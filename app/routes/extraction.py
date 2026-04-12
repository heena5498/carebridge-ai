import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.extraction import ExtractionResult
from app.services.case_service import get_case, update_case
from app.services.gemini_service import extract_from_pdf
from app.services.agent_service import run_agent_checks
from app.services.validation_service import validate_and_score

log = logging.getLogger(__name__)

router = APIRouter(prefix="/cases/{case_id}", tags=["extraction"])

# Statuses from which extraction can run (also allows re-run on already-extracted)
_EXTRACTABLE_STATUSES = {"intake", "extracted"}


@router.post("/extract", response_model=ExtractionResult)
async def extract_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Full extraction pipeline:
    1. Send PDF to Gemini for structured extraction
    2. Run internal agent checks (meds, follow-ups, risks)
    3. Run deterministic validation + confidence scoring
    4. Save result and update case status

    Requires case status in ('intake', 'extracted').
    Cases in 'in_review', 'approved', or 'care_plan_generated' cannot be re-extracted.
    """
    case = get_case(db, case_id)

    if case.status not in _EXTRACTABLE_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot extract: case status is '{case.status}'. "
                "Extraction is only allowed for cases in 'intake' or 'extracted' status."
            ),
        )

    if not case.documents:
        raise HTTPException(status_code=400, detail="No documents uploaded for this case.")

    # Prefer the discharge_summary document type; fall back to first document
    doc = next(
        (d for d in case.documents if d.document_type == "discharge_summary"),
        case.documents[0],
    )
    file_path = doc.file_path

    log.info("Starting extraction for case %d, document: %s", case_id, doc.filename)

    try:
        raw_extraction = await extract_from_pdf(case.id, file_path)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        log.error("Gemini extraction failed for case %d: %s", case_id, exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Extraction failed. Check PDF and try again.")

    try:
        reviewed_extraction = await run_agent_checks(raw_extraction)
    except Exception as exc:
        log.error("Agent checks failed for case %d: %s", case_id, exc, exc_info=True)
        # Agent failure is non-fatal — proceed with raw extraction
        reviewed_extraction = raw_extraction

    final_extraction = validate_and_score(reviewed_extraction)

    update_case(
        db, case,
        extraction_data=final_extraction.model_dump(mode="json"),
        status="extracted",
        # Clear stale review/care-plan data when re-extracting
        review_data=None,
        care_plan_data=None,
    )

    log.info(
        "Extraction complete for case %d — confidence: %.2f, missing: %d",
        case_id,
        final_extraction.overall_confidence,
        len(final_extraction.missing_information),
    )

    return final_extraction
