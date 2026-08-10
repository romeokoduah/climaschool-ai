# ClimaSchool AI — API

The intelligence and early-action layer around the child. Climate and field signals
arrive here, the multi-hazard engine classifies them into a risk band, alerts pass a
human safety gate, and every actor's response is recorded against the alert that
prompted it.

Operated by Eco-lution Consults, Ghana. Pilot footprint: two zones —
Agbogbloshie / Korle Gonno (Greater Accra) and Tamale Metropolis (Northern Region).

**This is decision support.** It does not diagnose disease, confirm outbreaks, or
replace DHIS2 or Ghana Health Service systems. No table in the data model holds an
identifiable child: risk is assessed at school and community level, field reports
carry counts and symptoms rather than names, and the only personal data stored is
the contact detail of a consenting adult.

---

## Stack

FastAPI · SQLAlchemy 2.0 · PostgreSQL (psycopg 3) · Pydantic v2 · JWT (python-jose)
· passlib/bcrypt. Python 3.12.

## Local setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # then edit it — see below
python -c "import secrets; print(secrets.token_hex(32))"   # or: openssl rand -hex 32
```

You need a reachable PostgreSQL database. Tables are created automatically on
startup (`Base.metadata.create_all`), so no migration step is required yet.

## Environment variables

Every setting lives in `app/config.py` and is documented in `.env.example`.

| Variable | Purpose |
| --- | --- |
| `APP_NAME` | Service name shown in `/`, `/health` and the OpenAPI title |
| `ENVIRONMENT` | `production` enables the startup guard on `SECRET_KEY` |
| `API_PREFIX` | Mount point for the versioned routers (default `/api/v1`) |
| `DATABASE_URL` | `postgresql+psycopg://user:pass@host:5432/dbname` |
| `SECRET_KEY` | **Required.** JWT signing key — generate with `openssl rand -hex 32` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime (default 720 = 12 hours) |
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API |
| `BOOTSTRAP_ADMIN_EMAIL` | Email of the first administrator |
| `BOOTSTRAP_ADMIN_PASSWORD` | Set **once** for first boot, then remove — see below |

The app refuses to start when `ENVIRONMENT=production` and `SECRET_KEY` is still
the default. Changing `SECRET_KEY` invalidates every issued token, which is the
intended way to revoke access in a hurry.

### First administrator

On startup, if the `users` table is empty *and* `BOOTSTRAP_ADMIN_PASSWORD` is set,
one admin account is created. Log in, change the password via
`POST /api/v1/auth/change-password`, then **delete the line from `.env` and restart**.
A live password sitting in `.env` is a standing key to the alert review queue.

## Running

```bash
uvicorn app.main:app --reload --port 8100          # development
python seed.py                                     # confirmed pilot reference data
```

Interactive docs at `/docs`, schema at `/openapi.json`, liveness (with a real
database round-trip) at `/health`.

`seed.py` is idempotent and seeds only what the programme documentation confirms:
two pilot schools, one per zone, and one health facility per zone. It creates no
alerts, subscribers or risk data — those must come from the field, because a
fabricated row is indistinguishable from a real one once it is in the table.

## Endpoint map

All routers are mounted under `API_PREFIX` (`/api/v1`). Unprefixed meta routes:

| Route | Purpose |
| --- | --- |
| `GET /` | Service identity |
| `GET /health` | Liveness plus a database round-trip |
| `GET /docs`, `GET /openapi.json` | Swagger UI and schema |

| Router | Base path | What it covers |
| --- | --- | --- |
| `auth` | `/auth` | Tokens, profile, staff accounts, password change |
| `schools` | `/schools` | Pilot schools and their resilience scores |
| `facilities` | `/facilities` | Health facilities and their resilience scores |
| `readings` | `/readings` | Climate and environmental observations/forecasts |
| `alerts` | `/alerts` | Alert lifecycle: create, review, issue, acknowledge, close |
| `reports` | `/reports` | Field reports from CHWs, teachers and school nurses |
| `subscribers` | `/subscribers` | Consenting caregiver contacts and channel/language |
| `observatory` | `/observatory` | Aggregate, de-identified views for institutions |
| `enquiries` | `/enquiries` | Partnership and contact enquiries from the public site |

### `auth` in full

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/token` | public | OAuth2 password flow (`username` = email). Returns `access_token`, `token_type`, `role`, `full_name` |
| `GET` | `/auth/me` | any signed-in user | Current user's profile |
| `POST` | `/auth/users` | admin | Create a staff account |
| `GET` | `/auth/users` | admin | List staff accounts |
| `PATCH` | `/auth/users/{id}` | admin | Change a user's role or active status |
| `POST` | `/auth/change-password` | any signed-in user | Change own password (current password required) |

`hashed_password` is never returned by any endpoint. There is no self-registration:
accounts are created by a named administrator, and an administrator cannot
deactivate or demote their own account — that requires a second administrator, so
the review queue can never be left with nobody able to act.

## Roles

| Role | Can do |
| --- | --- |
| `admin` | Everything, including user administration. Passes every role check |
| `reviewer` | Approves, rejects and issues alerts — the human in the safety gate |
| `chw` | Submits field reports and acknowledges actions |
| `observer` | Read-only access to aggregate views |

Bearer token in `Authorization: Bearer <token>`. Tokens carry the email as `sub`
and the role as a claim, but the role is re-read from the database on every
request — a demotion takes effect immediately, without waiting for expiry.

## Safety gate

**ORANGE and RED alerts cannot be issued without human review.** Any alert at those
bands is created with `requires_human_review = true` and stays in `created` until a
`reviewer` or `admin` approves it, at which point `reviewed_by_id` and `reviewed_at`
are stamped and the alert may move to `issued`. Every transition is written to
`alert_events`, giving a complete audit trail from signal to action — the record
behind the programme's Minutes of Protection.

This is not a formality. An alert that reaches caregivers tells them to change what
they do with their children today; the system is built so that no model output ever
makes that call unaccompanied.

## Deployment

Server tooling lives in `../deploy/`: a systemd unit, two nginx vhosts (IP+port for
immediate use, domain for later) and `deploy.sh`. See the comments at the top of
each file.
