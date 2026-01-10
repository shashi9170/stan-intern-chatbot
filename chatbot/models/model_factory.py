from typing import Dict
from chatbot.models.base_model import BaseChatModel
from chatbot.models.llama_model import LlamaModel

class ModelFactory:
    """Factory returning singleton chat model instances."""

    # Store instances
    _registry: Dict[str, BaseChatModel] = {
        "llama": LlamaModel(),
    }

    @classmethod
    def get(cls, model_name: str) -> BaseChatModel:
        model_instance = cls._registry.get(model_name.lower())
        
        if not model_instance:
            raise ValueError(
                f"Unsupported chat model '{model_name}'. "
                f"Available models: {list(cls._registry.keys())}"
            )

        return model_instance  
