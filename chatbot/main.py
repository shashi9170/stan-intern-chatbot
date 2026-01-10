from fastapi import FastAPI  # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore

from app.api.routes import router
from app.core.config import ORIGINS


# Create FastAPI app instance
app = FastAPI(
    title="Multi-Model LangGraph Chatbot API",
    description="Chatbot API supporting multiple LLM providers like DeepSeek, OpenAI, Gemini.",
    version="1.0.0"
)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routes
app.include_router(router, prefix="/api")



@app.get("/")
async def root():
    return {"message": "Multi-Model LangGraph Chatbot API is running!"}