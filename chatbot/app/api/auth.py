from fastapi import APIRouter, Depends, Response, HTTPException # type: ignore
from app.services.auth_service import AuthService
from app.schema.auth_schema import RegisterRequest, LoginRequest
from app.api.dependencies import get_current_user

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
            secure=False 
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
            secure=False 
        )
        return {"message": "Login successful"}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@auth_router.get("/me")
async def get_current_user_profile(user_id: str = Depends(get_current_user)):
    """
    Get the currently logged-in user's profile.
    """
    user_data = await AuthService.get_user_profile(user_id)
    
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user_data