"""
Facility chatbot service — Gemini-powered, in-memory session history.

Design choices:
  - Uses the same google-genai client pattern as gemini_service.py
  - In-memory dict for session history (no DB, no Redis)
  - History trimmed to last MAX_TURNS pairs to control prompt size
  - Patient case context is built once per request from DB JSON fields
  - Session is identified by a random UUID string
  - Sessions auto-evict after MAX_SESSIONS to prevent memory leaks
"""

import logging
import time
import uuid
from collections import OrderedDict
from dataclasses import dataclass, field

from google import genai
from google.genai import types as genai_types

from app.core.config import settings
from app.db.models.patient_case import PatientCase

log = logging.getLogger(__name__)

CHAT_MODEL = "gemini-2.5-flash-lite"
MAX_TURNS = 10  # keep last N user+assistant pairs (20 messages total)
MAX_CONTEXT_CHARS = 4000  # cap patient context size sent to Gemini
MAX_SESSIONS = 500  # evict oldest sessions beyond this limit
SESSION_TTL_SECONDS = 3600  # auto-expire sessions older than 1 hour

# ---------------------------------------------------------------------------
# System instruction
# ---------------------------------------------------------------------------

SYSTEM_INSTRUCTION = """\
You are a clinical assistant for nurses and facility coordinators at a skilled nursing facility.

Rules:
- Be concise, practical, and grounded in the data provided.
- If patient case context is provided, answer based ONLY on that data.
- If information is missing from the case data, clearly say it is not available.
- Do NOT fabricate medical facts, lab values, or details not present in the data.
- Do NOT give definitive medical advice beyond what the provided data supports.
- Speak as a facility assistant to a nurse/coordinator, NOT to the patient.
- When summarizing, use bullet points and keep it brief.
- If no patient case context is provided, answer general facility workflow questions helpfully.
"""

# ---------------------------------------------------------------------------
# Session storage (with LRU eviction and TTL)
# ---------------------------------------------------------------------------


@dataclass
class _Session:
    session_id: str
    case_id: int | None = None
    last_active: float = field(default_factory=time.time)
    # Each entry: {"role": "user"|"model", "text": str}
    history: list[dict] = field(default_factory=list)


# OrderedDict gives us LRU eviction for free — newest at the end
_sessions: OrderedDict[str, _Session] = OrderedDict()


def _evict_stale_sessions() -> None:
    """Remove expired sessions and enforce the max session cap."""
    now = time.time()
    # Remove expired sessions (iterate over a snapshot to avoid mutating during iteration)
    expired = [
        sid for sid, s in _sessions.items()
        if now - s.last_active > SESSION_TTL_SECONDS
    ]
    for sid in expired:
        _sessions.pop(sid, None)

    # Enforce hard cap — evict oldest first (leave room for one new session)
    while len(_sessions) >= MAX_SESSIONS:
        _sessions.popitem(last=False)


def create_session(case_id: int | None = None) -> str:
    _evict_stale_sessions()
    sid = uuid.uuid4().hex
    _sessions[sid] = _Session(session_id=sid, case_id=case_id)
    return sid


def get_session(session_id: str) -> _Session | None:
    return _sessions.get(session_id)


def clear_session(session_id: str) -> bool:
    return _sessions.pop(session_id, None) is not None


# ---------------------------------------------------------------------------
# Safe string coercion for unpredictable JSON shapes
# ---------------------------------------------------------------------------

def _to_str(value) -> str:
    """Safely convert any value to a display string."""
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        # Try common key names used in the extraction schemas
        for key in ("name", "item", "field_name", "field", "task", "label", "description"):
            if key in value:
                return str(value[key])
        return str(value)
    return str(value)


# ---------------------------------------------------------------------------
# Build compact patient context from DB model
# ---------------------------------------------------------------------------


