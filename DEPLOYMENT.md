# Deployment Guide

This guide provides step-by-step instructions for deploying the Beginner Investor Hub application.

## Prerequisites

1. **Accounts**
   - [Render](https://render.com) account
   - [Vercel](https://vercel.com) account
   - [Firebase](https://firebase.google.com) account
   - [Redis Cloud](https://redis.com/cloud/overview/) account
   - [GitHub](https://github.com) account

2. **Environment Variables**
   - Create a `.env` file in each service directory with required variables
   - Reference `*.example` files for required variables

## 1. Backend API (Render)

### 1.1 Deploy to Render

1. Connect your GitHub repository to Render
2. Click "New" > "Web Service"
3. Select your repository and configure:
   - **Name**: `beginner-investor-hub-api`
   - **Region**: Oregon (or your preferred region)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Add environment variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=postgres://user:pass@host:port/dbname
   REDIS_URL=rediss://user:pass@host:port
   JWT_SECRET=your-jwt-secret
   COOKIE_SECRET=your-cookie-secret
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

5. Click "Create Web Service"

## 2. Frontend (Vercel)

### 2.1 Deploy to Vercel

1. Import your GitHub repository to Vercel
2. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `tools-restructured/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://beginner-investor-hub-api.onrender.com
   NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. Click "Deploy"

## 3. AI Behavioral Nudge Service (Render)

### 3.1 Deploy to Render

1. Click "New" > "Web Service"
2. Select your repository and configure:
   - **Name**: `ai-behavioral-nudge`
   - **Region**: Oregon (or your preferred region)
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app.main:app`
   - **Plan**: Free

3. Add environment variables:
   ```
   PORT=8000
   ENVIRONMENT=production
   REDIS_URL=rediss://user:pass@host:port
   ```

4. Click "Create Web Service"

## 4. Python Engine (Render)

### 4.1 Deploy to Render

1. Click "New" > "Web Service"
2. Select your repository and configure:
   - **Name**: `python-engine`
   - **Region**: Oregon (or your preferred region)
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app.main:app`
   - **Plan**: Free

3. Add environment variables:
   ```
   PORT=5000
   ENVIRONMENT=production
   ```

4. Click "Create Web Service"

## 5. Redis (Redis Cloud)

### 5.1 Set up Redis Cloud

1. Log in to [Redis Cloud](https://app.redislabs.com/)
2. Create a new subscription (Free tier available)
3. Create a new database:
   - **Name**: `beginner-investor-hub-cache`
   - **Region**: Same as your other services
   - **Memory limit**: 30MB (Free tier)
   - **Data persistence**: Enabled
   - **TLS/SSL**: Enabled

4. Get the connection details:
   - Endpoint
   - Port
   - Username
   - Password

5. Update environment variables in all services with the Redis connection URL:
   ```
   REDIS_URL=rediss://username:password@host:port
   ```

## 6. Firebase Authentication

### 6.1 Set up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Email/Password
   - Google Sign-In
   - Other providers as needed

4. Get your Firebase configuration:
   ```js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```

5. Update frontend environment variables with these values

## 7. Database (PostgreSQL)

### 7.1 Set up PostgreSQL

1. In Render, create a new PostgreSQL database:
   - Click "New" > "PostgreSQL"
   - **Name**: `beginner-investor-hub-db`
   - **Database**: `beginner_investor_hub`
   - **User**: `beginner_investor_hub_user`
   - **Plan**: Free

2. Get the connection string:
   ```
   postgres://user:password@host:port/dbname
   ```

3. Update backend environment variable:
   ```
   DATABASE_URL=postgres://user:password@host:port/dbname
   ```

## 8. Domain Setup (Optional)

### 8.1 Custom Domain

1. In Vercel, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain and follow the verification steps

### 8.2 SSL Certificates

- Vercel automatically provisions SSL certificates
- Render provides automatic SSL with `*.onrender.com` domains
- For custom domains, follow the platform's instructions for SSL setup

## 9. CI/CD Pipeline

### 9.1 GitHub Actions

1. Push your code to the `main` branch
2. GitHub Actions will automatically:
   - Run tests
   - Build the application
   - Deploy to staging (if configured)

### 9.2 Manual Deployment

1. Push to `main` for automatic deployment
2. Or create a release tag:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

## 10. Monitoring and Logs

### 10.1 Backend Logs
- View logs in the Render dashboard
- Set up log forwarding to a monitoring service if needed

### 10.2 Frontend Logs
- View logs in the Vercel dashboard
- Integrate with monitoring services (e.g., Sentry, LogRocket)

### 10.3 Database Monitoring
- Use Render's built-in monitoring
- Set up alerts for high CPU/memory usage

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if the service is running
   - Verify network settings and security groups
   - Check if the port is correctly exposed

2. **Database Connection Issues**
   - Verify the connection string
   - Check if the database is running and accessible
   - Verify user permissions

3. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Restart services after updating variables

## Support

For additional help, please contact the development team or refer to the documentation in the `docs/` directory.
