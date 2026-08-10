"""Seed the confirmed pilot reference data.

Run once after the first deploy (and safely again at any time):

    python seed.py

What this deliberately does NOT do
----------------------------------
It seeds only the pilot footprint the programme documentation actually confirms:
two pilot schools, one per zone, and one health facility per zone. There are no
sample alerts, no sample subscribers and no sample risk assessments. Fabricated
readings would flow straight into the multi-hazard engine, and a fabricated alert
is indistinguishable from a real one once it is in the table — the cost of a
convincing demo row here is a caregiver acting on a hazard that never existed.

Where the source only confirms a zone rather than an administrative district or a
named institution, the zone label is used verbatim and the record is marked as
awaiting confirmation, rather than inventing a plausible-looking name.
"""

from __future__ import annotations

import sys

from sqlalchemy.orm import Session

from app.db import Base, SessionLocal, engine
from app.models import HealthFacility, School

# ─────────────────────────── confirmed pilot data ───────────────────────────

# Two zones, one primary school each (Eco-lution Consults pilot footprint).
# `district` carries the zone label where the source names a zone rather than a
# metropolitan/municipal district; Tamale Metropolis is itself the district.
PILOT_SCHOOLS: list[dict] = [
    {
        "code": "CS-ZONE1-SCH1",
        "name": "Pilot Primary School — Agbogbloshie / Korle Gonno (name pending confirmation)",
        "district": "Agbogbloshie / Korle Gonno",
        "region": "Greater Accra Region",
        "pilot_zone": "Zone 1 — Agbogbloshie / Korle Gonno",
    },
    {
        "code": "CS-ZONE2-SCH1",
        "name": "Pilot Primary School — Tamale Metropolis (name pending confirmation)",
        "district": "Tamale Metropolis",
        "region": "Northern Region",
        "pilot_zone": "Zone 2 — Tamale Metropolis",
    },
]

# One referral point per zone — the facility a school escalates to. Type and
# capacity are left null: neither is confirmed, and a guessed bed count would be
# read as fact by the facility resilience scorer.
PILOT_FACILITIES: list[dict] = [
    {
        "code": "CS-ZONE1-FAC1",
        "name": "Pilot Health Facility — Agbogbloshie / Korle Gonno (name pending confirmation)",
        "district": "Agbogbloshie / Korle Gonno",
        "region": "Greater Accra Region",
    },
    {
        "code": "CS-ZONE2-FAC1",
        "name": "Pilot Health Facility — Tamale Metropolis (name pending confirmation)",
        "district": "Tamale Metropolis",
        "region": "Northern Region",
    },
]


# ─────────────────────────── seeding ───────────────────────────


def seed_schools(db: Session) -> tuple[int, int]:
    """Insert any missing pilot schools. Returns (created, skipped)."""
    created = skipped = 0
    for record in PILOT_SCHOOLS:
        # `code` is the unique business key, so it is the only safe idempotency
        # check — names and districts may be corrected later without re-seeding.
        existing = db.query(School).filter(School.code == record["code"]).first()
        if existing is not None:
            print(f"  skip    school   {record['code']} — already present (id={existing.id})")
            skipped += 1
            continue
        db.add(School(**record))
        print(f"  create  school   {record['code']} — {record['district']}")
        created += 1
    return created, skipped


def seed_facilities(db: Session) -> tuple[int, int]:
    """Insert any missing pilot health facilities. Returns (created, skipped)."""
    created = skipped = 0
    for record in PILOT_FACILITIES:
        existing = db.query(HealthFacility).filter(HealthFacility.code == record["code"]).first()
        if existing is not None:
            print(f"  skip    facility {record['code']} — already present (id={existing.id})")
            skipped += 1
            continue
        db.add(HealthFacility(**record))
        print(f"  create  facility {record['code']} — {record['district']}")
        created += 1
    return created, skipped


def main() -> int:
    print("ClimaSchool AI — seeding confirmed pilot reference data")
    print("(no alerts, subscribers or risk data are seeded — those must come from the field)\n")

    # Harmless if the API has already started once; required if seeding runs first.
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        schools_created, schools_skipped = seed_schools(db)
        facilities_created, facilities_skipped = seed_facilities(db)
        db.commit()
    except Exception as exc:  # noqa: BLE001 — the message matters more than the type here
        db.rollback()
        print(f"\nFAILED: {exc}", file=sys.stderr)
        return 1
    finally:
        db.close()

    created = schools_created + facilities_created
    skipped = schools_skipped + facilities_skipped
    print(f"\nDone. {created} row(s) created, {skipped} already present.")
    if created == 0:
        print("Nothing to do — the pilot reference data was already seeded.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
