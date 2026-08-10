"""Health facility registry, Facility Climate Resilience Score, and demand forecasting.

Facilities are a full pillar of the platform, not an afterthought: the school
catchment and the health post that serves it are the same protective system. Reads
are public; writes are staff-only. Nothing here is a clinical instrument.
"""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import FacilityResilienceScore, HealthFacility, User
from ..security import require_admin, require_reviewer
from ..services.scoring import FACILITY_WEIGHTS, forecast_demand, score_facility

router = APIRouter(prefix="/facilities", tags=["facilities"])


# ─────────────────────────── schemas ───────────────────────────


class FacilityBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    facility_type: str | None = Field(default=None, max_length=80)
    district: str = Field(min_length=2, max_length=120)
    region: str = Field(min_length=2, max_length=120)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    catchment_population: int | None = Field(default=None, ge=0)
    daily_consultation_capacity: int | None = Field(default=None, ge=0)
    is_active: bool = True


class FacilityCreate(FacilityBase):
    code: str = Field(min_length=2, max_length=40)


class FacilityUpdate(BaseModel):
    """Every field optional — a PATCH touches only what it names."""

    name: str | None = Field(default=None, min_length=2, max_length=200)
    facility_type: str | None = Field(default=None, max_length=80)
    district: str | None = Field(default=None, min_length=2, max_length=120)
    region: str | None = Field(default=None, min_length=2, max_length=120)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    catchment_population: int | None = Field(default=None, ge=0)
    daily_consultation_capacity: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class FacilityOut(FacilityBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    created_at: datetime
    updated_at: datetime


class FacilityScoreIn(BaseModel):
    """The five WHO dimensions, each 0-100 where 100 is best.

    Hazard exposure is scored as *managed* exposure: a facility that has mapped and
    planned for its dominant hazards scores high, whatever the raw hazard level.
    """

    infrastructure_resilience: float = Field(ge=0, le=100)
    service_continuity: float = Field(ge=0, le=100)
    hazard_exposure: float = Field(ge=0, le=100)
    supply_readiness: float = Field(ge=0, le=100)
    preparedness: float = Field(ge=0, le=100)


class FacilityScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    facility_id: int
    infrastructure_resilience: float
    service_continuity: float
    hazard_exposure: float
    supply_readiness: float
    preparedness: float
    overall: float
    biggest_gap: str | None
    priority_action: str | None
    created_at: datetime


class FacilityDetailOut(FacilityOut):
    latest_score: FacilityScoreOut | None = None


class DemandForecastOut(BaseModel):
    facility_id: int
    facility_name: str
    hazard: str
    horizon_hours: int
    expected_consultations_low: int
    expected_consultations_high: int
    expected_consultations_midpoint: float
    baseline_daily_consultations: float
    condition_multiplier: float
    peak_daily_demand: float
    daily_capacity: int
    capacity_over_horizon: int
    gap: str
    gap_note: str
    basis: str
    caveat: str


# ─────────────────────────── helpers ───────────────────────────


def _get_facility(db: Session, facility_id: int) -> HealthFacility:
    facility = db.get(HealthFacility, facility_id)
    if facility is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No health facility found with id {facility_id}.",
        )
    return facility


def _latest_score(db: Session, facility_id: int) -> FacilityResilienceScore | None:
    return db.scalars(
        select(FacilityResilienceScore)
        .where(FacilityResilienceScore.facility_id == facility_id)
        .order_by(FacilityResilienceScore.created_at.desc(), FacilityResilienceScore.id.desc())
        .limit(1)
    ).first()


# ─────────────────────────── endpoints ───────────────────────────


