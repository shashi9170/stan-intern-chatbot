from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks # type: ignore
from fastapi.responses import StreamingResponse # type: ignore
from app.api.dependencies import get_current_user
from app.schema.chat_schema import ChatRequest
from app.controller.chat_controller import chat_stream
from app.services.chat_service import ChatService

chat_router = APIRouter()

@chat_router.get("/all")
async def get_user_chats(user_id: str = Depends(get_current_user)):
    """
    Fetch all chat history (IDs and Titles) for the current user.
    """
    
    chats = await ChatService.get_user_chats(user_id)
    return {"status": "success", "data": chats}


@chat_router.get("/latest")
async def get_latest_chat(user_id: str = Depends(get_current_user)):
    """
    Load the single most recent chat session.
    """
    chat_data = await ChatService.get_latest_chat_with_messages(user_id)
    
    if not chat_data:
        return {"status": "empty", "message": "No chats found"}
        
    return {"status": "success", "data": chat_data}


@chat_router.get("/{chat_id}")
async def get_specific_chat(
    chat_id: str, 
    user_id: str = Depends(get_current_user)
):
    """
    Load a specific chat session by ID.
    """
    chat_data = await ChatService.get_chat_by_id(chat_id, user_id)
    
    if not chat_data:
        raise HTTPException(status_code=404, detail="Chat not found or access denied")
        
    return {"status": "success", "data": chat_data}


@chat_router.post("/stream")
async def stream_chat(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    chat_id: str = Query(None, description="Optional chat ID to resume"),
    user_id: str = Depends(get_current_user)
):
    print(request)
    return StreamingResponse(
        chat_stream(request, user_id, background_tasks, chat_id=chat_id),
        media_type="text/plain"
    )