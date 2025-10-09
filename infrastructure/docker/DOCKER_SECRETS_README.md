# Docker Secrets Management Guide

## Overview

This project uses Docker secrets for secure management of sensitive configuration data in production environments. This approach provides better security than environment variables by:

- Keeping secrets out of container environment variables
- Mounting secrets as read-only files in `/run/secrets/`
- Preventing secrets from appearing in `docker inspect` output
- Automatic cleanup when containers stop

## Production Setup

### 1. Prepare Secret Files

Navigate to the `infrastructure/docker/secrets/` directory and populate each secret file:

```bash
cd infrastructure/docker/secrets/

# Generate a strong database password
echo "super_secure_db_password_2024!" > db_password.txt

# Generate a JWT secret (32+ characters)
openssl rand -hex 32 > jwt_secret.txt

# Add your API keys
echo "your_openai_api_key_here" > openai_api_key.txt
echo "your_alpha_vantage_key_here" > alpha_vantage_api_key.txt
echo "your_finnhub_key_here" > finnhub_api_key.txt

# Download and place your Firebase service account JSON
# The file should contain the complete JSON from Firebase Console
```

### 2. Set Permissions

Ensure secret files have restricted permissions:

```bash
chmod 600 secrets/*.txt secrets/*.json
chmod 700 secrets/
```

### 3. Deploy with Secrets

Use the production docker-compose file with secrets:

```bash
# Deploy with secrets (recommended for production)
docker-compose -f docker-compose.yml --env-file .env.production up -d

# Or include the secrets configuration explicitly
docker-compose -f docker-compose.yml -f docker-secrets.yml up -d
```

## Development Setup

For development, the `docker-compose-dev.yml` file uses environment variables instead of Docker secrets for easier local development:

### 1. Create Development Environment File

```bash
cd infrastructure/docker/
cp .env.production.example .env.development
```

### 2. Populate Development Secrets

Edit `.env.development` and replace placeholder values with your actual development keys:

```bash
# Example development values (use weak passwords only for development!)
DB_PASSWORD=development_db_password_please_change
JWT_SECRET=development_jwt_secret_key_please_change_in_production
OPENAI_API_KEY=development_openai_key
# ... etc
```

### 3. Start Development Environment

```bash
docker-compose -f docker-compose-dev.yml up -d
```

## Application Integration

### Node.js Services (Backend API)

The backend API reads secrets from files when available:

```javascript
// In your application code
const jwtSecret = process.env.JWT_SECRET_FILE
  ? fs.readFileSync(process.env.JWT_SECRET_FILE, 'utf8').trim()
  : process.env.JWT_SECRET;

const firebaseAccount = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
  ? JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_FILE, 'utf8'))
  : JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
```

### Python Services

Python services read secrets from environment variables that point to secret files:

```python
import os

# Read from file if available, otherwise from environment
openai_key = None
if os.getenv('OPENAI_API_KEY_FILE'):
    with open(os.getenv('OPENAI_API_KEY_FILE'), 'r') as f:
        openai_key = f.read().strip()
else:
    openai_key = os.getenv('OPENAI_API_KEY')
```

## Secret Rotation

To rotate secrets in production:

1. Update the secret file content
2. Restart the affected services:

```bash
# Restart all services to pick up new secrets
docker-compose down
docker-compose up -d

# Or restart specific services
docker-compose restart backend-api ai-engine
```

## Security Best Practices

1. **Never commit secret files** - Add `secrets/` to `.gitignore`
2. **Use strong, unique passwords** for all secrets
3. **Rotate secrets regularly** (at least every 90 days)
4. **Limit file permissions** (`chmod 600`)
5. **Use different secrets** for different environments
6. **Monitor secret access** in production logs
7. **Use a dedicated secret management service** for enterprise deployments

## Troubleshooting

### Common Issues

1. **Permission denied**: Ensure secret files have correct permissions (`chmod 600`)
2. **Service won't start**: Check that all required secret files exist and are readable
3. **Application can't read secrets**: Verify the application code handles both file and environment variable sources

### Debugging

Check if secrets are mounted correctly:

```bash
# Inspect a running container
docker exec -it container_name ls -la /run/secrets/

# View secret content (development only)
docker exec -it container_name cat /run/secrets/jwt_secret
```

## Migration from Environment Variables

If you're migrating from environment variables to Docker secrets:

1. Update your application code to read from both sources during transition
2. Deploy with secrets alongside environment variables initially
3. Remove environment variable support once migration is complete
4. Update deployment scripts and documentation
