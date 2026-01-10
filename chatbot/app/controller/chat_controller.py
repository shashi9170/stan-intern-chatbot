from app.schema.chat_schema import ChatRequest
from app.models.base_model import ModelFactory
from app.core.config import SYSTEM_PROMPT

async def chat_stream(request: ChatRequest, model: str = "llama"):
    """
    Async generator that yields response chunks from the requested model.
    """
    chat_model = ModelFactory.get(model)

    chat_messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *[{"role": m.role, "content": m.content} for m in request.messages]
    ]

    async for chunk in chat_model.stream_response(chat_messages):
        yield chunk
