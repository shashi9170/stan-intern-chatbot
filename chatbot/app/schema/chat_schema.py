from pydantic import BaseModel # type: ignore
from typing import List, Optional, Literal
from datetime import datetime

class ChatMessage(BaseModel):
    role: Literal["human", "bot"]
    content: str
    parent_message_id: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
