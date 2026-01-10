from fastapi import APIRouter # type: ignore

router = APIRouter()

@router.get("/login")
async def login():
    return {"message": "Login endpoint working"}
