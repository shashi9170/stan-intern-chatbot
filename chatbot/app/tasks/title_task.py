from app.services.chat_service import ChatService
from app.models.model_factory import ModelFactory

async def generate_chat_title_task(chat_id: str, content_to_summarize: str):
    """
    Background Task: Generates a short title.
    """
    try:
        model = ModelFactory.get("llama")
        
        prompt = [
            {"role": "system", "content": "Generate a very short, concise title (max 3 words) for this chat based on the message. Do not use quotes."},
            {"role": "user", "content": content_to_summarize}
        ]
        
        # Now this awaits the async get_response we fixed in Step 1
        response = await model.get_response(prompt)
        title = response.content.strip().replace('"', '')
        
        await ChatService.update_chat_title(chat_id, title)
        print(f"Title generated for {chat_id}: {title}")
        
    except Exception as e:
        print(f"Error generating title: {e}")