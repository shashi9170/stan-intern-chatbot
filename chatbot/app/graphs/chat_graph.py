from typing import TypedDict
from langgraph.graph import StateGraph, END # type: ignore
from app.models.model_factory import ModelFactory

class GraphState(TypedDict):
    original_input: str
    refined_prompt: str

async def refine_prompt_node(state: GraphState):
    model = ModelFactory.get("llama")
    
    system_prompt = (
        "You are an expert Prompt Engineer. "
        "Refine the user's input to be clear and precise. "
        "Return ONLY the refined prompt text."
    )
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": state["original_input"]}
    ]
    
    # Await the async response
    response = await model.get_response(messages)
    return {"refined_prompt": response.content}

# Build Graph
workflow = StateGraph(GraphState)
workflow.add_node("refine_prompt", refine_prompt_node)
workflow.set_entry_point("refine_prompt")
workflow.add_edge("refine_prompt", END)

prompt_refiner_graph = workflow.compile()