import datetime
import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey # type: ignore
from sqlalchemy.dialects.postgresql import UUID # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from .base_entities import Base

class Message(Base):
    __tablename__ = "messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chats.id"))
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id"))
    parent_message_id = Column(UUID(as_uuid=True), nullable=True)
    role = Column(String, nullable=False)  # 'human', 'ai', 'system'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    branch = relationship("Branch", back_populates="messages")
