from typing import List, Dict, Optional, Any
from datetime import datetime
import logging
from pydantic import BaseModel, Field, validator
import openai
import json

from .service_integrator import service_integrator

class NudgeContext(BaseModel):
    user_id: str
    investment_experience: str = Field(
        ...,
        description="Investment experience level",
        regex="^(beginner|intermediate|advanced)$"
    )
    risk_profile: Dict[str, float]
    portfolio_metrics: Dict[str, float]
    recent_actions: List[Dict[str, Any]]
    market_conditions: Dict[str, Any]

class NudgeResponse(BaseModel):
    message: str
    type: str = Field(
        ...,
        regex="^(educational|risk_warning|opportunity|goal_tracking)$"
    )
    priority: int = Field(..., ge=1, le=5)
    action_items: List[str]
    resources: Optional[List[Dict[str, str]]] = None
    metadata: Dict[str, Any]

class AIEnhancedNudgeService:
    def __init__(
        self,
        model_name: str = "gpt-4",
        temperature: float = 0.7,
        max_tokens: int = 150
    ):
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.logger = logging.getLogger(__name__)

    async def generate_personalized_nudge(
        self,
        context: NudgeContext
    ) -> NudgeResponse:
        """Generate a personalized behavioral nudge using AI and integrate with behavioral-nudge-engine"""

        # First, use AI to analyze the context and generate nudge content
        prompt = self._build_prompt(context)

        try:
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )

            if not response.choices or not response.choices[0].message.content:
                raise ValueError("Empty response from AI model")

            parsed_response = self._parse_ai_response(response.choices[0].message.content)

            # Enhance with resources based on nudge type
            enhanced_response = self._enhance_with_resources(parsed_response, context)

            # Now integrate with behavioral-nudge-engine to store the nudge
            nudge_data = {
                "user_id": context.user_id,
                "type": enhanced_response.type,
                "title": f"AI-Generated {enhanced_response.type.title()} Nudge",
                "content": enhanced_response.message,
                "priority": enhanced_response.priority,
                "metadata": {
                    "generated_by": "ai-microservice-engine",
                    "ai_model": self.model_name,
                    "context": parsed_response.get("context", ""),
                    "investment_experience": context.investment_experience,
                    "generated_at": datetime.utcnow().isoformat()
                }
            }

            # Try to create the nudge in behavioral-nudge-engine
            try:
                integration_result = await service_integrator.create_behavioral_nudge(nudge_data)
                if "error" not in integration_result:
                    enhanced_response.metadata["behavioral_engine_id"] = integration_result.get("id")
                    self.logger.info(f"Successfully integrated nudge with behavioral-nudge-engine: {integration_result.get('id')}")
                else:
                    self.logger.warning(f"Failed to integrate with behavioral-nudge-engine: {integration_result['error']}")
            except Exception as e:
                self.logger.error(f"Error integrating with behavioral-nudge-engine: {str(e)}")

            return enhanced_response

        except Exception as e:
            self.logger.error(f"Error generating nudge: {str(e)}", exc_info=True)
            raise

    def _build_prompt(self, context: NudgeContext) -> str:
        return f"""
        Generate a personalized investment nudge for a {context.investment_experience} investor.

        Risk Profile:
        - Risk Tolerance: {context.risk_profile.get('risk_tolerance', 'N/A')}
        - Max Drawdown Tolerance: {context.risk_profile.get('max_drawdown', 'N/A')}

        Portfolio Metrics:
        - Current Volatility: {context.portfolio_metrics.get('volatility', 'N/A')}
        - Sharpe Ratio: {context.portfolio_metrics.get('sharpe_ratio', 'N/A')}
        - Diversification Score: {context.portfolio_metrics.get('diversification', 'N/A')}

        Recent Actions:
        {self._format_recent_actions(context.recent_actions)}

        Market Conditions:
        {self._format_market_conditions(context.market_conditions)}

        Generate a nudge that includes:
        1. A clear, actionable message
        2. The type of nudge (educational/risk_warning/opportunity/goal_tracking)
        3. Priority level (1-5)
        4. Specific action items
        5. Additional context or explanations
        """

    def _get_system_prompt(self) -> str:
        """Get the system prompt that defines the AI's role"""
        return """
        You are an AI-powered investment coach that helps users make better investment decisions.
        Your responses should be:
        1. Educational and supportive
        2. Based on behavioral finance principles
        3. Focused on long-term investing success
        4. Tailored to the user's experience level
        5. Clear and actionable
        
        Format your response in a structured way:
        MESSAGE: [The main nudge message]
        TYPE: [nudge type]
        PRIORITY: [1-5]
        ACTIONS:
        - [action 1]
        - [action 2]
        CONTEXT: [Additional explanation or context]
        """

    def _format_recent_actions(self, actions: List[Dict[str, Any]]) -> str:
        """Format recent user actions for the prompt"""
        if not actions:
            return "No recent actions"
        return "\n".join([
            f"- {action.get('type', 'Unknown')}: {action.get('description', 'N/A')} "
            f"({action.get('timestamp', 'N/A')})"
            for action in actions[-5:]  # Last 5 actions
        ])

    def _format_market_conditions(self, conditions: Dict[str, Any]) -> str:
        """Format market conditions for the prompt"""
        if not conditions:
            return "No market conditions provided"
        return "\n".join([f"- {key}: {value}" for key, value in conditions.items()])

    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """Parse the AI response into structured format"""
        if not response_text.strip():
            raise ValueError("Empty response text")
            
        parsed = {
            "message": "",
            "type": "",
            "priority": 3,  # Default to medium priority
            "actions": [],
            "context": ""
        }
        
        current_section = None
        for line in response_text.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
                
            if line.lower().startswith("message:"):
                current_section = "message"
                parsed["message"] = line.split(":", 1)[1].strip()
            elif line.lower().startswith("type:"):
                current_section = "type"
                parsed["type"] = line.split(":", 1)[1].strip().lower()
            elif line.lower().startswith("priority:"):
                try:
                    priority = int(line.split(":", 1)[1].strip())
                    parsed["priority"] = max(1, min(5, priority))  # Clamp to 1-5
                except (ValueError, IndexError):
                    pass
            elif line.lower().startswith("actions:"):
                current_section = "actions"
            elif line.lower().startswith("context:"):
                current_section = "context"
                parsed["context"] = line.split(":", 1)[1].strip()
            elif current_section == "actions" and line.startswith("-"):
                parsed["actions"].append(line[1:].strip())
            elif current_section == "context":
                parsed["context"] += " " + line
            elif current_section == "message":
                parsed["message"] += " " + line
                
        return parsed

    def _enhance_with_resources(
        self,
        parsed_response: Dict[str, Any],
        context: NudgeContext
    ) -> NudgeResponse:
        """Enhance the nudge with relevant resources based on type and context"""
        resource_map = {
            "educational": self._get_educational_resources,
            "risk_warning": self._get_risk_management_resources,
            "opportunity": self._get_market_analysis_resources,
            "goal_tracking": self._get_goal_planning_resources
        }
        
        get_resources = resource_map.get(
            parsed_response.get("type", "").lower(),
            lambda *_: []
        )
        
        resources = get_resources(context.investment_experience)

        return NudgeResponse(
            message=parsed_response.get("message", "No message provided"),
            type=parsed_response.get("type", "educational"),
            priority=parsed_response.get("priority", 3),
            action_items=parsed_response.get("actions", []),
            resources=resources,
            metadata={
                "generated_at": datetime.utcnow().isoformat(),
                "model_used": self.model_name,
                "context": parsed_response.get("context", "")
            }
        )

    def _get_educational_resources(self, experience_level: str) -> List[Dict[str, str]]:
        """Get relevant educational resources based on experience level"""
        resources = {
            "beginner": [
                {"title": "Investing 101", "url": "https://example.com/beginner-investing"},
                {"title": "Understanding Risk", "url": "https://example.com/risk-basics"}
            ],
            "intermediate": [
                {"title": "Portfolio Diversification", "url": "https://example.com/diversification"},
                {"title": "Market Analysis Techniques", "url": "https://example.com/market-analysis"}
            ],
            "advanced": [
                {"title": "Advanced Options Strategies", "url": "https://example.com/options"},
                {"title": "Quantitative Investment Models", "url": "https://example.com/quant-models"}
            ]
        }
        return resources.get(experience_level.lower(), [])

    def _get_risk_management_resources(self) -> List[Dict[str, str]]:
        """Get resources about risk management"""
        return [
            {"title": "Risk Management Guide", "url": "https://example.com/risk-management"},
            {"title": "Understanding Volatility", "url": "https://example.com/volatility"}
        ]

    def _get_market_analysis_resources(self) -> List[Dict[str, str]]:
        """Get resources for market analysis"""
        return [
            {"title": "Market Trends Analysis", "url": "https://example.com/market-trends"},
            {"title": "Sector Performance", "url": "https://example.com/sector-analysis"}
        ]

    def _get_goal_planning_resources(self) -> List[Dict[str, str]]:
        """Get resources for financial goal planning"""
        return [
            {"title": "Goal-Based Investing", "url": "https://example.com/goal-investing"},
            {"title": "Retirement Planning Guide", "url": "https://example.com/retirement-planning"}
        ]