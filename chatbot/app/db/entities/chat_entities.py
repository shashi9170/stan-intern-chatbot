from uuid import uuid4
from datetime import datetime

def chat_document(user_id: str, title: str = "New Chat") -> dict:
    """
    Create a new chat document with default title and timestamp.
    """
    return {
        "_id": str(uuid4()),
        "user_id": user_id,
        "title": title,
        "active_branch_id": None,  # will be set after branch creation
        "created_at": datetime.utcnow()
    }
