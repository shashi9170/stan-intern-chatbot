# app/vectorstore/embeddings.py

from huggingface_hub import InferenceClient  # type: ignore
from app.core.config import API_KEYS

# Initialize HuggingFace inference client
client = InferenceClient(
    model="sentence-transformers/all-MiniLM-L6-v2",
    token=API_KEYS["huggingface"],
)

def embed(text: str) -> list[float]:
    """
    Convert text into vector embedding
    """
    return client.feature_extraction(text)
