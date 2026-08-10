"""Authentication and user administration.

Every write endpoint elsewhere in the API leans on the identities issued here, so
this router is deliberately narrow: issue a token, describe the caller, and let an
administrator manage the small set of staff accounts. There is no self-registration
— accounts are created by a named administrator, because an account in this system
can approve an ORANGE or RED alert that reaches real caregivers.
"""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import User, UserRole
from ..security import (
    create_access_token,
    get_current_user,
    hash_password,
    require_admin,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# Long enough to resist offline guessing of a bcrypt hash, short enough that a
# head teacher can still choose something memorable.
MIN_PASSWORD_LENGTH = 10


# ─────────────────────────── schemas ───────────────────────────


class TokenOut(BaseModel):
    """The console needs the role and name immediately, so they ride with the token."""

    access_token: str
    token_type: str = "bearer"
    role: UserRole
    full_name: str


class UserOut(BaseModel):
    """The only shape a user is ever serialised in — hashed_password is absent by design."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    organisation: str | None = None
    role: UserRole
    is_active: bool
    created_at: datetime


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=160)
    organisation: str | None = Field(default=None, max_length=160)
    role: UserRole = UserRole.OBSERVER
    password: str = Field(min_length=MIN_PASSWORD_LENGTH, max_length=128)


class UserUpdate(BaseModel):
    """Only the two fields an administrator may change after creation."""

    role: UserRole | None = None
    is_active: bool | None = None


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=MIN_PASSWORD_LENGTH, max_length=128)


class MessageOut(BaseModel):
    detail: str


# ─────────────────────────── endpoints ───────────────────────────


@router.post("/token", response_model=TokenOut, summary="Exchange email and password for a token")
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> TokenOut:
    """OAuth2 password flow. `username` carries the email address.

    The failure path is intentionally uniform: an unknown email, a wrong password
    and a deactivated account all return the same message, so the endpoint cannot
    be used to enumerate who works on the programme.
    """
    email = form.username.strip().lower()
    user = db.query(User).filter(User.email == email).first()

    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if user is None or not verify_password(form.password, user.hashed_password):
        raise invalid
    if not user.is_active:
        raise invalid

    return TokenOut(
        access_token=create_access_token(subject=user.email, role=user.role.value),
        token_type="bearer",
        role=user.role,
        full_name=user.full_name,
    )


@router.get("/me", response_model=UserOut, summary="Profile of the authenticated user")
def read_me(user: User = Depends(get_current_user)) -> User:
    return user


@router.post(
    "/users",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a staff account (admin only)",
)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> User:
    email = payload.email.strip().lower()
    if db.query(User).filter(User.email == email).first() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with that email already exists",
        )

    user = User(
        email=email,
        full_name=payload.full_name.strip(),
        organisation=(payload.organisation or "").strip() or None,
        role=payload.role,
        hashed_password=hash_password(payload.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/users", response_model=list[UserOut], summary="List staff accounts (admin only)")
def list_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> list[User]:
    return db.query(User).order_by(User.id).all()


@router.patch("/users/{user_id}", response_model=UserOut, summary="Change a user's role or status (admin only)")
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # An administrator locking themselves out would leave the alert review queue
    # with no one able to approve or reject — so self-demotion is refused here and
    # must be done by a second administrator.
    if user.id == admin.id:
        if payload.is_active is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own account",
            )
        if payload.role is not None and payload.role is not UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot remove your own admin role",
            )

    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active

    db.commit()
    db.refresh(user)
    return user


@router.post("/change-password", response_model=MessageOut, summary="Change your own password")
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> MessageOut:
    """Re-verifying the current password stops a borrowed, still-valid token from
    being turned into permanent ownership of the account."""
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    if payload.new_password == payload.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must differ from the current password",
        )

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    # Tokens already issued stay valid until they expire; the console is expected to
    # re-authenticate after this call.
    return MessageOut(detail="Password changed")
