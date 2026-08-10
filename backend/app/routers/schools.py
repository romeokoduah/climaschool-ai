"""School registry and School Climate Resilience Score endpoints.

Reads are public: the site renders the pilot schools without a token, and nothing
here is personal data — a school is a place, not a child. Writes are staff-only.
"""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import School, SchoolResilienceScore, User
from ..security import require_admin, require_reviewer
from ..services.scoring import SCHOOL_WEIGHTS, score_school

router = APIRouter(prefix="/schools", tags=["schools"])


# ─────────────────────────── schemas ───────────────────────────


class SchoolBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    district: str = Field(min_length=2, max_length=120)
    region: str = Field(min_length=2, max_length=120)
    pilot_zone: str | None = Field(default=None, max_length=120)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    enrolment: int | None = Field(default=None, ge=0)
    building_type: str | None = Field(default=None, max_length=80)
    has_school_feeding: bool = False
    distance_to_facility_km: float | None = Field(default=None, ge=0)
    flood_zone_proximity_m: float | None = Field(default=None, ge=0)
    is_active: bool = True


class SchoolCreate(SchoolBase):
    code: str = Field(min_length=2, max_length=40)


class SchoolUpdate(BaseModel):
    """Every field optional — a PATCH touches only what it names."""

    name: str | None = Field(default=None, min_length=2, max_length=200)
    district: str | None = Field(default=None, min_length=2, max_length=120)
    region: str | None = Field(default=None, min_length=2, max_length=120)
    pilot_zone: str | None = Field(default=None, max_length=120)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    enrolment: int | None = Field(default=None, ge=0)
    building_type: str | None = Field(default=None, max_length=80)
    has_school_feeding: bool | None = None
    distance_to_facility_km: float | None = Field(default=None, ge=0)
    flood_zone_proximity_m: float | None = Field(default=None, ge=0)
    is_active: bool | None = None


class SchoolOut(SchoolBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    created_at: datetime
    updated_at: datetime


class ResilienceScoreIn(BaseModel):
    """The eight dimensions, each 0-100 where 100 is best.

    The four 'exposure' dimensions are scored as *managed* exposure: a school with
    shade, ventilation and a heat timetable scores high on heat exposure.
    """

    heat_exposure: float = Field(ge=0, le=100)
    flood_exposure: float = Field(ge=0, le=100)
    wash_readiness: float = Field(ge=0, le=100)
    nutrition_resilience: float = Field(ge=0, le=100)
    health_service_access: float = Field(ge=0, le=100)
    air_quality_exposure: float = Field(ge=0, le=100)
    early_warning_readiness: float = Field(ge=0, le=100)
    infrastructure_resilience: float = Field(ge=0, le=100)


class ResilienceScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    school_id: int
    heat_exposure: float
    flood_exposure: float
    wash_readiness: float
    nutrition_resilience: float
    health_service_access: float
    air_quality_exposure: float
    early_warning_readiness: float
    infrastructure_resilience: float
    overall: float
    biggest_gap: str | None
    priority_action: str | None
    created_at: datetime


class SchoolDetailOut(SchoolOut):
    latest_score: ResilienceScoreOut | None = None


# ─────────────────────────── helpers ───────────────────────────


def _get_school(db: Session, school_id: int) -> School:
    school = db.get(School, school_id)
    if school is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No school found with id {school_id}.",
        )
    return school


def _latest_score(db: Session, school_id: int) -> SchoolResilienceScore | None:
    return db.scalars(
        select(SchoolResilienceScore)
        .where(SchoolResilienceScore.school_id == school_id)
        .order_by(SchoolResilienceScore.created_at.desc(), SchoolResilienceScore.id.desc())
        .limit(1)
    ).first()


# ─────────────────────────── endpoints ───────────────────────────


@router.get("", response_model=list[SchoolOut])
def list_schools(
    db: Session = Depends(get_db),
    district: str | None = Query(default=None, description="Filter by district"),
    region: str | None = Query(default=None, description="Filter by region"),
    pilot_zone: str | None = Query(default=None, description="Filter by pilot zone"),
    is_active: bool | None = Query(default=None, description="Filter by active status"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> list[School]:
    """List registered schools. Public read — the site renders this without a token."""
    stmt = select(School)
    if district:
        stmt = stmt.where(School.district == district)
    if region:
        stmt = stmt.where(School.region == region)
    if pilot_zone:
        stmt = stmt.where(School.pilot_zone == pilot_zone)
    if is_active is not None:
        stmt = stmt.where(School.is_active.is_(is_active))
    stmt = stmt.order_by(School.name).offset(offset).limit(limit)
    return list(db.scalars(stmt).all())


# Declared before /{school_id} so the literal path is not swallowed by the id route.
@router.get("/meta/weights", response_model=dict[str, float])
def scoring_weights() -> dict[str, float]:
    """The published dimension weights — part of the model card, not a secret."""
    return dict(SCHOOL_WEIGHTS)


@router.get("/{school_id}", response_model=SchoolDetailOut)
def get_school(school_id: int, db: Session = Depends(get_db)) -> SchoolDetailOut:
    """One school, with its most recent resilience score attached."""
    school = _get_school(db, school_id)
    detail = SchoolDetailOut.model_validate(school)
    latest = _latest_score(db, school_id)
    if latest is not None:
        detail.latest_score = ResilienceScoreOut.model_validate(latest)
    return detail


@router.post("", response_model=SchoolOut, status_code=status.HTTP_201_CREATED)
def create_school(
    payload: SchoolCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> School:
    school = School(**payload.model_dump())
    db.add(school)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A school with code '{payload.code}' is already registered.",
        ) from None
    db.refresh(school)
    return school


@router.patch("/{school_id}", response_model=SchoolOut)
def update_school(
    school_id: int,
    payload: SchoolUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> School:
    school = _get_school(db, school_id)
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields supplied to update.",
        )
    for field, value in changes.items():
        setattr(school, field, value)
    db.commit()
    db.refresh(school)
    return school


@router.post(
    "/{school_id}/resilience",
    response_model=ResilienceScoreOut,
    status_code=status.HTTP_201_CREATED,
)
def submit_resilience_score(
    school_id: int,
    payload: ResilienceScoreIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_reviewer),
) -> SchoolResilienceScore:
    """Score a school against the eight dimensions and record the result.

    Scores are appended, never overwritten — the history is how improvement gets
    evidenced to a funder, and how a bad assessment stays visible.
    """
    school = _get_school(db, school_id)
    dimensions = payload.model_dump()
    result = score_school(dimensions)

    record = SchoolResilienceScore(
        school_id=school.id,
        **dimensions,
        overall=result["overall"],
        biggest_gap=result["biggest_gap"],
        priority_action=result["priority_action"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/{school_id}/resilience", response_model=list[ResilienceScoreOut])
def resilience_history(
    school_id: int,
    db: Session = Depends(get_db),
    limit: int = Query(default=50, ge=1, le=200),
) -> list[SchoolResilienceScore]:
    """Score history for a school, newest first."""
    _get_school(db, school_id)
    stmt = (
        select(SchoolResilienceScore)
        .where(SchoolResilienceScore.school_id == school_id)
        .order_by(SchoolResilienceScore.created_at.desc(), SchoolResilienceScore.id.desc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())
