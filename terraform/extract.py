import subprocess, json

def main():
    res = subprocess.run(['terraform', 'state', 'pull'], capture_output=True, text=True, encoding='utf-8')
    try:
        d = json.loads(res.stdout)
        rs = [r for r in d.get('resources', []) if r['type'] in ['aws_cognito_user_pool', 'aws_cognito_user_pool_client']]
        with open('cognito_state.json', 'w', encoding='utf-8') as f:
            json.dump(rs, f, indent=2)
    except Exception as e:
        print("Failed to decode JSON. Output was:")
        print(res.stdout[:500])
        raise e

if __name__ == "__main__":
    main()
