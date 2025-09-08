# Investment Tools Hub Web Portal

This is the monorepo for the Investment Tools Hub web portal, built with Next.js, Tailwind CSS, Node.js, and Python. It features Firebase Authentication, role-based access, Dockerization, and AWS-ready deployment. See below for setup and structure.

## Project Structure

```
frontend/         # Next.js + Tailwind CSS frontend
backend/          # Node.js API backend
python-engine/    # Python microservices/engines
packages/         # Shared code (types, UI, utils)
```

## Features
- Next.js (frontend, SSR, API routes)
- Tailwind CSS (responsive, mobile-first)
- Firebase Auth (email/password, OAuth, RBAC)
- JWT-secured API access
- Dockerized (frontend & backend)
- AWS-ready (ECS/EKS/Amplify)
- Google Analytics & SEO
- AI Behavioral Nudge Chat Widget
- Stripe payments & newsletter (optional)
- CI/CD (GitHub Actions or AWS CodePipeline)

## Quickstart

```sh
# Prerequisites: Node.js >=18, Docker, Python 3.10+
cp .env.example .env
# Start local dev
cd frontend && npm install && npm run dev
# For full stack:
docker-compose up --build
```

See full documentation in each subfolder and below.

---

## Environment Variables
- All secrets/config in `.env` (see `.env.example`)

## Deployment
- Dockerfiles provided for each service
- docker-compose for local dev
- See `/infra` for AWS deployment templates (coming soon)

## Testing
- Jest (frontend/backend)
- Example tests in `/tests`

## Contact
Kevin Ringler <beginnerinvestorhub@gmail.com>
