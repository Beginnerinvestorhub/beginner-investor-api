# 🚀 Productivity Setup Guide - Beginner Investor Hub

This guide outlines the optimal development setup for maximum productivity with your multi-service investment platform.

## 🏗️ Architecture Overview

Your application consists of:
- **Frontend**: Next.js + Tailwind CSS (Port 3000)
- **Backend**: Node.js/Express API (Port 4000) 
- **Python AI**: FastAPI behavioral nudge engine (Port 8000)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Firebase Authentication with RBAC
- **Payments**: Stripe integration

## ⚡ Quick Start

### 1. Initial Setup
```powershell
# Run the automated setup script
./dev-setup.ps1

# Or manually:
pnpm install                    # Install Node dependencies
./tools/setup_python_env.ps1   # Setup Python environments
```

### 2. Start Development
```powershell
# Option 1: Use VS Code tasks (Ctrl+Shift+P → "Tasks: Run Task")
- "Start All Services"

# Option 2: Use the start script
./start-dev.ps1

# Option 3: Individual services
pnpm --filter frontend dev      # Frontend only
pnpm --filter backend dev       # Backend only
```

## 🛠️ VS Code Productivity Features

### Enhanced Extensions
Your workspace includes optimized extensions for:
- **React/TypeScript**: Auto-imports, snippets, IntelliSense
- **Python**: Pylance, auto-docstring, virtual env support
- **Database**: Prisma extension for schema management
- **API Testing**: Thunder Client for endpoint testing
- **Git**: GitLens, Git Graph for version control
- **Code Quality**: ESLint, Prettier, Error Lens

### Optimized Settings
- **File Nesting**: Related files grouped together
- **Auto-save**: On focus change for seamless workflow
- **Format on Save**: Consistent code formatting
- **Smart Imports**: Auto-organize and update imports
- **Performance**: Excluded build folders from search/watch

### Debugging Configuration
- **Full Stack Debugging**: Debug all services simultaneously
- **Individual Service Debug**: Target specific components
- **Python Virtual Env**: Automatic environment detection
- **Source Maps**: Accurate TypeScript debugging

## 📋 Development Workflow

### Daily Development
1. **Start Services**: Use "Start All Services" task
2. **Code Changes**: Auto-save and format on save enabled
3. **Testing**: Run tests with dedicated tasks
4. **Debugging**: Use compound debug configuration

### Code Quality
```powershell
# Lint and format all code
pnpm lint:fix    # Fix ESLint issues
pnpm format      # Format with Prettier

# Run tests
pnpm test        # All tests
pnpm --filter frontend test  # Frontend only
```

### Database Management
```powershell
cd tools/backend
npx prisma studio           # Visual database browser
npx prisma db push          # Apply schema changes
npx prisma generate         # Update client
```

## 🔧 Key Productivity Tips

### 1. Multi-Terminal Setup
- **Terminal 1**: Frontend development server
- **Terminal 2**: Backend API server  
- **Terminal 3**: Python AI service
- **Terminal 4**: General commands/git

### 2. File Navigation
- Use `Ctrl+P` for quick file switching
- File nesting groups related files (`.env` files, configs)
- Excluded folders improve search performance

### 3. Debugging Workflow
- Set breakpoints in TypeScript/Python code
- Use "Debug Full Stack" for complete debugging
- Console logs automatically appear in Debug Console

### 4. Environment Management
- Separate `.env` files for each service
- Python virtual environments auto-activate
- Environment variables validated on startup

## 🐳 Docker Development

### Local Development
```powershell
cd tools
docker-compose up --build    # All services in containers
```

### Production Testing
```powershell
docker-compose -f docker-compose.prod.yml up --build
```

## 📊 Monitoring & Analytics

### Development URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/docs
- **Python AI**: http://localhost:8000
- **Prisma Studio**: http://localhost:5555

### Performance Monitoring
- **Bundle Analyzer**: Analyze frontend bundle size
- **API Monitoring**: Thunder Client for endpoint testing
- **Error Tracking**: Error Lens shows issues inline
- **Git Analytics**: GitLens provides code insights

## 🔐 Security Best Practices

### Environment Variables
- Never commit `.env` files
- Use `.env.example` as templates
- Validate required variables on startup

### API Security
- JWT tokens for authentication
- CORS configured via environment
- Rate limiting on all endpoints
- Input validation with Joi/Yup

## 🚀 Deployment Workflow

### Pre-deployment Checklist
```powershell
# Build and test
pnpm build              # Build all services
pnpm test               # Run all tests
pnpm lint               # Check code quality

# Environment check
# Verify all .env.production files
# Test database connections
# Validate API endpoints
```

### Deployment Options
- **Vercel**: Frontend deployment
- **Railway**: Backend + Database
- **Docker**: Full containerized deployment
- **Firebase**: Authentication & hosting

## 📈 Performance Optimization

### Development Performance
- **Fast Refresh**: Instant React updates
- **TypeScript**: Incremental compilation
- **File Watching**: Optimized for large codebases
- **Caching**: Turbo for build caching

### Production Performance
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js built-in
- **API Caching**: Redis integration ready
- **CDN**: Vercel/Cloudflare integration

## 🎯 Next Steps

1. **Run Setup**: Execute `./dev-setup.ps1`
2. **Configure Environment**: Edit `.env` files with your keys
3. **Start Development**: Use "Start All Services" task
4. **Test Features**: Visit http://localhost:3000
5. **Explore Codebase**: Use file navigation and search

## 📞 Troubleshooting

### Common Issues
- **Port Conflicts**: Check if ports 3000, 4000, 8000 are free
- **Python Environment**: Ensure virtual environments are activated
- **Database**: Verify PostgreSQL connection string
- **Firebase**: Check Firebase configuration keys

### Debug Commands
```powershell
# Check service status
Get-Process node, python    # Running processes
netstat -an | findstr "3000 4000 8000"  # Port usage

# Reset environment
pnpm clean                  # Clean node_modules
./dev-setup.ps1 -Force     # Rebuild everything
```

---

**Happy coding! 🎉** Your development environment is now optimized for maximum productivity.
