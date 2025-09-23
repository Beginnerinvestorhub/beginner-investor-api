"""
AI module for the Python Engine service.

This module contains the AI model interface and implementations for various AI tasks.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Union

class AIModel(ABC):
    """Abstract base class for AI models."""
    
    @abstractmethod
    async def predict(self, input_data: Any, **kwargs) -> Any:
        """Make a prediction using the model.
        
        Args:
            input_data: The input data for the prediction
            **kwargs: Additional model-specific parameters
            
        Returns:
            The model's prediction
        """
        pass
    
    @abstractmethod
    async def get_embeddings(self, texts: List[str], **kwargs) -> List[List[float]]:
        """Get embeddings for a list of texts.
        
        Args:
            texts: List of input texts
            **kwargs: Additional model-specific parameters
            
        Returns:
            List of embeddings, one for each input text
        """
        pass
    
    @abstractmethod
    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate text based on a prompt.
        
        Args:
            prompt: The input prompt
            **kwargs: Additional generation parameters
            
        Returns:
            Generated text
        """
        pass

class TransformersModel(AIModel):
    """Implementation of AIModel using Hugging Face Transformers."""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """Initialize the Transformers model.
        
        Args:
            model_name: Name or path of the pre-trained model
        """
        from transformers import AutoModel, AutoTokenizer, pipeline
        import torch
        
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name).to(self.device)
        self.generator = pipeline("text-generation", model=model_name, device=0 if self.device == "cuda" else -1)
    
    async def predict(self, input_data: Union[str, Dict[str, Any]], **kwargs) -> Dict[str, Any]:
        """Make a prediction using the model."""
        if isinstance(input_data, str):
            # For text classification or other tasks
            result = self.generator(input_data, **kwargs)
            return {"result": result}
        else:
            # For other types of input
            raise NotImplementedError("Custom input types not implemented yet")
    
    async def get_embeddings(self, texts: List[str], **kwargs) -> List[List[float]]:
        """Get embeddings for a list of texts."""
        import torch
        
        # Tokenize the input texts
        encoded_input = self.tokenizer(
            texts, 
            padding=True, 
            truncation=True, 
            return_tensors="pt",
            max_length=512
        ).to(self.device)
        
        # Get the model output
        with torch.no_grad():
            model_output = self.model(**encoded_input)
        
        # Extract the embeddings (use mean of last hidden states)
        embeddings = model_output.last_hidden_state.mean(dim=1).cpu().numpy().tolist()
        
        return embeddings
    
    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate text based on a prompt."""
        # Set default generation parameters if not provided
        generation_kwargs = {
            "max_length": 100,
            "num_return_sequences": 1,
            "temperature": 0.7,
            "top_p": 0.9,
            "do_sample": True,
            **kwargs
        }
        
        # Generate text
        generated = self.generator(prompt, **generation_kwargs)
        return generated[0]["generated_text"]

# Factory function to create the appropriate AI model
def create_ai_model(model_type: str = "transformers", **kwargs) -> AIModel:
    """Create an instance of the specified AI model.
    
    Args:
        model_type: Type of model to create (default: "transformers")
        **kwargs: Additional arguments to pass to the model constructor
        
    Returns:
        An instance of the specified AI model
        
    Raises:
        ValueError: If the specified model type is not supported
    """
    if model_type == "transformers":
        return TransformersModel(**kwargs)
    else:
        raise ValueError(f"Unsupported model type: {model_type}")

# Global model instance
_model = None

def get_model() -> AIModel:
    """Get the global AI model instance, creating it if necessary."""
    global _model
    if _model is None:
        _model = create_ai_model()
    return _model
