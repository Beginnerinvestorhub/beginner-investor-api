# Beginner Investor Hub

## Project Structure

```
beginnerinvestorhub/
├── .vscode/                 # VS Code workspace settings
│   └── settings.json        # Editor configuration and theming
│
├── docs/                    # Project documentation
│   └── PERFORMANCE-OPTIMIZATION.md
│
├── frontend/                # Next.js frontend application
│   ├── components/          # React components
│   ├── pages/               # Next.js pages
│   ├── public/              # Static assets
│   ├── styles/              # Global styles
│   ├── next.config.js       # Next.js configuration
│   └── package.json         # Frontend dependencies
│
├── monitoring/              # Monitoring and observability
│   ├── alertmanager/        # Alert manager configuration
│   ├── grafana/             # Grafana dashboards
│   ├── prometheus/          # Prometheus configuration
│   └── docker-compose.yml   # Monitoring stack
│
├── scripts/                 # Utility scripts
│   ├── security-audit.js    # Security auditing
│   ├── setup-cicd-env.sh    # CI/CD setup
│   └── setup-monitoring.sh  # Monitoring setup
│
├── tools-restructured/      # Main application code
│   ├── frontend/            # Shared frontend components
│   ├── infrastructure/      # Infrastructure as Code
│   └── services/            # Backend services
│       ├── ai_microservice/  # AI/ML services
│       └── backend-api/      # Main API service
│
├── .github/                 # GitHub configurations
│   └── workflows/           # CI/CD workflows
│
├── .gitignore               # Git ignore rules
├── DEPLOYMENT.md            # Deployment instructions
├── dev-setup.ps1            # Development environment setup
├── migrate.sh               # Database migration script
└── package.json             # Root project dependencies
```
