from pydantic import BaseModel
from enum import Enum
from app.schemas.extraction import ExtractionResult, MedicationItem, FollowUpItem, RiskItem


class FieldStatus(str, Enum):
    auto_accepted = "auto_accepted"     # confidence >= 0.85
    needs_review = "needs_review"       # confidence 0.60-0.84
    blocked = "blocked"                 # confidence < 0.60 or hard block


class ReviewField(BaseModel):
    field_name: str
    status: FieldStatus
    confidence: float
    issue: str | None = None  # why it needs review or is blocked


class UnresolvedIssue(BaseModel):
    field_name: str
    issue: str
    severity: str = "medium"


# Full payload the nurse sees on the review page
class NurseReviewPayload(BaseModel):
    case_id: int
    summary_status: FieldStatus  # worst status across all fields
    extraction: ExtractionResult
    fields: list[ReviewField] = []
    unresolved_issues: list[UnresolvedIssue] = []
    ready_for_approval: bool = False
    nurse_notes: str | None = None


# What the nurse sends back when editing the review
class ReviewUpdate(BaseModel):
    allergies: list[str] | None = None
    medications: list[MedicationItem] | None = None
    follow_ups: list[FollowUpItem] | None = None
    risks: list[RiskItem] | None = None
    nurse_notes: str | None = None
