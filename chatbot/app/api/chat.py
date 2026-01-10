from fastapi import APIRouter # type: ignore

router = APIRouter()

@router.get("/chat")
async def chat():
    return {"message": "Chat endpoint working"}
