import json

with open('terraform.tfstate', 'r', encoding='utf-8') as f:
    state = json.load(f)

resources = [r for r in state.get('resources', []) if r['type'] in ['aws_cognito_user_pool', 'aws_cognito_user_pool_client']]

with open('clean_state.json', 'w', encoding='utf-8') as f:
    json.dump(resources, f, indent=2)
