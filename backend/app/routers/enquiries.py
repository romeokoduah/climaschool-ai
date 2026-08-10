"""Partnership and contact enquiries from the public site.

Open to the public, so it carries the light spam defences an unauthenticated
write endpoint needs: a length ceiling and a honeypot field.
"""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Enquiry, User
from ..security import require_admin

router = APIRouter(prefix="/enquiries", tags=["enquiries"])

MAX_MESSAGE_LENGTH = 5000


class EnquiryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    email: EmailStr
    organisation: str | None = Field(default=None, max_length=200)
    topic: str | None = Field(default=None, max_length=120)
    message: str = Field(min_length=1)
    # Hidden on the real form, so anything here came from a bot filling every input.
    website: str | None = Field(default=None, max_length=200)

    @field_validator("message")
    @classmethod
    def _message_length(cls, value: str) -> str:
        if len(value) > MAX_MESSAGE_LENGTH:
            raise ValueError(
                f"Message is too long. Please keep it under {MAX_MESSAGE_LENGTH} characters."
            )
        return value

    @field_validator("website")
    @classmethod
    def _honeypot(cls, value: str | None) -> str | None:
        if value:
            raise ValueError("This enquiry could not be accepted.")
        return value


class EnquiryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    organisation: str | None
    topic: str | None
    message: str
    handled: bool
    created_at: datetime


class EnquiryAck(BaseModel):
    id: int
    message: str


@router.post("", response_model=EnquiryAck, status_code=status.HTTP_201_CREATED)
def create_enquiry(payload: EnquiryCreate, db: Session = Depends(get_db)) -> EnquiryAck:
    """Public contact and partnership form."""
    enquiry = Enquiry(
        name=payload.name.strip(),
        email=str(payload.email).lower(),
        organisation=payload.organisation,
        topic=payload.topic,
        message=payload.message.strip(),
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return EnquiryAck(
        id=enquiry.id,
        message="Thank you for your enquiry. The ClimaSchool team will respond shortly.",
    )


@router.get("", response_model=list[EnquiryOut])
def list_enquiries(
    handled: bool | None = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
) -> list[Enquiry]:
    query = db.query(Enquiry)
    if handled is not None:
        query = query.filter(Enquiry.handled.is_(handled))
    return query.order_by(Enquiry.created_at.desc()).offset(offset).limit(limit).all()


@router.post("/{enquiry_id}/handled", response_model=EnquiryOut)
def mark_handled(
    enquiry_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
) -> Enquiry:
    enquiry = db.get(Enquiry, enquiry_id)
    if enquiry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enquiry not found.")
    enquiry.handled = True
    db.commit()
    db.refresh(enquiry)
    return enquiry
