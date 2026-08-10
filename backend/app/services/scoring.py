"""Resilience scoring and health-facility demand estimation.

Scoring convention, and it matters: every dimension is scored 0-100 where **100 is
best**. The four dimensions named "exposure" are scored as *managed* exposure — a
school with deep shade, good ventilation and a heat timetable scores high on
`heat_exposure`; a school with none of those scores low. Without that convention a
weighted mean would add resilience to vulnerability and mean nothing, and the
weakest dimension would not be the biggest gap.

Nothing here diagnoses, confirms an outbreak, or decides anything. It ranks where
attention is most likely to be worth spending, and a named human decides.
"""

from __future__ import annotations

from typing import Any

# ─────────────────────────── school scoring ───────────────────────────

# Weights sum to 1.0. They are a deliberate editorial judgement about which
# dimensions carry the most child-health consequence in the Ghanaian pilot
# districts, not an empirical fit — there is not yet enough pilot data to fit one,
# and pretending otherwise would be dishonest. The reasoning:
#
#   heat, flood and WASH (0.15 each) — the three pathways that shut a school or
#     put children in hospital fastest. Flooding harms mainly *through* WASH
#     failure, so WASH carries equal weight to the hazards themselves.
#   health service access (0.13) — determines whether a case that does occur is
#     treated in time; the difference between an illness and a death.
#   infrastructure resilience (0.12) — slower-moving, but it caps how much the
#     hazard dimensions can ever improve.
#   nutrition, air quality, early warning (0.10 each) — real and measurable, but
#     each acts over a longer horizon or through the dimensions above.
#
# Revisit these once pilot outcome data can support a fitted weighting, and
# record any change in the model card.
SCHOOL_WEIGHTS: dict[str, float] = {
    "heat_exposure": 0.15,
    "flood_exposure": 0.15,
    "wash_readiness": 0.15,
    "health_service_access": 0.13,
    "infrastructure_resilience": 0.12,
    "nutrition_resilience": 0.10,
    "air_quality_exposure": 0.10,
    "early_warning_readiness": 0.10,
}

SCHOOL_DIMENSION_LABELS: dict[str, str] = {
    "heat_exposure": "Heat exposure",
    "flood_exposure": "Flood exposure",
    "wash_readiness": "WASH readiness",
    "health_service_access": "Health service access",
    "infrastructure_resilience": "Infrastructure resilience",
    "nutrition_resilience": "Nutrition resilience",
    "air_quality_exposure": "Air quality exposure",
    "early_warning_readiness": "Early warning readiness",
}

SCHOOL_PRIORITY_ACTIONS: dict[str, str] = {
    "heat_exposure": (
        "Install shading over the most exposed classrooms and improve cross-ventilation; "
        "move assembly and physical activity out of the peak-heat window."
    ),
    "flood_exposure": (
        "Clear and extend site drainage before the rains, and raise or relocate the "
        "classrooms and stores that flood first."
    ),
    "wash_readiness": (
        "Improve water storage and drainage, return handwashing stations to working order "
        "and replenish ORS stock to full capacity."
    ),
    "health_service_access": (
        "Agree a named referral route and contact with the nearest health facility, and "
        "confirm CHW cover for the school week."
    ),
    "infrastructure_resilience": (
        "Repair roofing and rainwater capture, and place flood barriers where the site "
        "takes water first."
    ),
    "nutrition_resilience": (
        "Extend school feeding coverage through the lean season and secure dry, "
        "pest-proof food storage."
    ),
    "air_quality_exposure": (
        "Reduce dust and smoke ingress — screen and seal the worst-affected classrooms — "
        "and adopt the harmattan indoor-activity guidance."
    ),
    "early_warning_readiness": (
        "Restore platform connectivity and rehearse alert acknowledgement with the head "
        "teacher and named focal staff."
    ),
}


# ─────────────────────────── facility scoring ───────────────────────────

# Five dimensions from WHO's Operational Framework for Climate-Resilient Health
# Systems. Infrastructure and service continuity carry the most weight because a
# facility that loses water, power or staff stops functioning outright, whatever
# its plans say. Supply readiness follows — it is the fastest-degrading dimension
# and the one a surge exhausts first. Hazard exposure and preparedness are
# weighted lower not because they matter less but because they act *through* the
# other three.
FACILITY_WEIGHTS: dict[str, float] = {
    "infrastructure_resilience": 0.25,
    "service_continuity": 0.25,
    "supply_readiness": 0.20,
    "hazard_exposure": 0.15,
    "preparedness": 0.15,
}

FACILITY_DIMENSION_LABELS: dict[str, str] = {
    "infrastructure_resilience": "Infrastructure resilience",
    "service_continuity": "Health service continuity",
    "supply_readiness": "Supply readiness",
    "hazard_exposure": "Climate hazard exposure",
    "preparedness": "Preparedness",
}

