"""Climate reading ingest, and the public Engine Room classifier.

Ingest and classification share one code path on purpose: what the public sees on
the Engine Room page is the same engine that drives real alerts, so the demo can
never quietly diverge from production behaviour.
"""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import ClimateReading, RiskAssessment, RiskBand, School, Season, User
from ..security import require_chw, require_observer
from ..services.risk_engine import SchoolContext, classify

router = APIRouter(prefix="/readings", tags=["readings"])


# ─────────────────────────── schemas ───────────────────────────


class ReadingIn(BaseModel):
    district: str = Field(min_length=1, max_length=120)
    school_id: int | None = None
    source: str = Field(default="manual", max_length=120)
    observed_at: datetime | None = None

    temp_c: float | None = Field(default=None, ge=-30, le=70)
    humidity: float | None = Field(default=None, ge=0, le=100)
    aqi: float | None = Field(default=None, ge=0, le=1000)
    rainfall_mm: float | None = Field(default=None, ge=0, le=2000)


class ReadingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    district: str
    school_id: int | None
    source: str
    observed_at: datetime
    temp_c: float | None
    humidity: float | None
    aqi: float | None
    rainfall_mm: float | None
    created_at: datetime


class AssessmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    district: str
    school_id: int | None
    reading_id: int | None
    season: Season
    band: RiskBand
    overall: float
    confidence: float
    module_scores: dict[str, float]
    evidence: list[str]
    created_at: datetime


class IngestOut(BaseModel):
    reading: ReadingOut
    assessment: AssessmentOut
    requires_human_review: bool
    triggers: list[dict]


class ClassifyIn(BaseModel):
    """Stateless input for the Engine Room — nothing here is stored."""

    temp_c: float | None = Field(default=None, ge=-30, le=70)
    humidity: float | None = Field(default=None, ge=0, le=100)
    aqi: float | None = Field(default=None, ge=0, le=1000)
    rainfall_mm: float | None = Field(default=None, ge=0, le=2000)

    enrolment: int | None = Field(default=None, ge=0, le=20000)
    flood_zone_proximity_m: float | None = Field(default=None, ge=0)
    distance_to_facility_km: float | None = Field(default=None, ge=0)
    building_type: str | None = Field(default=None, max_length=80)
    has_school_feeding: bool | None = None


class ClassifyOut(BaseModel):
    season: str
    band: str
    overall: float
    confidence: float
    module_scores: dict[str, float]
    evidence: list[str]
    requires_human_review: bool
    dominant_hazard: str
    triggers: list[dict]
    band_guidance: dict[str, str]


# ─────────────────────────── helpers ───────────────────────────


def _context_for(school: School | None) -> SchoolContext:
    if school is None:
        return SchoolContext()
    return SchoolContext(
        enrolment=school.enrolment,
        flood_zone_proximity_m=school.flood_zone_proximity_m,
        distance_to_facility_km=school.distance_to_facility_km,
        building_type=school.building_type,
        has_school_feeding=school.has_school_feeding,
    )


# ─────────────────────────── routes ───────────────────────────


@router.post("", response_model=IngestOut, status_code=status.HTTP_201_CREATED)
def ingest_reading(
    payload: ReadingIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_chw),
) -> IngestOut:
    """Store a reading and classify it in the same transaction.

    A reading without its assessment is a number nobody acted on, so the two are
    written together rather than left to a later batch job.
    """
    school: School | None = None
    if payload.school_id is not None:
        school = db.get(School, payload.school_id)
        if school is None:
            raise HTTPException(status_code=404, detail="School not found")

    reading = ClimateReading(
        district=payload.district,
        school_id=payload.school_id,
        source=payload.source,
        temp_c=payload.temp_c,
        humidity=payload.humidity,
        aqi=payload.aqi,
        rainfall_mm=payload.rainfall_mm,
    )
    if payload.observed_at is not None:
        reading.observed_at = payload.observed_at

    db.add(reading)
    db.flush()  # need the reading id before the assessment can point at it

    result = classify(
        temp_c=payload.temp_c,
        humidity=payload.humidity,
        aqi=payload.aqi,
        rainfall_mm=payload.rainfall_mm,
        context=_context_for(school),
    )

    assessment = RiskAssessment(
        district=payload.district,
        school_id=payload.school_id,
        reading_id=reading.id,
        season=result.season,
        band=result.band,
        overall=result.overall,
        confidence=result.confidence,
        module_scores=result.module_scores,
        evidence=result.evidence,
    )
    db.add(assessment)
    db.commit()
    db.refresh(reading)
    db.refresh(assessment)

    return IngestOut(
        reading=ReadingOut.model_validate(reading),
        assessment=AssessmentOut.model_validate(assessment),
        requires_human_review=result.requires_human_review,
        triggers=[t.to_dict() for t in result.triggers],
    )


@router.post("/classify", response_model=ClassifyOut)
def classify_reading(payload: ClassifyIn) -> ClassifyOut:
    """Show what the engine would produce. No authentication, nothing persisted.

    This is the public Engine Room: anyone may interrogate the reasoning, which is
    the point of an explainable engine.
    """
    result = classify(
        temp_c=payload.temp_c,
        humidity=payload.humidity,
        aqi=payload.aqi,
        rainfall_mm=payload.rainfall_mm,
        context=SchoolContext(
            enrolment=payload.enrolment,
            flood_zone_proximity_m=payload.flood_zone_proximity_m,
            distance_to_facility_km=payload.distance_to_facility_km,
            building_type=payload.building_type,
            has_school_feeding=payload.has_school_feeding,
        ),
    )
    return ClassifyOut(**result.to_dict())


@router.get("", response_model=list[ReadingOut])
def list_readings(
    district: str | None = None,
    school_id: int | None = None,
    date_from: datetime | None = Query(default=None, alias="from"),
    date_to: datetime | None = Query(default=None, alias="to"),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> list[ReadingOut]:
    query = db.query(ClimateReading)
    if district:
        query = query.filter(ClimateReading.district == district)
    if school_id is not None:
        query = query.filter(ClimateReading.school_id == school_id)
    if date_from is not None:
        query = query.filter(ClimateReading.observed_at >= date_from)
    if date_to is not None:
        query = query.filter(ClimateReading.observed_at <= date_to)

    rows = query.order_by(ClimateReading.observed_at.desc()).offset(offset).limit(limit).all()
    return [ReadingOut.model_validate(row) for row in rows]


@router.get("/{reading_id}", response_model=ReadingOut)
def get_reading(
    reading_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> ReadingOut:
    reading = db.get(ClimateReading, reading_id)
    if reading is None:
        raise HTTPException(status_code=404, detail="Reading not found")
    return ReadingOut.model_validate(reading)
