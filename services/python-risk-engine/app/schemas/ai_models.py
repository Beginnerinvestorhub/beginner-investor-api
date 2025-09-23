"""Pydantic models for AI model management and inference."""
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Literal, Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl, field_validator, validator

from app.schemas.common import BaseModelWithID, PaginationParams

class ModelProvider(str, Enum):
    """Supported AI model providers."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    COHERE = "cohere"
    HUGGINGFACE = "huggingface"
    CUSTOM = "custom"

class ModelTask(str, Enum):
    """Supported AI model tasks."""
    TEXT_GENERATION = "text_generation"
    TEXT_EMBEDDING = "text_embedding"
    TEXT_CLASSIFICATION = "text_classification"
    SENTIMENT_ANALYSIS = "sentiment_analysis"
    NAMED_ENTITY_RECOGNITION = "named_entity_recognition"
    QUESTION_ANSWERING = "question_answering"
    SUMMARIZATION = "summarization"
    TRANSLATION = "translation"
    CODE_GENERATION = "code_generation"
    CHAT = "chat"

class ModelStatus(str, Enum):
    """Status of an AI model."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"
    TRAINING = "training"
    ERROR = "error"

class ModelVersionStatus(str, Enum):
    """Status of a model version."""
    DRAFT = "draft"
    STAGING = "staging"
    PRODUCTION = "production"
    ARCHIVED = "archived"
    FAILED = "failed"

# Request Models
class AIModelCreate(BaseModel):
    """Request model for creating a new AI model."""
    name: str = Field(..., min_length=3, max_length=100, description="Unique name of the model")
    description: Optional[str] = Field(None, max_length=1000, description="Description of the model")
    provider: ModelProvider = Field(..., description="Provider of the model")
    task: ModelTask = Field(..., description="Task the model is designed for")
    status: ModelStatus = Field(ModelStatus.INACTIVE, description="Initial status of the model")
    is_public: bool = Field(False, description="Whether the model is publicly accessible")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "gpt-4",
                "description": "OpenAI's GPT-4 model",
                "provider": "openai",
                "task": "text_generation",
                "status": "active",
                "is_public": True,
                "metadata": {
                    "context_length": 8192,
                    "supports_function_calling": True
                }
            }
        }

class AIModelUpdate(BaseModel):
    """Request model for updating an AI model."""
    name: Optional[str] = Field(None, min_length=3, max_length=100, description="New name for the model")
    description: Optional[str] = Field(None, max_length=1000, description="Updated description")
    status: Optional[ModelStatus] = Field(None, description="New status")
    is_public: Optional[bool] = Field(None, description="Whether the model is publicly accessible")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Updated metadata")

class ModelVersionCreate(BaseModel):
    """Request model for creating a new model version."""
    version: str = Field(..., description="Version identifier (e.g., '1.0.0')")
    model_path: str = Field(..., description="Path to the model files")
    status: ModelVersionStatus = Field(ModelVersionStatus.DRAFT, description="Initial status")
    is_production: bool = Field(False, description="Whether this is a production version")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Version metadata")
    
    @validator('version')
    def validate_version_format(cls, v):
        """Validate semantic versioning format."""
        import re
        if not re.match(r'^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$', v):
            raise ValueError('Version must follow semantic versioning (e.g., 1.0.0)')
        return v

class InferenceRequest(BaseModel):
    """Request model for making inferences with an AI model."""
    input: Union[str, List[str], Dict[str, Any]] = Field(..., description="Input data for the model")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Inference parameters")
    stream: bool = Field(False, description="Whether to stream the response")
    
    @validator('input')
    def validate_input(cls, v):
        """Validate input data."""
        if not v:
            raise ValueError("Input cannot be empty")
        return v

# Response Models
class AIModelResponse(BaseModelWithID):
    """Response model for AI model details."""
    name: str
    description: Optional[str]
    provider: ModelProvider
    task: ModelTask
    status: ModelStatus
    is_public: bool
    metadata: Dict[str, Any]
    created_by: Optional[UUID] = None
    updated_by: Optional[UUID] = None
    
    class Config:
        from_attributes = True

class ModelVersionResponse(BaseModelWithID):
    """Response model for model version details."""
    model_id: UUID
    version: str
    model_path: str
    status: ModelVersionStatus
    is_production: bool
    metadata: Dict[str, Any]
    metrics: Optional[Dict[str, float]] = None
    created_by: Optional[UUID] = None
    
    class Config:
        from_attributes = True

class InferenceResponse(BaseModel):
    """Response model for inference results."""
    model_id: UUID
    model_version: str
    output: Union[str, List[Any], Dict[str, Any]]
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_schema_extra = {
            "example": {
                "model_id": "550e8400-e29b-41d4-a716-446655440000",
                "model_version": "1.0.0",
                "output": "This is a generated text response.",
                "metadata": {
                    "tokens_used": 42,
                    "processing_time": 0.75
                }
            }
        }

class EmbeddingResponse(BaseModel):
    """Response model for text embeddings."""
    model_id: UUID
    model_version: str
    embeddings: List[List[float]]
    metadata: Dict[str, Any] = Field(default_factory=dict)

# Query Parameters
class AIModelFilter(PaginationParams):
    """Query parameters for filtering AI models."""
    provider: Optional[ModelProvider] = None
    task: Optional[ModelTask] = None
    status: Optional[ModelStatus] = None
    is_public: Optional[bool] = None
    search: Optional[str] = None

class ModelVersionFilter(PaginationParams):
    """Query parameters for filtering model versions."""
    status: Optional[ModelVersionStatus] = None
    is_production: Optional[bool] = None

# Webhook Events
class WebhookEventType(str, Enum):
    """Types of webhook events."""
    MODEL_CREATED = "model.created"
    MODEL_UPDATED = "model.updated"
    VERSION_DEPLOYED = "version.deployed"
    INFERENCE_COMPLETED = "inference.completed"
    TRAINING_STARTED = "training.started"
    TRAINING_COMPLETED = "training.completed"
    TRAINING_FAILED = "training.failed"

class WebhookEvent(BaseModel):
    """Webhook event payload."""
    event: WebhookEventType
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
