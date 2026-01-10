from fastapi import APIRouter # type: ignore
from .auth import auth_router
from .chat import chat_router


router = APIRouter()

# feature routers
router.include_router(chat_router, prefix="/chat", tags=["Chat"])
router.include_router(auth_router, prefix="/auth", tags=["Auth"])