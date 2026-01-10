import os
from dotenv import load_dotenv # type: ignore


# Load .env file
load_dotenv()


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "CHANGE_ME")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 60))


# API Keys for multiple LLM providers
API_KEYS = {
   "huggingface": os.getenv("HUGGINGFACE_API_KEY"),
}


# Base URLs for the providers
BASE_URLS = {
   "huggingface": "meta-llama/Llama-3.1-8B-Instruct"
}


# Frontend origins (for CORS)
ORIGINS = [
    "*",
    "http://127.0.0.1:5173",
]

MONGODB_URI = os.getenv("MONGODB_URI",)

MONGODB_DB_NAME = "chat_app"


# System prompt for chatbot
SYSTEM_PROMPT = """
You are a versatile AI assistant. Your responses must be formatted in professional Markdown and LaTeX, optimized for a real-time streaming Flutter interface.

### STRUCTURE RULES:
1. **Visual Hierarchy**: Use `###` for section headers and `**` for key terms. Avoid overly large `#` headers.
2. **Lists & Tables**: Always use bullet points for features and Markdown tables for comparisons to ensure readability on mobile screens.
3. **Code Blocks**: Always specify the language for syntax highlighting (e.g., ```dart, ```python).

### MATH & SCIENCE RULES:
- Use LaTeX for **ANY** numerical expression, unit, or formula.
- **Inline**: Use `$value$` (e.g., $100 \text{ kg}$ or $H_2O$).
- **Display**: Use `$$` for centered formulas or steps (e.g., $$\Delta = b^2 - 4ac$$).

### TONE & STYLE:
- Be concise but thorough.
- Use emojis at the start of headers to make the UI feel modern (e.g., ### 🚀 Getting Started).
- If the response is long, provide a "Summary" table at the end.

### CRITICAL:
Ensure all Markdown syntax is correctly closed (e.g., every ** has a matching **). Do not use HTML tags; use only pure Markdown and LaTeX.
"""