FACILITY_PRIORITY_ACTIONS: dict[str, str] = {
    "infrastructure_resilience": (
        "Secure water supply and power backup, and address drainage and cooling in the "
        "most exposed wards."
    ),
    "service_continuity": (
        "Confirm the staffing rota, referral contacts and communications that surge "
        "conditions depend on."
    ),
    "supply_readiness": (
        "Replenish ORS, malaria commodities and essential medicines to full capacity, and "
        "identify a backup water source."
    ),
    "hazard_exposure": (
        "Set trigger thresholds for the facility's dominant hazards with district health "
        "management and wire them into the anticipate phase."
    ),
    "preparedness": (
        "Update the emergency response plan, run a staff drill, and agree surge "
        "arrangements with the nearest referral facility."
    ),
}


# ─────────────────────────── shared machinery ───────────────────────────

# Bands read as vulnerability, not as a grade: a school scoring 64 is moderately
# vulnerable, which is what the head teacher needs told, rather than "a C".
_BANDS: tuple[tuple[float, str], ...] = (
    (75.0, "Low vulnerability"),
    (55.0, "Moderate vulnerability"),
    (40.0, "High vulnerability"),
    (0.0, "Severe vulnerability"),
)


def _band(overall: float) -> str:
    for threshold, label in _BANDS:
        if overall >= threshold:
            return label
    return _BANDS[-1][1]


def _validate(dimensions: dict[str, Any], weights: dict[str, float]) -> dict[str, float]:
    """Coerce and range-check the submitted dimensions, rejecting anything unusable.

    Routers validate too, but this function is also called from scripts and
    background jobs, so it refuses to score rubbish on its own account.
    """
    cleaned: dict[str, float] = {}
    missing = [name for name in weights if name not in dimensions]
    if missing:
        raise ValueError(f"Missing dimension scores: {', '.join(sorted(missing))}")

    for name in weights:
        raw = dimensions[name]
        if raw is None or isinstance(raw, bool):
            raise ValueError(f"Dimension '{name}' must be a number between 0 and 100")
        try:
            value = float(raw)
        except (TypeError, ValueError):
            raise ValueError(f"Dimension '{name}' must be a number between 0 and 100") from None
        if not 0.0 <= value <= 100.0:
            raise ValueError(f"Dimension '{name}' must be between 0 and 100, received {value:g}")
        cleaned[name] = value
    return cleaned


def _score(
    dimensions: dict[str, Any],
    weights: dict[str, float],
    labels: dict[str, str],
    actions: dict[str, str],
) -> dict[str, Any]:
    values = _validate(dimensions, weights)
    overall = round(sum(values[name] * weight for name, weight in weights.items()), 1)

    # Iterating the weights dict keeps tie-breaking deterministic: on an exact tie
    # the more heavily weighted dimension wins, because it is declared first.
    gap = min(weights, key=lambda name: (values[name], list(weights).index(name)))

    return {
        "dimensions": values,
        "weights": dict(weights),
        "overall": overall,
        "band": _band(overall),
        "biggest_gap": gap,
        "biggest_gap_label": labels[gap],
        "biggest_gap_score": values[gap],
        "priority_action": actions[gap],
    }


def score_school(dimensions: dict[str, Any]) -> dict[str, Any]:
    """Combine the eight school dimensions into an overall score and a next step.

    Returns the weighted overall (0-100, higher is better), the vulnerability band,
    the weakest dimension, and the priority action that follows from it.
    """
    return _score(dimensions, SCHOOL_WEIGHTS, SCHOOL_DIMENSION_LABELS, SCHOOL_PRIORITY_ACTIONS)


def score_facility(dimensions: dict[str, Any]) -> dict[str, Any]:
    """Combine the five WHO facility dimensions into an overall score and a next step."""
    return _score(dimensions, FACILITY_WEIGHTS, FACILITY_DIMENSION_LABELS, FACILITY_PRIORITY_ACTIONS)


# ─────────────────────── demand forecasting ───────────────────────

DEMAND_CAVEAT = (
    "All demand forecasts are decision-support estimates, not clinical guarantees. "
    "Human professional judgement governs all facility decisions."
)

# Condition thresholds → a multiplier on the historical baseline caseload. These
# are coarse on purpose: a wide, honestly-bounded range that a facility manager can
# act on beats a precise-looking number the pilot data cannot yet support.
_HEAT_STEPS: tuple[tuple[float, float], ...] = ((40.0, 2.2), (38.0, 1.8), (36.0, 1.5), (34.0, 1.2))
_RAIN_STEPS: tuple[tuple[float, float], ...] = ((100.0, 2.0), (50.0, 1.6), (20.0, 1.3))
_AQI_STEPS: tuple[tuple[float, float], ...] = ((200.0, 2.0), (150.0, 1.7), (100.0, 1.4), (50.0, 1.15))


