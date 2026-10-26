"""Admin routes: users, hospitals, rule versions."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_roles, Role
from app.core.security import hash_password
from app.deps import DbSession
from app.models.models import AppUser, Hospital, RuleVersion
from app.schemas.schemas import (
    HospitalCreate,
    HospitalOut,
    HospitalUpdate,
    PaginatedResponse,
    RuleVersionCreate,
    RuleVersionOut,
    UserCreate,
    UserOut,
    UserUpdate,
)

router = APIRouter(prefix="/admin", tags=["admin"])

_admin_only = Depends(require_roles(Role.ADMIN))


# ── Users ─────────────────────────────────────────────────────

@router.get("/users", response_model=PaginatedResponse, dependencies=[_admin_only])
async def list_users(db: DbSession, page: int = 1, page_size: int = 20):
    total = (await db.execute(select(func.count()).select_from(AppUser))).scalar_one()
    users = (
        await db.execute(
            select(AppUser).offset((page - 1) * page_size).limit(page_size)
        )
    ).scalars().all()
    return PaginatedResponse(total=total, page=page, page_size=page_size,
                             items=[UserOut.model_validate(u) for u in users])


@router.post("/users", response_model=UserOut, status_code=201, dependencies=[_admin_only])
async def create_user(body: UserCreate, db: DbSession):
    existing = (await db.execute(select(AppUser).where(AppUser.email == body.email))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = AppUser(
        email=body.email,
        hashed_password=hash_password(body.password),
        role=body.role,
        hospital_id=body.hospital_id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)


@router.get("/users/{user_id}", response_model=UserOut, dependencies=[_admin_only])
async def get_user(user_id: str, db: DbSession):
    user = (await db.execute(select(AppUser).where(AppUser.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut.model_validate(user)


@router.patch("/users/{user_id}", response_model=UserOut, dependencies=[_admin_only])
async def update_user(user_id: str, body: UserUpdate, db: DbSession):
    user = (await db.execute(select(AppUser).where(AppUser.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if body.role is not None:
        user.role = body.role
    if body.hospital_id is not None:
        user.hospital_id = body.hospital_id
    if body.is_active is not None:
        user.is_active = body.is_active
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)


# ── Hospitals ─────────────────────────────────────────────────

@router.get("/hospitals", response_model=PaginatedResponse, dependencies=[_admin_only])
async def list_hospitals(db: DbSession, page: int = 1, page_size: int = 20):
    total = (await db.execute(select(func.count()).select_from(Hospital))).scalar_one()
    hospitals = (
        await db.execute(select(Hospital).offset((page - 1) * page_size).limit(page_size))
    ).scalars().all()
    return PaginatedResponse(total=total, page=page, page_size=page_size,
                             items=[HospitalOut.model_validate(h) for h in hospitals])


@router.post("/hospitals", response_model=HospitalOut, status_code=201, dependencies=[_admin_only])
async def create_hospital(body: HospitalCreate, db: DbSession):
    hospital = Hospital(name=body.name, region=body.region)
    db.add(hospital)
    await db.commit()
    await db.refresh(hospital)
    return HospitalOut.model_validate(hospital)


@router.patch("/hospitals/{hospital_id}", response_model=HospitalOut, dependencies=[_admin_only])
async def update_hospital(hospital_id: str, body: HospitalUpdate, db: DbSession):
    hospital = (await db.execute(select(Hospital).where(Hospital.id == hospital_id))).scalar_one_or_none()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    if body.name is not None:
        hospital.name = body.name
    if body.region is not None:
        hospital.region = body.region
    if body.verified is not None:
        hospital.verified = body.verified
    await db.commit()
    await db.refresh(hospital)
    return HospitalOut.model_validate(hospital)


# ── Rule Versions ─────────────────────────────────────────────

@router.get("/rule-versions", response_model=PaginatedResponse, dependencies=[_admin_only])
async def list_rule_versions(db: DbSession, page: int = 1, page_size: int = 20):
    total = (await db.execute(select(func.count()).select_from(RuleVersion))).scalar_one()
    versions = (
        await db.execute(select(RuleVersion).offset((page - 1) * page_size).limit(page_size))
    ).scalars().all()
    return PaginatedResponse(total=total, page=page, page_size=page_size,
                             items=[RuleVersionOut.model_validate(v) for v in versions])


@router.post("/rule-versions", response_model=RuleVersionOut, status_code=201, dependencies=[_admin_only])
async def create_rule_version(body: RuleVersionCreate, db: DbSession, current_user=Depends(require_roles(Role.ADMIN))):
    rv = RuleVersion(
        organ=body.organ,
        version_tag=body.version_tag,
        weights_yaml_hash=body.weights_yaml_hash,
        approved_by=current_user.id,
        effective_from=body.effective_from,
    )
    db.add(rv)
    await db.commit()
    await db.refresh(rv)
    return RuleVersionOut.model_validate(rv)
