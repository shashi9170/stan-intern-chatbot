from datetime import datetime
from uuid import uuid4

def branch_document(chat_id: str, summary: str = None) -> dict:
    """
    Create a new branch document for a chat.
    """
    return {
        "_id": str(uuid4()),
        "chat_id": chat_id,
        "summary": summary,
        "created_at": datetime.utcnow()
    }
