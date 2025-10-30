from typing import Optional, Any, Dict
from loguru import logger

class ModelManager:
    """Manages AI models for the application."""
    
    def __init__(self):
        self._embedding_model = None
        self._llm_model = None
        self._config = {}
    
    @property
    def embedding_model(self):
        """Get the current embedding model."""
        return self._embedding_model
    
    @property
    def llm_model(self):
        """Get the current language model."""
        return self._llm_model
    
    def set_embedding_model(self, model):
        """Set the embedding model."""
        self._embedding_model = model
        logger.info(f"Embedding model set to: {model.__class__.__name__}")
    
    def set_llm_model(self, model):
        """Set the language model."""
        self._llm_model = model
        logger.info(f"LLM model set to: {model.__class__.__name__}")
    
    def get_config(self) -> Dict[str, Any]:
        """Get the current model configuration."""
        return self._config.copy()

# Create a singleton instance
model_manager = ModelManager()
