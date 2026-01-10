from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker # type: ignore
from app.core.config import ASYNC_DATABASE_URL

# Create async engine
engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_pre_ping=True,
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  
)
