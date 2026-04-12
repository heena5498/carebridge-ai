from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base  # type: ignore


class PatientCase(Base):
    __tablename__ = "patient_cases"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_name: Mapped[str] = mapped_column(String(200), nullable=False)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source_hospital: Mapped[str | None] = mapped_column(String(200), nullable=True)
    discharge_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="intake")
    facility_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    discharge_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    patient_email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    patient_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Complex nested data stored as JSON
    extraction_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    review_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    care_plan_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    documents: Mapped[list["Document"]] = relationship(back_populates="case")
    patient_user: Mapped["User | None"] = relationship(back_populates="cases")


from app.db.models.document import Document  # noqa: E402
from app.db.models.user import User  # noqa: E402
