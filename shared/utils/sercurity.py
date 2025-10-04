import hashlib
import hmac
import secrets
from typing import Optional
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2

def generate_salt(length: int = 32) -> str:
    """Generate random salt"""
    return secrets.token_hex(length)

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Hash password with salt"""
    if salt is None:
        salt = generate_salt()
    
    # Use PBKDF2
    kdf = PBKDF2(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt.encode(),
        iterations=100000,
    )
    
    hashed = base64.b64encode(kdf.derive(password.encode())).decode()
    return hashed, salt

def verify_password(password: str, hashed: str, salt: str) -> bool:
    """Verify password against hash"""
    new_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(new_hash, hashed)

def generate_token(length: int = 32) -> str:
    """Generate secure random token"""
    return secrets.token_urlsafe(length)

def encrypt_string(text: str, key: bytes) -> str:
    """Encrypt string with Fernet"""
    f = Fernet(key)
    return f.encrypt(text.encode()).decode()

def decrypt_string(encrypted: str, key: bytes) -> str:
    """Decrypt string with Fernet"""
    f = Fernet(key)
    return f.decrypt(encrypted.encode()).decode()

def generate_encryption_key() -> bytes:
    """Generate Fernet encryption key"""
    return Fernet.generate_key()

def create_signature(data: str, secret: str) -> str:
    """Create HMAC signature"""
    return hmac.new(
        secret.encode(),
        data.encode(),
        hashlib.sha256
    ).hexdigest()

def verify_signature(data: str, signature: str, secret: str) -> bool:
    """Verify HMAC signature"""
    expected = create_signature(data, secret)
    return hmac.compare_digest(expected, signature)
