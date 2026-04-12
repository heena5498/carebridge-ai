import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.care_plan import CarePlanResponse
from app.schemas.extraction import ExtractionResult
from app.services.case_service import get_case, update_case
from app.services.care_plan_service import generate_care_plan
from app.services.agents.patient_summary_agent import PatientSummaryAgent

log = logging.getLogger(__name__)

router = APIRouter(prefix="/cases/{case_id}/care-plan", tags=["care_plan"])


@router.post("/generate", response_model=CarePlanResponse)
async def generate(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a patient-friendly care plan from approved extraction data."""
    case = get_case(db, case_id)

    if case.status != "approved":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot generate care plan: case status is '{case.status}'. Case must be approved first.",
        )

    if not case.extraction_data:
        raise HTTPException(status_code=400, detail="No extraction data found.")

    extraction = ExtractionResult(**case.extraction_data)
    care_plan = await generate_care_plan(case.id, extraction)

    # Generate patient-friendly plain-language summary via Gemini (Agent 5)
    patient_summary = await PatientSummaryAgent().run(extraction, case)

    care_plan_dict = care_plan.model_dump(mode="json")
    care_plan_dict["patient_summary"] = patient_summary

    update_case(db, case, care_plan_data=care_plan_dict, status="care_plan_generated")
    log.info("Care plan generated for case %d by user %d", case_id, current_user.id)

    # Return full care plan including patient_summary
    return CarePlanResponse(**care_plan_dict)


@router.get("", response_model=CarePlanResponse)
def get_care_plan(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve the generated care plan."""
    case = get_case(db, case_id)

    if not case.care_plan_data:
        raise HTTPException(status_code=404, detail="Care plan not yet generated.")

    return CarePlanResponse(**case.care_plan_data)
