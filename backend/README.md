# Backend API

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/habit_tracker"

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Redis (optional)
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Habits
- `GET /api/habits` - Get all user habits
- `POST /api/habits` - Create new habit
- `GET /api/habits/:id` - Get specific habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit

### Tracking
- `POST /api/tracking` - Log habit completion
- `GET /api/tracking/:habitId` - Get tracking history
- `DELETE /api/tracking/:id` - Remove tracking entry

### Analytics
- `GET /api/analytics/overview` - Get dashboard overview
- `GET /api/analytics/habits/:id/stats` - Get habit statistics
- `GET /api/analytics/trends` - Get trend analysis

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```
