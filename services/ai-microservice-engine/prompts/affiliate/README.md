# Affiliate Marketing Prompts

This directory contains prompt templates specifically designed for affiliate marketing use cases. These prompts help integrate affiliate content naturally while maintaining value for the reader.

## Available Prompts

### Injection Prompts
- **injection.json**: Templates for naturally integrating affiliate links into existing content
  - `affiliate_injection_prompt`: For seamlessly adding affiliate links while maintaining content quality

## Usage

Each prompt template is a JSON file containing one or more prompt templates. To use a template:

1. Import the JSON file
2. Load the desired template
3. Fill in the variables
4. Send to the AI model

### Example (Python)

```python
import json

def get_affiliate_prompt(prompt_name, variables):
    with open(f'prompts/affiliate/{prompt_name}.json') as f:
        templates = json.load(f)
    
    template = templates.get(prompt_name)
    if not template:
        raise ValueError(f"Prompt '{prompt_name}' not found")
    
    return template['template'].format(**variables)

# Example usage
prompt = get_affiliate_prompt(
    'injection',
    {
        'content': 'Investing in index funds is a great way to build long-term wealth.',
        'affiliate_link': 'https://example.com/best-index-funds?ref=123',
        'context': 'Beginner investors looking for passive investment options'
    }
)
```

## Best Practices

1. **Disclosure**: Always ensure proper disclosure of affiliate relationships
2. **Relevance**: Only include affiliate links that are highly relevant to the content
3. **Value First**: Focus on providing value to the reader first, with the affiliate link as a natural next step
4. **Testing**: Test different prompt variations to find what works best for your audience
5. **Compliance**: Ensure all affiliate content complies with FTC guidelines and platform policies

## Adding New Prompts

1. Create a new JSON file in this directory
2. Define your prompt with a clear name, description, and template
3. Document all required variables
4. Include an example usage
5. Update this README to include the new prompt
