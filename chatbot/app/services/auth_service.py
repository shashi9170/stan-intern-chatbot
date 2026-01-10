from app.db.mongo import users_collection
from app.db.entities.user_entities import user_document
from app.core.security import hash_password, verify_password, create_access_token

class AuthService:

    @staticmethod
    async def register(username: str, email: str, password: str):
        existing = await users_collection.find_one({
            "$or": [{"username": username}, {"email": email}]
        })
        if existing:
            raise ValueError("User already exists")

        hashed = hash_password(password)
        user = user_document(username, email, hashed)
        await users_collection.insert_one(user)

        token = create_access_token(user["_id"])
        return token

    @staticmethod
    async def login(username: str, password: str):
        user = await users_collection.find_one({"username": username})
        if not user:
            raise ValueError("Invalid credentials")

        if not verify_password(password, user["hashed_password"]):
            raise ValueError("Invalid credentials")

        token = create_access_token(user["_id"])
        return token
