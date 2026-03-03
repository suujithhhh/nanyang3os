"""
Auth service — reads user_id directly from the X-User-ID header.
No Firebase token verification required.
"""

from fastapi import Header, HTTPException, status


async def get_verified_uid(x_user_id: str = Header(default=None)) -> str:
    """
    FastAPI dependency — reads user_id from X-User-ID header.
    Raises HTTP 401 if missing.
    """
    if not x_user_id or not x_user_id.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-User-ID header.",
        )
    return x_user_id.strip()


async def optional_uid(x_user_id: str = Header(default=None)) -> str | None:
    """
    FastAPI dependency — reads user_id from X-User-ID header.
    Returns None if not provided.
    """
    if not x_user_id or not x_user_id.strip():
        return None
    return x_user_id.strip()
