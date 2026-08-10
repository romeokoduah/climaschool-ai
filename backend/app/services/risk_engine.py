"""The multi-hazard child climate risk engine.

A Python port of the browser engine in `src/lib/engine.js`, extended from four
signals to the six hazard modules described in the ClimaSchool AI specification:
heat, flood and WASH, climate-sensitive disease, air quality, nutrition, and
mental wellbeing.

The engine is deliberately transparent rather than clever. Every module is an
explainable arithmetic rule over observable inputs, so an alert can always be
defended to a head teacher or a district health officer. It is decision support:
it says conditions suggest elevated risk, never that an outbreak exists.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any

from ..models import Hazard, RiskBand, Season

# ─────────────────────────── band definitions ───────────────────────────

# Minimum overall score for each band, ascending. ORANGE and RED carry the
# mandatory human review gate — the thresholds live here so the engine and the
# alert router cannot drift apart.
BAND_THRESHOLDS: list[tuple[float, RiskBand]] = [
    (0.0, RiskBand.GREEN),
    (25.0, RiskBand.YELLOW),
    (55.0, RiskBand.ORANGE),
    (80.0, RiskBand.RED),
]

REVIEW_REQUIRED_BANDS: frozenset[RiskBand] = frozenset({RiskBand.ORANGE, RiskBand.RED})

BAND_GUIDANCE: dict[RiskBand, dict[str, str]] = {
    RiskBand.GREEN: {
        "label": "Normal",
        "meaning": "Conditions are within the expected range. Standard seasonal health guidance applies.",
        "platform_action": "Seasonal advisory to schools and parents",
    },
    RiskBand.YELLOW: {
        "label": "Watch",
        "meaning": "Conditions are approaching risk thresholds. Preparedness actions are recommended.",
        "platform_action": "Preparedness checklist to school and CHW",
    },
    RiskBand.ORANGE: {
        "label": "Prepare",
        "meaning": "A risk threshold has been breached. Immediate preparedness actions are required.",
        "platform_action": "Action alert to school, CHW and health facility",
    },
    RiskBand.RED: {
        "label": "Act",
        "meaning": (
            "Critical risk. Immediate action is required. Human review is mandatory before distribution."
        ),
        "platform_action": "Critical alert with human review gate",
    },
}

# Fallbacks used when a sensor or forecast field is absent. Each substitution
# costs confidence rather than silently pretending the reading was complete.
_DEFAULTS: dict[str, float] = {"temp_c": 30.0, "humidity": 60.0, "aqi": 55.0, "rainfall_mm": 0.0}
_MISSING_INPUT_CONFIDENCE_PENALTY = 9.0


# ─────────────────────────── value objects ───────────────────────────


@dataclass(frozen=True, slots=True)
class SchoolContext:
    """Static school characteristics that modulate an otherwise district-wide signal.

    Two schools under the same forecast are not equally exposed: a zinc-roofed
    classroom block beside a drain is a different proposition from a ventilated
    concrete block on high ground.
    """

    enrolment: int | None = None
    flood_zone_proximity_m: float | None = None
    distance_to_facility_km: float | None = None
    building_type: str | None = None
    has_school_feeding: bool | None = None


@dataclass(frozen=True, slots=True)
class Trigger:
    """A concrete operational rule that fired, with the action it mandates."""

    key: str
    hazard: Hazard | None
    title: str
    action: str
    severity: RiskBand

    def to_dict(self) -> dict[str, Any]:
        return {
            "key": self.key,
            "hazard": self.hazard.value if self.hazard else None,
            "title": self.title,
            "action": self.action,
            "severity": self.severity.value,
        }


@dataclass(slots=True)
class RiskResult:
    season: Season
    band: RiskBand
    overall: float
    confidence: float
    module_scores: dict[str, float]
    evidence: list[str]
    requires_human_review: bool
    triggers: list[Trigger] = field(default_factory=list)
    dominant_hazard: Hazard = Hazard.HEAT

    def to_dict(self) -> dict[str, Any]:
        return {
            "season": self.season.value,
            "band": self.band.value,
            "overall": self.overall,
            "confidence": self.confidence,
            "module_scores": dict(self.module_scores),
            "evidence": list(self.evidence),
            "requires_human_review": self.requires_human_review,
            "dominant_hazard": self.dominant_hazard.value,
            "triggers": [t.to_dict() for t in self.triggers],
            "band_guidance": BAND_GUIDANCE[self.band],
        }


# ─────────────────────────── helpers ───────────────────────────


def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def _median(values: list[float]) -> float:
    ordered = sorted(values)
    mid = len(ordered) // 2
    if len(ordered) % 2:
        return ordered[mid]
    return (ordered[mid - 1] + ordered[mid]) / 2


def _round(value: float, places: int = 1) -> float:
    return round(value + 0.0, places)


def _apparent_temperature(temp_c: float, humidity: float) -> float:
    """Steadman apparent temperature — humid heat is the heat a child actually feels."""
    vapour_pressure = (humidity / 100.0) * 6.105 * math.exp((17.27 * temp_c) / (237.7 + temp_c))
    return temp_c + 0.33 * vapour_pressure - 4.00


def _building_heat_penalty(building_type: str | None) -> float:
    if not building_type:
        return 0.0
    kind = building_type.strip().lower()
    if any(token in kind for token in ("zinc", "metal", "tin", "iron", "sheet")):
        return 9.0
    if any(token in kind for token in ("thatch", "mud", "temporary", "makeshift", "tent")):
        return 5.0
    return 0.0


def _building_ventilation_penalty(building_type: str | None) -> float:
    if not building_type:
        return 0.0
    kind = building_type.strip().lower()
    if any(token in kind for token in ("open", "shed", "temporary", "makeshift", "thatch")):
        return 6.0
    return 0.0


# ─────────────────────────── the six hazard modules ───────────────────────────
#
# Each module returns 0-100 on the same scale so the modules can be compared,
# and so the agreement between them is a meaningful confidence signal.


def heat_score(temp_c: float, humidity: float, ctx: SchoolContext) -> float:
    apparent = _apparent_temperature(temp_c, humidity)
    # Two readings of the same danger: humid heat that the body cannot shed, and
    # the raw air temperature the schedule-modification thresholds are written
    # against. Taking the worse of the two keeps the score and the operational
    # triggers from contradicting each other on a dry 38°C day.
    score = max((apparent - 33.0) * 8.0, (temp_c - 30.0) * 7.5)
    if apparent >= 34.0:
        score += _building_heat_penalty(ctx.building_type)
    # A crowded classroom concentrates body heat and starves the water point.
    if ctx.enrolment and ctx.enrolment >= 800 and apparent >= 34.0:
        score += 5.0
    return _clamp(score)


def flood_wash_score(rainfall_mm: float, humidity: float, ctx: SchoolContext) -> float:
    score = rainfall_mm * 1.6
    proximity = ctx.flood_zone_proximity_m
    if proximity is not None and rainfall_mm > 5.0:
        if proximity < 100:
            score += 25.0
        elif proximity < 500:
            score += 12.0
        elif proximity < 1000:
            score += 5.0
    # Saturated ground sheds rather than absorbs, and latrines back up first.
    if humidity >= 85.0 and rainfall_mm >= 10.0:
        score += 6.0
    if rainfall_mm >= 20.0:
        score += 6.0  # water-contamination and access-route component
    return _clamp(score)


def disease_score(temp_c: float, humidity: float, rainfall_mm: float, flood_wash: float, ctx: SchoolContext) -> float:
    """Climate-sensitive disease, following WHO EWARS-csd principles.

    Vector conditions (malaria) plus water-borne conditions (diarrhoeal disease,
    cholera) plus the distance a sick child must travel to be seen.
    """
    malaria = 0.0
    if rainfall_mm > 5.0:
        malaria += 30.0
    if humidity > 70.0:
        malaria += 30.0
    elif humidity > 55.0:
        malaria += 15.0
    if 22.0 < temp_c < 32.0:
        malaria += 25.0

    waterborne = 0.0
    if rainfall_mm >= 30.0:
        waterborne += 15.0
    if temp_c >= 30.0 and humidity >= 70.0:
        waterborne += 10.0
    waterborne += flood_wash * 0.15

    # Favourable vector conditions are a watch-level signal, not an outbreak: the
    # rains make transmission possible across most of the country for months, so
    # letting the raw suitability index reach RED on its own would put the whole
    # wet season permanently in review and train reviewers to click through.
    # Water-borne risk is scored at full weight because it follows a specific,
    # dated event — this week's flooding — rather than a season.
    malaria *= 0.6

    score = max(malaria, waterborne) + min(malaria, waterborne) * 0.2

    distance = ctx.distance_to_facility_km
    if distance is not None:
        if distance > 10.0:
            score += 8.0
        elif distance > 5.0:
            score += 4.0
    return _clamp(score)


def air_quality_score(aqi: float, humidity: float, ctx: SchoolContext) -> float:
    score = (aqi - 50.0) * 0.7
    # Harmattan: dry air keeps dust airborne and in small airways for longer.
    if aqi >= 100.0 and humidity <= 35.0:
        score = score * 1.15 + 5.0
    score += _building_ventilation_penalty(ctx.building_type) if aqi >= 100.0 else 0.0
    return _clamp(score)


def nutrition_score(temp_c: float, rainfall_mm: float, disease: float, ctx: SchoolContext) -> float:
    """Seasonal food availability under climate shock.

    Without a market data feed this is a proxy: the lean season is defined by the
    weather that precedes the harvest, and both drought heat and crop-destroying
    rain shorten the food year for the same households.
    """
    score = 8.0  # baseline seasonal pressure in the pilot districts
    if temp_c >= 38.0 and rainfall_mm <= 1.0:
        score += 20.0  # drought heat during the growing window
    if rainfall_mm >= 50.0:
        score += 18.0  # standing water on farmland and spoiled stored grain
    score += disease * 0.18  # illness and undernutrition compound each other
    if ctx.has_school_feeding is False:
        score += 12.0
    elif ctx.has_school_feeding is True:
        score -= 6.0
    return _clamp(score)


def wellbeing_score(heat: float, flood_wash: float, air: float) -> float:
    """Mental wellbeing, driven by disruption rather than by weather directly.

    Children are affected by the closure, the displacement and the missed weeks,
    so this module reads the other modules rather than the raw sensors.
    """
    score = flood_wash * 0.35 + heat * 0.30 + air * 0.20
    if flood_wash >= 70.0:
        score += 12.0  # displacement is the dominant driver of school disruption
    if heat >= 80.0:
        score += 6.0
    return _clamp(score)


# ─────────────────────────── trigger rules ───────────────────────────


def evaluate_triggers(
    temp_c: float | None,
    humidity: float | None,
    aqi: float | None,
    rainfall_mm: float | None,
) -> list[Trigger]:
    """The concrete operational thresholds, stated as actions rather than as numbers.

    These are the rules a head teacher can memorise and act on without opening the
    platform, so they are kept separate from the graded module scores.
    """
    t = temp_c if temp_c is not None else _DEFAULTS["temp_c"]
    h = humidity if humidity is not None else _DEFAULTS["humidity"]
    a = aqi if aqi is not None else _DEFAULTS["aqi"]
    r = rainfall_mm if rainfall_mm is not None else _DEFAULTS["rainfall_mm"]

    fired: list[Trigger] = []

    if t >= 40.0:
        fired.append(
            Trigger(
                key="heat_closure",
                hazard=Hazard.HEAT,
                title="Extreme heat",
                action=(
                    "Forecast above 40°C — closure recommendation to district education, "
                    "ORS pre-positioned, parent advisory dispatched."
                ),
                severity=RiskBand.RED,
            )
        )
    elif t >= 38.0:
        fired.append(
            Trigger(
                key="heat_schedule_modification",
                hazard=Hazard.HEAT,
                title="Heat alert",
                action=(
                    "Forecast above 38°C — schedule modification, morning assembly cancelled, "
                    "shade and water stations activated."
                ),
                severity=RiskBand.ORANGE,
            )
        )

    if a >= 150.0:
        fired.append(
            Trigger(
                key="air_quality_hazard",
                hazard=Hazard.AIR_QUALITY,
                title="Air quality hazard",
                action="AQI hazardous — indoor activity only, windows closed, scheduled water-break protocol.",
                severity=RiskBand.ORANGE,
            )
        )
    elif a >= 100.0:
        fired.append(
            Trigger(
                key="dust_watch",
                hazard=Hazard.AIR_QUALITY,
                title="Dust watch",
                action="AQI elevated — partial window protocol, outdoor PE shortened, dust advisory to parents.",
                severity=RiskBand.YELLOW,
            )
        )

    if r >= 50.0:
        fired.append(
            Trigger(
                key="flood_protocol",
                hazard=Hazard.FLOOD_WASH,
                title="Flood protocol",
                action=(
                    "Rainfall above 50 mm/24h — safe-route SMS to parents, latrine inspection, "
                    "attendance flagged for 48 hours."
                ),
                severity=RiskBand.ORANGE,
            )
        )
    elif r >= 20.0:
        fired.append(
            Trigger(
                key="heavy_rain",
                hazard=Hazard.FLOOD_WASH,
                title="Heavy rain",
                action="WASH stations refilled and drainage checked ahead of the next rainfall band.",
                severity=RiskBand.YELLOW,
            )
        )

    if h >= 80.0 and 22.0 <= t <= 32.0:
        fired.append(
            Trigger(
                key="malaria_conditions",
                hazard=Hazard.DISEASE,
                title="Malaria conditions",
                action=(
                    "Vector conditions favourable — bednet reminder dispatched, ITN distribution "
                    "coordinated with the CHW. Public-health verification recommended."
                ),
                severity=RiskBand.YELLOW,
            )
        )

    if not fired:
        fired.append(
            Trigger(
                key="all_clear",
                hazard=None,
                title="All clear",
                action="Normal operations — routine monitoring continues.",
                severity=RiskBand.GREEN,
            )
        )
    return fired


# ─────────────────────────── classification ───────────────────────────


def classify_band(overall: float) -> RiskBand:
    band = RiskBand.GREEN
    for minimum, candidate in BAND_THRESHOLDS:
        if overall >= minimum:
            band = candidate
    return band


def requires_human_review(band: RiskBand) -> bool:
    """The single source of truth for the safety gate. ORANGE and RED never self-issue."""
    return band in REVIEW_REQUIRED_BANDS


def _detect_season(
    temp_c: float,
    humidity: float,
    aqi: float,
    rainfall_mm: float,
    heat: float,
    air: float,
    flood: float,
) -> Season:
    """Read the season from the weather itself.

    The browser engine inferred season from whichever hazard scored highest, which
    mislabels a calm dry day as the second rains whenever a background signal
    happens to lead. The Ghanaian seasons are distinguishable directly: rain or no
    rain first, then dust for the harmattan and intensity for which rains these are.
    """
    if rainfall_mm < 5.0:
        if humidity < 45.0 and (aqi >= 90.0 or (air >= heat and aqi >= 70.0)):
            return Season.HARMATTAN
        return Season.DRYHEAT
    if rainfall_mm >= 25.0 or flood >= 45.0:
        return Season.FIRSTRAINS
    return Season.SECONDRAINS


def _confidence(signals: list[float], missing_inputs: int) -> float:
    """Agreement between the modules stands in for model confidence.

    A classification supported by several modules pointing the same way is better
    evidenced than one driven by a single outlier, so we measure the distance from
    the loudest module to the median module: tight agreement means a small spread
    and high confidence, one screaming outlier means a large spread and a score we
    are honest about. Missing sensor inputs are then subtracted, because a
    confident answer computed from defaults is not a confident answer.
    """
    spread = max(signals) - _median(signals)
    return _clamp(96.0 - spread * 0.45 - missing_inputs * _MISSING_INPUT_CONFIDENCE_PENALTY)


def classify(
    temp_c: float | None = None,
    humidity: float | None = None,
    aqi: float | None = None,
    rainfall_mm: float | None = None,
    context: SchoolContext | None = None,
) -> RiskResult:
    """Run all six hazard modules over one reading and produce a banded assessment."""
    ctx = context or SchoolContext()

    supplied = {"temp_c": temp_c, "humidity": humidity, "aqi": aqi, "rainfall_mm": rainfall_mm}
    missing = [name for name, value in supplied.items() if value is None]
    t = temp_c if temp_c is not None else _DEFAULTS["temp_c"]
    h = humidity if humidity is not None else _DEFAULTS["humidity"]
    a = aqi if aqi is not None else _DEFAULTS["aqi"]
    r = rainfall_mm if rainfall_mm is not None else _DEFAULTS["rainfall_mm"]

    heat = heat_score(t, h, ctx)
    flood = flood_wash_score(r, h, ctx)
    disease = disease_score(t, h, r, flood, ctx)
    air = air_quality_score(a, h, ctx)
    nutrition = nutrition_score(t, r, disease, ctx)
    wellbeing = wellbeing_score(heat, flood, air)

    module_scores: dict[str, float] = {
        Hazard.HEAT.value: _round(heat),
        Hazard.FLOOD_WASH.value: _round(flood),
        Hazard.DISEASE.value: _round(disease),
        Hazard.AIR_QUALITY.value: _round(air),
        Hazard.NUTRITION.value: _round(nutrition),
        Hazard.WELLBEING.value: _round(wellbeing),
    }

    scored: list[tuple[Hazard, float]] = [
        (Hazard.HEAT, heat),
        (Hazard.FLOOD_WASH, flood),
        (Hazard.DISEASE, disease),
        (Hazard.AIR_QUALITY, air),
        (Hazard.NUTRITION, nutrition),
        (Hazard.WELLBEING, wellbeing),
    ]
    signals = [value for _, value in scored]
    dominant_index = max(range(len(scored)), key=lambda i: scored[i][1])
    dominant_hazard, dominant_value = scored[dominant_index]

    others = signals[:dominant_index] + signals[dominant_index + 1 :]
    # The worst hazard sets the level — a child is not safer from flooding because
    # the air is clean — but several hazards at once is genuinely worse than one,
    # so the remaining modules add a bounded uplift rather than averaging it away.
    overall = _clamp(dominant_value + (sum(others) / len(others)) * 0.15)

    band = classify_band(overall)
    season = _detect_season(t, h, a, r, heat, air, flood)
    confidence = _confidence(signals, len(missing))

    evidence: list[str] = [
        f"forecast temperature {t:.1f}°C" + (" (assumed — not supplied)" if "temp_c" in missing else ""),
        f"humidity {h:.0f}%" + (" (assumed — not supplied)" if "humidity" in missing else ""),
        f"AQI {a:.0f}" + (" (assumed — not supplied)" if "aqi" in missing else ""),
        f"rainfall {r:.1f} mm/24h" + (" (assumed — not supplied)" if "rainfall_mm" in missing else ""),
        f"apparent temperature {_apparent_temperature(t, h):.1f}°C",
        f"dominant hazard: {dominant_hazard.value.replace('_', ' and ')}",
    ]
    if ctx.building_type:
        evidence.append(f"classroom construction: {ctx.building_type}")
    if ctx.flood_zone_proximity_m is not None:
        evidence.append(f"{ctx.flood_zone_proximity_m:.0f} m from the nearest flood-prone area")
    if ctx.distance_to_facility_km is not None:
        evidence.append(f"{ctx.distance_to_facility_km:.1f} km to the nearest health facility")
    if ctx.enrolment:
        evidence.append(f"{ctx.enrolment} children enrolled")
    if band in REVIEW_REQUIRED_BANDS:
        evidence.append("verification status: pending human review")

    return RiskResult(
        season=season,
        band=band,
        overall=_round(overall),
        confidence=_round(confidence),
        module_scores=module_scores,
        evidence=evidence,
        requires_human_review=requires_human_review(band),
        triggers=evaluate_triggers(temp_c, humidity, aqi, rainfall_mm),
        dominant_hazard=dominant_hazard,
    )


def summarise(result: RiskResult, place: str) -> tuple[str, str]:
    """A title and body for an alert drafted from an assessment.

    The wording is bounded on purpose: the platform reports elevated risk and
    recommends verification, it never asserts that an outbreak is under way.
    """
    hazard_label = result.dominant_hazard.value.replace("_", " and ")
    title = f"{result.band.value} — {BAND_GUIDANCE[result.band]['label']}: {hazard_label} risk, {place}"
    actions = " ".join(f"{t.title}: {t.action}" for t in result.triggers)
    body = (
        f"Climate and available indicators suggest {BAND_GUIDANCE[result.band]['label'].lower()}-level "
        f"{hazard_label} risk for {place} (score {result.overall:.0f}/100, confidence "
        f"{result.confidence:.0f}%). {actions} "
        "This is decision support, not a clinical diagnosis — public-health verification is recommended."
    )
    return title, body
