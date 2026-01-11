# app/services/memory_extractor.py

from app.models.model_factory import ModelFactory


async def extract_memory_with_llm(text: str) -> str | None:
    triggers = [
        "i like", "i love", "my", "i am", "i live",
        "i prefer", "i teach", "i work", "i hate"
    ]

    if not any(t in text.lower() for t in triggers):
        return None

    model = ModelFactory.get("llama")

    prompt = [
        {
            "role": "system",
            "content": (
                "Extract ONLY a permanent personal fact.\n"
                "Examples:\n"
                "- User teaches math\n"
                "- User likes coffee\n"
                "- User lives in India\n\n"
                "If no fact exists, return NONE."
            ),
        },
        {"role": "user", "content": text},
    ]

    response = await model.get_response(prompt)
    content = response.content.strip()

    if content.upper() == "NONE":
        return None

    return content
