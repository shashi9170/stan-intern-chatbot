from fastapi import APIRouter, Response, HTTPException # type: ignore
from app.services.auth_service import AuthService
from app.schema.auth_schema import RegisterRequest, LoginRequest

auth_router = APIRouter()

@auth_router.post("/register")
async def register(data: RegisterRequest, response: Response):
    try:
        token = await AuthService.register(data.username, data.email, data.password)
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            samesite="lax",
        )
        return {"message": "User registered successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))



@auth_router.post("/login")
async def login(data: LoginRequest, response: Response):
    try:
        token = await AuthService.login(data.username, data.password)
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            samesite="lax",
        )
        return {"message": "Login successful"}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
