"""ClimaSchool AI API — the intelligence and early-action layer around the child.

This service is where the platform's connections happen: climate and field data
arrive here, the multi-hazard engine classifies them, alerts pass the safety gate,
and every actor's action is recorded against the alert that prompted it.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from .config import get_settings
from .db import Base, SessionLocal, engine
from .routers import (
    alerts,
    auth,
    enquiries,
    facilities,
    observatory,
    readings,
    reports,
    schools,
    subscribers,
)

settings = get_settings()
log = logging.getLogger("climaschool")

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description=(
        "Child-centred climate-health intelligence and early action. "
        "Decision support only — this API does not diagnose disease or confirm outbreaks."
    ),
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (
    auth.router,
    schools.router,
    facilities.router,
    readings.router,
    alerts.router,
    reports.router,
    subscribers.router,
    observatory.router,
    enquiries.router,
):
    app.include_router(router, prefix=settings.api_prefix)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)

    if settings.environment == "production" and settings.secret_key == "change-me":
        raise RuntimeError("SECRET_KEY must be set in production — refusing to start on the default.")

    # Seed the first admin only when a password was supplied and no users exist yet.
    if settings.bootstrap_admin_password:
        from .models import User, UserRole
        from .security import hash_password

        db = SessionLocal()
        try:
            if db.query(User).count() == 0:
                db.add(
                    User(
                        email=settings.bootstrap_admin_email,
                        full_name="ClimaSchool Administrator",
                        organisation="Eco-lution Consults",
                        role=UserRole.ADMIN,
                        hashed_password=hash_password(settings.bootstrap_admin_password),
                    )
                )
                db.commit()
                log.info("Seeded bootstrap admin %s", settings.bootstrap_admin_email)
        finally:
            db.close()


@app.get("/health", tags=["meta"])
def health() -> JSONResponse:
    """Liveness plus a real database round-trip, for the deploy script and uptime checks."""
    db_ok = True
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception:
        db_ok = False
    return JSONResponse(
        status_code=200 if db_ok else 503,
        content={"status": "ok" if db_ok else "degraded", "database": db_ok, "service": settings.app_name},
    )


@app.get("/", tags=["meta"])
def root() -> dict:
    return {
        "service": settings.app_name,
        "docs": "/docs",
        "api": settings.api_prefix,
        "operated_by": "Eco-lution Consults, Ghana",
    }
