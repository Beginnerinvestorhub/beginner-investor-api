# Render Deployment Guide

This guide provides detailed instructions for deploying the Beginner Investor Hub application to Render.

## Prerequisites

1. **Accounts**
   - [Render](https://render.com) account
   - [GitHub](https://github.com) account with repository access

2. **Environment Variables**
   - Prepare your environment variables in advance
   - Reference `.env.example` files in each service directory

## 1. Backend API Deployment

### 1.1 Create New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" > "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `beginner-investor-hub-api`
   - **Region**: Oregon (or your preferred region)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (upgrade for production)

### 1.2 Configure Environment Variables

Add these required variables:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgres://user:pass@host:port/dbname
REDIS_URL=rediss://user:pass@host:port
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
CORS_ORIGIN=https://your-frontend.vercel.app
```

### 1.3 Deploy

1. Click "Create Web Service"
2. Monitor the build and deployment logs
3. Note the service URL (e.g., `https://beginner-investor-hub-api.onrender.com`)

## 2. AI Behavioral Nudge Service

### 2.1 Create New Web Service

1. In Render Dashboard, click "New" > "Web Service"
2. Select your repository
3. Configure the service:
   - **Name**: `ai-behavioral-nudge`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app.main:app`
   - **Plan**: Free (upgrade for production)

### 2.2 Configure Environment Variables

```
PORT=8000
ENVIRONMENT=production
REDIS_URL=rediss://user:pass@host:port
```

## 3. Python Engine

### 3.1 Create New Web Service

1. In Render Dashboard, click "New" > "Web Service"
2. Select your repository
3. Configure the service:
   - **Name**: `python-engine`
   - **Region**: Same as other services
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app.main:app`
   - **Plan**: Free (upgrade for production)

### 3.2 Configure Environment Variables

```
PORT=8001
ENVIRONMENT=production
```

## 4. Database Setup

### 4.1 Create PostgreSQL Database

1. In Render Dashboard, click "New" > "PostgreSQL"
2. Configure the database:
   - **Name**: `beginner-investor-hub-db`
   - **Database**: `investor_hub`
   - **User**: `investor_hub_user`
   - **Region**: Same as your services
   - **Plan**: Free (upgrade for production)

3. Note the connection string:
   ```
   postgresql://user:password@host:port/dbname
   ```

### 4.2 Create Redis Instance

1. In Render Dashboard, click "New" > "Redis"
2. Configure Redis:
   - **Name**: `beginner-investor-hub-redis`
   - **Plan**: Free (upgrade for production)
   - **Region**: Same as other services

3. Note the connection URL:
   ```
   rediss://user:password@host:port
   ```

## 5. Environment Variables Reference

### Backend API

```
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# Redis
REDIS_URL=rediss://user:password@host:port

# Authentication
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret

# CORS
CORS_ORIGIN=https://your-frontend.vercel.app

# Other
NODE_ENV=production
PORT=10000
```

### AI Behavioral Nudge Service

```
PORT=8000
ENVIRONMENT=production
REDIS_URL=rediss://user:password@host:port
```

## 6. Post-Deployment Steps

1. **Verify Services**
   - Check all services are running in the Render Dashboard
   - Test API endpoints using Postman or curl

2. **Set Up Monitoring**
   - Enable health checks in Render
   - Set up alerts for downtime

3. **Scale Services**
   - Upgrade plans as needed
   - Configure auto-scaling for production traffic

## 7. Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Render
   - Verify all dependencies are in package.json/requirements.txt

2. **Connection Issues**
   - Verify database and Redis connection strings
   - Check CORS settings
   - Ensure all environment variables are set

3. **Performance**
   - Upgrade service plans if needed
   - Enable caching where appropriate
   - Monitor resource usage in Render Dashboard

## 8. Maintenance

### Updating Services

1. Push changes to the `main` branch
2. Render will automatically redeploy the services
3. Monitor the deployment in the Render Dashboard

### Backups

1. Regular database backups are recommended
2. Configure backup schedules in Render Dashboard
3. Test restore procedures periodically
