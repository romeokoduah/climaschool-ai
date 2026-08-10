"""Field reports — the community end of the school-to-CHW-to-facility signal chain.

Teachers, school nurses and CHWs submit counts and symptom keywords (never names).
The signal detector aggregates those reports and surfaces clusters that a human
public-health officer should look at. It does not diagnose and does not declare
outbreaks — see SIGNAL_RECOMMENDATION below.
"""

from __future__ import annotations

import os
import re
import secrets
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any, Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import ActorType, Channel, FieldReport, School, User
from ..security import require_chw, require_observer, require_reviewer

router = APIRouter(prefix="/reports", tags=["field reports"])


# ─────────────────────────── keyword vocabulary ───────────────────────────

# The two-way SMS codes understood by the gateway. Kept as a plain module-level
# dict so field teams can extend the vocabulary (new code, new alias, new
# category) without touching parsing logic. `category` is what the signal
# detector groups on; `aliases` absorb spelling variants seen in the field.
KEYWORD_VOCABULARY: dict[str, dict[str, Any]] = {
    "FEVER": {"category": "febrile", "label": "Fever reported", "aliases": ["FEVR", "HOTBODY"]},
    "DIARRHOEA": {
        "category": "diarrhoeal",
        "label": "Diarrhoea reported",
        "aliases": ["DIARRHEA", "DIAR", "RUNNYSTOMACH"],
    },
    "STOMACH": {"category": "diarrhoeal", "label": "Stomach complaint", "aliases": ["STOMACHACHE", "BELLY"]},
    "VOMIT": {"category": "diarrhoeal", "label": "Vomiting reported", "aliases": ["VOMITING", "THROWUP"]},
    "SICK": {"category": "general", "label": "General illness or absence with symptoms", "aliases": ["ILL", "UNWELL"]},
    "RASH": {"category": "dermatological", "label": "Skin rash reported", "aliases": ["SKIN"]},
    "COUGH": {"category": "respiratory", "label": "Cough or breathing difficulty", "aliases": ["BREATH", "ASTHMA"]},
    "FLOOD": {"category": "hazard", "label": "Flooding affecting the community", "aliases": ["FLOODING", "WATERLOG"]},
    "HEAT": {"category": "hazard", "label": "Extreme heat affecting the school", "aliases": ["HOT"]},
    "WATER": {"category": "wash", "label": "Water supply or safety problem", "aliases": ["NOWATER", "DIRTYWATER"]},
    "EMERGENCY": {"category": "urgent", "label": "Medical emergency requiring referral", "aliases": ["URGENT", "SOS"]},
}

# Alias → canonical code, built once at import.
_ALIAS_INDEX: dict[str, str] = {
    alias: code for code, meta in KEYWORD_VOCABULARY.items() for alias in [code, *meta["aliases"]]
}

_TOKEN_RE = re.compile(r"[A-Z]+")
_COUNT_RE = re.compile(r"\b(\d{1,4})\b")

# Codes that describe a hazard or a WASH problem rather than a person, so they
# must not be counted as cases.
_NON_CASE_CATEGORIES = {"hazard", "wash"}


def parse_case_count(body: str, keywords: list[str]) -> int:
    """Read a case count out of messages like "FEVER 3"; otherwise infer a minimum.

    A symptom keyword with no number still means at least one child was affected;
    a pure hazard report ("FLOOD") means none.
    """
    match = _COUNT_RE.search(body)
    if match:
        return min(int(match.group(1)), 9999)
    symptomatic = _categories(keywords) - _NON_CASE_CATEGORIES
    return 1 if symptomatic else 0


def parse_keywords(body: str) -> list[str]:
    """Pull recognised codes out of a free-text SMS, de-duplicated, order preserved."""
    found: list[str] = []
    for token in _TOKEN_RE.findall(body.upper()):
        code = _ALIAS_INDEX.get(token)
        if code and code not in found:
            found.append(code)
    return found


def _categories(keywords: list[str]) -> set[str]:
    return {KEYWORD_VOCABULARY[k]["category"] for k in keywords if k in KEYWORD_VOCABULARY}


# ─────────────────────────── signal detection ───────────────────────────

# Deliberate scope boundary. ClimaSchool is a decision-support system, not a
# surveillance authority: only Ghana Health Service can confirm an outbreak.
# Every cluster we surface is therefore phrased as a prompt for verification by
# qualified public-health staff, never as a finding. Do not reword this into an
# assertion — the platform's clinical safety position depends on it.
SIGNAL_RECOMMENDATION = (
    "Climate conditions and available indicators suggest elevated risk. "
    "Public-health verification by qualified staff is recommended. "
    "This is a decision-support signal, not a confirmed outbreak or diagnosis."
)

