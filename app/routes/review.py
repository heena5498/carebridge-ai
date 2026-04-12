from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_facility_user
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.review import NurseReviewPayload, ReviewUpdate
from app.schemas.extraction import ExtractionResult
from app.services.case_service import get_case, update_case
from app.services.validation_service import build_review_payload

router = APIRouter(prefix="/cases/{case_id}", tags=["review"])


@router.get("/review", response_model=NurseReviewPayload)
def get_review(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_facility_user),
):
    """Build and return the nurse review payload from extraction data."""
    case = get_case(db, case_id)

    if not case.extraction_data:
        raise HTTPException(status_code=400, detail="Extraction not yet run")

    extraction = ExtractionResult(**case.extraction_data)
    payload = build_review_payload(extraction)

    # Save review data and update status
    update_case(db, case, review_data=payload.model_dump(mode="json"), status="in_review")

    return payload


@router.patch("/review", response_model=NurseReviewPayload)
def update_review(
    case_id: int,
    body: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_facility_user),
):
    """Nurse edits extracted data (allergies, meds, follow-ups, etc.)."""
    case = get_case(db, case_id)

    if not case.review_data:
        raise HTTPException(status_code=400, detail="Review not yet generated")

    extraction_dict = case.review_data["extraction"]

    # Apply nurse edits to extraction data
    if body.allergies is not None:
        extraction_dict["allergies"] = body.allergies
    if body.medications is not None:
        extraction_dict["medications"] = body.medications
    if body.follow_ups is not None:
        extraction_dict["follow_ups"] = body.follow_ups
    if body.risks is not None:
        extraction_dict["risks"] = body.risks

    # Preserve existing nurse notes if not provided
    nurse_notes = body.nurse_notes if body.nurse_notes is not None else case.review_data.get("nurse_notes")

    # Re-run review payload generation with updated data
    updated_extraction = ExtractionResult(**extraction_dict)
    payload = build_review_payload(updated_extraction)
    payload.nurse_notes = nurse_notes

    # Save both review and extraction data
    update_case(
        db, case,
        review_data=payload.model_dump(mode="json"),
        extraction_data=updated_extraction.model_dump(mode="json"),
    )

    return payload


@router.post("/approve", response_model=dict)
def approve_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_facility_user),
):
    """Nurse approves the review — case moves to approved status."""
    case = get_case(db, case_id)

    if not case.review_data:
        raise HTTPException(status_code=400, detail="Review not yet generated")

    if not case.review_data.get("ready_for_approval"):
        raise HTTPException(
            status_code=400,
            detail="Case has unresolved issues and cannot be approved",
        )

    update_case(db, case, status="approved")

    return {"case_id": case.id, "status": "approved"}
