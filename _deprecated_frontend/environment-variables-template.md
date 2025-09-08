# Environment Variables Configuration

## Required Environment Variables

Copy these environment variables to your `.env.local` file (for local development) and to your Vercel deployment settings (for production).

### Firebase Configuration
```bash
# Get these values from your Firebase project settings
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF123
```

### API Configuration
```bash
# Backend API URL (update with your actual backend URL)
NEXT_PUBLIC_API_BASE_URL=https://backend-api-989d.onrender.com

# ESG API endpoint (for the ESG proxy)
ESG_API_URL=https://backend-api-989d.onrender.com/api/esg
```

### Optional Development Settings
```bash
# Set to 'true' to use Firebase emulator in development
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false

# Google Analytics (optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id

# Nudge Engine API Key (if using AI behavioral nudges)
NUDGE_ENGINE_API_KEY=your_nudge_api_key
```

## Setup Instructions

### For Local Development:
1. Create a `.env.local` file in the frontend directory
2. Copy the environment variables above and fill in your actual values
3. Restart your development server

### For Vercel Production Deployment:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each environment variable with its corresponding value
4. Redeploy your application

## Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project or create a new one
3. Go to Project Settings → General → Your apps
4. Copy the configuration values to the environment variables above

## Troubleshooting
- If you see "Firebase not initialized" errors, check that all required Firebase environment variables are set
- If the ESG proxy returns 500 errors, verify the backend API URL is correct and the endpoint exists
- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser, others are server-side only
