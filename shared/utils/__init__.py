# ... existing imports ...

from .http_client import HTTPClient, fetch_json, rate_limited
from .testing import (
    MockDataGenerator,
    APITestClient,
    assert_valid_response,
    assert_has_keys,
    assert_valid_uuid
)
from .performance import (
    Timer,
    timeit,
    MemoryProfiler,
    memory_usage,
    RateLimiter
)
from .config import (
    load_config,
    get_env,
    get_bool_env,
    get_int_env,
    get_float_env,
    get_list_env,
    get_json_env,
    ConfigValidator
)

__all__ = [
    # ... existing exports ...
    
    # HTTP Client
    'HTTPClient', 'fetch_json', 'rate_limited',
    
    # Testing
    'MockDataGenerator', 'APITestClient',
    'assert_valid_response', 'assert_has_keys', 'assert_valid_uuid',
    
    # Performance
    'Timer', 'timeit', 'MemoryProfiler', 'memory_usage', 'RateLimiter',
    
    # Config
    'load_config', 'get_env', 'get_bool_env', 'get_int_env',
    'get_float_env', 'get_list_env', 'get_json_env', 'ConfigValidator'
]
