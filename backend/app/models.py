"""SQLAlchemy models — the ClimaSchool AI data model.

Privacy note, load-bearing rather than decorative: no table here holds an
identifiable child. Risk is assessed at school and community level, field reports
carry counts and symptoms rather than names, and the only personal data stored is
the contact detail of a consenting adult (a parent subscriber, a CHW, a reviewer).
"""

from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


# ─────────────────────────── enums ───────────────────────────


class RiskBand(str, enum.Enum):
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    ORANGE = "ORANGE"
    RED = "RED"


class Hazard(str, enum.Enum):
    HEAT = "heat"
    FLOOD_WASH = "flood_wash"
    DISEASE = "disease"
    AIR_QUALITY = "air_quality"
    NUTRITION = "nutrition"
    WELLBEING = "wellbeing"


class AlertStatus(str, enum.Enum):
    """The tracked early-warning-to-early-action chain."""

    CREATED = "created"
    REVIEWED = "reviewed"
    ISSUED = "issued"
    ACKNOWLEDGED = "acknowledged"
    ACTION_STARTED = "action_started"
    ACTION_COMPLETED = "action_completed"
    CLOSED = "closed"
    REJECTED = "rejected"


class ActorType(str, enum.Enum):
    SCHOOL = "school"
    PARENT = "parent"
    CHW = "chw"
    FACILITY = "facility"
    INSTITUTION = "institution"


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    REVIEWER = "reviewer"
    CHW = "chw"
    OBSERVER = "observer"


class Channel(str, enum.Enum):
    SMS = "sms"
    USSD = "ussd"
    WHATSAPP = "whatsapp"
    VOICE = "voice"


class Language(str, enum.Enum):
    EN = "en"
    TW = "tw"
    HA = "ha"
    GA = "ga"


class Season(str, enum.Enum):
    HARMATTAN = "harmattan"
    DRYHEAT = "dryheat"
    FIRSTRAINS = "firstrains"
    SECONDRAINS = "secondrains"


# ─────────────────────────── mixins ───────────────────────────


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


# ─────────────────────────── people ───────────────────────────