DIARRHOEAL_CLUSTER_MIN_REPORTS = 3
DIARRHOEAL_CLUSTER_WINDOW_HOURS = 48
FEBRILE_CLUSTER_MIN_REPORTS = 3
FEBRILE_CLUSTER_WINDOW_DAYS = 7
ABSENCE_SPIKE_MULTIPLIER = 1.5
ABSENCE_SPIKE_MIN_TOTAL = 5


def _as_utc(value: datetime | None) -> datetime:
    """Normalise possibly naive DB timestamps so window arithmetic is safe."""
    if value is None:
        return datetime.now(timezone.utc)
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def detect_signal_clusters(db: Session, *, lookback_days: int = 28) -> list[dict[str, Any]]:
    """Aggregate recent field reports into clusters warranting verification.

    Aggregation is done in Python rather than SQL so the rules stay readable and
    portable — report volumes at pilot scale are small, and the rules are the
    part that domain staff will want to review and adjust.
    """
    now = datetime.now(timezone.utc)
    since = now - timedelta(days=lookback_days)

    reports = (
        db.query(FieldReport)
        .filter(FieldReport.created_at >= since)
        .order_by(FieldReport.created_at.asc())
        .all()
    )
    if not reports:
        return []

    school_names: dict[int, str] = dict(db.query(School.id, School.name).all())

    clusters: list[dict[str, Any]] = []

    # 1. Diarrhoeal cluster — 3+ reports from one school inside a 48h window.
    by_school: dict[int, list[FieldReport]] = defaultdict(list)
    for r in reports:
        if r.school_id is not None and "diarrhoeal" in _categories(list(r.keywords or [])):
            by_school[r.school_id].append(r)

    window = timedelta(hours=DIARRHOEAL_CLUSTER_WINDOW_HOURS)
    for school_id, items in by_school.items():
        items.sort(key=lambda r: _as_utc(r.created_at))
        for start in range(len(items)):
            end = start
            while end + 1 < len(items) and _as_utc(items[end + 1].created_at) - _as_utc(items[start].created_at) <= window:
                end += 1
            group = items[start : end + 1]
            if len(group) >= DIARRHOEAL_CLUSTER_MIN_REPORTS:
                clusters.append(
                    {
                        "type": "diarrhoeal_cluster",
                        "scope": "school",
                        "school_id": school_id,
                        "school_name": school_names.get(school_id),
                        "district": group[0].district,
                        "report_count": len(group),
                        "cases_reported": sum(r.cases_reported or 0 for r in group),
                        "window_hours": DIARRHOEAL_CLUSTER_WINDOW_HOURS,
                        "first_report_at": _as_utc(group[0].created_at),
                        "last_report_at": _as_utc(group[-1].created_at),
                        "evidence": [
                            f"{len(group)} diarrhoeal reports from this school within "
                            f"{DIARRHOEAL_CLUSTER_WINDOW_HOURS} hours",
                            f"{sum(r.cases_reported or 0 for r in group)} cases reported in total",
                            f"Keywords observed: {', '.join(sorted({k for r in group for k in (r.keywords or [])}))}",
                        ],
                        "report_ids": [r.id for r in group],
                        "recommendation": SIGNAL_RECOMMENDATION,
                    }
                )
                break  # one cluster per school is enough to prompt a visit

    # 2. Febrile cluster — 3+ fever reports in one district within a week.
    week_since = now - timedelta(days=FEBRILE_CLUSTER_WINDOW_DAYS)
    by_district: dict[str, list[FieldReport]] = defaultdict(list)
    for r in reports:
        if _as_utc(r.created_at) >= week_since and "FEVER" in (r.keywords or []):
            by_district[r.district].append(r)

    for district, items in by_district.items():
        if len(items) >= FEBRILE_CLUSTER_MIN_REPORTS:
            clusters.append(
                {
                    "type": "febrile_cluster",
                    "scope": "district",
                    "school_id": None,
                    "school_name": None,
                    "district": district,
                    "report_count": len(items),
                    "cases_reported": sum(r.cases_reported or 0 for r in items),
                    "window_hours": FEBRILE_CLUSTER_WINDOW_DAYS * 24,
                    "first_report_at": _as_utc(items[0].created_at),
                    "last_report_at": _as_utc(items[-1].created_at),
                    "evidence": [
                        f"{len(items)} fever reports across {district} in the last "
                        f"{FEBRILE_CLUSTER_WINDOW_DAYS} days",
                        f"{len({r.school_id for r in items if r.school_id})} distinct schools involved",
                        f"{sum(r.cases_reported or 0 for r in items)} cases reported in total",
                    ],
                    "report_ids": [r.id for r in items],
                    "recommendation": SIGNAL_RECOMMENDATION,
                }
            )

    # 3. Absence spike — recent week's mean absence above the school's own baseline.
    absence_recent: dict[int, list[int]] = defaultdict(list)
    absence_baseline: dict[int, list[int]] = defaultdict(list)
    for r in reports:
        if r.school_id is None or r.absences_reported is None:
            continue
        bucket = absence_recent if _as_utc(r.created_at) >= week_since else absence_baseline
        bucket[r.school_id].append(r.absences_reported)

    for school_id, recent in absence_recent.items():
        baseline = absence_baseline.get(school_id)
        if not baseline:
            continue  # without a baseline we cannot claim anything is "above" it
        recent_mean = sum(recent) / len(recent)
        baseline_mean = sum(baseline) / len(baseline)
        if sum(recent) < ABSENCE_SPIKE_MIN_TOTAL or recent_mean < baseline_mean * ABSENCE_SPIKE_MULTIPLIER:
            continue
        district = next((r.district for r in reports if r.school_id == school_id), "")
        clusters.append(
            {
                "type": "absence_spike",
                "scope": "school",
                "school_id": school_id,
                "school_name": school_names.get(school_id),
                "district": district,
                "report_count": len(recent),
                "cases_reported": sum(recent),
                "window_hours": FEBRILE_CLUSTER_WINDOW_DAYS * 24,
                "first_report_at": week_since,
                "last_report_at": now,
                "evidence": [
                    f"Mean absences this week {recent_mean:.1f} against a baseline of {baseline_mean:.1f}",
                    f"{sum(recent)} absences reported across {len(recent)} reports",
                    f"Baseline drawn from {len(baseline)} earlier reports in the last {lookback_days} days",
                ],
                "report_ids": [],
                "recommendation": SIGNAL_RECOMMENDATION,
            }
        )

    clusters.sort(key=lambda c: c["report_count"], reverse=True)
    return clusters


