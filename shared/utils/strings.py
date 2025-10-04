import hashlib
import secrets
import string
from typing import Optional

def generate_random_string(length: int = 32, include_special: bool = False) -> str:
    """Generate random string"""
    chars = string.ascii_letters + string.digits
    if include_special:
        chars += string.punctuation
    return ''.join(secrets.choice(chars) for _ in range(length))

def generate_api_key(prefix: str = "sk", length: int = 32) -> str:
    """Generate API key with prefix"""
    random_part = generate_random_string(length)
    return f"{prefix}_{random_part}"

def hash_string(text: str, algorithm: str = "sha256") -> str:
    """Hash a string"""
    hasher = hashlib.new(algorithm)
    hasher.update(text.encode('utf-8'))
    return hasher.hexdigest()

def truncate(text: str, length: int, suffix: str = "...") -> str:
    """Truncate string to length"""
    if len(text) <= length:
        return text
    return text[:length - len(suffix)] + suffix

def slugify(text: str) -> str:
    """Convert string to URL-friendly slug"""
    # Convert to lowercase
    slug = text.lower()
    
    # Replace spaces with hyphens
    slug = slug.replace(' ', '-')
    
    # Remove non-alphanumeric characters except hyphens
    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
    
    # Remove consecutive hyphens
    slug = '-'.join(filter(None, slug.split('-')))
    
    return slug

def mask_sensitive(text: str, visible_chars: int = 4, mask_char: str = "*") -> str:
    """Mask sensitive information"""
    if len(text) <= visible_chars:
        return mask_char * len(text)
    
    visible = text[-visible_chars:]
    masked = mask_char * (len(text) - visible_chars)
    return masked + visible

def camel_to_snake(text: str) -> str:
    """Convert camelCase to snake_case"""
    return re.sub(r'(?<!^)(?=[A-Z])', '_', text).lower()

def snake_to_camel(text: str) -> str:
    """Convert snake_case to camelCase"""
    components = text.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def pluralize(word: str, count: int) -> str:
    """Simple pluralization"""
    if count == 1:
        return word
    
    # Simple rules
    if word.endswith('y'):
        return word[:-1] + 'ies'
    elif word.endswith(('s', 'sh', 'ch', 'x', 'z')):
        return word + 'es'
    else:
        return word + 's'
