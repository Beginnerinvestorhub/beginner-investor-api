import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random
from enum import Enum

logger = logging.getLogger(__name__)

class NudgeType(str, Enum):
    EDUCATIONAL = "educational"
    ACTION = "action"
    REMINDER = "reminder"n    AFFILIATE = "affiliate"

class NudgeGenerator:
    """
    Service for generating personalized investment nudges based on user behavior.
    """
    
    def __init__(self):
        self.educational_resources = [
            "Check out our beginner's guide to index funds",
            "Learn about dollar-cost averaging and how it can reduce risk",
            "Understanding risk tolerance: Take our assessment",
            "The power of compound interest: How starting early pays off"
        ]
        
        self.action_items = [
            "Consider diversifying your portfolio with international stocks",
            "Review your asset allocation to ensure it matches your risk profile",
            "Set up automatic transfers to your investment account",
            "Rebalance your portfolio to maintain your target allocation"
        ]
        
        self.affiliate_products = [
            {"name": "Investment Book Bundle", "url": "https://affiliate.example.com/books", "commission": 0.1},
            {"name": "Trading Course", "url": "https://affiliate.example.com/course", "commission": 0.15},
            {"name": "Financial Planning Tool", "url": "https://affiliate.example.com/planner", "commission": 0.2}
        ]

    def generate_nudge(self, user_id: str, user_behavior: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a personalized nudge based on user behavior.
        
        Args:
            user_id: Unique identifier for the user
            user_behavior: Dictionary containing user activity and preferences
            
        Returns:
            Dict containing nudge details
        """
        try:
            # Simple logic to determine nudge type based on user behavior
            # In a real implementation, this would use more sophisticated ML models
            if user_behavior.get('last_login_days_ago', 0) > 7:
                nudge_type = NudgeType.REMINDER
                content = "We've missed you! Check out what's new in your portfolio."
            elif user_behavior.get('portfolio_diversity_score', 0) < 0.5:
                nudge_type = NudgeType.ACTION
                content = random.choice(self.action_items)
            elif random.random() < 0.3:  # 30% chance for affiliate nudge
                nudge_type = NudgeType.AFFILIATE
                product = random.choice(self.affiliate_products)
                content = f"Recommended for you: {product['name']}"
                metadata = {"affiliate_link": product['url'], "commission_rate": product['commission']}
            else:
                nudge_type = NudgeType.EDUCATIONAL
                content = random.choice(self.educational_resources)
            
            nudge = {
                "user_id": user_id,
                "type": nudge_type.value,
                "content": content,
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": metadata if nudge_type == NudgeType.AFFILIATE else {}
            }
            
            logger.info(f"Generated {nudge_type.value} nudge for user {user_id}")
            return nudge
            
        except Exception as e:
            logger.error(f"Error generating nudge for user {user_id}: {str(e)}")
            raise

    def batch_generate_nudges(self, user_behaviors: Dict[str, Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Generate nudges for multiple users at once.
        
        Args:
            user_behaviors: Dictionary mapping user_ids to their behavior data
            
        Returns:
            Dictionary mapping user_ids to their generated nudges
        """
        return {
            user_id: [self.generate_nudge(user_id, behavior)]
            for user_id, behavior in user_behaviors.items()
        }
