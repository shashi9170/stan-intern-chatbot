from typing import TypedDict, List
from langgraph.graph import StateGraph, END # type: ignore
from app.models.model_factory import ModelFactory

class GraphState(TypedDict):
    original_input: str
    chat_history: List[str]
    refined_prompt: str

async def refine_prompt_node(state: GraphState):
    model = ModelFactory.get("llama")
    
    # Format history for the prompt
    history_text = "\n".join(state["chat_history"])
    
    system_prompt = (
        "You are a Context Refiner. Your job is to rewrite the 'Latest User Input' "
        "into a standalone question based on the 'Chat History'.\n"
        "If the input relies on context (e.g. 'What is it?', 'Tell me more'), "
        "replace pronouns with specific entities from history.\n"
        "If the input is already clear, return it unchanged.\n"
        "Return ONLY the refined text."
    )
    
    user_message = f"""
    --- Chat History ---
    {history_text}
    
    --- Latest User Input ---
    {state["original_input"]}
    """
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]
    
    response = await model.get_response(messages)
    return {"refined_prompt": response.content}

# Build Graph
workflow = StateGraph(GraphState)
workflow.add_node("refine_prompt", refine_prompt_node)
workflow.set_entry_point("refine_prompt")
workflow.add_edge("refine_prompt", END)

prompt_refiner_graph = workflow.compile()