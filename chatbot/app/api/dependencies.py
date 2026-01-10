from fastapi import Cookie, HTTPException # type: ignore
from app.core.security import decode_token
from app.services.auth_service import AuthService

async def get_current_user(access_token: str | None = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401)

    user_id = decode_token(access_token)
    data = await AuthService.get_user_profile(user_id)
    
    if not data:
        raise HTTPException(status_code=401)

    return user_id
