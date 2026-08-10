"""Alert lifecycle, the AI safety gate, and the Minutes of Protection metric.

Every transition in this file appends an AlertEvent. That audit trail is not
bookkeeping: it is the evidence that an alert turned into an action, and it is
the only thing the signature metric is computed from.
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session, selectinload

from ..db import get_db
from ..models import (
    ActorType,
    Alert,
    AlertEvent,
    AlertStatus,
    Hazard,
    RiskAssessment,
    RiskBand,
    School,
    User,
)
from ..security import require_chw, require_observer, require_reviewer
from ..services.risk_engine import BAND_GUIDANCE, RiskResult, requires_human_review, summarise

router = APIRouter(prefix="/alerts", tags=["alerts"])


# The permitted forward moves. Anything absent is refused, so an alert cannot be
# marked complete without ever having been issued.
_TRANSITIONS: dict[AlertStatus, frozenset[AlertStatus]] = {
    AlertStatus.CREATED: frozenset({AlertStatus.REVIEWED, AlertStatus.REJECTED, AlertStatus.ISSUED}),
    AlertStatus.REVIEWED: frozenset({AlertStatus.ISSUED, AlertStatus.REJECTED, AlertStatus.CLOSED}),
    AlertStatus.ISSUED: frozenset({AlertStatus.ACKNOWLEDGED, AlertStatus.CLOSED}),
    AlertStatus.ACKNOWLEDGED: frozenset({AlertStatus.ACTION_STARTED, AlertStatus.CLOSED}),
    AlertStatus.ACTION_STARTED: frozenset({AlertStatus.ACTION_COMPLETED, AlertStatus.CLOSED}),
    AlertStatus.ACTION_COMPLETED: frozenset({AlertStatus.CLOSED}),
    AlertStatus.CLOSED: frozenset(),
    AlertStatus.REJECTED: frozenset({AlertStatus.CLOSED}),
}


# ─────────────────────────── schemas ───────────────────────────


class AlertCreate(BaseModel):
    """Create from an assessment (preferred) or manually with the full payload."""

    assessment_id: int | None = None

    district: str | None = Field(default=None, max_length=120)
    school_id: int | None = None
    facility_id: int | None = None
    hazard: Hazard | None = None
    band: RiskBand | None = None
    title: str | None = Field(default=None, max_length=200)
    message: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=100)
    evidence: list[str] | None = None


class ReviewIn(BaseModel):
    approve: bool
    note: str | None = None


class TransitionIn(BaseModel):
    actor_type: ActorType | None = None
    actor_reference: str | None = Field(default=None, max_length=160)
    note: str | None = None


# A lifecycle step should never fail because a field CHW's client posted no body;
# the transition itself is the record, and the actor details enrich it.
_NO_BODY = TransitionIn()


class AlertEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: AlertStatus
    actor_type: ActorType | None
    actor_reference: str | None
    note: str | None
    occurred_at: datetime


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    assessment_id: int | None
    school_id: int | None
    facility_id: int | None
    district: str
    hazard: Hazard
    band: RiskBand
    status: AlertStatus
    title: str
    message: str
    confidence: float
    evidence: list[str]
    requires_human_review: bool
    reviewed_by_id: int | None
    reviewed_at: datetime | None
    issued_at: datetime | None
    closed_at: datetime | None
    created_at: datetime


class AlertDetailOut(AlertOut):
    events: list[AlertEventOut]
    band_guidance: dict[str, str]


class MinutesOfProtectionOut(BaseModel):
    """Honest by construction: every field is null or zero until real data exists."""

    issued_alerts: int
    alerts_with_completed_action: int
    children_reached: int
    children_reached_unique: int
    schools_reached: int
    mean_lead_time_hours: float | None
    median_lead_time_hours: float | None
    total_minutes_of_protection: int | None
    definition: str


# ─────────────────────────── helpers ───────────────────────────


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(value: datetime) -> datetime:
    """Some backends hand back naive datetimes; treat those as UTC rather than crash."""
    return value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)


def _record_event(
    db: Session,
    alert: Alert,
    new_status: AlertStatus,
    *,
    actor_type: ActorType | None,
    actor_reference: str | None,
    note: str | None,
) -> AlertEvent:
    event = AlertEvent(
        alert_id=alert.id,
        status=new_status,
        actor_type=actor_type,
        actor_reference=actor_reference,
        note=note,
    )
    db.add(event)
    return event


def _guard_transition(alert: Alert, new_status: AlertStatus) -> None:
    if new_status not in _TRANSITIONS[alert.status]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Cannot move an alert from '{alert.status.value}' to '{new_status.value}'. "
                f"Permitted next steps: "
                f"{', '.join(sorted(s.value for s in _TRANSITIONS[alert.status])) or 'none'}."
            ),
        )


def _get_alert(db: Session, alert_id: int) -> Alert:
    alert = db.get(Alert, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


def _dominant_hazard(module_scores: dict) -> Hazard:
    if not module_scores:
        return Hazard.HEAT
    key = max(module_scores, key=lambda k: module_scores.get(k) or 0)
    try:
        return Hazard(key)
    except ValueError:
        return Hazard.HEAT


def _detail(alert: Alert) -> AlertDetailOut:
    return AlertDetailOut(
        **AlertOut.model_validate(alert).model_dump(),
        events=[AlertEventOut.model_validate(e) for e in alert.events],
        band_guidance=BAND_GUIDANCE[alert.band],
    )


def _advance(
    db: Session,
    alert_id: int,
    new_status: AlertStatus,
    payload: TransitionIn,
    default_actor: ActorType | None = None,
) -> AlertDetailOut:
    alert = _get_alert(db, alert_id)
    _guard_transition(alert, new_status)

    alert.status = new_status
    if new_status is AlertStatus.CLOSED:
        alert.closed_at = _now()

    _record_event(
        db,
        alert,
        new_status,
        actor_type=payload.actor_type or default_actor,
        actor_reference=payload.actor_reference,
        note=payload.note,
    )
    db.commit()
    db.refresh(alert)
    return _detail(alert)


# ─────────────────────────── routes ───────────────────────────


@router.post("", response_model=AlertDetailOut, status_code=status.HTTP_201_CREATED)
def create_alert(
    payload: AlertCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_chw),
) -> AlertDetailOut:
    assessment: RiskAssessment | None = None
    if payload.assessment_id is not None:
        assessment = db.get(RiskAssessment, payload.assessment_id)
        if assessment is None:
            raise HTTPException(status_code=404, detail="Risk assessment not found")

    if assessment is not None:
        district = payload.district or assessment.district
        school_id = payload.school_id if payload.school_id is not None else assessment.school_id
        band = payload.band or assessment.band
        hazard = payload.hazard or _dominant_hazard(assessment.module_scores or {})
        confidence = payload.confidence if payload.confidence is not None else assessment.confidence
        evidence = payload.evidence if payload.evidence is not None else list(assessment.evidence or [])
        title, message = payload.title, payload.message
        if not title or not message:
            school = db.get(School, school_id) if school_id else None
            place = school.name if school else district
            drafted_title, drafted_message = summarise(
                _assessment_as_result(assessment, hazard), place
            )
            title = title or drafted_title
            message = message or drafted_message
    else:
        missing = [
            name
            for name, value in (
                ("district", payload.district),
                ("hazard", payload.hazard),
                ("band", payload.band),
                ("title", payload.title),
                ("message", payload.message),
            )
            if value is None
        ]
        if missing:
            raise HTTPException(
                status_code=422,
                detail=f"A manual alert requires: {', '.join(missing)} (or supply an assessment_id).",
            )
        district = payload.district  # type: ignore[assignment]
        school_id = payload.school_id
        band = payload.band  # type: ignore[assignment]
        hazard = payload.hazard  # type: ignore[assignment]
        confidence = payload.confidence if payload.confidence is not None else 0.0
        evidence = payload.evidence or []
        title, message = payload.title, payload.message

    alert = Alert(
        assessment_id=assessment.id if assessment else None,
        school_id=school_id,
        facility_id=payload.facility_id,
        district=district,
        hazard=hazard,
        band=band,
        status=AlertStatus.CREATED,
        title=title,
        message=message,
        confidence=confidence,
        evidence=evidence,
        # Derived from the band, never accepted from the client. See the issue gate.
        requires_human_review=requires_human_review(band),
    )
    db.add(alert)
    db.flush()

    _record_event(
        db,
        alert,
        AlertStatus.CREATED,
        actor_type=ActorType.INSTITUTION,
        actor_reference=user.email,
        note="Alert drafted from risk assessment" if assessment else "Alert created manually",
    )
    db.commit()
    db.refresh(alert)
    return _detail(alert)


def _assessment_as_result(assessment: RiskAssessment, hazard: Hazard) -> RiskResult:
    """Adapt a stored assessment back into the shape `summarise` expects."""
    return RiskResult(
        season=assessment.season,
        band=assessment.band,
        overall=assessment.overall,
        confidence=assessment.confidence,
        module_scores=dict(assessment.module_scores or {}),
        evidence=list(assessment.evidence or []),
        requires_human_review=requires_human_review(assessment.band),
        triggers=[],
        dominant_hazard=hazard,
    )


@router.post("/{alert_id}/review", response_model=AlertDetailOut)
def review_alert(
    alert_id: int,
    payload: ReviewIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_reviewer),
) -> AlertDetailOut:
    """The named human in the loop. Approval and rejection are both recorded."""
    alert = _get_alert(db, alert_id)
    new_status = AlertStatus.REVIEWED if payload.approve else AlertStatus.REJECTED
    _guard_transition(alert, new_status)

    alert.status = new_status
    alert.reviewed_by_id = user.id
    alert.reviewed_at = _now()
    if not payload.approve:
        alert.closed_at = alert.reviewed_at

    _record_event(
        db,
        alert,
        new_status,
        actor_type=ActorType.INSTITUTION,
        actor_reference=user.email,
        note=payload.note or ("Approved for issue" if payload.approve else "Rejected — not distributed"),
    )
    db.commit()
    db.refresh(alert)
    return _detail(alert)


@router.post("/{alert_id}/issue", response_model=AlertDetailOut)
def issue_alert(
    alert_id: int,
    payload: TransitionIn = _NO_BODY,
    db: Session = Depends(get_db),
    user: User = Depends(require_chw),
) -> AlertDetailOut:
    """Distribute an alert to schools, parents, CHWs and facilities.

    THE SAFETY GATE. An ORANGE or RED alert is a message telling a head teacher to
    send children home or a parent that their child is at risk. If the engine is
    wrong and no human checked it, the platform has caused the harm it exists to
    prevent. So the gate is enforced here, at the only door through which an alert
    can reach a real person, and it is enforced against values recomputed from the
    band rather than against the stored flag — a client that creates a RED alert
    with requires_human_review=False still cannot issue it, and neither can one
    that sets reviewed_at directly, because a review is only ever recorded by the
    reviewer endpoint under a reviewer's own credentials.
    """
    alert = _get_alert(db, alert_id)

    gate_applies = requires_human_review(alert.band) or alert.requires_human_review
    reviewed = alert.status is AlertStatus.REVIEWED and alert.reviewed_by_id is not None and alert.reviewed_at is not None

    if gate_applies and not reviewed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"{alert.band.value} alerts require human review before they can be issued. "
                f"This alert is '{alert.status.value}' and has not been approved by an authorised "
                f"reviewer. POST /alerts/{alert_id}/review first."
            ),
        )

    # Keep the stored flag honest even if the alert was created before the band was known.
    alert.requires_human_review = gate_applies

    _guard_transition(alert, AlertStatus.ISSUED)
    alert.status = AlertStatus.ISSUED
    alert.issued_at = _now()

    _record_event(
        db,
        alert,
        AlertStatus.ISSUED,
        actor_type=payload.actor_type or ActorType.INSTITUTION,
        actor_reference=payload.actor_reference or user.email,
        note=payload.note or "Distributed to school, parents, CHW and health facility",
    )
    db.commit()
    db.refresh(alert)
    return _detail(alert)


@router.post("/{alert_id}/acknowledge", response_model=AlertDetailOut)
def acknowledge_alert(
    alert_id: int,
    payload: TransitionIn = _NO_BODY,
    db: Session = Depends(get_db),
    user: User = Depends(require_chw),
) -> AlertDetailOut:
    return _advance(db, alert_id, AlertStatus.ACKNOWLEDGED, payload, default_actor=ActorType.SCHOOL)


@router.post("/{alert_id}/action-started", response_model=AlertDetailOut)
def start_action(
    alert_id: int,
    payload: TransitionIn = _NO_BODY,
    db: Session = Depends(get_db),
    user: User = Depends(require_chw),
) -> AlertDetailOut:
    return _advance(db, alert_id, AlertStatus.ACTION_STARTED, payload, default_actor=ActorType.SCHOOL)


@router.post("/{alert_id}/action-completed", response_model=AlertDetailOut)
def complete_action(
    alert_id: int,
    payload: TransitionIn = _NO_BODY,
    db: Session = Depends(get_db),
    user: User = Depends(require_chw),
) -> AlertDetailOut:
    return _advance(db, alert_id, AlertStatus.ACTION_COMPLETED, payload, default_actor=ActorType.SCHOOL)


@router.post("/{alert_id}/close", response_model=AlertDetailOut)
def close_alert(
    alert_id: int,
    payload: TransitionIn = _NO_BODY,
    db: Session = Depends(get_db),
    user: User = Depends(require_reviewer),
) -> AlertDetailOut:
    return _advance(db, alert_id, AlertStatus.CLOSED, payload, default_actor=ActorType.INSTITUTION)


@router.get("", response_model=list[AlertOut])
def list_alerts(
    alert_status: AlertStatus | None = Query(default=None, alias="status"),
    band: RiskBand | None = None,
    district: str | None = None,
    school_id: int | None = None,
    hazard: Hazard | None = None,
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> list[AlertOut]:
    query = db.query(Alert)
    if alert_status is not None:
        query = query.filter(Alert.status == alert_status)
    if band is not None:
        query = query.filter(Alert.band == band)
    if district:
        query = query.filter(Alert.district == district)
    if school_id is not None:
        query = query.filter(Alert.school_id == school_id)
    if hazard is not None:
        query = query.filter(Alert.hazard == hazard)

    rows = query.order_by(Alert.id.desc()).offset(offset).limit(limit).all()
    return [AlertOut.model_validate(row) for row in rows]


@router.get("/stats/minutes-of-protection", response_model=MinutesOfProtectionOut)
def minutes_of_protection(
    district: str | None = None,
    school_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> MinutesOfProtectionOut:
    """The signature metric: how many children were reached, and how fast action followed.

    Computed only from alerts that were actually issued and events that were
    actually recorded. Where there is no data the answer is null or zero — an
    invented figure here would corrupt the one number partners will quote.
    """
    query = db.query(Alert).options(selectinload(Alert.events)).filter(Alert.issued_at.is_not(None))
    if district:
        query = query.filter(Alert.district == district)
    if school_id is not None:
        query = query.filter(Alert.school_id == school_id)
    issued = query.all()

    definition = (
        "Children reached is the enrolment of the schools that received an issued alert. "
        "Lead time is the interval between issue and the first recorded completed action. "
        "Minutes of protection multiplies that interval, in minutes, by the children reached."
    )

    if not issued:
        return MinutesOfProtectionOut(
            issued_alerts=0,
            alerts_with_completed_action=0,
            children_reached=0,
            children_reached_unique=0,
            schools_reached=0,
            mean_lead_time_hours=None,
            median_lead_time_hours=None,
            total_minutes_of_protection=None,
            definition=definition,
        )

    school_ids = {a.school_id for a in issued if a.school_id is not None}
    enrolments: dict[int, int] = {}
    if school_ids:
        for sid, enrolment in db.query(School.id, School.enrolment).filter(School.id.in_(school_ids)).all():
            enrolments[sid] = enrolment or 0

    children_reached = sum(enrolments.get(a.school_id, 0) for a in issued if a.school_id is not None)
    children_reached_unique = sum(enrolments.values())

    lead_hours: list[float] = []
    minutes_of_protection_total = 0.0
    for alert in issued:
        completed = next((e for e in alert.events if e.status is AlertStatus.ACTION_COMPLETED), None)
        if completed is None or alert.issued_at is None:
            continue
        delta = (_aware(completed.occurred_at) - _aware(alert.issued_at)).total_seconds()
        if delta < 0:
            continue  # clock skew — drop it rather than report a negative response time
        hours = delta / 3600.0
        lead_hours.append(hours)
        minutes_of_protection_total += (delta / 60.0) * enrolments.get(alert.school_id or -1, 0)

    mean_lead: float | None = None
    median_lead: float | None = None
    total_minutes: int | None = None
    if lead_hours:
        ordered = sorted(lead_hours)
        mid = len(ordered) // 2
        median = ordered[mid] if len(ordered) % 2 else (ordered[mid - 1] + ordered[mid]) / 2
        mean_lead = round(sum(lead_hours) / len(lead_hours), 2)
        median_lead = round(median, 2)
        total_minutes = int(round(minutes_of_protection_total))

    return MinutesOfProtectionOut(
        issued_alerts=len(issued),
        alerts_with_completed_action=len(lead_hours),
        children_reached=children_reached,
        children_reached_unique=children_reached_unique,
        schools_reached=len(school_ids),
        mean_lead_time_hours=mean_lead,
        median_lead_time_hours=median_lead,
        total_minutes_of_protection=total_minutes,
        definition=definition,
    )


@router.get("/{alert_id}", response_model=AlertDetailOut)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> AlertDetailOut:
    return _detail(_get_alert(db, alert_id))
