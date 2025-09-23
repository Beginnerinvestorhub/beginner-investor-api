# Investment Analysis Prompts

This directory contains prompt templates for investment-related analysis and insights. These prompts are designed to help generate high-quality investment content, analysis, and recommendations.

## Available Prompts

### Analysis Prompts
- **fundamental_analysis.json**: For analyzing company fundamentals
- **technical_analysis.json**: For technical analysis of securities
- **portfolio_review.json**: For reviewing and analyzing investment portfolios

### Educational Prompts
- **concept_explanation.json**: For explaining investment concepts
- **strategy_guide.json**: For creating investment strategy guides
- **market_outlook.json**: For generating market analysis and outlook

## Usage

Each prompt template is a JSON file containing one or more prompt templates. To use a template:

1. Import the JSON file
2. Load the desired template
3. Fill in the variables
4. Send to the AI model

### Example (Python)

```python
import json

def load_investment_prompt(category, prompt_name, variables):
    with open(f'prompts/investment/{category}/{prompt_name}.json') as f:
        templates = json.load(f)
    
    template = templates.get(prompt_name)
    if not template:
        raise ValueError(f"Prompt '{prompt_name}' not found in {category}")
    
    return template['template'].format(**variables)

# Example usage
analysis_prompt = load_investment_prompt(
    'analysis',
    'fundamental_analysis',
    {
        'ticker': 'AAPL',
        'timeframe': '5 years',
        'analysis_depth': 'comprehensive',
        'target_audience': 'beginner investors'
    }
)
```

## Best Practices

1. **Accuracy**: Always verify investment advice and data points
2. **Disclosure**: Include appropriate risk disclosures
3. **Clarity**: Use clear, non-technical language for beginner audiences
4. **Relevance**: Tailor content to current market conditions
5. **Compliance**: Ensure all content complies with financial regulations

## Adding New Prompts

1. Create a new JSON file in the appropriate subdirectory
2. Define your prompt with a clear name, description, and template
3. Document all required variables
4. Include an example usage
5. Update this README to include the new prompt

## Compliance Note

All investment-related content should be reviewed by a qualified financial professional before being published. The prompts in this directory are for educational purposes only and do not constitute financial advice.