# ─────────────────────────── schemas ───────────────────────────


class ReportCreate(BaseModel):
    district: str = Field(min_length=1, max_length=120)
    school_id: int | None = None
    facility_id: int | None = None
    reporter_type: ActorType = ActorType.CHW
    reporter_reference: str | None = Field(default=None, max_length=160)
    channel: Channel = Channel.SMS
    keywords: list[str] = Field(default_factory=list)
    cases_reported: int = Field(default=0, ge=0)
    households_visited: int | None = Field(default=None, ge=0)
    absences_reported: int | None = Field(default=None, ge=0)
    note: str | None = Field(default=None, max_length=4000)


class SmsReportIn(BaseModel):
    """The gateway's view of an inbound message. Body is free text from a feature phone."""

    body: str = Field(min_length=1, max_length=1600)
    sender_reference: str = Field(min_length=1, max_length=160)
    district: str = Field(min_length=1, max_length=120)
    school_id: int | None = None
    reporter_type: ActorType = ActorType.CHW
    channel: Channel = Channel.SMS


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    district: str
    school_id: int | None
    facility_id: int | None
    reporter_type: ActorType
    reporter_reference: str | None
    channel: Channel
    keywords: list[str]
    cases_reported: int
    households_visited: int | None
    absences_reported: int | None
    note: str | None
    triaged: bool
    generated_alert_id: int | None
    created_at: datetime


class SmsReportAck(BaseModel):
    report_id: int
    recognised_keywords: list[str]
    unrecognised: bool
    reply: str


class SignalCluster(BaseModel):
    type: str
    scope: Literal["school", "district"]
    school_id: int | None
    school_name: str | None
    district: str
    report_count: int
    cases_reported: int
    window_hours: int
    first_report_at: datetime
    last_report_at: datetime
    evidence: list[str]
    report_ids: list[int]
    recommendation: str


class SignalResponse(BaseModel):
    generated_at: datetime
    lookback_days: int
    cluster_count: int
    clusters: list[SignalCluster]
    disclaimer: str


