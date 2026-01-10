from abc import ABC, abstractmethod
from typing import List, Dict, AsyncGenerator, Any

class BaseChatModel(ABC):
    """Contract for all chat-based LLM implementations."""

    @abstractmethod
    def get_response(self, messages: List[Dict[str, str]]) -> Any:
        """Return the complete model response for the given chat messages."""
        pass

    @abstractmethod
    async def stream_response(self, messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        """Yield response chunks asynchronously as the model generates them."""
        pass