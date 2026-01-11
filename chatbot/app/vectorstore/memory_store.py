# app/vectorstore/memory_store.py

import uuid
import asyncio
import logging
from typing import List
from app.vectorstore.pinecone_client import index
from app.vectorstore.embeddings import embed

logger = logging.getLogger(__name__)


# ---------- UPSERT ----------
async def upsert_memory(
    user_id: str,
    text: str,
    type: str = "long_term_memory",
) -> None:
    try:
        vector = await asyncio.to_thread(embed, text)

        await asyncio.to_thread(
            index.upsert,
            vectors=[
                {
                    "id": str(uuid.uuid4()),
                    "values": vector.tolist(),
                    "metadata": {
                        "user_id": user_id,
                        "text": text,
                        "type": type,  # 👈 VERY IMPORTANT
                    },
                }
            ],
        )
    except Exception as e:
        logger.error(f"Failed to upsert memory: {e}")


# ---------- QUERY GENERIC ----------
async def query_memories(
    user_id: str,
    query: str,
    top_k: int = 10,
) -> List[str]:
    try:
        vector = await asyncio.to_thread(embed, query)

        response = await asyncio.to_thread(
            index.query,
            vector=vector.tolist(),
            top_k=top_k,
            include_metadata=True,
            filter={"user_id": user_id},
        )

        return [m["metadata"]["text"] for m in response["matches"]]
    except Exception as e:
        logger.error(f"Failed to query memories: {e}")
        return []


# ---------- QUERY FACT BY TYPE (NEW) ----------
async def query_fact(
    user_id: str,
    fact_type: str,
) -> str | None:
    """
    Guaranteed retrieval for name/job/etc
    """
    try:
        response = await asyncio.to_thread(
            index.query,
            vector=[0.0] * 384,  # dummy vector
            top_k=1,
            include_metadata=True,
            filter={
                "user_id": user_id,
                "type": fact_type,
            },
        )

        if response["matches"]:
            return response["matches"][0]["metadata"]["text"]

        return None
    except Exception as e:
        logger.error(f"Failed to query fact {fact_type}: {e}")
        return None
