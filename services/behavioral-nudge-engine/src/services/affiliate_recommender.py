import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import random

logger = logging.getLogger(__name__)

class AffiliateRecommender:
    """
    Service for generating personalized affiliate product recommendations.
    """
    
    def __init__(self):
        self.affiliate_products = [
            {
                "id": "book_bundle",
                "name": "Investment Book Bundle",
                "description": "A collection of top-rated investment books for beginners",
                "url": "https://affiliate.example.com/books",
                "commission_rate": 0.1,
                "categories": ["education", "books", "beginner"],
                "min_investment_level": 0
            },
            {
                "id": "trading_course",
                "name": "Advanced Trading Course",
                "description": "Learn advanced trading strategies from industry experts",
                "url": "https://affiliate.example.com/course",
                "commission_rate": 0.15,
                "categories": ["education", "courses", "advanced"],
                "min_investment_level": 1000
            },
            {
                "id": "planner_tool",
                "name": "Financial Planning Tool",
                "description": "Comprehensive financial planning software",
                "url": "https://affiliate.example.com/planner",
                "commission_rate": 0.2,
                "categories": ["tools", "planning", "all-levels"],
                "min_investment_level": 0
            },
            {
                "id": "robo_advisor",
                "name": "Robo-Advisor Service",
                "description": "Automated investment management service",
                "url": "https://affiliate.example.com/robo",
                "commission_rate": 0.25,
                "categories": ["tools", "automation", "all-levels"],
                "min_investment_level": 100
            },
            {
                "id": "tax_software",
                "name": "Investment Tax Software",
                "description": "Specialized tax software for investors",
                "url": "https://affiliate.example.com/tax",
                "commission_rate": 0.15,
                "categories": ["tools", "tax", "all-levels"],
                "min_investment_level": 0
            }
        ]

    def recommend_products(
        self, 
        user_profile: Dict[str, Any], 
        max_recommendations: int = 3,
        exclude_viewed: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Recommend affiliate products based on user profile.
        
        Args:
            user_profile: Dictionary containing user information and preferences
            max_recommendations: Maximum number of recommendations to return
            exclude_viewed: Whether to exclude previously viewed products
            
        Returns:
            List of recommended affiliate products
        """
        try:
            # Filter products based on user's investment level
            investment_level = user_profile.get('investment_level', 0)
            eligible_products = [
                p for p in self.affiliate_products 
                if p['min_investment_level'] <= investment_level
            ]
            
            # Filter out viewed products if needed
            if exclude_viewed and 'viewed_products' in user_profile:
                viewed_ids = {p['id'] for p in user_profile['viewed_products']}
                eligible_products = [p for p in eligible_products if p['id'] not in viewed_ids]
            
            # Simple recommendation logic - in a real app, this would use ML models
            # For now, we'll just randomize with some basic filtering
            
            # Try to match user interests with product categories
            user_interests = set(user_profile.get('interests', []))
            if user_interests:
                # Score products based on interest matches
                scored_products = []
                for product in eligible_products:
                    product_categories = set(product.get('categories', []))
                    match_score = len(user_interests.intersection(product_categories))
                    scored_products.append((product, match_score))
                
                # Sort by match score (descending) and take top N
                scored_products.sort(key=lambda x: x[1], reverse=True)
                eligible_products = [p[0] for p in scored_products]
            
            # Randomize and limit results
            recommendations = random.sample(
                eligible_products, 
                min(max_recommendations, len(eligible_products))
            )
            
            # Add tracking information
            timestamp = datetime.utcnow().isoformat()
            for rec in recommendations:
                rec['recommended_at'] = timestamp
                rec['affiliate_url'] = self._add_affiliate_tracking(
                    rec['url'], 
                    user_id=user_profile.get('id'),
                    campaign='nudge_engine'
                )
            
            logger.info(f"Generated {len(recommendations)} product recommendations for user {user_profile.get('id')}")
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating product recommendations: {str(e)}")
            # Return a default set of recommendations in case of error
            return self._get_default_recommendations()
    
    def _add_affiliate_tracking(self, base_url: str, user_id: Optional[str] = None, campaign: str = '') -> str:
        """
        Add tracking parameters to affiliate URLs.
        
        Args:
            base_url: The base affiliate URL
            user_id: Optional user ID for tracking
            campaign: Campaign identifier
            
        Returns:
            URL with tracking parameters
        """
        from urllib.parse import urlencode, urlparse, parse_qs, urlunparse
        
        # Parse the URL
        parsed = urlparse(base_url)
        query = parse_qs(parsed.query)
        
        # Add tracking parameters
        query['utm_source'] = 'beginnerinvestorhub'
        query['utm_medium'] = 'affiliate'
        if campaign:
            query['utm_campaign'] = campaign
        if user_id:
            query['ref'] = f'user_{user_id}'
        
        # Rebuild the URL
        return urlunparse(parsed._replace(query=urlencode(query, doseq=True)))
    
    def _get_default_recommendations(self) -> List[Dict[str, Any]]:
        """Return a default set of recommendations in case of errors."""
        return [
            {
                "id": "default_planner",
                "name": "Financial Planning Tool",
                "description": "Comprehensive financial planning software",
                "url": "https://affiliate.example.com/planner?utm_source=beginnerinvestorhub&utm_medium=affiliate&utm_campaign=default",
                "commission_rate": 0.2,
                "is_default": True
            },
            {
                "id": "default_books",
                "name": "Investment Book Bundle",
                "description": "A collection of top-rated investment books for beginners",
                "url": "https://affiliate.example.com/books?utm_source=beginnerinvestorhub&utm_medium=affiliate&utm_campaign=default",
                "commission_rate": 0.1,
                "is_default": True
            }
        ]

    def track_click(self, product_id: str, user_id: str) -> bool:
        """
        Track when a user clicks on an affiliate link.
        
        Args:
            product_id: ID of the clicked product
            user_id: ID of the user who clicked
            
        Returns:
            bool: True if tracking was successful
        """
        try:
            # In a real implementation, this would log to a database or analytics service
            logger.info(f"User {user_id} clicked on product {product_id}")
            return True
        except Exception as e:
            logger.error(f"Error tracking click for user {user_id} on product {product_id}: {str(e)}")
            return False

    def track_conversion(self, product_id: str, user_id: str, amount: float) -> bool:
        """
        Track when a conversion (sale) occurs through an affiliate link.
        
        Args:
            product_id: ID of the purchased product
            user_id: ID of the user who made the purchase
            amount: Purchase amount
            
        Returns:
            bool: True if tracking was successful
        """
        try:
            # In a real implementation, this would log to a database or analytics service
            # and potentially trigger commission payments
            product = next((p for p in self.affiliate_products if p['id'] == product_id), {})
            commission = amount * product.get('commission_rate', 0)
            
            logger.info(
                f"Conversion: User {user_id} purchased {product_id} for ${amount:.2f}. "
                f"Commission: ${commission:.2f} ({product.get('commission_rate', 0)*100:.1f}%)"
            )
            return True
        except Exception as e:
            logger.error(f"Error tracking conversion for user {user_id} on product {product_id}: {str(e)}")
            return False
