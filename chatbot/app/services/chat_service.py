from typing import List, Optional
from app.db.mongo import chats_collection, branches_collection, messages_collection
from app.db.entities.chat_entities import chat_document
from app.db.entities.branch_entities import branch_document
from app.db.entities.message_entities import message_document

class ChatService:
    @staticmethod
    async def get_or_create_chat(user_id: str, chat_id: Optional[str] = None) -> dict:
        if chat_id:
            chat = await chats_collection.find_one({"_id": chat_id, "user_id": user_id})
            if not chat:
                raise ValueError("Chat not found")
            return chat
        else:
            new_chat = chat_document(user_id)
            new_branch = branch_document(new_chat["_id"])
            new_chat["active_branch_id"] = new_branch["_id"]

            await chats_collection.insert_one(new_chat)
            await branches_collection.insert_one(new_branch)
            return new_chat

    @staticmethod
    async def add_message(chat_id: str, branch_id: str, role: str, content: str) -> dict:
        msg = message_document(chat_id, branch_id, role, content)
        await messages_collection.insert_one(msg)
        return msg

    @staticmethod
    async def get_branch_messages(branch_id: str, last_n: int = 10) -> List[dict]:
        """Fetch the last N messages for context."""
        cursor = messages_collection.find({"branch_id": branch_id}).sort("created_at", 1)
        all_msgs = await cursor.to_list(length=None)
        return all_msgs[-last_n:]

    @staticmethod
    async def update_chat_title(chat_id: str, title: str):
        """Update title in DB."""
        await chats_collection.update_one(
            {"_id": chat_id},
            {"$set": {"title": title}}
        )
        
    @staticmethod
    async def get_user_chats(user_id: str) -> list:
        """
        Fetch all chat sessions for a user, sorted by newest first.
        Returns a list of dicts with id, title, and timestamp.
        """
        cursor = chats_collection.find(
            {"user_id": user_id},
            {"_id": 1, "title": 1, "created_at": 1} # Projection: Select only specific fields
        ).sort("created_at", -1) # Sort by Newest first
        
        chats = await cursor.to_list(length=None)
        return chats
    
    
    @staticmethod
    async def get_latest_chat_with_messages(user_id: str) -> dict:
        """
        Finds the user's most recent chat and returns its details + messages.
        Returns None if the user has no chats.
        """
        # 1. Find the most recent chat document
        # Sort by 'created_at' descending (-1) and limit to 1
        cursor = chats_collection.find({"user_id": user_id}).sort("created_at", -1).limit(1)
        latest_chats = await cursor.to_list(length=1)

        if not latest_chats:
            return None

        chat = latest_chats[0]
        branch_id = chat["active_branch_id"]

        # 2. Fetch messages for this chat
        msg_cursor = messages_collection.find(
            {"branch_id": branch_id},
            {"role": 1, "content": 1, "created_at": 1, "_id": 0}
        ).sort("created_at", 1)
        
        messages = await msg_cursor.to_list(length=None)

        # 3. Role mapping (bot -> assistant)
        for msg in messages:
            if msg["role"] == "bot":
                msg["role"] = "assistant"

        return {
            "chat_id": str(chat["_id"]),
            "title": chat.get("title", "New Chat"),
            "messages": messages
        }