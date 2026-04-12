"""
Facility chatbot routes.

POST   /chat/facility              — send a message, get a reply
DELETE /chat/facility/{session_id}  — clear/reset a chat session
"""

import logging
import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services import chat_service
from app.services.case_service import get_case

log = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

# session_id must be a 32-char hex string (uuid4 without dashes)
_SESSION_ID_RE = re.compile(r"^[0-9a-f]{32}$")


def _validate_session_id(session_id: str) -> None:
    if not _SESSION_ID_RE.match(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID format")


@router.post("/facility", response_model=ChatResponse)
async def facility_chat(body: ChatRequest, db: Session = Depends(get_db)):
    """Send a message to the facility assistant chatbot."""
    # Validate session_id format if provided
    if body.session_id is not None:
        _validate_session_id(body.session_id)

    # Optionally load patient case context
    case = None
    if body.case_id is not None:
        case = get_case(db, body.case_id)  # raises 404 if not found

    try:
        session_id, reply = await chat_service.chat(
            message=body.message,
            session_id=body.session_id,
            case=case,
        )
    except RuntimeError as exc:
        log.error("Chat service error: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc))

    return ChatResponse(session_id=session_id, reply=reply)


@router.delete("/facility/{session_id}")
def clear_chat_session(session_id: str):
    """Clear/reset a chat session."""
    _validate_session_id(session_id)
    removed = chat_service.clear_session(session_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"detail": "Session cleared"}
