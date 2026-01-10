from typing import Dict, Type
from chatbot.models.base_model import BaseChatModel
from chatbot.models.llama_model import LlamaModel

class ModelFactory:
    """
    Factory to return chat model instances dynamically.
    Supports singleton instances for heavy models.
    """

    # Registry mapping model name
    _registry: Dict[str, Type[BaseChatModel]] = {
        "llama": LlamaModel,
    }

    # Singleton cache for already created instances
    _instances: Dict[str, BaseChatModel] = {}

    @classmethod
    def get(cls, model_name: str, singleton: bool = True) -> BaseChatModel:
        """
        Returns a concrete chat model instance for the given name.
        
        Args:
            model_name: Name of the chat model.
            singleton: If True, return the same instance for each call.
        """
        key = model_name.lower()

        if key not in cls._registry:
            raise ValueError(
                f"Unsupported chat model '{model_name}'. "
                f"Available models: {list(cls._registry.keys())}"
            )

        if singleton:
            # Return existing instance if it exists
            if key not in cls._instances:
                cls._instances[key] = cls._registry[key]() 
                
            return cls._instances[key]
        else:
            # Always create a new instance
            return cls._registry[key]()
