from fastapi import BackgroundTasks # type: ignore
from app.services.chat_service import ChatService
from app.models.model_factory import ModelFactory
from app.core.config import SYSTEM_PROMPT
from app.schema.chat_schema import ChatRequest
from app.graphs.chat_graph import prompt_refiner_graph
from app.tasks.title_task import generate_chat_title_task

async def chat_stream(
    request: ChatRequest, 
    user_id: str, 
    background_tasks: BackgroundTasks, 
    chat_id: str = None
):
    # 1. Init Chat
    is_new_chat = chat_id is None
    chat = await ChatService.get_or_create_chat(user_id, chat_id)
    chat_id = chat["_id"]
    branch_id = chat["active_branch_id"]

    user_content = request.messages[-1].content

    # 2. Refine Prompt (Async LangGraph)
    graph_state = await prompt_refiner_graph.ainvoke({"original_input": user_content})
    refined_content = graph_state["refined_prompt"]

    # 3. Save User Message
    await ChatService.add_message(chat_id, branch_id, "user", user_content)

    # 4. Trigger Title (Background Task)
    if is_new_chat:
        background_tasks.add_task(generate_chat_title_task, chat_id, refined_content)

    # 5. Build Context (History + Refined Prompt)
    history_docs = await ChatService.get_branch_messages(branch_id, last_n=10)
    
    messages_payload = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # --- FIX STARTS HERE ---
    # Convert DB roles to LangChain compatible roles
    for doc in history_docs[:-1]: 
        role = doc["role"]
        
        # Map "bot" -> "assistant"
        if role == "bot":
            role = "assistant"
        
        messages_payload.append({"role": role, "content": doc["content"]})
    # --- FIX ENDS HERE ---

    # Add the REFINED prompt as the current user message
    messages_payload.append({"role": "user", "content": refined_content})

    # 6. Stream Response
    chat_model = ModelFactory.get("llama")
    bot_chunks = []
    
    async for chunk in chat_model.stream_response(messages_payload):
        if chunk:  
            bot_chunks.append(chunk)
            yield chunk 

    # 7. Save Bot Response
    full_bot_message = "".join(bot_chunks)
    if full_bot_message.strip():
        # Ideally, start saving as "assistant" instead of "bot" for future compatibility
        await ChatService.add_message(chat_id, branch_id, "bot", full_bot_message)