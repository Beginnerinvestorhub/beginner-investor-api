#!/usr/bin/env python3
"""
Database setup script for AI Microservice
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from models.database import Base, AINudgeHistory, AIModelUsage, UserContextCache

def setup_database():
    """Initialize the AI microservice database"""

    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL environment variable not set")
        print("📋 Please set: DATABASE_URL=postgresql://username:password@localhost:5432/ai_microservice_db")
        return False

    print(f"🔗 Connecting to database: {database_url}")

    try:
        # Create engine
        engine = create_engine(database_url)

        # Create tables
        print("🏗️  Creating database tables...")
        Base.metadata.create_all(bind=engine)

        # Test connection
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()

        # Create test record
        test_nudge = AINudgeHistory(
            user_id="test_user",
            nudge_type="educational",
            message="Welcome to AI-powered investment nudges!",
            priority=3,
            action_items=["Explore the platform", "Complete your profile"],
            metadata={"test": True}
        )

        db.add(test_nudge)
        db.commit()
        db.refresh(test_nudge)

        print(f"✅ Database setup completed successfully!")
        print(f"📊 Test record created with ID: {test_nudge.id}")

        # Clean up test record
        db.delete(test_nudge)
        db.commit()

        db.close()
        return True

    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False

if __name__ == "__main__":
    success = setup_database()
    sys.exit(0 if success else 1)
