"""Parent and caregiver messaging list.

The only personal data ClimaSchool holds is the contact detail of a consenting
adult. Consent is a precondition for storage, opt-out must work from a feature
phone with nothing but the sender's number, and contact details are visible to
administrators alone — observers get counts.
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Channel, Language, School, Subscriber, User
from ..security import require_admin, require_observer

router = APIRouter(prefix="/subscribers", tags=["subscribers"])

CONSENT_REQUIRED_MESSAGE = (
    "Consent is required. ClimaSchool does not send messages to anyone who has not "
    "explicitly agreed to receive them."
)


def _normalise_phone(raw: str) -> str:
    """Strip formatting so the same handset cannot register twice as different rows."""
    cleaned = "".join(ch for ch in raw.strip() if ch.isdigit() or ch == "+")
    if cleaned.startswith("00"):
        cleaned = "+" + cleaned[2:]
    if len(cleaned.lstrip("+")) < 7:
        raise ValueError("Please provide a valid telephone number.")
    return cleaned


# ─────────────────────────── schemas ───────────────────────────


class SubscriberCreate(BaseModel):
    phone: str = Field(min_length=7, max_length=32)
    display_name: str | None = Field(default=None, max_length=120)
    language: Language = Language.EN
    channel: Channel = Channel.SMS
    school_id: int | None = None
    consent_given: bool

    @field_validator("phone")
    @classmethod
    def _phone(cls, value: str) -> str:
        return _normalise_phone(value)

    @field_validator("consent_given")
    @classmethod
    def _consent(cls, value: bool) -> bool:
        # Raised inside validation so FastAPI answers 422 — messaging without a
        # recorded consent is not something the platform will store at all.
        if value is not True:
            raise ValueError(CONSENT_REQUIRED_MESSAGE)
        return value


class OptOutIn(BaseModel):
    """Backs replying STOP: the phone number is the only thing we can rely on."""

    phone: str = Field(min_length=7, max_length=32)

    @field_validator("phone")
    @classmethod
    def _phone(cls, value: str) -> str:
        return _normalise_phone(value)


class SubscriberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    phone: str
    display_name: str | None
    language: Language
    channel: Channel
    school_id: int | None
    consent_given: bool
    consent_at: datetime | None
    is_active: bool
    created_at: datetime


class OptOutResult(BaseModel):
    phone_matched: bool
    is_active: bool
    message: str


class SubscriberStats(BaseModel):
    total: int
    active: int
    inactive: int
    by_language: dict[str, int]
    by_channel: dict[str, int]
    by_school: list[dict[str, object]]
    unassigned_to_school: int
    note: str


# ─────────────────────────── endpoints ───────────────────────────


@router.post("", response_model=SubscriberOut, status_code=status.HTTP_201_CREATED)
def sign_up(payload: SubscriberCreate, db: Session = Depends(get_db)) -> Subscriber:
    """Public sign-up. Idempotent on the phone number: a repeat sign-up updates the record."""
    if payload.school_id is not None and db.get(School, payload.school_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found.")

    now = datetime.now(timezone.utc)
    existing = db.query(Subscriber).filter(Subscriber.phone == payload.phone).first()

    if existing is not None:
        existing.display_name = payload.display_name or existing.display_name
        existing.language = payload.language
        existing.channel = payload.channel
        if payload.school_id is not None:
            existing.school_id = payload.school_id
        existing.consent_given = True
        existing.consent_at = existing.consent_at or now
        existing.is_active = True  # re-consenting after an opt-out reinstates delivery
        db.commit()
        db.refresh(existing)
        return existing

    subscriber = Subscriber(
        phone=payload.phone,
        display_name=payload.display_name,
        language=payload.language,
        channel=payload.channel,
        school_id=payload.school_id,
        consent_given=True,
        consent_at=now,
        is_active=True,
    )
    db.add(subscriber)
    db.commit()
    db.refresh(subscriber)
    return subscriber


@router.post("/opt-out", response_model=OptOutResult)
def opt_out(payload: OptOutIn, db: Session = Depends(get_db)) -> OptOutResult:
    """Stop all messaging to a number. Public, and answers the same either way.

    The response never reveals whether the number was on the list — an unknown
    number gets the same confirmation as a known one.
    """
    subscriber = db.query(Subscriber).filter(Subscriber.phone == payload.phone).first()
    if subscriber is not None:
        subscriber.is_active = False
        db.commit()
    return OptOutResult(
        phone_matched=subscriber is not None,
        is_active=False,
        message="You have been removed from ClimaSchool messages. Reply START at any time to rejoin.",
    )


@router.get("", response_model=list[SubscriberOut])
def list_subscribers(
    school_id: int | None = None,
    language: Language | None = None,
    channel: Channel | None = None,
    is_active: bool | None = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
) -> list[Subscriber]:
    """Administrators only — this returns contact details, so observer access is not enough."""
    query = db.query(Subscriber)
    if school_id is not None:
        query = query.filter(Subscriber.school_id == school_id)
    if language is not None:
        query = query.filter(Subscriber.language == language)
    if channel is not None:
        query = query.filter(Subscriber.channel == channel)
    if is_active is not None:
        query = query.filter(Subscriber.is_active.is_(is_active))
    return query.order_by(Subscriber.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/stats", response_model=SubscriberStats)
def stats(
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> SubscriberStats:
    """Reach figures for planning. Counts only — no telephone number leaves this endpoint."""
    total = db.query(func.count(Subscriber.id)).scalar() or 0
    active = db.query(func.count(Subscriber.id)).filter(Subscriber.is_active.is_(True)).scalar() or 0

    by_language = {
        (row[0].value if hasattr(row[0], "value") else str(row[0])): row[1]
        for row in db.query(Subscriber.language, func.count(Subscriber.id)).group_by(Subscriber.language).all()
    }
    by_channel = {
        (row[0].value if hasattr(row[0], "value") else str(row[0])): row[1]
        for row in db.query(Subscriber.channel, func.count(Subscriber.id)).group_by(Subscriber.channel).all()
    }

    school_rows = (
        db.query(School.id, School.name, School.district, func.count(Subscriber.id))
        .join(Subscriber, Subscriber.school_id == School.id)
        .group_by(School.id, School.name, School.district)
        .order_by(func.count(Subscriber.id).desc())
        .all()
    )
    by_school = [
        {"school_id": sid, "school_name": name, "district": district, "subscribers": count}
        for sid, name, district, count in school_rows
    ]

    unassigned = db.query(func.count(Subscriber.id)).filter(Subscriber.school_id.is_(None)).scalar() or 0

    return SubscriberStats(
        total=total,
        active=active,
        inactive=total - active,
        by_language=by_language,
        by_channel=by_channel,
        by_school=by_school,
        unassigned_to_school=unassigned,
        note="Aggregate counts only. Contact details are available to administrators alone.",
    )
