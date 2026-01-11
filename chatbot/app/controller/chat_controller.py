import re
from fastapi import BackgroundTasks
from app.services.chat_service import ChatService
from app.models.model_factory import ModelFactory
from app.core.identity import IDENTITY_PROMPT
from app.core.config import SYSTEM_PROMPT
from app.schema.chat_schema import ChatRequest
from app.graphs.chat_graph import prompt_refiner_graph
from app.tasks.title_task import generate_chat_title_task
from app.vectorstore.memory_store import (
    upsert_memory,
    query_memories,
    query_fact,
)
from app.services.memory_extractor import extract_memory_with_llm


async def chat_stream(
    request: ChatRequest,
    user_id: str,
    background_tasks: BackgroundTasks,
    chat_id: str | None = None,
):
    # -------------------------------------------------
    # 1. CHAT SETUP
    # -------------------------------------------------
    is_new_chat = chat_id is None
    chat = await ChatService.get_or_create_chat(user_id, chat_id)
    chat_id = chat["_id"]
    branch_id = chat["active_branch_id"]

    user_content = request.messages[-1].content.strip()

    # -------------------------------------------------
    # 2. SHORT-TERM HISTORY
    # -------------------------------------------------
    history_docs = await ChatService.get_branch_messages(branch_id, last_n=20)

    history_context = [
        f"{'User' if d['role']=='user' else 'Assistant'}: {d['content']}"
        for d in history_docs
    ]

    # -------------------------------------------------
    # 3. PROMPT REFINEMENT
    # -------------------------------------------------
    graph_state = await prompt_refiner_graph.ainvoke({
        "original_input": user_content,
        "chat_history": history_context,
    })
    refined_content = graph_state["refined_prompt"]

    # -------------------------------------------------
    # 4. SAVE USER MESSAGE
    # -------------------------------------------------
    await ChatService.add_message(chat_id, branch_id, "user", user_content)

    if is_new_chat:
        background_tasks.add_task(
            generate_chat_title_task,
            chat_id,
            refined_content,
        )

    # -------------------------------------------------
    # 5. NAME EXTRACTION (DETERMINISTIC)
    # -------------------------------------------------
    extracted_name = None
    name_pattern = r"(?:my\s+name\s+is|i\s+am|i'm|call\s+me)\s+(?!happy|sad|here|tired)([a-zA-Z\s]+)"
    name_match = re.search(name_pattern, user_content, re.IGNORECASE)

    if name_match:
        extracted_name = name_match.group(1).strip().title()
        await upsert_memory(
            user_id,
            f"User's name is {extracted_name}",
            type="name",
        )

    # -------------------------------------------------
    # 6. JOB EXTRACTION
    # -------------------------------------------------
    job_pattern = r"i\s+(teach|work\s+as|am\s+a)\s+([a-zA-Z\s]+)"
    job_match = re.search(job_pattern, user_content, re.IGNORECASE)

    if job_match:
        await upsert_memory(
            user_id,
            f"User {job_match.group(1)} {job_match.group(2)}",
            type="job",
        )

    # -------------------------------------------------
    # 7. OTHER FACTS (LLM)
    # -------------------------------------------------
    fact_memory = await extract_memory_with_llm(user_content)
    if fact_memory:
        await upsert_memory(user_id, fact_memory, type="fact")

    # -------------------------------------------------
    # 8. GUARANTEED FACT FETCH (NO SIMILARITY)
    # -------------------------------------------------
    known_user_name = await query_fact(user_id, "name")
    known_job = await query_fact(user_id, "job")

    # -------------------------------------------------
    # 9. VECTOR MEMORY (OPTIONAL CONTEXT)
    # -------------------------------------------------
    memories = await query_memories(
        user_id,
        refined_content + " name job teach work",
    )

    if known_user_name:
        memories.append(known_user_name)
    if known_job:
        memories.append(known_job)

    unique_memories = list(set(memories))

    memory_block = ""
    if unique_memories:
        memory_block = (
            "### KNOWN FACTS ABOUT USER:\n"
            + "\n".join(f"- {m}" for m in unique_memories)
        )

    # -------------------------------------------------
    # 10. INTENT DETECTION
    # -------------------------------------------------
    ask_name = re.search(
        r"(what\s+is|tell\s+me)\s+my\s+name|who\s+am\s+i",
        user_content,
        re.IGNORECASE,
    )

    ask_job = re.search(
        r"(what.*teach|which.*subject|what.*do\s+i\s+do)",
        user_content,
        re.IGNORECASE,
    )

    # -------------------------------------------------
    # 11. SPECIAL INSTRUCTION (HARD RULES)
    # -------------------------------------------------
    special_instruction = ""

    if extracted_name:
        special_instruction = f"""
SYSTEM (NON-NEGOTIABLE):
Reply EXACTLY:
"Nice to meet you, {extracted_name}!"
"""

    elif ask_name:
        if known_user_name:
            clean = known_user_name.replace("User's name is ", "")
            special_instruction = f"""
SYSTEM (NON-NEGOTIABLE):
Reply EXACTLY:
"Your name is {clean}."
"""
        else:
            special_instruction = """
SYSTEM (NON-NEGOTIABLE):
Reply EXACTLY:
"I don't think you've told me your name yet. What should I call you?"
"""

    elif ask_job:
        if known_job:
            special_instruction = f"""
SYSTEM (NON-NEGOTIABLE):
Reply EXACTLY:
"{known_job}"
"""
        else:
            special_instruction = """
SYSTEM:
Ask politely about user's job.
"""

    else:
        special_instruction = """
SYSTEM:
Engage naturally. Use known facts when helpful.
"""

    # -------------------------------------------------
    # 12. BUILD PAYLOAD (🔥 FIXED 🔥)
    # -------------------------------------------------
    messages_payload = []

    # 🚨 HARD OVERRIDE → NO HISTORY, NO MEMORY
    if extracted_name or ask_name or ask_job:
        messages_payload = [
            {
                "role": "system",
                "content": special_instruction.strip(),
            }
        ]
    else:
        messages_payload = [
            {
                "role": "system",
                "content": f"""
{IDENTITY_PROMPT}
{SYSTEM_PROMPT}
{memory_block}
{special_instruction}
"""
            }
        ]

        for doc in history_docs:
            role = "assistant" if doc["role"] == "bot" else doc["role"]
            messages_payload.append(
                {"role": role, "content": doc["content"]}
            )

        messages_payload.append(
            {"role": "user", "content": refined_content}
        )

    # -------------------------------------------------
    # 13. STREAM RESPONSE
    # -------------------------------------------------
    model = ModelFactory.get("llama")
    bot_chunks: list[str] = []

    async for chunk in model.stream_response(messages_payload):
        if chunk:
            bot_chunks.append(chunk)
            yield chunk

    full_response = "".join(bot_chunks).strip()

    if full_response:
        await ChatService.add_message(chat_id, branch_id, "bot", full_response)
        await upsert_memory(
            user_id,
            f"User: {refined_content}\nBot: {full_response}",
            type="conversation",
        )