def _build_case_context(case: PatientCase) -> str:
    """Build a compact text summary of the patient case for the LLM prompt.

    Defensive: every field access is wrapped to tolerate unexpected types
    in the JSON blobs. A failure in one section must not block others.
    """
    parts: list[str] = []
    parts.append(f"Patient: {case.patient_name}")
    if case.age:
        parts.append(f"Age: {case.age}")
    if case.source_hospital:
        parts.append(f"Source hospital: {case.source_hospital}")
    if case.discharge_date:
        parts.append(f"Discharge date: {case.discharge_date}")
    parts.append(f"Status: {case.status}")

    # -- extraction_data -------------------------------------------------------
    if case.extraction_data and isinstance(case.extraction_data, dict):
        ext = case.extraction_data
        try:
            if ext.get("clinical_summary"):
                parts.append(f"\nClinical summary: {ext['clinical_summary']}")
        except Exception:
            pass

        try:
            if ext.get("allergies"):
                items = [_to_str(a) for a in ext["allergies"][:15]]
                parts.append(f"Allergies: {', '.join(items)}")
        except Exception:
            pass

        try:
            if ext.get("medications"):
                med_lines = []
                for m in ext["medications"][:15]:
                    if isinstance(m, dict):
                        name = m.get("name", "?")
                        dose = m.get("dose", "")
                        freq = m.get("frequency", "")
                        route = m.get("route", "")
                        purpose = m.get("purpose", "")
                        line = f"  - {name}"
                        if dose:
                            line += f" {dose}"
                        if route:
                            line += f" ({route})"
                        if freq:
                            line += f", {freq}"
                        if purpose:
                            line += f" — {purpose}"
                        med_lines.append(line)
                    else:
                        med_lines.append(f"  - {_to_str(m)}")
                parts.append("Medications:\n" + "\n".join(med_lines))
        except Exception:
            pass

        try:
            if ext.get("risks"):
                risk_lines = []
                for r in ext["risks"][:10]:
                    if isinstance(r, dict):
                        cat = r.get("category", "?")
                        sev = r.get("severity", "?")
                        desc = r.get("description", "")
                        action = r.get("action_needed", "")
                        line = f"  - [{sev}] {cat}: {desc}"
                        if action:
                            line += f" (Action: {action})"
                        risk_lines.append(line)
                    else:
                        risk_lines.append(f"  - {_to_str(r)}")
                parts.append("Risks:\n" + "\n".join(risk_lines))
        except Exception:
            pass

        try:
            if ext.get("follow_ups"):
                fu_lines = []
                for f in ext["follow_ups"][:10]:
                    if isinstance(f, dict):
                        spec = f.get("specialty") or f.get("provider_name") or "?"
                        date_ = f.get("appointment_date") or "TBD"
                        reason = f.get("reason") or ""
                        fu_lines.append(f"  - {spec} on {date_}: {reason}")
                    else:
                        fu_lines.append(f"  - {_to_str(f)}")
                parts.append("Follow-ups:\n" + "\n".join(fu_lines))
        except Exception:
            pass

        try:
            if ext.get("care_tasks"):
                task_lines = []
                for t in ext["care_tasks"][:10]:
                    if isinstance(t, dict):
                        task_lines.append(
                            f"  - {t.get('task', '?')} [{t.get('priority', '?')}] "
                            f"({t.get('time_frame', '?')})"
                        )
                    else:
                        task_lines.append(f"  - {_to_str(t)}")
                parts.append("Care tasks:\n" + "\n".join(task_lines))
        except Exception:
            pass

        try:
            if ext.get("warning_signs"):
                ws = [_to_str(w) for w in ext["warning_signs"][:10]]
                parts.append(f"Warning signs: {', '.join(ws)}")
        except Exception:
            pass

        try:
            if ext.get("missing_information"):
                mi = [_to_str(m) for m in ext["missing_information"][:10]]
                parts.append(f"Missing info: {', '.join(mi)}")
        except Exception:
            pass

    # -- review_data -----------------------------------------------------------
    if case.review_data and isinstance(case.review_data, dict):
        rev = case.review_data
        try:
            if rev.get("summary_status"):
                parts.append(f"\nReview status: {rev['summary_status']}")
            elif rev.get("decision"):
                parts.append(f"\nReview decision: {rev['decision']}")

            if rev.get("nurse_notes"):
                parts.append(f"Nurse notes: {rev['nurse_notes']}")
            elif rev.get("notes"):
                parts.append(f"Review notes: {rev['notes']}")

            if rev.get("unresolved_issues"):
                issue_lines = []
                for iss in rev["unresolved_issues"][:5]:
                    if isinstance(iss, dict):
                        issue_lines.append(
                            f"  - {iss.get('field_name', '?')}: {iss.get('issue', '?')} "
                            f"[{iss.get('severity', '?')}]"
                        )
                    else:
                        issue_lines.append(f"  - {_to_str(iss)}")
                parts.append("Unresolved issues:\n" + "\n".join(issue_lines))
        except Exception:
            pass

    # -- care_plan_data --------------------------------------------------------
    if case.care_plan_data and isinstance(case.care_plan_data, dict):
        cp = case.care_plan_data
        try:
            # CarePlanResponse shape: timeline, medications_schedule, etc.
            if cp.get("timeline"):
                timeline_lines = []
                for bucket in cp["timeline"][:5]:
                    if isinstance(bucket, dict):
                        label = bucket.get("label", "?")
                        tasks = bucket.get("tasks", [])
                        timeline_lines.append(f"  {label}:")
                        for t in tasks[:5]:
                            if isinstance(t, dict):
                                timeline_lines.append(
                                    f"    - {t.get('task', '?')} [{t.get('priority', '?')}]"
                                )
                            else:
                                timeline_lines.append(f"    - {_to_str(t)}")
                parts.append("\nCare plan timeline:\n" + "\n".join(timeline_lines))

            if cp.get("medications_schedule"):
                sched_lines = []
                for ms in cp["medications_schedule"][:10]:
                    if isinstance(ms, dict):
                        line = f"  - {ms.get('name', '?')} {ms.get('dose', '')}"
                        if ms.get("frequency"):
                            line += f", {ms['frequency']}"
                        if ms.get("special_instructions"):
                            line += f" ({ms['special_instructions']})"
                        sched_lines.append(line)
                parts.append("Medication schedule:\n" + "\n".join(sched_lines))

            if cp.get("follow_up_reminders"):
                rem_lines = []
                for r in cp["follow_up_reminders"][:5]:
                    if isinstance(r, dict):
                        rem_lines.append(
                            f"  - {r.get('provider_name', '?')} "
                            f"({r.get('specialty', '?')}) on {r.get('date', 'TBD')}"
                        )
                parts.append("Follow-up reminders:\n" + "\n".join(rem_lines))

            if cp.get("warning_signs"):
                ws = [_to_str(w) for w in cp["warning_signs"][:10]]
                parts.append(f"Care plan warning signs: {', '.join(ws)}")

            # Fallback for older/simpler shapes
            if cp.get("summary") and not cp.get("timeline"):
                parts.append(f"\nCare plan summary: {cp['summary']}")
            if cp.get("tasks") and not cp.get("timeline"):
                task_lines = []
                for t in cp["tasks"][:10]:
                    if isinstance(t, dict):
                        task_lines.append(
                            f"  - {t.get('task', '?')} ({t.get('priority', '?')})"
                        )
                    else:
                        task_lines.append(f"  - {_to_str(t)}")
                parts.append("Care plan tasks:\n" + "\n".join(task_lines))
        except Exception:
            pass

    context = "\n".join(parts)
    # hard cap to prevent huge prompts
    if len(context) > MAX_CONTEXT_CHARS:
        context = context[:MAX_CONTEXT_CHARS] + "\n... (truncated)"
    return context


