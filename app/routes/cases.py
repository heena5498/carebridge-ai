from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.case import (
    PatientCaseCreate, PatientCaseResponse, PatientCaseSummary, PatientCaseUpdate,
)
from app.services.case_service import create_case, get_all_cases, get_case, update_case

router = APIRouter(prefix="/cases", tags=["cases"])


@router.post("", response_model=PatientCaseResponse, status_code=201)
def create(
    body: PatientCaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Nurse creates a new intake case."""
    case = create_case(
        db,
        patient_name=body.patient_name,
        age=body.age,
        source_hospital=body.source_hospital,
        discharge_date=body.discharge_date,
    )
    return case


@router.get("", response_model=list[PatientCaseSummary])
def list_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Case list — returns lightweight summaries."""
    cases = get_all_cases(db)
    summaries = []
    for case in cases:
        extraction = case.extraction_data or {}
        summaries.append(PatientCaseSummary(
            id=case.id,
            patient_name=case.patient_name,
            status=case.status,
            risk_score=extraction.get("overall_confidence"),
            missing_items_count=len(extraction.get("missing_information", [])),
            med_conflicts_count=0,
            updated_at=case.updated_at,
        ))
    return summaries


@router.get("/{case_id}", response_model=PatientCaseResponse)
def get(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Single case detail."""
    return get_case(db, case_id)


@router.patch("/{case_id}", response_model=PatientCaseResponse)
def update(
    case_id: int,
    body: PatientCaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update editable case fields (name, age, hospital, discharge date).
    Status transitions must go through the proper flow endpoints."""
    case = get_case(db, case_id)
    updates = body.model_dump(exclude_unset=True)
    if updates:
        case = update_case(db, case, **updates)
    return case
