import json
import os
from typing import Dict, List, Optional
import openai
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AffiliateInjector:
    """
    Service for injecting affiliate links into content in a natural and valuable way.
    Uses OpenAI's API to generate contextually relevant content with affiliate links.
    """
    
    def __init__(self, prompts_dir: str = None):
        """
        Initialize the AffiliateInjector with optional custom prompts directory.
        
        Args:
            prompts_dir: Directory containing prompt templates (default: ./prompts)
        """
        self.prompts_dir = prompts_dir or os.path.join(os.path.dirname(__file__), "..", "..", "prompts")
        self.prompts = self._load_prompts()
        
        # Initialize OpenAI API
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            logger.warning("OPENAI_API_KEY not found in environment variables")
    
    def _load_prompts(self) -> Dict[str, str]:
        """Load prompt templates from JSON files in the prompts directory."""
        prompts = {}
        try:
            prompts_file = os.path.join(self.prompts_dir, "affiliate_injection.json")
            with open(prompts_file, 'r') as f:
                prompts.update(json.load(f))
        except Exception as e:
            logger.error(f"Error loading prompts: {e}")
            # Fallback to default prompts
            prompts = {
                "affiliate_injection_prompt": "Given the following content and context, naturally integrate the provided affiliate link in a way that adds value to the reader. The link should feel like a helpful suggestion rather than an advertisement.\n\nContent: {content}\n\nAffiliate Link: {affiliate_link}\n\nContext: {context}\n\nRewritten content with affiliate link:",
                "affiliate_suggestion_prompt": "Based on the following content, suggest relevant affiliate products or services that would be genuinely helpful to the reader. Include a brief explanation of why each recommendation is valuable.\n\nContent: {content}\n\nContext: {context}\n\nAffiliate suggestions:",
                "seo_optimized_prompt": "Optimize the following content for search engines while naturally incorporating the provided affiliate link. Ensure the content remains valuable and engaging for readers.\n\nContent: {content}\n\nAffiliate Link: {affiliate_link}\n\nTarget Keywords: {keywords}\n\nOptimized content:"
            }
        return prompts
    
    async def inject_affiliate_link(
        self, 
        content: str, 
        affiliate_link: str, 
        context: str = "", 
        model: str = "gpt-3.5-turbo"
    ) -> str:
        """
        Inject an affiliate link into the content naturally.
        
        Args:
            content: The original content
            affiliate_link: The affiliate link to inject
            context: Additional context about the content or audience
            model: The OpenAI model to use
            
        Returns:
            Content with the affiliate link naturally integrated
        """
        if not self.openai_api_key:
            raise ValueError("OpenAI API key is not configured")
            
        prompt = self.prompts["affiliate_injection_prompt"].format(
            content=content,
            affiliate_link=affiliate_link,
            context=context
        )
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that helps integrate affiliate links naturally into content."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            return response.choices[0].message['content'].strip()
            
        except Exception as e:
            logger.error(f"Error generating content with OpenAI: {e}")
            # Fallback to simple injection
            return f"{content}\n\nYou might find this resource helpful: {affiliate_link}"
    
    async def suggest_affiliate_products(
        self, 
        content: str, 
        context: str = "", 
        model: str = "gpt-3.5-turbo"
    ) -> List[Dict[str, str]]:
        """
        Suggest relevant affiliate products based on the content.
        
        Args:
            content: The content to analyze for product suggestions
            context: Additional context about the content or audience
            model: The OpenAI model to use
            
        Returns:
            List of suggested products with descriptions and rationale
        """
        if not self.openai_api_key:
            raise ValueError("OpenAI API key is not configured")
            
        prompt = self.prompts["affiliate_suggestion_prompt"].format(
            content=content,
            context=context
        )
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that suggests relevant affiliate products."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Parse the response into a list of suggestions
            suggestions_text = response.choices[0].message['content'].strip()
            # Simple parsing - in a real implementation, you might want to use a more robust approach
            suggestions = [{"product": line.split(":")[0].strip(), 
                          "description": ":".join(line.split(":")[1:]).strip()}
                         for line in suggestions_text.split("\n") if ":" in line]
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Error generating product suggestions: {e}")
            return []
    
    async def optimize_for_seo(
        self, 
        content: str, 
        affiliate_link: str, 
        keywords: List[str], 
        context: str = "",
        model: str = "gpt-3.5-turbo"
    ) -> str:
        """
        Optimize content for SEO while naturally incorporating an affiliate link.
        
        Args:
            content: The original content
            affiliate_link: The affiliate link to include
            keywords: List of target keywords
            context: Additional context about the content or audience
            model: The OpenAI model to use
            
        Returns:
            SEO-optimized content with the affiliate link
        """
        if not self.openai_api_key:
            raise ValueError("OpenAI API key is not configured")
            
        prompt = self.prompts["seo_optimized_prompt"].format(
            content=content,
            affiliate_link=affiliate_link,
            keywords=", ".join(keywords),
            context=context
        )
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an SEO expert that helps optimize content for search engines while naturally incorporating affiliate links."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            return response.choices[0].message['content'].strip()
            
        except Exception as e:
            logger.error(f"Error optimizing content for SEO: {e}")
            # Fallback to simple injection
            return f"{content}\n\nYou might find this resource helpful: {affiliate_link}"
