"""
User types for behavioral-nudge-engine
"""
from pydantic import BaseModel

class UserInDB(BaseModel):
    id: str
    email: str
    is_admin: bool = False
