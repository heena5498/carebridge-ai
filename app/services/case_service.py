"""
Patient case CRUD operations against PostgreSQL.
"""

from datetime import date

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.models.patient_case import PatientCase
from app.db.models.user import User


def create_case(
    db: Session,
    patient_name: str,
    age: int,
    source_hospital: str,
    discharge_date: date,
    patient_email: str | None = None,
) -> PatientCase:
    normalized_email = patient_email.lower() if patient_email else None
    patient_user = None
    if normalized_email:
        patient_user = (
            db.query(User)
            .filter(User.email == normalized_email, User.role == "patient")
            .first()
        )

    case = PatientCase(
        patient_name=patient_name,
        age=age,
        source_hospital=source_hospital,
        discharge_date=discharge_date,
        patient_email=normalized_email,
        patient_user_id=patient_user.id if patient_user else None,
        status="intake",
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


def get_all_cases(db: Session) -> list[PatientCase]:
    return db.query(PatientCase).order_by(PatientCase.updated_at.desc()).all()


def get_case(db: Session, case_id: int) -> PatientCase:
    case = db.query(PatientCase).filter(PatientCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


def get_cases_for_patient(db: Session, patient_user_id: int) -> list[PatientCase]:
    return (
        db.query(PatientCase)
        .filter(PatientCase.patient_user_id == patient_user_id)
        .order_by(PatientCase.updated_at.desc())
        .all()
    )


def link_patient_cases(db: Session, user: User) -> int:
    """Backfill ownership for cases created before patient account registration."""
    updated = (
        db.query(PatientCase)
        .filter(PatientCase.patient_email == user.email, PatientCase.patient_user_id.is_(None))
        .update({"patient_user_id": user.id}, synchronize_session=False)
    )
    if updated:
        db.commit()
    return int(updated)


def update_case(db: Session, case: PatientCase, **fields) -> PatientCase:
    for key, value in fields.items():
        setattr(case, key, value)
    db.commit()
    db.refresh(case)
    return case
