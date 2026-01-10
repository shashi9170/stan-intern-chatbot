from fastapi import Cookie, HTTPException # type: ignore
from app.core.security import decode_token

async def get_current_user(access_token: str | None = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401)

    user_id = decode_token(access_token)
    if not user_id:
        raise HTTPException(status_code=401)

    return user_id
