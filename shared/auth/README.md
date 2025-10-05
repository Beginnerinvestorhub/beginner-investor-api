# Firebase Authentication Service

A comprehensive Firebase Authentication system for the Investment Hub platform with FastAPI backend.

## Features

- 🔐 **Firebase Authentication** - Full Firebase Admin SDK integration
- 🎫 **JWT Token Management** - Access and refresh token handling
- 👥 **User Management** - User registration, login, and profile management
- 🔒 **Role-based Access Control** - Admin and user role management
- 📧 **Email Verification** - Email verification and password reset
- 🔑 **Password Security** - Secure password hashing with bcrypt
- 🛡️ **Middleware Protection** - Authentication middleware for protected routes

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables in `.env`:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-at-least-32-characters-long
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/investment_hub
```

3. Set up Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Go to Project Settings > Service Accounts
   - Generate a new private key and download the JSON file
   - Extract the values for the environment variables above

## Usage

### Start the Authentication Service

```bash
# From the shared/auth directory
python start.py

# Or directly with uvicorn
uvicorn shared.auth.main:app --host 0.0.0.0 --port 8000 --reload
```

The service will start on `http://localhost:8000`

### API Endpoints

#### Authentication Routes

- `POST /auth/login` - Email/password login
- `POST /auth/firebase-login` - Firebase token-based login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info
- `POST /auth/verify-email` - Verify email with token
- `POST /auth/forgot-password` - Send password reset email

#### Protected Routes

- `GET /api/profile` - Get user profile (requires authentication)
- `GET /api/admin` - Admin dashboard (requires admin role)
- `GET /api/public` - Public endpoint (optional authentication)

### Example Usage

#### 1. Register a new user
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

#### 2. Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "email_verified": false,
    "firebase_uid": "firebase_user_id"
  }
}
```

#### 3. Access protected route
```bash
curl -X GET "http://localhost:8000/api/profile" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

## Architecture

### Components

1. **FirebaseAuthService** (`firebase_auth.py`)
   - Handles Firebase Admin SDK operations
   - Token verification and user management

2. **Authentication Routes** (`routes.py`)
   - Login, registration, and user management endpoints
   - JWT token creation and refresh

3. **Middleware** (`middleware.py`)
   - Authentication and authorization middleware
   - Role-based access control

4. **Main Application** (`main.py`)
   - FastAPI application setup
   - CORS configuration and global error handling

### Database Integration

The service integrates with the existing database models:
- **User** - User accounts and profiles
- **UserSession** - Session management (if implemented)
- **Subscription** - User subscription management

### Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- CORS protection
- Role-based access control
- Secure cookie handling for refresh tokens
- Input validation and sanitization

## Development

### Adding New Protected Routes

```python
from fastapi import Depends
from shared.auth.middleware import get_current_user, get_admin_user

@app.get("/api/new-feature")
async def new_feature(current_user: dict = Depends(get_current_user)):
    # Only authenticated users can access
    return {"message": "New feature", "user": current_user}

@app.get("/api/admin-only")
async def admin_only(current_user: dict = Depends(get_admin_user)):
    # Only admin users can access
    return {"message": "Admin feature", "user": current_user}
```

### Custom Authentication Logic

```python
from shared.auth.firebase_auth import firebase_auth

# Custom user creation
try:
    firebase_user = firebase_auth.create_user(
        email="user@example.com",
        password="password123",
        display_name="John Doe"
    )
except Exception as e:
    print(f"User creation failed: {e}")
```

## Production Deployment

1. Set secure environment variables
2. Use HTTPS in production
3. Configure proper CORS origins
4. Set up monitoring and logging
5. Use a production WSGI server (gunicorn, etc.)

```bash
# Production startup
gunicorn shared.auth.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Troubleshooting

### Common Issues

1. **Firebase initialization fails**
   - Check Firebase environment variables
   - Verify Firebase project configuration

2. **Token verification fails**
   - Check JWT secret key
   - Verify token expiration

3. **Database connection fails**
   - Check DATABASE_URL configuration
   - Verify database server is running

### Logging

The service uses structured logging. Set log level in environment:
```env
LOG_LEVEL=DEBUG  # DEBUG, INFO, WARNING, ERROR
```

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
