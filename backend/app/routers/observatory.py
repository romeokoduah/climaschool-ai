"""Observatory — read-only institutional decision support.

Every response in this module is aggregated and anonymised. Nothing here returns
personally identifiable data: no telephone numbers, no names of individuals, no
per-child records. Risk is expressed at school, facility and district level only.
The Observatory exists to generate evidence for government planning, donor
investment and research — not to profile individual children or households.

The review desk actions (acknowledge, comment, escalate) are the one place where
this router writes: each records an AlertEvent attributed to the institution, so
the alert's audit trail shows which actor acted and when.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import (
    ActorType,
    Alert,
    AlertEvent,
    AlertStatus,
    FacilityResilienceScore,
    HealthFacility,
    RiskAssessment,
    RiskBand,
    School,
    SchoolResilienceScore,
    User,
)
from ..security import require_observer
from .reports import SIGNAL_RECOMMENDATION, detect_signal_clusters

router = APIRouter(prefix="/observatory", tags=["observatory"])

ELEVATED_BANDS = (RiskBand.ORANGE, RiskBand.RED)

ANONYMISATION_NOTE = (
    "All Observatory data is aggregated and anonymised. No individual child, "
    "household or caregiver data is displayed."
)


# ─────────────────────────── helpers ───────────────────────────


def _latest_school_scores(db: Session) -> dict[int, SchoolResilienceScore]:
    """Most recent resilience score per school, keyed by school id."""
    latest_ids = select(func.max(SchoolResilienceScore.id)).group_by(SchoolResilienceScore.school_id)
    rows = db.query(SchoolResilienceScore).filter(SchoolResilienceScore.id.in_(latest_ids)).all()
    return {row.school_id: row for row in rows}


def _latest_facility_scores(db: Session) -> dict[int, FacilityResilienceScore]:
    latest_ids = select(func.max(FacilityResilienceScore.id)).group_by(FacilityResilienceScore.facility_id)
    rows = db.query(FacilityResilienceScore).filter(FacilityResilienceScore.id.in_(latest_ids)).all()
    return {row.facility_id: row for row in rows}


def _latest_school_assessments(db: Session) -> dict[int, RiskAssessment]:
    latest_ids = (
        select(func.max(RiskAssessment.id))
        .where(RiskAssessment.school_id.isnot(None))
        .group_by(RiskAssessment.school_id)
    )
    rows = db.query(RiskAssessment).filter(RiskAssessment.id.in_(latest_ids)).all()
    return {row.school_id: row for row in rows if row.school_id is not None}


def _latest_district_bands(db: Session) -> dict[str, RiskBand]:
    latest_ids = select(func.max(RiskAssessment.id)).group_by(RiskAssessment.district)
    rows = db.query(RiskAssessment).filter(RiskAssessment.id.in_(latest_ids)).all()
    return {row.district: row.band for row in rows}


def _mean(values: list[float]) -> float | None:
    return round(sum(values) / len(values), 1) if values else None


# ─────────────────────────── schemas ───────────────────────────


class ReviewNoteIn(BaseModel):
    note: str = Field(min_length=1, max_length=4000)


class ReviewActionOut(BaseModel):
    alert_id: int
    action: Literal["acknowledged", "commented", "escalated"]
    alert_status: AlertStatus
    requires_human_review: bool
    recorded_at: datetime
    message: str


class OverviewOut(BaseModel):
    generated_at: datetime
    alerts_by_band: dict[str, int]
    alerts_by_status: dict[str, int]
    open_alerts: int
    alerts_awaiting_review: int
    schools_monitored: int
    schools_at_elevated_risk: list[dict[str, Any]]
    districts_at_elevated_risk: list[str]
    recent_signal_clusters: list[dict[str, Any]]
    recommendation: str
    anonymisation: str


class SchoolsOut(BaseModel):
    generated_at: datetime
    schools: list[dict[str, Any]]
    districts: list[dict[str, Any]]
    anonymisation: str


class FacilitiesOut(BaseModel):
    generated_at: datetime
    facilities: list[dict[str, Any]]
    districts: list[dict[str, Any]]
    anonymisation: str


# ─────────────────────────── endpoints ───────────────────────────


@router.get("/overview", response_model=OverviewOut)
def overview(
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> OverviewOut:
    """The current risk picture for an authorised institutional observer."""
    alerts_by_band = {
        (row[0].value if hasattr(row[0], "value") else str(row[0])): row[1]
        for row in db.query(Alert.band, func.count(Alert.id)).group_by(Alert.band).all()
    }
    alerts_by_status = {
        (row[0].value if hasattr(row[0], "value") else str(row[0])): row[1]
        for row in db.query(Alert.status, func.count(Alert.id)).group_by(Alert.status).all()
    }

    closed = {AlertStatus.CLOSED, AlertStatus.REJECTED, AlertStatus.ACTION_COMPLETED}
    open_alerts = sum(count for key, count in alerts_by_status.items() if key not in {s.value for s in closed})

    awaiting = (
        db.query(func.count(Alert.id))
        .filter(Alert.requires_human_review.is_(True), Alert.status == AlertStatus.CREATED)
        .scalar()
        or 0
    )

    assessments = _latest_school_assessments(db)
    scores = _latest_school_scores(db)
    schools = {s.id: s for s in db.query(School).filter(School.is_active.is_(True)).all()}

    elevated: list[dict[str, Any]] = []
    for school_id, assessment in assessments.items():
        school = schools.get(school_id)
        if school is None or assessment.band not in ELEVATED_BANDS:
            continue
        score = scores.get(school_id)
        elevated.append(
            {
                "school_id": school.id,
                "school_code": school.code,
                "school_name": school.name,
                "district": school.district,
                "region": school.region,
                "band": assessment.band.value,
                "overall_risk": round(assessment.overall, 1),
                "confidence": round(assessment.confidence, 2),
                "resilience_score": round(score.overall, 1) if score else None,
                "biggest_gap": score.biggest_gap if score else None,
                "evidence": list(assessment.evidence or []),
            }
        )
    elevated.sort(key=lambda item: item["overall_risk"], reverse=True)

    districts_elevated = sorted(
        {district for district, band in _latest_district_bands(db).items() if band in ELEVATED_BANDS}
    )

    clusters = detect_signal_clusters(db, lookback_days=14)

    return OverviewOut(
        generated_at=datetime.now(timezone.utc),
        alerts_by_band=alerts_by_band,
        alerts_by_status=alerts_by_status,
        open_alerts=open_alerts,
        alerts_awaiting_review=awaiting,
        schools_monitored=len(schools),
        schools_at_elevated_risk=elevated,
        districts_at_elevated_risk=districts_elevated,
        recent_signal_clusters=clusters,
        recommendation=SIGNAL_RECOMMENDATION,
        anonymisation=ANONYMISATION_NOTE,
    )


@router.get("/schools", response_model=SchoolsOut)
def schools_rollup(
    district: str | None = None,
    region: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> SchoolsOut:
    """School resilience scores with district rollups — the education planning view."""
    query = db.query(School).filter(School.is_active.is_(True))
    if district:
        query = query.filter(School.district == district)
    if region:
        query = query.filter(School.region == region)
    school_rows = query.order_by(School.district, School.name).all()

    scores = _latest_school_scores(db)
    assessments = _latest_school_assessments(db)

    schools: list[dict[str, Any]] = []
    for school in school_rows:
        score = scores.get(school.id)
        assessment = assessments.get(school.id)
        schools.append(
            {
                "school_id": school.id,
                "school_code": school.code,
                "school_name": school.name,
                "district": school.district,
                "region": school.region,
                "pilot_zone": school.pilot_zone,
                "enrolment": school.enrolment,
                "has_school_feeding": school.has_school_feeding,
                "distance_to_facility_km": school.distance_to_facility_km,
                "resilience_score": round(score.overall, 1) if score else None,
                "biggest_gap": score.biggest_gap if score else None,
                "priority_action": score.priority_action if score else None,
                "dimensions": (
                    {
                        "heat_exposure": score.heat_exposure,
                        "flood_exposure": score.flood_exposure,
                        "wash_readiness": score.wash_readiness,
                        "nutrition_resilience": score.nutrition_resilience,
                        "health_service_access": score.health_service_access,
                        "air_quality_exposure": score.air_quality_exposure,
                        "early_warning_readiness": score.early_warning_readiness,
                        "infrastructure_resilience": score.infrastructure_resilience,
                    }
                    if score
                    else None
                ),
                "current_band": assessment.band.value if assessment else None,
            }
        )

    by_district: dict[str, list[dict[str, Any]]] = {}
    for item in schools:
        by_district.setdefault(item["district"], []).append(item)

    districts = [
        {
            "district": name,
            "schools": len(items),
            "scored_schools": len([i for i in items if i["resilience_score"] is not None]),
            "mean_resilience_score": _mean([i["resilience_score"] for i in items if i["resilience_score"] is not None]),
            "schools_at_elevated_risk": len([i for i in items if i["current_band"] in {b.value for b in ELEVATED_BANDS}]),
            "commonest_gap": (
                max(
                    {i["biggest_gap"] for i in items if i["biggest_gap"]},
                    key=lambda gap: len([i for i in items if i["biggest_gap"] == gap]),
                    default=None,
                )
            ),
        }
        for name, items in sorted(by_district.items())
    ]

    return SchoolsOut(
        generated_at=datetime.now(timezone.utc),
        schools=schools,
        districts=districts,
        anonymisation=ANONYMISATION_NOTE,
    )


@router.get("/facilities", response_model=FacilitiesOut)
def facilities_rollup(
    district: str | None = None,
    region: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> FacilitiesOut:
    """Facility readiness rollup — the health system view of the Observatory."""
    query = db.query(HealthFacility).filter(HealthFacility.is_active.is_(True))
    if district:
        query = query.filter(HealthFacility.district == district)
    if region:
        query = query.filter(HealthFacility.region == region)
    facility_rows = query.order_by(HealthFacility.district, HealthFacility.name).all()

    scores = _latest_facility_scores(db)

    facilities: list[dict[str, Any]] = []
    for facility in facility_rows:
        score = scores.get(facility.id)
        facilities.append(
            {
                "facility_id": facility.id,
                "facility_code": facility.code,
                "facility_name": facility.name,
                "facility_type": facility.facility_type,
                "district": facility.district,
                "region": facility.region,
                "catchment_population": facility.catchment_population,
                "daily_consultation_capacity": facility.daily_consultation_capacity,
                "readiness_score": round(score.overall, 1) if score else None,
                "biggest_gap": score.biggest_gap if score else None,
                "priority_action": score.priority_action if score else None,
                "dimensions": (
                    {
                        "infrastructure_resilience": score.infrastructure_resilience,
                        "service_continuity": score.service_continuity,
                        "hazard_exposure": score.hazard_exposure,
                        "supply_readiness": score.supply_readiness,
                        "preparedness": score.preparedness,
                    }
                    if score
                    else None
                ),
            }
        )

    by_district: dict[str, list[dict[str, Any]]] = {}
    for item in facilities:
        by_district.setdefault(item["district"], []).append(item)

    districts = [
        {
            "district": name,
            "facilities": len(items),
            "scored_facilities": len([i for i in items if i["readiness_score"] is not None]),
            "mean_readiness_score": _mean([i["readiness_score"] for i in items if i["readiness_score"] is not None]),
            "catchment_population": sum(i["catchment_population"] or 0 for i in items),
            "daily_consultation_capacity": sum(i["daily_consultation_capacity"] or 0 for i in items),
        }
        for name, items in sorted(by_district.items())
    ]

    return FacilitiesOut(
        generated_at=datetime.now(timezone.utc),
        facilities=facilities,
        districts=districts,
        anonymisation=ANONYMISATION_NOTE,
    )


@router.get("/map")
def map_feed(
    district: str | None = None,
    band: RiskBand | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> dict[str, Any]:
    """GeoJSON feed for the Ghana child climate risk map.

    Institution-level geometry only: schools and facilities are public
    infrastructure, so no point in this feed locates a person.
    """
    school_scores = _latest_school_scores(db)
    school_assessments = _latest_school_assessments(db)
    facility_scores = _latest_facility_scores(db)

    school_query = db.query(School).filter(
        School.is_active.is_(True), School.latitude.isnot(None), School.longitude.isnot(None)
    )
    facility_query = db.query(HealthFacility).filter(
        HealthFacility.is_active.is_(True),
        HealthFacility.latitude.isnot(None),
        HealthFacility.longitude.isnot(None),
    )
    if district:
        school_query = school_query.filter(School.district == district)
        facility_query = facility_query.filter(HealthFacility.district == district)

    features: list[dict[str, Any]] = []

    for school in school_query.all():
        assessment = school_assessments.get(school.id)
        current_band = assessment.band if assessment else None
        if band is not None and current_band is not band:
            continue
        score = school_scores.get(school.id)
        features.append(
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [school.longitude, school.latitude]},
                "properties": {
                    "kind": "school",
                    "id": school.id,
                    "code": school.code,
                    "name": school.name,
                    "district": school.district,
                    "region": school.region,
                    "band": current_band.value if current_band else None,
                    "resilience_score": round(score.overall, 1) if score else None,
                    "biggest_gap": score.biggest_gap if score else None,
                    "enrolment": school.enrolment,
                },
            }
        )

    if band is None:
        # Facilities carry readiness rather than a hazard band, so a band filter
        # would silently drop them all rather than narrowing the layer.
        for facility in facility_query.all():
            score = facility_scores.get(facility.id)
            features.append(
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [facility.longitude, facility.latitude]},
                    "properties": {
                        "kind": "health_facility",
                        "id": facility.id,
                        "code": facility.code,
                        "name": facility.name,
                        "facility_type": facility.facility_type,
                        "district": facility.district,
                        "region": facility.region,
                        "band": None,
                        "readiness_score": round(score.overall, 1) if score else None,
                        "biggest_gap": score.biggest_gap if score else None,
                        "catchment_population": facility.catchment_population,
                    },
                }
            )

    return {
        "type": "FeatureCollection",
        "features": features,
        "properties": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "feature_count": len(features),
            "anonymisation": ANONYMISATION_NOTE,
        },
    }


# ─────────────────────── institutional review desk ───────────────────────


def _load_alert(db: Session, alert_id: int) -> Alert:
    alert = db.get(Alert, alert_id)
    if alert is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")
    return alert


def _actor_reference(user: User) -> str:
    """Attribute the action to an accountable officer without exposing them onward.

    The reference is stored on the audit trail (accountability), but no
    Observatory read endpoint ever returns it.
    """
    return f"{user.organisation or 'institution'}:{user.email}"


@router.post("/alerts/{alert_id}/acknowledge", response_model=ReviewActionOut)
def acknowledge_alert(
    alert_id: int,
    payload: ReviewNoteIn | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> ReviewActionOut:
    """Confirm that an authorised officer has seen the alert."""
    alert = _load_alert(db, alert_id)
    now = datetime.now(timezone.utc)

    alert.status = AlertStatus.ACKNOWLEDGED
    db.add(
        AlertEvent(
            alert_id=alert.id,
            status=AlertStatus.ACKNOWLEDGED,
            actor_type=ActorType.INSTITUTION,
            actor_reference=_actor_reference(user),
            note=payload.note if payload else None,
            occurred_at=now,
        )
    )
    db.commit()
    return ReviewActionOut(
        alert_id=alert.id,
        action="acknowledged",
        alert_status=alert.status,
        requires_human_review=alert.requires_human_review,
        recorded_at=now,
        message="Acknowledgement recorded against the alert.",
    )


@router.post("/alerts/{alert_id}/comment", response_model=ReviewActionOut)
def comment_on_alert(
    alert_id: int,
    payload: ReviewNoteIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> ReviewActionOut:
    """Add a professional note visible to the project technical team."""
    alert = _load_alert(db, alert_id)
    now = datetime.now(timezone.utc)

    # A comment is commentary, not a lifecycle transition — the event carries the
    # alert's existing status so the chain is not falsely advanced.
    db.add(
        AlertEvent(
            alert_id=alert.id,
            status=alert.status,
            actor_type=ActorType.INSTITUTION,
            actor_reference=_actor_reference(user),
            note=payload.note,
            occurred_at=now,
        )
    )
    db.commit()
    return ReviewActionOut(
        alert_id=alert.id,
        action="commented",
        alert_status=alert.status,
        requires_human_review=alert.requires_human_review,
        recorded_at=now,
        message="Comment recorded against the alert.",
    )


@router.post("/alerts/{alert_id}/escalate", response_model=ReviewActionOut)
def escalate_alert(
    alert_id: int,
    payload: ReviewNoteIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> ReviewActionOut:
    """Flag an alert for urgent attention by a senior officer.

    There is no ESCALATED lifecycle status, and inventing one would corrupt the
    early-warning-to-early-action chain. Escalation therefore raises the
    human-review flag and records a note, leaving the status where it stands.
    """
    alert = _load_alert(db, alert_id)
    now = datetime.now(timezone.utc)

    alert.requires_human_review = True
    db.add(
        AlertEvent(
            alert_id=alert.id,
            status=alert.status,
            actor_type=ActorType.INSTITUTION,
            actor_reference=_actor_reference(user),
            note=f"Escalated for senior review: {payload.note}",
            occurred_at=now,
        )
    )
    db.commit()
    return ReviewActionOut(
        alert_id=alert.id,
        action="escalated",
        alert_status=alert.status,
        requires_human_review=True,
        recorded_at=now,
        message="Escalation recorded. The alert is flagged for senior review.",
    )


@router.get("/alerts/{alert_id}/trail")
def alert_trail(
    alert_id: int,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> dict[str, Any]:
    """The alert's action chain. Actor type only — the actor's identity is not returned."""
    alert = _load_alert(db, alert_id)
    events = (
        db.query(AlertEvent)
        .filter(AlertEvent.alert_id == alert.id)
        .order_by(AlertEvent.id.asc())
        .limit(limit)
        .all()
    )
    return {
        "alert_id": alert.id,
        "district": alert.district,
        "hazard": alert.hazard.value,
        "band": alert.band.value,
        "status": alert.status.value,
        "requires_human_review": alert.requires_human_review,
        "events": [
            {
                "status": event.status.value,
                "actor_type": event.actor_type.value if event.actor_type else None,
                "note": event.note,
                "occurred_at": event.occurred_at,
            }
            for event in events
        ],
        "anonymisation": ANONYMISATION_NOTE,
    }