class User(Base, TimestampMixin):
    """Staff and authorised institutional users. Not children, not parents."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    organisation: Mapped[str | None] = mapped_column(String(160))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), default=UserRole.OBSERVER, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Subscriber(Base, TimestampMixin):
    """A consenting parent or caregiver receiving guidance. Adult contact only."""

    __tablename__ = "subscribers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    phone: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(120))
    language: Mapped[Language] = mapped_column(Enum(Language, name="language"), default=Language.EN, nullable=False)
    channel: Mapped[Channel] = mapped_column(Enum(Channel, name="channel"), default=Channel.SMS, nullable=False)
    school_id: Mapped[int | None] = mapped_column(ForeignKey("schools.id", ondelete="SET NULL"), index=True)
    consent_given: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    consent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    school: Mapped["School | None"] = relationship(back_populates="subscribers")


# ─────────────────────────── places ───────────────────────────


class School(Base, TimestampMixin):
    __tablename__ = "schools"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    district: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    region: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    pilot_zone: Mapped[str | None] = mapped_column(String(120))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)

    enrolment: Mapped[int | None] = mapped_column(Integer)
    building_type: Mapped[str | None] = mapped_column(String(80))
    has_school_feeding: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    distance_to_facility_km: Mapped[float | None] = mapped_column(Float)
    flood_zone_proximity_m: Mapped[float | None] = mapped_column(Float)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    subscribers: Mapped[list[Subscriber]] = relationship(back_populates="school")
    resilience_scores: Mapped[list["SchoolResilienceScore"]] = relationship(
        back_populates="school", cascade="all, delete-orphan"
    )
    risk_assessments: Mapped[list["RiskAssessment"]] = relationship(back_populates="school")


class HealthFacility(Base, TimestampMixin):
    __tablename__ = "health_facilities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    facility_type: Mapped[str | None] = mapped_column(String(80))
    district: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    region: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    catchment_population: Mapped[int | None] = mapped_column(Integer)
    daily_consultation_capacity: Mapped[int | None] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    resilience_scores: Mapped[list["FacilityResilienceScore"]] = relationship(
        back_populates="facility", cascade="all, delete-orphan"
    )


# ─────────────────────── resilience scoring ───────────────────────


class SchoolResilienceScore(Base, TimestampMixin):
    """Eight scored dimensions, 0-100 each, combined into an overall score."""

    __tablename__ = "school_resilience_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    school_id: Mapped[int] = mapped_column(ForeignKey("schools.id", ondelete="CASCADE"), index=True, nullable=False)

    heat_exposure: Mapped[float] = mapped_column(Float, default=0)
    flood_exposure: Mapped[float] = mapped_column(Float, default=0)
    wash_readiness: Mapped[float] = mapped_column(Float, default=0)
    nutrition_resilience: Mapped[float] = mapped_column(Float, default=0)
    health_service_access: Mapped[float] = mapped_column(Float, default=0)
    air_quality_exposure: Mapped[float] = mapped_column(Float, default=0)
    early_warning_readiness: Mapped[float] = mapped_column(Float, default=0)
    infrastructure_resilience: Mapped[float] = mapped_column(Float, default=0)

    overall: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    biggest_gap: Mapped[str | None] = mapped_column(String(80))
    priority_action: Mapped[str | None] = mapped_column(Text)

    school: Mapped[School] = relationship(back_populates="resilience_scores")


class FacilityResilienceScore(Base, TimestampMixin):
    """Five dimensions from the WHO climate-resilient health systems framework."""

    __tablename__ = "facility_resilience_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    facility_id: Mapped[int] = mapped_column(
        ForeignKey("health_facilities.id", ondelete="CASCADE"), index=True, nullable=False
    )

    infrastructure_resilience: Mapped[float] = mapped_column(Float, default=0)
    service_continuity: Mapped[float] = mapped_column(Float, default=0)
    hazard_exposure: Mapped[float] = mapped_column(Float, default=0)
    supply_readiness: Mapped[float] = mapped_column(Float, default=0)
    preparedness: Mapped[float] = mapped_column(Float, default=0)

    overall: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    biggest_gap: Mapped[str | None] = mapped_column(String(80))
    priority_action: Mapped[str | None] = mapped_column(Text)

    facility: Mapped[HealthFacility] = relationship(back_populates="resilience_scores")


# ─────────────────────── climate + risk ───────────────────────


class ClimateReading(Base, TimestampMixin):
    """A single observation or forecast for a district, from any of the five data categories."""

    __tablename__ = "climate_readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    district: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    school_id: Mapped[int | None] = mapped_column(ForeignKey("schools.id", ondelete="SET NULL"), index=True)

    source: Mapped[str] = mapped_column(String(120), default="manual", nullable=False)
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True, nullable=False
    )

    temp_c: Mapped[float | None] = mapped_column(Float)
    humidity: Mapped[float | None] = mapped_column(Float)
    aqi: Mapped[float | None] = mapped_column(Float)
    rainfall_mm: Mapped[float | None] = mapped_column(Float)

    __table_args__ = (Index("ix_climate_readings_district_observed", "district", "observed_at"),)


class RiskAssessment(Base, TimestampMixin):
    """Output of the multi-hazard engine for one district or school at one moment."""

    __tablename__ = "risk_assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    district: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    school_id: Mapped[int | None] = mapped_column(ForeignKey("schools.id", ondelete="SET NULL"), index=True)
    reading_id: Mapped[int | None] = mapped_column(ForeignKey("climate_readings.id", ondelete="SET NULL"))

    season: Mapped[Season] = mapped_column(Enum(Season, name="season"), nullable=False)
    band: Mapped[RiskBand] = mapped_column(Enum(RiskBand, name="risk_band"), index=True, nullable=False)
    overall: Mapped[float] = mapped_column(Float, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0, nullable=False)

    # {"heat": 71.0, "flood_wash": 12.0, ...} — one entry per hazard engine.
    module_scores: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    # ["forecast 39.4C", "humidity 31%", ...] — what the classification was based on.
    evidence: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    school: Mapped[School | None] = relationship(back_populates="risk_assessments")
    alerts: Mapped[list["Alert"]] = relationship(back_populates="assessment")


# ─────────────────────── alerts + lifecycle ───────────────────────


class Alert(Base, TimestampMixin):
    """An alert moving through the safety gate and then the action chain."""

    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    assessment_id: Mapped[int | None] = mapped_column(ForeignKey("risk_assessments.id", ondelete="SET NULL"))
    school_id: Mapped[int | None] = mapped_column(ForeignKey("schools.id", ondelete="SET NULL"), index=True)
    facility_id: Mapped[int | None] = mapped_column(ForeignKey("health_facilities.id", ondelete="SET NULL"))
    district: Mapped[str] = mapped_column(String(120), index=True, nullable=False)

    hazard: Mapped[Hazard] = mapped_column(Enum(Hazard, name="hazard"), nullable=False)
    band: Mapped[RiskBand] = mapped_column(Enum(RiskBand, name="risk_band"), index=True, nullable=False)
    status: Mapped[AlertStatus] = mapped_column(
        Enum(AlertStatus, name="alert_status"), default=AlertStatus.CREATED, index=True, nullable=False
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    evidence: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    # ORANGE and RED must not leave the system without a named human approving them.
    requires_human_review: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reviewed_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    issued_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    assessment: Mapped[RiskAssessment | None] = relationship(back_populates="alerts")
    events: Mapped[list["AlertEvent"]] = relationship(
        back_populates="alert", cascade="all, delete-orphan", order_by="AlertEvent.id"
    )


class AlertEvent(Base):
    """One step of the alert lifecycle — the audit trail behind Minutes of Protection."""

    __tablename__ = "alert_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    alert_id: Mapped[int] = mapped_column(ForeignKey("alerts.id", ondelete="CASCADE"), index=True, nullable=False)
    status: Mapped[AlertStatus] = mapped_column(Enum(AlertStatus, name="alert_status"), nullable=False)
    actor_type: Mapped[ActorType | None] = mapped_column(Enum(ActorType, name="actor_type"))
    actor_reference: Mapped[str | None] = mapped_column(String(160))
    note: Mapped[str | None] = mapped_column(Text)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    alert: Mapped[Alert] = relationship(back_populates="events")


# ─────────────────────── field intelligence ───────────────────────


class FieldReport(Base, TimestampMixin):
    """A structured report from a CHW, teacher or school nurse. Counts, never names."""

    __tablename__ = "field_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    school_id: Mapped[int | None] = mapped_column(ForeignKey("schools.id", ondelete="SET NULL"), index=True)
    facility_id: Mapped[int | None] = mapped_column(ForeignKey("health_facilities.id", ondelete="SET NULL"))
    district: Mapped[str] = mapped_column(String(120), index=True, nullable=False)

    reporter_type: Mapped[ActorType] = mapped_column(Enum(ActorType, name="actor_type"), nullable=False)
    reporter_reference: Mapped[str | None] = mapped_column(String(160))
    channel: Mapped[Channel] = mapped_column(Enum(Channel, name="channel"), default=Channel.SMS, nullable=False)

    # SMS keyword codes, e.g. ["FEVER", "DIARRHOEA"]
    keywords: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    cases_reported: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    households_visited: Mapped[int | None] = mapped_column(Integer)
    absences_reported: Mapped[int | None] = mapped_column(Integer)
    note: Mapped[str | None] = mapped_column(Text)

    triaged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    generated_alert_id: Mapped[int | None] = mapped_column(ForeignKey("alerts.id", ondelete="SET NULL"))


class Enquiry(Base, TimestampMixin):
    """Partnership and contact enquiries from the public site."""

    __tablename__ = "enquiries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    organisation: Mapped[str | None] = mapped_column(String(200))
    topic: Mapped[str | None] = mapped_column(String(120))
    message: Mapped[str] = mapped_column(Text, nullable=False)
    handled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