@router.get("", response_model=list[FacilityOut])
def list_facilities(
    db: Session = Depends(get_db),
    district: str | None = Query(default=None, description="Filter by district"),
    region: str | None = Query(default=None, description="Filter by region"),
    facility_type: str | None = Query(default=None, description="Filter by facility type"),
    is_active: bool | None = Query(default=None, description="Filter by active status"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> list[HealthFacility]:
    """List registered health facilities. Public read."""
    stmt = select(HealthFacility)
    if district:
        stmt = stmt.where(HealthFacility.district == district)
    if region:
        stmt = stmt.where(HealthFacility.region == region)
    if facility_type:
        stmt = stmt.where(HealthFacility.facility_type == facility_type)
    if is_active is not None:
        stmt = stmt.where(HealthFacility.is_active.is_(is_active))
    stmt = stmt.order_by(HealthFacility.name).offset(offset).limit(limit)
    return list(db.scalars(stmt).all())


# Declared before /{facility_id} so the literal path is not swallowed by the id route.
@router.get("/meta/weights", response_model=dict[str, float])
def scoring_weights() -> dict[str, float]:
    """The published dimension weights — part of the model card, not a secret."""
    return dict(FACILITY_WEIGHTS)


@router.get("/{facility_id}", response_model=FacilityDetailOut)
def get_facility(facility_id: int, db: Session = Depends(get_db)) -> FacilityDetailOut:
    """One facility, with its most recent resilience score attached."""
    facility = _get_facility(db, facility_id)
    detail = FacilityDetailOut.model_validate(facility)
    latest = _latest_score(db, facility_id)
    if latest is not None:
        detail.latest_score = FacilityScoreOut.model_validate(latest)
    return detail


@router.post("", response_model=FacilityOut, status_code=status.HTTP_201_CREATED)
def create_facility(
    payload: FacilityCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> HealthFacility:
    facility = HealthFacility(**payload.model_dump())
    db.add(facility)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A health facility with code '{payload.code}' is already registered.",
        ) from None
    db.refresh(facility)
    return facility


@router.patch("/{facility_id}", response_model=FacilityOut)
def update_facility(
    facility_id: int,
    payload: FacilityUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> HealthFacility:
    facility = _get_facility(db, facility_id)
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields supplied to update.",
        )
    for field, value in changes.items():
        setattr(facility, field, value)
    db.commit()
    db.refresh(facility)
    return facility


@router.post(
    "/{facility_id}/resilience",
    response_model=FacilityScoreOut,
    status_code=status.HTTP_201_CREATED,
)
def submit_facility_score(
    facility_id: int,
    payload: FacilityScoreIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_reviewer),
) -> FacilityResilienceScore:
    """Score a facility against the five WHO dimensions and record the result."""
    facility = _get_facility(db, facility_id)
    dimensions = payload.model_dump()
    result = score_facility(dimensions)

    record = FacilityResilienceScore(
        facility_id=facility.id,
        **dimensions,
        overall=result["overall"],
        biggest_gap=result["biggest_gap"],
        priority_action=result["priority_action"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/{facility_id}/resilience", response_model=list[FacilityScoreOut])
def facility_score_history(
    facility_id: int,
    db: Session = Depends(get_db),
    limit: int = Query(default=50, ge=1, le=200),
) -> list[FacilityResilienceScore]:
    """Score history for a facility, newest first."""
    _get_facility(db, facility_id)
    stmt = (
        select(FacilityResilienceScore)
        .where(FacilityResilienceScore.facility_id == facility_id)
        .order_by(FacilityResilienceScore.created_at.desc(), FacilityResilienceScore.id.desc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


@router.get("/{facility_id}/demand-forecast", response_model=DemandForecastOut)
def demand_forecast(
    facility_id: int,
    db: Session = Depends(get_db),
    hazard: str = Query(default="heat", description="Hazard the estimate relates to"),
    historical_incidence_per_1000_per_day: float = Query(
        ..., ge=0, le=1000, description="Historical hazard-related incidence per 1,000 people per day"
    ),
    forecast_temp_c: float | None = Query(default=None, ge=-20, le=60),
    forecast_rainfall_mm: float | None = Query(default=None, ge=0),
    forecast_aqi: float | None = Query(default=None, ge=0, le=1000),
    horizon_hours: int = Query(default=72, ge=1, le=168),
    catchment_population: int | None = Query(
        default=None, ge=1, description="Overrides the registered catchment population"
    ),
    daily_consultation_capacity: int | None = Query(
        default=None, ge=1, description="Overrides the registered daily consultation capacity"
    ),
) -> DemandForecastOut:
    """Estimate hazard-related consultations over the forecast horizon.

    Decision support only. The response carries the caveat verbatim because the
    number is useless — and potentially harmful — read without it.
    """
    facility = _get_facility(db, facility_id)

    population = catchment_population or facility.catchment_population
    capacity = daily_consultation_capacity or facility.daily_consultation_capacity

    # Refuse to guess: an invented catchment or capacity would silently change the
    # gap classification a facility manager acts on.
    missing = [
        label
        for label, value in (
            ("catchment population", population),
            ("daily consultation capacity", capacity),
        )
        if not value
    ]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Cannot forecast demand for '{facility.name}': no {' or '.join(missing)} recorded. "
                "Update the facility record or supply the value as a query parameter."
            ),
        )

    try:
        result = forecast_demand(
            catchment_population=population,
            historical_incidence_per_1000_per_day=historical_incidence_per_1000_per_day,
            daily_consultation_capacity=capacity,
            hazard=hazard,
            forecast_temp_c=forecast_temp_c,
            forecast_rainfall_mm=forecast_rainfall_mm,
            forecast_aqi=forecast_aqi,
            horizon_hours=horizon_hours,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from None

    return DemandForecastOut(facility_id=facility.id, facility_name=facility.name, **result)
