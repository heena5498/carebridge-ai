"""
Care plan generation service.
Transforms approved extraction data into a patient-friendly care plan
organized by timeline buckets and task categories.
"""

from datetime import datetime, timezone
from app.schemas.extraction import ExtractionResult
from app.schemas.care_plan import (
    CarePlanResponse, CarePlanTask, TimelineBucket,
    MedicationSchedule, FollowUpReminder,
)


async def generate_care_plan(case_id: int, extraction: ExtractionResult) -> CarePlanResponse:
    """
    Build a care plan from extraction data.

    TODO: Optionally enhance with a Gemini call for patient-friendly language.
    For now, uses deterministic mapping from extraction to care plan.
    """

    # Build medication schedule
    med_schedule = [
        MedicationSchedule(
            name=m.name,
            dose=m.dose or "as prescribed",
            frequency=m.frequency or "as directed",
            route=m.route,
            special_instructions=m.purpose,
        )
        for m in extraction.medications
    ]

    # Build follow-up reminders
    reminders = [
        FollowUpReminder(
            provider_name=f.provider_name or "TBD",
            specialty=f.specialty,
            date=f.appointment_date,
            time=f.appointment_time,
            reason=f.reason,
        )
        for f in extraction.follow_ups
    ]

    # Map care tasks into timeline buckets
    bucket_map = {"first_24h": [], "24_to_72h": [], "day_3_to_7": []}
    monitoring = []

    for task in extraction.care_tasks:
        plan_task = CarePlanTask(
            task=task.task,
            category=task.category,
            priority=task.priority,
            time_frame=task.time_frame or "first_24h",
        )
        bucket_map.get(plan_task.time_frame, bucket_map["first_24h"]).append(plan_task)
        if task.category == "monitoring":
            monitoring.append(plan_task)

    # Add medication tasks to first 24h if not already present
    for med in extraction.medications:
        bucket_map["first_24h"].append(CarePlanTask(
            task=f"Take {med.name} {med.dose or ''} {med.frequency or ''}".strip(),
            category="meds",
            priority="high",
            time_frame="first_24h",
        ))

    timeline = [
        TimelineBucket(label="First 24 Hours", tasks=bucket_map["first_24h"]),
        TimelineBucket(label="24-72 Hours", tasks=bucket_map["24_to_72h"]),
        TimelineBucket(label="Day 3-7", tasks=bucket_map["day_3_to_7"]),
    ]

    med_conflicts = [
        risk for risk in extraction.risks
        if "med" in risk.category.lower() and risk.severity.lower() in {"high", "critical"}
    ]
    missing_items = [f"{item.field_name}: {item.reason}" for item in extraction.missing_information]

    return CarePlanResponse(
        case_id=case_id,
        generated_at=datetime.now(timezone.utc),
        timeline=timeline,
        medications_schedule=med_schedule,
        follow_up_reminders=reminders,
        monitoring_tasks=monitoring,
        warning_signs=extraction.warning_signs,
        active_medications_count=len(med_schedule),
        med_conflicts_count=len(med_conflicts),
        missing_items_count=len(extraction.missing_information),
        follow_ups_due_count=len(reminders),
        med_conflicts=[risk.description for risk in med_conflicts],
        missing_items=missing_items,
    )
