# Habit Tracker

A comprehensive full-stack habit tracking application with analytics, insights, and visualization. **Fully containerized with Docker for easy development and deployment.**

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd habit-tracker

# Start the entire application with one command
docker-compose -f docker-compose.dev.yml up

# Or use the helper script (auto-follows logs)
./start.sh
```

That's it! No Node.js, PostgreSQL, or other dependencies needed locally.

**Access the application:**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Health**: http://localhost:8080/health
- **Database**: PostgreSQL on localhost:5432

**Test Credentials:**

- Email: `test@example.com`
- Password: `password123`

> 📖 **For detailed development instructions and all commands, see [DEVELOPMENT.md](DEVELOPMENT.md)**  
> 📝 **For logging and debugging, see [.github/LOGGING_GUIDE.md](.github/LOGGING_GUIDE.md)**

## ✨ Features

- **Habit Management**: Create, edit, delete, and organize personal habits
- **Tracking**: Daily check-ins and progress tracking
- **Analytics**: Detailed insights and statistics about habit performance
- **Visualizations**: Charts and graphs showing trends and patterns
- **Streaks**: Track consecutive days of habit completion
- **Categories**: Organize habits by custom categories
- **Goals**: Set and track habit-related goals

## Tech Stack

### Backend

- Node.js 20 with Express
- TypeScript
- PostgreSQL 16 (with Prisma ORM)
- JWT Authentication

### Frontend

- React 18
- TypeScript
- Tailwind CSS
- Recharts (for visualizations)
- React Query (data fetching)
- Zustand (state management)

### Infrastructure

- Docker & Docker Compose
- Nginx (production frontend)
- Multi-stage builds for optimization

## Project Structure

```
habit-tracker/
├── backend/              # API server (Express + Prisma)
│   ├── src/             # Source code
│   ├── prisma/          # Database schema & migrations
│   ├── Dockerfile       # Production image
│   └── Dockerfile.dev   # Development image
├── frontend/            # React application
│   ├── src/            # Source code
│   ├── Dockerfile      # Production image (Nginx)
│   └── Dockerfile.dev  # Development image
├── shared/             # Shared TypeScript types
├── docs/               # Documentation
├── docker-compose.yml  # Production setup
└── docker-compose.dev.yml # Development setup
```

## 📋 Development Guide

### Prerequisites

- Docker Desktop (macOS/Windows) or Docker Engine + Docker Compose (Linux)

### Environment Setup

All services run in Docker - no local Node.js or PostgreSQL needed!

```bash
# Development mode (hot reload enabled)
docker-compose -f docker-compose.dev.yml up

# Or use the interactive script
./start.sh

# Detached mode (runs in background)
docker-compose -f docker-compose.dev.yml up -d
```

### Common Commands

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml up --build

# Database operations
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev --name <name>
docker-compose -f docker-compose.dev.yml exec backend npx prisma studio
docker-compose -f docker-compose.dev.yml exec backend npx ts-node prisma/seed.ts

# Access database directly
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d habit_tracker
```

### Development Workflow

1. **Start containers**: `docker-compose -f docker-compose.dev.yml up`
2. **Access frontend**: http://localhost:3000
3. **Test API**: http://localhost:8080/health
4. **Make changes**: Files auto-reload via volume mounts
5. **Run migrations**: After schema changes, run `prisma migrate dev`
6. **View database**: Use Prisma Studio or psql

### Port Configuration

- Frontend: 3000
- Backend: 8080 (mapped from container port 5000)
- PostgreSQL: 5432

### Troubleshooting

**Port conflicts:**

```bash
# Free up ports if needed
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
lsof -ti:5432 | xargs kill -9
```

**Database issues:**

```bash
# Reset database
docker-compose -f docker-compose.dev.yml exec backend npm run db:reset
docker-compose -f docker-compose.dev.yml exec backend npx ts-node prisma/seed.ts
```

**Container issues:**

```bash
# Complete reset
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build
```

## 🚀 Deployment

### Production Build

```bash
# Build optimized images
docker-compose build

# Start production stack
docker-compose up -d
```

### Deployment Platforms

**Cloud Platforms (Recommended):**

- Railway, Render, Fly.io - Direct Docker deployment from Git
- DigitalOcean App Platform - Container support
- AWS ECS/Fargate, GCP Cloud Run - Container orchestration

**VPS/Self-Hosted:**

```bash
# On your server
git clone <repo>
cd habit-tracker
docker-compose up -d

# Set production environment variables
# Configure reverse proxy (Nginx/Caddy) for SSL
```

### Environment Variables

Production requires:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong random secret
- `CORS_ORIGIN` - Frontend URL
- `REACT_APP_API_URL` - Backend API URL

## 📚 API Documentation

### Authentication

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret","name":"User"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'
```

### API Endpoints

Base URL: `http://localhost:8080/api`

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user (requires auth)
- `GET /habits` - List user's habits
- `POST /habits` - Create new habit
- `GET /habits/:id` - Get habit details
- `PUT /habits/:id` - Update habit
- `DELETE /habits/:id` - Delete habit
- `POST /tracking/log` - Log habit completion
- `GET /tracking/history` - View tracking history
- `GET /analytics/overview` - Dashboard analytics

Full API examples in `docs/API_EXAMPLES.json`

## 🤖 AI Integration (Planned)

This project is architected for future AI capabilities:

- **Habit Recommendations**: ML-based suggestions
- **Pattern Recognition**: Identify success factors
- **Insights Generation**: Natural language summaries
- **Predictive Analytics**: Success probability forecasting
- **Smart Reminders**: Context-aware notifications

Modular design allows easy addition of AI services as separate containers.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in Docker environment
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with modern web technologies and best practices for containerized deployment.

## Documentation

- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Complete Docker guide
- [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) - Architecture details
- [docs/SETUP.md](docs/SETUP.md) - Local development (non-Docker)
- [docs/API_EXAMPLES.json](docs/API_EXAMPLES.json) - API examples

## License

MIT
