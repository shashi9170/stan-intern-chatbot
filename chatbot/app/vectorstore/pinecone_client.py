# app/vectorstore/pinecone_client.py

from pinecone import Pinecone, ServerlessSpec  # type: ignore
from app.core.config import (
    PINECONE_API_KEY,
    PINECONE_INDEX,
    PINECONE_REGION,
    DIMENSION,
)

# Initialize Pinecone client
pc = Pinecone(api_key=PINECONE_API_KEY)

# Create index if it doesn't exist
if PINECONE_INDEX not in pc.list_indexes().names():
    pc.create_index(
        name=PINECONE_INDEX,
        dimension=DIMENSION,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region=PINECONE_REGION,
        ),
    )

# Export index instance
index = pc.Index(PINECONE_INDEX)
