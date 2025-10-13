from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://ai_user:ai_password@localhost:5432/ai_microservice")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# AI Nudge History Model
class AINudgeHistory(Base):
    __tablename__ = "ai_nudge_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    nudge_type = Column(String)
    message = Column(Text)
    priority = Column(Integer)
    action_items = Column(JSON)
    resources = Column(JSON)
    nudge_metadata = Column(JSON)  # Renamed from 'metadata' to avoid SQLAlchemy conflict
    created_at = Column(DateTime, default=datetime.utcnow)
    delivered = Column(DateTime, nullable=True)
    interacted = Column(DateTime, nullable=True)
    interaction_type = Column(String, nullable=True)

# AI Model Usage Tracking
class AIModelUsage(Base):
    __tablename__ = "ai_model_usage"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String)
    tokens_used = Column(Integer)
    cost_usd = Column(Float)
    response_time_ms = Column(Integer)
    user_id = Column(String, nullable=True)
    nudge_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# User Context Cache
class UserContextCache(Base):
    __tablename__ = "user_context_cache"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    investment_experience = Column(String)
    risk_profile = Column(JSON)
    portfolio_metrics = Column(JSON)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime)

# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)

# Get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
