import logging
import os
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models.document import Document
from app.db.models.user import User
from app.schemas.case import DocumentResponse
from app.services.case_service import get_case

log = logging.getLogger(__name__)

router = APIRouter(prefix="/cases/{case_id}/documents", tags=["documents"])

UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_CONTENT_TYPES = {"application/pdf", "application/x-pdf"}
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB — matches Gemini inline upload limit


@router.post("", response_model=DocumentResponse, status_code=201)
async def upload_document(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    file: UploadFile = File(...),
):
    """Upload a discharge PDF for this case."""
    case = get_case(db, case_id)

    # Validate file is present and has a name
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    # Validate file extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Only PDF files are accepted.",
        )

    # Validate content type if provided by the client
    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid content type '{file.content_type}'. Only PDF files are accepted.",
        )

    content = await file.read()

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(content) > MAX_FILE_SIZE_BYTES:
        size_mb = len(content) / (1024 * 1024)
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({size_mb:.1f} MB). Maximum allowed size is 20 MB.",
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, f"{case.id}_{file.filename}")

    with open(file_path, "wb") as f:
        f.write(content)

    doc = Document(
        case_id=case.id,
        filename=file.filename,
        file_path=file_path,
        document_type="discharge_summary",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    log.info(
        "Document uploaded for case %d: %s (%.1f KB)",
        case_id, file.filename, len(content) / 1024,
    )
    return doc
