from esperanto import LanguageModel
from langchain_core.language_models.chat_models import BaseChatModel
from loguru import logger

from ..domain.models import model_manager
from ..utils import token_count


def provision_langchain_model(
    content, model_id, default_type, **kwargs
) -> BaseChatModel:
    """
    Returns the best model to use based on the context size and on whether there is a specific model being requested in Config.
    If context > 105_000, returns the large_context_model
    If model_id is specified in Config, returns that model
    Otherwise, returns the default model for the given type
    """
    tokens = token_count(content)

    if tokens > 105_000:
        logger.debug(
            f"Using large context model because the content has {tokens} tokens"
        )
        model = model_manager.get_default_model("large_context", **kwargs)
    elif model_id:
        model = model_manager.get_model(model_id, **kwargs)
    else:
        model = model_manager.get_default_model(default_type, **kwargs)

    # If no model is configured, try to get any available language model as fallback
    if model is None:
        logger.warning(f"No default {default_type} model configured, trying to find any available language model")
        try:
            from ..domain.models import Model
            from esperanto import AIFactory
            
            # Get all language models from the database
            available_models = Model.get_models_by_type("language")
            if available_models:
                # Define the preferred model selection order
                preferred_providers = ["openai", "anthropic", "groq", "mistral", "deepseek"]
                fallback_model = None
                
                # First, try to find a model from preferred providers
                for provider in preferred_providers:
                    for model in available_models:
                        if model.provider == provider:
                            fallback_model = model
                            break
                    if fallback_model:
                        break
                
                # If no preferred model found, use the first available model with a supported provider
                if not fallback_model:
                    supported_providers = ["openai", "anthropic", "google", "groq", "ollama", 
                                         "openrouter", "xai", "perplexity", "azure", "mistral", 
                                         "deepseek", "vertex", "thealpha"]
                    for model in available_models:
                        if model.provider in supported_providers:
                            fallback_model = model
                            break
                
                if not fallback_model:
                    logger.warning("No supported models found in database")
                    return None
                
                logger.info(f"Using fallback model: {fallback_model.name} ({fallback_model.provider})")
                
                # Handle fallback model based on its type
                try:
                    if fallback_model.type == "language":
                        model = AIFactory.create_language(
                            model_name=fallback_model.name,
                            provider=fallback_model.provider,
                            config=kwargs,
                        )
                    elif fallback_model.type == "embedding":
                        model = AIFactory.create_embedding(
                            model_name=fallback_model.name,
                            provider=fallback_model.provider,
                            config=kwargs,
                        )
                    elif fallback_model.type == "text_to_speech":
                        model = AIFactory.create_text_to_speech(
                            model_name=fallback_model.name,
                            provider=fallback_model.provider,
                            config=kwargs,
                        )
                    elif fallback_model.type == "speech_to_text":
                        model = AIFactory.create_speech_to_text(
                            model_name=fallback_model.name,
                            provider=fallback_model.provider,
                            config=kwargs,
                        )
                    else:
                        logger.warning(f"Unsupported model type: {fallback_model.type}")
                        return None
                except Exception as e:
                    logger.error(f"Failed to initialize model {fallback_model.name} ({fallback_model.provider}): {str(e)}")
                    return None
            else:
                logger.warning("No language models found in database")
                return None
        except Exception as e:
            logger.error(f"Error in fallback model selection: {str(e)}")
            return None

    logger.debug(f"Using model: {model}")
    assert isinstance(model, LanguageModel), f"Model is not a LanguageModel: {model}"
    return model.to_langchain()