def _step(value: float | None, steps: tuple[tuple[float, float], ...]) -> float:
    if value is None:
        return 1.0
    for threshold, multiplier in steps:
        if value >= threshold:
            return multiplier
    return 1.0


def forecast_demand(
    *,
    catchment_population: int,
    historical_incidence_per_1000_per_day: float,
    daily_consultation_capacity: int,
    hazard: str = "heat",
    forecast_temp_c: float | None = None,
    forecast_rainfall_mm: float | None = None,
    forecast_aqi: float | None = None,
    horizon_hours: int = 72,
    uncertainty: float = 0.15,
) -> dict[str, Any]:
    """Estimate hazard-related consultations over the forecast horizon.

    Baseline caseload comes from the facility's own historical incidence rate and
    catchment population; forecast conditions raise it by a stepped multiplier; the
    result is reported as a range, never a point estimate, because a point estimate
    would imply a confidence the underlying data does not carry.

    Gap classification compares peak daily demand against the facility's stated
    daily consultation capacity: under half of capacity the surge absorbs into
    normal slack (`none`); between half and full capacity it consumes the headroom
    routine care needs (`moderate`); above capacity it cannot be met without
    additional triage or referral (`high`).
    """
    if catchment_population <= 0:
        raise ValueError("Catchment population must be greater than zero")
    if historical_incidence_per_1000_per_day < 0:
        raise ValueError("Historical incidence rate cannot be negative")
    if daily_consultation_capacity <= 0:
        raise ValueError("Daily consultation capacity must be greater than zero")
    if horizon_hours <= 0:
        raise ValueError("Forecast horizon must be greater than zero hours")
    if not 0.0 <= uncertainty < 1.0:
        raise ValueError("Uncertainty must be between 0 and 1")

    days = horizon_hours / 24.0
    baseline_daily = catchment_population * historical_incidence_per_1000_per_day / 1000.0

    drivers: list[str] = []
    heat = _step(forecast_temp_c, _HEAT_STEPS)
    rain = _step(forecast_rainfall_mm, _RAIN_STEPS)
    air = _step(forecast_aqi, _AQI_STEPS)

    if heat > 1.0:
        drivers.append(f"forecast temperature {forecast_temp_c:g}°C")
    if rain > 1.0:
        drivers.append(f"forecast rainfall {forecast_rainfall_mm:g} mm")
    if air > 1.0:
        drivers.append(f"forecast AQI {forecast_aqi:g}")

    # The dominant condition drives the surge; multiplying them together would
    # compound coarse thresholds into a number with no defensible basis.
    multiplier = max(heat, rain, air)

    expected_total = baseline_daily * days * multiplier
    low = expected_total * (1.0 - uncertainty)
    high = expected_total * (1.0 + uncertainty)
    peak_daily = high / days if days else high

    ratio = peak_daily / daily_consultation_capacity
    if ratio <= 0.5:
        gap = "none"
        gap_note = (
            "Expected demand sits within routine capacity. No surge arrangements required "
            "beyond normal stock checks."
        )
    elif ratio <= 1.0:
        gap = "moderate"
        gap_note = (
            "Expected demand consumes the headroom routine care relies on. Prepare additional "
            "triage capacity and coordinate with the nearest referral facility."
        )
    else:
        gap = "high"
        gap_note = (
            "Expected demand exceeds daily consultation capacity. Activate surge arrangements, "
            "confirm referral routes, and alert district health management."
        )

    drivers_text = ", ".join(drivers) if drivers else "no elevated forecast conditions"

    return {
        "hazard": hazard,
        "horizon_hours": horizon_hours,
        "expected_consultations_low": int(round(low)),
        "expected_consultations_high": int(round(high)),
        "expected_consultations_midpoint": round(expected_total, 1),
        "baseline_daily_consultations": round(baseline_daily, 1),
        "condition_multiplier": round(multiplier, 2),
        "peak_daily_demand": round(peak_daily, 1),
        "daily_capacity": daily_consultation_capacity,
        "capacity_over_horizon": int(round(daily_consultation_capacity * days)),
        "gap": gap,
        "gap_note": gap_note,
        "basis": (
            f"Based on {drivers_text}, a historical incidence of "
            f"{historical_incidence_per_1000_per_day:g} per 1,000 per day, and a catchment "
            f"population of {catchment_population:,}."
        ),
        "caveat": DEMAND_CAVEAT,
    }
