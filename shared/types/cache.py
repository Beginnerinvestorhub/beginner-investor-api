from pydantic import BaseModel, Field
from typing import Optional, Any, Generic, TypeVar
from datetime import datetime
from enum import Enum

T = TypeVar('T')

class CacheStrategy(str, Enum):
    """Cache invalidation strategies"""
    TTL = "ttl"  # Time to live
    LRU = "lru"  # Least recently used
    LFU = "lfu"  # Least frequently used
    FIFO = "fifo"  # First in first out

class CacheEntry(BaseModel, Generic[T]):
    """Cache entry wrapper"""
    key: str
    value: T
    created_at: datetime
    expires_at: Optional[datetime] = None
    hits: int = 0
    last_accessed: datetime
    tags: Optional[List[str]] = None

class CacheStats(BaseModel):
    """Cache statistics"""
    total_keys: int
    hit_rate: float
    miss_rate: float
    evictions: int
    memory_usage_mb: float
    avg_ttl_seconds: Optional[float] = None