from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_patient
from app.db.database import get_db
from app.db.models.patient_case import PatientCase
from app.db.models.user import User
from app.schemas.case import PatientCasePublic
from app.services.case_service import get_case

router = APIRouter(prefix="/patient", tags=["patient"])


@router.get("/cases/me", response_model=list[PatientCasePublic])
def get_my_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_patient),
):
    cases = (
        db.query(PatientCase)
        .filter(PatientCase.patient_user_id == current_user.id)
        .order_by(PatientCase.discharge_date.desc())
        .all()
    )
    return [PatientCasePublic.from_case(case) for case in cases]


@router.get("/cases/{case_id}/care-plan", response_model=dict)
def get_my_care_plan(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_patient),
):
    case = get_case(db, case_id)
    if case.patient_user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Case not found")
    if not case.care_plan_data:
        raise HTTPException(status_code=404, detail="Care plan not yet generated")
    return case.care_plan_data