# ─────────────────────────── endpoints ───────────────────────────


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def submit_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_chw),
) -> FieldReport:
    """Submit a structured field report. Counts and symptom codes only, never names."""
    unknown = [k for k in payload.keywords if k.upper() not in _ALIAS_INDEX]
    if unknown:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unrecognised keyword(s): {', '.join(unknown)}",
        )

    report = FieldReport(
        district=payload.district,
        school_id=payload.school_id,
        facility_id=payload.facility_id,
        reporter_type=payload.reporter_type,
        reporter_reference=payload.reporter_reference or user.email,
        channel=payload.channel,
        keywords=[_ALIAS_INDEX[k.upper()] for k in payload.keywords],
        cases_reported=payload.cases_reported,
        households_visited=payload.households_visited,
        absences_reported=payload.absences_reported,
        note=payload.note,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.post("/sms", response_model=SmsReportAck, status_code=status.HTTP_201_CREATED)
def ingest_sms(
    payload: SmsReportIn,
    x_gateway_token: Annotated[str | None, Header(alias="X-Gateway-Token")] = None,
    db: Session = Depends(get_db),
) -> SmsReportAck:
    """Two-way SMS ingress, called by the telco gateway rather than by a logged-in user.

    Authenticated by a shared secret instead of a bearer token; with no secret
    configured the endpoint fails closed rather than accepting anonymous writes.
    """
    expected = os.getenv("GATEWAY_TOKEN", "")
    if not expected or not x_gateway_token or not secrets.compare_digest(x_gateway_token, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing gateway token.",
        )

    keywords = parse_keywords(payload.body)

    report = FieldReport(
        district=payload.district,
        school_id=payload.school_id,
        reporter_type=payload.reporter_type,
        reporter_reference=payload.sender_reference,
        channel=payload.channel,
        keywords=keywords,
        cases_reported=parse_case_count(payload.body, keywords),
        note=payload.body.strip()[:4000],
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    if keywords:
        labels = ", ".join(KEYWORD_VOCABULARY[k]["label"] for k in keywords)
        reply = f"Thank you. Your report has been received ({labels}). A community health worker will follow up."
    else:
        reply = (
            "Thank you. Your message was received but no keyword was recognised. "
            f"Reply with one of: {', '.join(sorted(KEYWORD_VOCABULARY))}."
        )

    return SmsReportAck(
        report_id=report.id,
        recognised_keywords=keywords,
        unrecognised=not keywords,
        reply=reply,
    )


@router.get("/signals", response_model=SignalResponse)
def signals(
    lookback_days: int = Query(28, ge=1, le=120),
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> SignalResponse:
    """The signal chain detector: clusters of field reports warranting verification."""
    clusters = detect_signal_clusters(db, lookback_days=lookback_days)
    return SignalResponse(
        generated_at=datetime.now(timezone.utc),
        lookback_days=lookback_days,
        cluster_count=len(clusters),
        clusters=[SignalCluster(**c) for c in clusters],
        disclaimer=SIGNAL_RECOMMENDATION,
    )


# Registered ahead of /{report_id} so the literal path is not swallowed by the
# integer path parameter.
@router.get("/meta/keywords")
def keyword_vocabulary(user: User = Depends(require_observer)) -> dict[str, Any]:
    """Publish the SMS vocabulary so training materials and the CHW app stay in step."""
    return {
        "keywords": [
            {"code": code, "label": meta["label"], "category": meta["category"], "aliases": meta["aliases"]}
            for code, meta in sorted(KEYWORD_VOCABULARY.items())
        ],
        "counts_by_category": dict(Counter(m["category"] for m in KEYWORD_VOCABULARY.values())),
    }


@router.get("", response_model=list[ReportOut])
def list_reports(
    district: str | None = None,
    school_id: int | None = None,
    triaged: bool | None = None,
    from_: Annotated[datetime | None, Query(alias="from")] = None,
    to: datetime | None = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> list[FieldReport]:
    query = db.query(FieldReport)
    if district:
        query = query.filter(FieldReport.district == district)
    if school_id is not None:
        query = query.filter(FieldReport.school_id == school_id)
    if triaged is not None:
        query = query.filter(FieldReport.triaged.is_(triaged))
    if from_ is not None:
        query = query.filter(FieldReport.created_at >= from_)
    if to is not None:
        query = query.filter(FieldReport.created_at <= to)
    return query.order_by(FieldReport.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{report_id}", response_model=ReportOut)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_observer),
) -> FieldReport:
    report = db.get(FieldReport, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field report not found.")
    return report


@router.post("/{report_id}/triage", response_model=ReportOut)
def triage_report(
    report_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_reviewer),
) -> FieldReport:
    """Mark a report as reviewed by a named human — the audit trail behind any action."""
    report = db.get(FieldReport, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field report not found.")
    report.triaged = True
    db.commit()
    db.refresh(report)
    return report
