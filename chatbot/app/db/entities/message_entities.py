from datetime import datetime
from uuid import uuid4

def message_document(chat_id: str, branch_id: str, role: str, content: str, parent_message_id: str = None) -> dict:
    """
    Create a new message document.
    """
    return {
        "_id": str(uuid4()),
        "chat_id": chat_id,
        "branch_id": branch_id,
        "parent_message_id": parent_message_id,
        "role": role,  # "human" or "bot"
        "content": content,
        "created_at": datetime.utcnow()
    }