# ---------------------------------------------------------------------------
# Gemini client (reuses same pattern as gemini_service.py)
# ---------------------------------------------------------------------------

_client: genai.Client | None = None


def _gemini() -> genai.Client:
    global _client
    if _client is None:
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env file.")
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


# ---------------------------------------------------------------------------
# Main chat function
# ---------------------------------------------------------------------------


async def chat(
    message: str,
    session_id: str | None = None,
    case: PatientCase | None = None,
) -> tuple[str, str]:
    """
    Send a message to the facility chatbot.

    Returns (session_id, reply_text).
    """
    # Resolve or create session
    if session_id and session_id in _sessions:
        session = _sessions[session_id]
        session.last_active = time.time()
        # Move to end of OrderedDict (most recently used)
        _sessions.move_to_end(session_id)
    else:
        sid = create_session(case_id=case.id if case else None)
        session = _sessions[sid]

    # Build the contents list for Gemini
    contents: list[genai_types.Content] = []

    # System instruction
    system_text = SYSTEM_INSTRUCTION
    if case:
        case_ctx = _build_case_context(case)
        system_text += f"\n\nCurrent patient case context:\n{case_ctx}"

    # Add trimmed history
    trimmed = session.history[-(MAX_TURNS * 2):]
    for entry in trimmed:
        contents.append(
            genai_types.Content(
                role=entry["role"],
                parts=[genai_types.Part(text=entry["text"])],
            )
        )

    # Add new user message
    contents.append(
        genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=message)],
        )
    )

    # Call Gemini with error handling
    try:
        response = await _gemini().aio.models.generate_content(
            model=CHAT_MODEL,
            contents=contents,
            config=genai_types.GenerateContentConfig(
                system_instruction=system_text,
                temperature=0.3,
                max_output_tokens=1024,
            ),
        )
    except Exception as exc:
        log.error("Gemini API call failed: %s: %s", type(exc).__name__, exc)
        raise RuntimeError(
            "The AI assistant is temporarily unavailable. Please try again."
        ) from exc

    # Safely extract the reply text — response.text can raise on blocked content
    try:
        reply = response.text
    except (ValueError, AttributeError):
        reply = None

    if not reply:
        # Check if the response was blocked by safety filters
        if hasattr(response, "candidates") and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, "finish_reason") and candidate.finish_reason:
                reason = str(candidate.finish_reason)
                if "SAFETY" in reason.upper():
                    reply = (
                        "I'm unable to respond to that query due to content safety "
                        "guidelines. Please rephrase your question."
                    )
                    log.warning("Gemini response blocked by safety filter: %s", reason)
        if not reply:
            reply = "I'm sorry, I couldn't generate a response. Please try again."

    # Save to session history
    session.history.append({"role": "user", "text": message})
    session.history.append({"role": "model", "text": reply})

    # Trim history if it exceeds limit
    if len(session.history) > MAX_TURNS * 2:
        session.history = session.history[-(MAX_TURNS * 2):]

    return session.session_id, reply
