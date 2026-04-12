from pydantic import BaseModel
from datetime import datetime


class CarePlanTask(BaseModel):
    task: str
    category: str       # meds, monitoring, follow_up, critical
    priority: str       # low, medium, high, critical
    time_frame: str     # first_24h, 24_to_72h, day_3_to_7
    details: str | None = None


class MedicationSchedule(BaseModel):
    name: str
    dose: str
    frequency: str
    route: str | None = None
    special_instructions: str | None = None


class FollowUpReminder(BaseModel):
    provider_name: str
    specialty: str | None = None
    date: str | None = None
    time: str | None = None
    reason: str | None = None


class TimelineBucket(BaseModel):
    label: str          # "First 24 Hours", "24-72 Hours", "Day 3-7"
    tasks: list[CarePlanTask] = []


# The full care plan returned to the frontend
class CarePlanResponse(BaseModel):
    case_id: int
    generated_at: datetime
    timeline: list[TimelineBucket] = []
    medications_schedule: list[MedicationSchedule] = []
    follow_up_reminders: list[FollowUpReminder] = []
    monitoring_tasks: list[CarePlanTask] = []
    warning_signs: list[str] = []
    active_medications_count: int = 0
    med_conflicts_count: int = 0
    missing_items_count: int = 0
    follow_ups_due_count: int = 0
    med_conflicts: list[str] = []
    missing_items: list[str] = []
    active_medications_count: int = 0
    med_conflicts_count: int = 0
    missing_items_count: int = 0
    follow_ups_due_count: int = 0
    medication_conflicts: list[str] = []
    missing_items: list[str] = []
