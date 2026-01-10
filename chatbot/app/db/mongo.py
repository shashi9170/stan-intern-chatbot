from motor.motor_asyncio import AsyncIOMotorClient # type: ignore
from app.core.config import MONGODB_URI, MONGODB_DB_NAME

client = AsyncIOMotorClient(MONGODB_URI)
db = client[MONGODB_DB_NAME]

# Collections
users_collection = db.users
chats_collection = db.chats
branches_collection = db.branches
messages_collection = db.messages
