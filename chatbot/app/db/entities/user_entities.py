from uuid import uuid4
from datetime import datetime

def user_document(username: str, email: str, hashed_password: str):
    return {
        "_id": str(uuid4()),
        "username": username,
        "email": email,
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": datetime.utcnow(),
    }
