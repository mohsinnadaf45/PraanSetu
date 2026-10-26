"""Identity vault routes (reveal requests)."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from app.core.permissions import require_roles, Role
from app.deps import DbSession, VaultDbSession
from app.schemas.schemas import RevealRequest, RevealApproveRequest, RevealOut, IdentityStore
from app.vault import reveal as reveal_service

router = APIRouter(prefix="/identity", tags=["identity"])


@router.post("/store", status_code=201)
async def store_identity(
    body: IdentityStore,
    vault_db: VaultDbSession,
    current_user=Depends(require_roles(Role.COORDINATOR, Role.DOCTOR, Role.ADMIN)),
):
    """Store encrypted identity for a donor/recipient code (called at registration)."""
    from app.vault.client import store_identity as _store
    await _store(vault_db, body)
    return {"message": "Identity stored"}


@router.post("/reveal", response_model=RevealOut, status_code=201)
async def request_reveal(
    body: RevealRequest,
    vault_db: VaultDbSession,
    current_user=Depends(require_roles(Role.DOCTOR, Role.ADMIN)),
):
    return await reveal_service.request_reveal(vault_db, body, current_user)


@router.post("/reveal/{reveal_id}/approve", response_model=RevealOut)
async def approve_reveal(
    reveal_id: str,
    body: RevealApproveRequest,
    vault_db: VaultDbSession,
    current_user=Depends(require_roles(Role.COMMITTEE, Role.ADMIN)),
):
    return await reveal_service.approve_reveal(vault_db, reveal_id, body, current_user)


@router.get("/reveal/{reveal_id}", response_model=RevealOut)
async def get_reveal_status(
    reveal_id: str,
    vault_db: VaultDbSession,
    current_user=Depends(require_roles(Role.DOCTOR, Role.COMMITTEE, Role.ADMIN)),
):
    return await reveal_service.get_reveal(vault_db, reveal_id)


@router.get("/{code}")
async def get_revealed_identity(
    code: str,
    vault_db: VaultDbSession,
    current_user=Depends(require_roles(Role.DOCTOR, Role.COMMITTEE, Role.ADMIN)),
):
    """Return decrypted identity for an approved reveal. Writes audit entry."""
    from app.vault.client import get_identity
    return await get_identity(vault_db, code, current_user)
