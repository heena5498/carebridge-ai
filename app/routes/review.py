import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.review import NurseReviewPayload, ReviewUpdate
from app.schemas.extraction import ExtractionResult
from app.services.case_service import get_case, update_case
from app.services.validation_service import build_review_payload

log = logging.getLogger(__name__)

router = APIRouter(prefix="/cases/{case_id}", tags=["review"])


@router.post("/review", response_model=NurseReviewPayload, status_code=200)
def initialize_review(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Initialize (or refresh) the nurse review payload from extraction data.
    Sets case status to in_review and saves the review payload.
    Must be called before GET /review or PATCH /review.

    Requires case status == 'extracted'.
    """
    case = get_case(db, case_id)

    if case.status not in ("extracted", "in_review"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot start review: case status is '{case.status}'. Run extraction first.",
        )

    if not case.extraction_data:
        raise HTTPException(status_code=400, detail="Extraction data not found. Run extraction first.")

    extraction = ExtractionResult(**case.extraction_data)
    payload = build_review_payload(extraction)

    update_case(db, case, review_data=payload.model_dump(mode="json"), status="in_review")
    log.info("Review initialized for case %d by user %d", case_id, current_user.id)

    return payload


@router.get("/review", response_model=NurseReviewPayload)
def get_review(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return the existing nurse review payload. Read-only — does not mutate state.
    POST /review must be called first to initialize the review.
    """
    case = get_case(db, case_id)

    if not case.review_data:
        raise HTTPException(
            status_code=400,
            detail="Review not yet initialized. POST to /cases/{case_id}/review to start review.",
        )

    return NurseReviewPayload(**case.review_data)


@router.patch("/review", response_model=NurseReviewPayload)
def update_review(
    case_id: int,
    body: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Nurse edits extracted data (allergies, meds, follow-ups, risks)."""
    case = get_case(db, case_id)

    if case.status != "in_review":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot edit review: case status is '{case.status}'. Initialize review first.",
        )

    if not case.review_data:
        raise HTTPException(status_code=400, detail="Review not yet initialized.")

    extraction_dict = dict(case.review_data["extraction"])

    # Apply nurse edits — convert typed Pydantic models to JSON-safe dicts
    if body.allergies is not None:
        extraction_dict["allergies"] = body.allergies
    if body.medications is not None:
        extraction_dict["medications"] = [m.model_dump(mode="json") for m in body.medications]
    if body.follow_ups is not None:
        extraction_dict["follow_ups"] = [f.model_dump(mode="json") for f in body.follow_ups]
    if body.risks is not None:
        extraction_dict["risks"] = [r.model_dump(mode="json") for r in body.risks]

    nurse_notes = body.nurse_notes if body.nurse_notes is not None else case.review_data.get("nurse_notes")

    updated_extraction = ExtractionResult(**extraction_dict)
    payload = build_review_payload(updated_extraction)
    payload.nurse_notes = nurse_notes

    update_case(
        db, case,
        review_data=payload.model_dump(mode="json"),
        extraction_data=updated_extraction.model_dump(mode="json"),
    )

    log.info("Review updated for case %d by user %d", case_id, current_user.id)
    return payload


@router.post("/approve", response_model=dict)
def approve_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Nurse approves the review — case moves to approved status."""
    case = get_case(db, case_id)

    if case.status != "in_review":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot approve: case status is '{case.status}'. Case must be in_review.",
        )

    if not case.review_data:
        raise HTTPException(status_code=400, detail="Review not yet initialized.")

    if not case.review_data.get("ready_for_approval"):
        raise HTTPException(
            status_code=400,
            detail="Case has unresolved issues and cannot be approved. Resolve all blocking items first.",
        )

    update_case(db, case, status="approved")
    log.info("Case %d approved by user %d", case_id, current_user.id)

    return {"case_id": case.id, "status": "approved"}
