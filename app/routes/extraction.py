from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_facility_user
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.extraction import ExtractionResult
from app.services.case_service import get_case, update_case
from app.services.gemini_service import extract_from_pdf
from app.services.agent_service import run_agent_checks
from app.services.validation_service import validate_and_score

router = APIRouter(prefix="/cases/{case_id}", tags=["extraction"])


@router.post("/extract", response_model=ExtractionResult)
async def extract_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_facility_user),
):
    """
    Full extraction pipeline:
    1. Send PDF to Gemini for structured extraction
    2. Run internal agent checks (meds, follow-ups, risks)
    3. Run deterministic validation + confidence scoring
    4. Save result and update case status
    """
    case = get_case(db, case_id)

    # Find uploaded documents for this case
    if not case.documents:
        raise HTTPException(status_code=400, detail="No documents uploaded for this case")

    file_path = case.documents[0].file_path

    # Step 1: Gemini extraction
    raw_extraction = await extract_from_pdf(case.id, file_path)

    # Step 2: Agent/orchestrator checks
    reviewed_extraction = await run_agent_checks(raw_extraction)

    # Step 3: Validation + confidence scoring
    final_extraction = validate_and_score(reviewed_extraction)

    # Step 4: Save extraction data and update case status
    update_case(db, case, extraction_data=final_extraction.model_dump(mode="json"), status="extracted")

    return final_extraction
