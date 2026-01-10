from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace # type: ignore
from app.core.config import API_KEYS, BASE_URLS
from chatbot.models.base_model import BaseChatModel


class LlamaModel(BaseChatModel):
    def __init__(self):
        self.llm = HuggingFaceEndpoint(
            repo_id=BASE_URLS['huggingface'],
            huggingfacehub_api_token=API_KEYS["huggingface"],
            streaming=True,
        )
        self.model = ChatHuggingFace(llm=self.llm)

    def get_response(self, messages):
        return self.model.invoke(messages)

    async def stream_response(self, messages):
        """Async generator for FastAPI streaming"""
        async for chunk in self.model.astream(messages): 
            if chunk.content:
                yield chunk.content