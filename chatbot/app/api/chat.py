from fastapi import APIRouter  # type: ignore
from fastapi.responses import StreamingResponse  # type: ignore
from app.schema.chat_schema import ChatRequest
from app.controller.chat_controller import chat_stream

router = APIRouter()

@router.post('/stream')
async def chat(request: ChatRequest):
    return StreamingResponse(chat_stream(request), media_type="text/plain")