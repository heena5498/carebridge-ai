"""
Tests for the facility chatbot feature.

Covers:
  - session creation / reuse / clear / eviction / TTL
  - session_id validation
  - invalid case_id handling
  - successful response structure
  - Gemini error handling
  - context builder robustness
  - chat service internals (history trimming)

Uses unittest.mock to stub out the Gemini API call so tests run
without a real API key or network access.
"""

import time

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.services import chat_service
from app.services.chat_service import (
    _build_case_context,
    _sessions,
    _to_str,
    clear_session,
    create_session,
    get_session,
    MAX_SESSIONS,
    MAX_TURNS,
    SESSION_TTL_SECONDS,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def _clear_sessions():
    """Ensure each test starts with a clean session store."""
    _sessions.clear()
    yield
    _sessions.clear()


@pytest.fixture()
def client():
    return TestClient(app)


def _mock_gemini_response(text="Test reply from Gemini."):
    """Create a mock that looks like a Gemini generate_content response."""
    resp = MagicMock()
    resp.text = text
    resp.candidates = []
    return resp


# ---------------------------------------------------------------------------
# Unit tests — _to_str helper
# ---------------------------------------------------------------------------

class TestToStr:
    def test_string_passthrough(self):
        assert _to_str("hello") == "hello"

    def test_dict_with_name(self):
        assert _to_str({"name": "Aspirin", "dose": "81mg"}) == "Aspirin"

    def test_dict_with_field_name(self):
        assert _to_str({"field_name": "PCP", "reason": "missing"}) == "PCP"

    def test_dict_with_item(self):
        assert _to_str({"item": "allergy info"}) == "allergy info"

    def test_dict_fallback(self):
        result = _to_str({"x": 1})
        assert isinstance(result, str)

    def test_int(self):
        assert _to_str(42) == "42"

    def test_none(self):
        assert _to_str(None) == "None"


# ---------------------------------------------------------------------------
# Unit tests — session management
# ---------------------------------------------------------------------------

class TestSessionManagement:
    def test_create_session_returns_id(self):
        sid = create_session()
        assert isinstance(sid, str)
        assert len(sid) == 32  # uuid4 hex

    def test_create_session_with_case_id(self):
        sid = create_session(case_id=42)
        session = get_session(sid)
        assert session is not None
        assert session.case_id == 42

    def test_get_session_missing(self):
        assert get_session("nonexistent") is None

    def test_clear_session_existing(self):
        sid = create_session()
        assert clear_session(sid) is True
        assert get_session(sid) is None

    def test_clear_session_missing(self):
        assert clear_session("nonexistent") is False

    def test_session_eviction_at_max(self):
        """Sessions beyond MAX_SESSIONS are evicted (oldest first)."""
        first_sid = create_session()
        for _ in range(MAX_SESSIONS):
            create_session()
        # The first session should have been evicted
        assert get_session(first_sid) is None
        assert len(_sessions) <= MAX_SESSIONS

    def test_session_ttl_eviction(self):
        """Expired sessions are cleaned up on next create."""
        sid = create_session()
        # Artificially age the session past TTL
        _sessions[sid].last_active = time.time() - SESSION_TTL_SECONDS - 10
        # Creating a new session triggers eviction
        create_session()
        assert get_session(sid) is None


# ---------------------------------------------------------------------------
# Unit tests — context builder
# ---------------------------------------------------------------------------

class TestBuildCaseContext:
    def _make_case(self, **overrides):
        case = MagicMock()
        case.patient_name = overrides.get("patient_name", "Jane Doe")
        case.age = overrides.get("age", 75)
        case.source_hospital = overrides.get("source_hospital", "General Hospital")
        case.discharge_date = overrides.get("discharge_date", "2025-01-15")
        case.status = overrides.get("status", "reviewed")
        case.extraction_data = overrides.get("extraction_data", None)
        case.review_data = overrides.get("review_data", None)
        case.care_plan_data = overrides.get("care_plan_data", None)
        return case

    def test_basic_fields(self):
        ctx = _build_case_context(self._make_case())
        assert "Jane Doe" in ctx
        assert "75" in ctx
        assert "General Hospital" in ctx

    def test_with_extraction_data(self):
        case = self._make_case(extraction_data={
            "clinical_summary": "Hip replacement recovery",
            "allergies": ["Penicillin"],
            "medications": [
                {"name": "Aspirin", "dose": "81mg", "frequency": "daily", "route": "oral", "purpose": "blood thinner"},
            ],
            "risks": [
                {"category": "fall_risk", "severity": "high", "description": "Post-surgery", "action_needed": "Bed rails"},
            ],
            "follow_ups": [
                {"specialty": "Orthopedics", "appointment_date": "2025-02-01", "reason": "Check-up"},
            ],
            "care_tasks": [
                {"task": "Check vitals", "priority": "high", "time_frame": "first_24h"},
            ],
            "warning_signs": ["Fever", "Swelling"],
            "missing_information": [
                {"field_name": "PCP contact", "reason": "not in doc", "severity": "medium"},
            ],
        })
        ctx = _build_case_context(case)
        assert "Hip replacement recovery" in ctx
        assert "Penicillin" in ctx
        assert "Aspirin" in ctx
        assert "oral" in ctx
        assert "blood thinner" in ctx
        assert "fall_risk" in ctx
        assert "Bed rails" in ctx
        assert "Orthopedics" in ctx
        assert "Check vitals" in ctx
        assert "Fever" in ctx
        assert "PCP contact" in ctx

    def test_allergies_as_dicts(self):
        """allergies may contain dicts in some DB rows."""
        case = self._make_case(extraction_data={
            "allergies": [{"name": "Penicillin"}, "Sulfa"],
        })
        ctx = _build_case_context(case)
        assert "Penicillin" in ctx
        assert "Sulfa" in ctx

    def test_missing_info_as_strings(self):
        """missing_information may be plain strings in some DB rows."""
        case = self._make_case(extraction_data={
            "missing_information": ["PCP phone", "Insurance info"],
        })
        ctx = _build_case_context(case)
        assert "PCP phone" in ctx

    def test_review_data_nurse_payload_shape(self):
        """review_data uses NurseReviewPayload shape."""
        case = self._make_case(review_data={
            "summary_status": "needs_review",
            "nurse_notes": "Need to verify allergies",
            "unresolved_issues": [
                {"field_name": "allergy", "issue": "Conflicting info", "severity": "high"},
            ],
        })
        ctx = _build_case_context(case)
        assert "needs_review" in ctx
        assert "verify allergies" in ctx
        assert "Conflicting info" in ctx

    def test_care_plan_timeline_shape(self):
        """care_plan_data uses CarePlanResponse shape with timeline."""
        case = self._make_case(care_plan_data={
            "timeline": [
                {
                    "label": "First 24 Hours",
                    "tasks": [
                        {"task": "Check vitals q4h", "priority": "high"},
                    ],
                },
            ],
            "medications_schedule": [
                {"name": "Metformin", "dose": "500mg", "frequency": "twice daily"},
            ],
            "follow_up_reminders": [
                {"provider_name": "Dr. Smith", "specialty": "Cardio", "date": "2025-03-01"},
            ],
            "warning_signs": ["Chest pain"],
        })
        ctx = _build_case_context(case)
        assert "First 24 Hours" in ctx
        assert "Check vitals" in ctx
        assert "Metformin" in ctx
        assert "Dr. Smith" in ctx
        assert "Chest pain" in ctx

    def test_truncation(self):
        case = self._make_case(patient_name="A" * 5000)
        ctx = _build_case_context(case)
        assert len(ctx) <= chat_service.MAX_CONTEXT_CHARS + 50

    def test_none_extraction_data(self):
        """Should not crash when all data fields are None."""
        case = self._make_case()
        ctx = _build_case_context(case)
        assert "Jane Doe" in ctx

    def test_extraction_data_not_dict(self):
        """Should not crash if extraction_data is somehow a string."""
        case = self._make_case(extraction_data="bad data")
        ctx = _build_case_context(case)
        assert "Jane Doe" in ctx  # basic fields still present


# ---------------------------------------------------------------------------
# Unit tests — chat function
# ---------------------------------------------------------------------------

class TestChatFunction:
    @pytest.mark.asyncio
    async def test_chat_creates_session(self):
        mock_resp = _mock_gemini_response("Hello nurse!")
        mock_client = MagicMock()
        mock_client.aio.models.generate_content = AsyncMock(return_value=mock_resp)

        with patch.object(chat_service, "_gemini", return_value=mock_client):
            sid, reply = await chat_service.chat(message="Hi")

        assert isinstance(sid, str)
        assert reply == "Hello nurse!"
        session = get_session(sid)
        assert session is not None
        assert len(session.history) == 2

    @pytest.mark.asyncio
    async def test_chat_reuses_session(self):
        mock_resp = _mock_gemini_response("Reply 1")
        mock_client = MagicMock()
        mock_client.aio.models.generate_content = AsyncMock(return_value=mock_resp)

        with patch.object(chat_service, "_gemini", return_value=mock_client):
            sid1, _ = await chat_service.chat(message="First")
            mock_resp.text = "Reply 2"
            sid2, reply2 = await chat_service.chat(message="Second", session_id=sid1)

        assert sid1 == sid2
        assert reply2 == "Reply 2"
        session = get_session(sid1)
        assert len(session.history) == 4

    @pytest.mark.asyncio
    async def test_chat_with_invalid_session_creates_new(self):
        """If session_id doesn't exist, a new session is created."""
        mock_resp = _mock_gemini_response("ok")
        mock_client = MagicMock()
        mock_client.aio.models.generate_content = AsyncMock(return_value=mock_resp)

        with patch.object(chat_service, "_gemini", return_value=mock_client):
            sid, _ = await chat_service.chat(message="Hi", session_id="nonexistent")

        assert sid != "nonexistent"
        assert get_session(sid) is not None

    @pytest.mark.asyncio
    async def test_history_trimming(self):
        mock_resp = _mock_gemini_response("ok")
        mock_client = MagicMock()
        mock_client.aio.models.generate_content = AsyncMock(return_value=mock_resp)

        with patch.object(chat_service, "_gemini", return_value=mock_client):
            sid, _ = await chat_service.chat(message="start")
            for i in range(MAX_TURNS + 5):
                await chat_service.chat(message=f"msg {i}", session_id=sid)

        session = get_session(sid)
        assert len(session.history) <= MAX_TURNS * 2

    @pytest.mark.asyncio
    async def test_gemini_api_failure_returns_friendly_error(self):
        """Gemini network/API errors should raise RuntimeError with friendly message."""
        mock_client = MagicMock()
        mock_client.aio.models.generate_content = AsyncMock(
            side_effect=Exception("Connection timeout")
        )

        with patch.object(chat_service, "_gemini", return_value=mock_client):
            with pytest.raises(RuntimeError, match="temporarily unavailable"):
                await chat_service.chat(message="Hi")

    @pytest.mark.asyncio
    async def test_blocked_response_handled(self):
        """Safety-blocked responses should return a friendly message, not crash."""
        mock_resp = MagicMock()
        # Make .text raise like a real blocked response
        type(mock_resp).text = property(lambda self: (_ for _ in ()).throw(ValueError("blocked")))
        candidate = MagicMock()
        candidate.finish_reason = "SAFETY"
        mock_resp.candidates = [candidate]

        mock_client = MagicMock()
        mock_client.aio.models.generate_content = AsyncMock(return_value=mock_resp)

        with patch.object(chat_service, "_gemini", return_value=mock_client):
            sid, reply = await chat_service.chat(message="something")

        assert "content safety" in reply.lower()

    @pytest.mark.asyncio
    async def test_empty_response_handled(self):
        """Empty Gemini response returns fallback text."""
        mock_resp = MagicMock()
        mock_resp.text = ""
        mock_resp.candidates = []

        mock_client = MagicMock()
        mock_client.aio.models.generate_content = AsyncMock(return_value=mock_resp)

        with patch.object(chat_service, "_gemini", return_value=mock_client):
            sid, reply = await chat_service.chat(message="Hi")

        assert "couldn't generate" in reply.lower() or "try again" in reply.lower()


# ---------------------------------------------------------------------------
# Integration tests — HTTP endpoints via TestClient
# ---------------------------------------------------------------------------

class TestChatEndpoint:
    def test_chat_success(self, client):
        mock_resp = _mock_gemini_response("API reply")
        mock_client = MagicMock()
        mock_client.aio.models.generate_content = AsyncMock(return_value=mock_resp)

        with patch.object(chat_service, "_gemini", return_value=mock_client):
            resp = client.post("/chat/facility", json={"message": "Hello"})

        assert resp.status_code == 200
        data = resp.json()
        assert "session_id" in data
        assert data["reply"] == "API reply"

    def test_chat_with_invalid_case_id(self, client):
        """When case_id doesn't exist, get_case raises 404."""
        from fastapi import HTTPException as FastHTTPException

        with patch(
            "app.routes.chat.get_case",
            side_effect=FastHTTPException(status_code=404, detail="Case not found"),
        ):
            resp = client.post(
                "/chat/facility",
                json={"message": "Hello", "case_id": 999999},
            )
        assert resp.status_code == 404

    def test_chat_empty_message_rejected(self, client):
        resp = client.post("/chat/facility", json={"message": ""})
        assert resp.status_code == 422  # pydantic validation

    def test_chat_session_reuse(self, client):
        mock_resp = _mock_gemini_response("First")
        mock_client = MagicMock()
        mock_client.aio.models.generate_content = AsyncMock(return_value=mock_resp)

        with patch.object(chat_service, "_gemini", return_value=mock_client):
            r1 = client.post("/chat/facility", json={"message": "Hi"})
            sid = r1.json()["session_id"]

            mock_resp.text = "Second"
            r2 = client.post(
                "/chat/facility",
                json={"message": "Follow up", "session_id": sid},
            )

        assert r2.json()["session_id"] == sid
        assert r2.json()["reply"] == "Second"

    def test_chat_invalid_session_id_format(self, client):
        """Non-hex session_id should be rejected with 400."""
        resp = client.post(
            "/chat/facility",
            json={"message": "Hi", "session_id": "not-a-valid-id!!"},
        )
        assert resp.status_code == 400

    def test_chat_gemini_failure_returns_503(self, client):
        """Gemini API failure should surface as 503."""
        mock_client = MagicMock()
        mock_client.aio.models.generate_content = AsyncMock(
            side_effect=Exception("API down")
        )

        with patch.object(chat_service, "_gemini", return_value=mock_client):
            resp = client.post("/chat/facility", json={"message": "Hi"})

        assert resp.status_code == 503
        assert "unavailable" in resp.json()["detail"].lower()

    def test_chat_message_too_long(self, client):
        """Messages over 2000 chars should be rejected."""
        resp = client.post(
            "/chat/facility",
            json={"message": "x" * 2001},
        )
        assert resp.status_code == 422


class TestClearEndpoint:
    def test_clear_existing_session(self, client):
        sid = create_session()
        resp = client.delete(f"/chat/facility/{sid}")
        assert resp.status_code == 200
        assert get_session(sid) is None

    def test_clear_nonexistent_session(self, client):
        # Valid format but doesn't exist
        resp = client.delete("/chat/facility/00000000000000000000000000000000")
        assert resp.status_code == 404

    def test_clear_invalid_format(self, client):
        resp = client.delete("/chat/facility/bad-format!")
        assert resp.status_code == 400
