# 📝 Logging Quick Reference

## Starting with Logs

### Automatic Logs (Recommended)

```bash
# Starts containers and automatically follows logs
./start.sh
# OR
make up
```

### Manual Start + Logs

```bash
# Start in background
docker-compose -f docker-compose.dev.yml up -d

# Then view logs
docker-compose -f docker-compose.dev.yml logs -f backend frontend
```

## Viewing Logs

### Development (Backend + Frontend Only)

```bash
# Best for active development
docker-compose -f docker-compose.dev.yml logs -f backend frontend

# Using makefile shortcut
make logs
```

### All Services (Including Database)

```bash
docker-compose -f docker-compose.dev.yml logs -f

# Using makefile shortcut
make logs-all
```

### Individual Services

```bash
# Backend only
make logs-backend
# OR
docker-compose -f docker-compose.dev.yml logs -f backend

# Frontend only
make logs-frontend
# OR
docker-compose -f docker-compose.dev.yml logs -f frontend

# Database only
make logs-db
# OR
docker-compose -f docker-compose.dev.yml logs -f postgres
```

## Log Options

### Follow Logs in Real-Time

```bash
# -f flag follows logs (like tail -f)
docker-compose -f docker-compose.dev.yml logs -f backend
```

### View Last N Lines

```bash
# Show last 50 lines
docker-compose -f docker-compose.dev.yml logs --tail=50 backend

# Show last 100 lines from multiple services
docker-compose -f docker-compose.dev.yml logs --tail=100 backend frontend
```

### Static Snapshot (No Follow)

```bash
# View logs without following
docker-compose -f docker-compose.dev.yml logs backend
```

### Filter by Time

```bash
# Show logs since timestamp
docker-compose -f docker-compose.dev.yml logs --since=2024-01-29T10:00:00 backend

# Show logs from last hour
docker-compose -f docker-compose.dev.yml logs --since=1h backend
```

### Search Logs

```bash
# Search for specific text in logs
docker-compose -f docker-compose.dev.yml logs backend | grep "error"
docker-compose -f docker-compose.dev.yml logs backend | grep -i "prisma"
```

## Common Patterns

### Development Flow

```bash
# 1. Start with logs (one terminal)
./start.sh

# 2. Watch specific service (another terminal if needed)
make logs-backend

# 3. Exit logs: Ctrl+C (services keep running in background)

# 4. Resume watching logs
make logs
```

### Debugging

```bash
# Watch backend logs for errors
docker-compose -f docker-compose.dev.yml logs -f backend | grep -i "error"

# Check startup issues
docker-compose -f docker-compose.dev.yml logs --tail=100 backend frontend

# View database connection logs
docker-compose -f docker-compose.dev.yml logs postgres | grep "connection"
```

### Performance Monitoring

```bash
# Watch all logs with timestamps
docker-compose -f docker-compose.dev.yml logs -f --timestamps

# Monitor container resource usage (separate command)
docker stats
```

## Log Locations Inside Containers

### Backend Logs

- Stdout: All console.log() statements
- Location inside container: `/app/` (no file logging by default)

### Frontend Logs

- Stdout: Webpack compilation logs
- Location inside container: `/app/` (no file logging by default)

### Database Logs

- Stdout: PostgreSQL query logs (if enabled)
- Location inside container: `/var/lib/postgresql/data/log/`

## Tips

1. **Best for Development**: Use `./start.sh` or `make up` - automatically follows logs
2. **Background Work**: Use `docker-compose up -d` then view logs separately
3. **Multiple Terminals**: One for logs, one for commands
4. **Log Filtering**: Use grep, tail, head to find what you need
5. **Exit Logs**: Press `Ctrl+C` - containers keep running
6. **Stop Everything**: `docker-compose -f docker-compose.dev.yml down`

## Makefile Shortcuts

```bash
make up             # Start + follow backend/frontend logs
make logs           # Follow backend/frontend logs
make logs-all       # Follow all service logs
make logs-backend   # Follow backend only
make logs-frontend  # Follow frontend only
make logs-db        # Follow database only
make down           # Stop all services
```
