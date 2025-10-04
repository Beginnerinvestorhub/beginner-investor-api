import re
from typing import Optional, Any
from decimal import Decimal, InvalidOperation

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_phone(phone: str) -> bool:
    """Validate phone number (US format)"""
    pattern = r'^\+?1?\d{10}$'
    cleaned = re.sub(r'[\s\-\(\)]', '', phone)
    return bool(re.match(pattern, cleaned))

def validate_symbol(symbol: str) -> bool:
    """Validate stock symbol"""
    pattern = r'^[A-Z]{1,5}$'
    return bool(re.match(pattern, symbol.upper()))

def validate_password_strength(password: str) -> tuple[bool, list[str]]:
    """
    Validate password strength
    Returns (is_valid, list_of_issues)
    """
    issues = []
    
    if len(password) < 8:
        issues.append("Password must be at least 8 characters")
    
    if not re.search(r'[A-Z]', password):
        issues.append("Password must contain uppercase letter")
    
    if not re.search(r'[a-z]', password):
        issues.append("Password must contain lowercase letter")
    
    if not re.search(r'\d', password):
        issues.append("Password must contain digit")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        issues.append("Password must contain special character")
    
    return len(issues) == 0, issues

def validate_percentage(value: float) -> bool:
    """Validate percentage (0-100)"""
    return 0 <= value <= 100

def validate_positive_decimal(value: Any) -> Optional[Decimal]:
    """Validate and convert to positive decimal"""
    try:
        decimal_val = Decimal(str(value))
        return decimal_val if decimal_val > 0 else None
    except (InvalidOperation, ValueError):
        return None

def sanitize_string(text: str, max_length: Optional[int] = None) -> str:
    """Sanitize string input"""
    # Remove leading/trailing whitespace
    sanitized = text.strip()
    
    # Remove excessive whitespace
    sanitized = re.sub(r'\s+', ' ', sanitized)
    
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>]', '', sanitized)
    
    if max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized

def validate_url(url: str) -> bool:
    """Validate URL format"""
    pattern = r'^https?://[^\s/$.?#].[^\s]*$'
    return bool(re.match(pattern, url, re.IGNORECASE))
