"""Centralised error definitions and handlers."""
from __future__ import annotations

from fastapi import Request
from fastapi.responses import JSONResponse


class PraanSetuError(Exception):
    status_code: int = 500
    code: str = "internal_error"
    message: str = "An unexpected error occurred."

    def __init__(self, message: str | None = None, **kwargs):
        self.message = message or self.message
        for k, v in kwargs.items():
            setattr(self, k, v)
        super().__init__(self.message)


class NotFoundError(PraanSetuError):
    status_code = 404
    code = "not_found"
    message = "The requested resource was not found."


class UnauthorizedError(PraanSetuError):
    status_code = 401
    code = "unauthorized"
    message = "Authentication required."


class ForbiddenError(PraanSetuError):
    status_code = 403
    code = "forbidden"
    message = "You do not have permission to perform this action."


class ValidationError(PraanSetuError):
    status_code = 422
    code = "validation_error"
    message = "Input validation failed."


class ConflictError(PraanSetuError):
    status_code = 409
    code = "conflict"
    message = "A conflict occurred."


class LockedError(PraanSetuError):
    status_code = 423
    code = "account_locked"
    message = "Account is temporarily locked."


async def praansetu_exception_handler(request: Request, exc: PraanSetuError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.code, "message": exc.message},
    )
