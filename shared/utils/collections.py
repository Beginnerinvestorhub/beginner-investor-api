from typing import Any, Dict, List, TypeVar, Callable, Optional
from collections import defaultdict

T = TypeVar('T')

def chunk_list(lst: List[T], size: int) -> List[List[T]]:
    """Split list into chunks of specified size"""
    return [lst[i:i + size] for i in range(0, len(lst), size)]

def flatten_list(nested_list: List[List[T]]) -> List[T]:
    """Flatten nested list"""
    return [item for sublist in nested_list for item in sublist]

def group_by(items: List[T], key_func: Callable[[T], Any]) -> Dict[Any, List[T]]:
    """Group items by key function"""
    groups = defaultdict(list)
    for item in items:
        groups[key_func(item)].append(item)
    return dict(groups)

def deduplicate(items: List[T], key_func: Optional[Callable[[T], Any]] = None) -> List[T]:
    """Remove duplicates while preserving order"""
    if key_func is None:
        seen = set()
        result = []
        for item in items:
            if item not in seen:
                seen.add(item)
                result.append(item)
        return result
    else:
        seen = set()
        result = []
        for item in items:
            key = key_func(item)
            if key not in seen:
                seen.add(key)
                result.append(item)
        return result

def merge_dicts(*dicts: Dict) -> Dict:
    """Merge multiple dictionaries"""
    result = {}
    for d in dicts:
        result.update(d)
    return result

def deep_merge_dicts(dict1: Dict, dict2: Dict) -> Dict:
    """Deep merge two dictionaries"""
    result = dict1.copy()
    
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge_dicts(result[key], value)
        else:
            result[key] = value
    
    return result

def pick_keys(d: Dict, keys: List[str]) -> Dict:
    """Pick specified keys from dictionary"""
    return {k: d[k] for k in keys if k in d}

def omit_keys(d: Dict, keys: List[str]) -> Dict:
    """Omit specified keys from dictionary"""
    return {k: v for k, v in d.items() if k not in keys}

def invert_dict(d: Dict) -> Dict:
    """Invert dictionary keys and values"""
    return {v: k for k, v in d.items()}

def safe_get(d: Dict, path: str, default: Any = None) -> Any:
    """
    Safely get nested dictionary value using dot notation
    Example: safe_get({'a': {'b': 'c'}}, 'a.b') -> 'c'
    """
    keys = path.split('.')
    value = d
    
    for key in keys:
        if isinstance(value, dict) and key in value:
            value = value[key]
        else:
            return default
    
    return value
