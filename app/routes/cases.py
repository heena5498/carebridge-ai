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


def _extract_case_metrics(case):
    extraction = case.extraction_data or {}
    care_plan = case.care_plan_data or {}

    active_meds = care_plan.get("active_medications_count")
    med_conflicts = care_plan.get("med_conflicts_count")
    missing_items = care_plan.get("missing_items_count")
    follow_ups_due = care_plan.get("follow_ups_due_count")

    if active_meds is None:
        active_meds = len(care_plan.get("medications_schedule", []))
    if med_conflicts is None:
        med_conflicts = len(care_plan.get("med_conflicts", []))
    if missing_items is None:
        missing_items = len(care_plan.get("missing_items", [])) or len(extraction.get("missing_information", []))
    if follow_ups_due is None:
        follow_ups_due = len(care_plan.get("follow_up_reminders", []))

    return {
        "active_medications_count": int(active_meds or 0),
        "med_conflicts_count": int(med_conflicts or 0),
        "missing_items_count": int(missing_items or 0),
        "follow_ups_due_count": int(follow_ups_due or 0),
    }


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
        patient_email=body.patient_email,
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
        metrics = _extract_case_metrics(case)
        summaries.append(PatientCaseSummary(
            id=case.id,
            patient_name=case.patient_name,
            status=case.status,
            risk_score=extraction.get("overall_confidence"),
            active_medications_count=metrics["active_medications_count"],
            missing_items_count=metrics["missing_items_count"],
            med_conflicts_count=metrics["med_conflicts_count"],
            follow_ups_due_count=metrics["follow_ups_due_count"],
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
