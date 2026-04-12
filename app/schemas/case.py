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


# Full case record returned by the API
class PatientCaseResponse(BaseModel):
    id: int
    patient_name: str
    age: int | None = None
    source_hospital: str | None = None
    discharge_date: date | None = None
    status: CaseStatus = CaseStatus.intake
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Lightweight summary for the case list page
class PatientCaseSummary(BaseModel):
    id: int
    patient_name: str
    status: CaseStatus
    risk_score: float | None = None
    missing_items_count: int = 0
    med_conflicts_count: int = 0
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Optional update payload — status intentionally excluded; use flow endpoints to advance state
class PatientCaseUpdate(BaseModel):
    patient_name: str | None = None
    age: int | None = None
    source_hospital: str | None = None
    discharge_date: date | None = None


# Document metadata after upload
class DocumentResponse(BaseModel):
    id: int
    case_id: int
    filename: str
    document_type: str = "discharge_summary"
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)
