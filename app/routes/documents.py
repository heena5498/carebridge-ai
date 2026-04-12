import os

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_facility_user
from app.db.database import get_db
from app.db.models.document import Document
from app.db.models.user import User
from app.schemas.case import DocumentResponse
from app.services.case_service import get_case

router = APIRouter(prefix="/cases/{case_id}/documents", tags=["documents"])

UPLOAD_DIR = "uploads"


@router.post("", response_model=DocumentResponse, status_code=201)
async def upload_document(
    case_id: int,
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_facility_user),
):
    """Nurse uploads a discharge PDF for this case."""
    case = get_case(db, case_id)

    # Save file to disk
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, f"{case.id}_{file.filename}")

    content = await file.read()
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

    return doc
