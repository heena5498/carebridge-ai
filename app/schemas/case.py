from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from enum import Enum


class CaseStatus(str, Enum):
    intake = "intake"
    extracted = "extracted"
    in_review = "in_review"
    approved = "approved"
    care_plan_generated = "care_plan_generated"


# What the nurse sends to create a case
class PatientCaseCreate(BaseModel):
    patient_name: str
    age: int
    source_hospital: str
    discharge_date: date
    patient_email: str | None = None


# Full case record returned by the API
class PatientCaseResponse(BaseModel):
    id: int
    patient_name: str
    age: int | None = None
    source_hospital: str | None = None
    discharge_date: date | None = None
    status: CaseStatus = CaseStatus.intake
    patient_email: str | None = None
    extraction_data: dict | None = None
    review_data: dict | None = None
    care_plan_data: dict | None = None
    active_medications_count: int = 0
    med_conflicts_count: int = 0
    missing_items_count: int = 0
    follow_ups_due_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Lightweight summary for the case list page
class PatientCaseSummary(BaseModel):
    id: int
    patient_name: str
    status: CaseStatus
    risk_score: float | None = None
    active_medications_count: int = 0
    missing_items_count: int = 0
    med_conflicts_count: int = 0
    follow_ups_due_count: int = 0
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PatientCasePublicResponse(BaseModel):
    id: int
    patient_name: str
    status: CaseStatus
    source_hospital: str | None = None
    discharge_date: date | None = None
    extraction_data: dict | None = None
    care_plan_data: dict | None = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PatientCasePublic(BaseModel):
    """
    Patient-facing case shape.
    Excludes internal fields like review_data, extraction_data internals,
    and facility metadata the patient does not need.
    """

    id: int
    patient_name: str
    age: int | None = None
    source_hospital: str | None = None
    discharge_date: date | None = None
    status: str
    discharge_summary: str | None = None
    care_plan_data: dict | None = None
    allergies: list[str] = []
    active_medications_count: int = 0
    med_conflicts_count: int = 0
    missing_items_count: int = 0
    follow_ups_due_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_case(cls, case):
        allergies = []
        if case.extraction_data:
            allergies = case.extraction_data.get("allergies", [])

        care_plan = case.care_plan_data or {}
        return cls(
            id=case.id,
            patient_name=case.patient_name,
            age=case.age,
            source_hospital=case.source_hospital,
            discharge_date=case.discharge_date,
            status=case.status,
            discharge_summary=case.discharge_summary,
            care_plan_data=case.care_plan_data,
            allergies=allergies,
            active_medications_count=care_plan.get("active_medications_count", 0),
            med_conflicts_count=care_plan.get("med_conflicts_count", 0),
            missing_items_count=care_plan.get("missing_items_count", 0),
            follow_ups_due_count=care_plan.get("follow_ups_due_count", 0),
            created_at=case.created_at,
            updated_at=case.updated_at,
        )


# Optional update payload
class PatientCaseUpdate(BaseModel):
    patient_name: str | None = None
    age: int | None = None
    source_hospital: str | None = None
    discharge_date: date | None = None
    status: CaseStatus | None = None


# Document metadata after upload
class DocumentResponse(BaseModel):
    id: int
    case_id: int
    filename: str
    document_type: str = "discharge_summary"
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)
