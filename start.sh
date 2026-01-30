#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Habit Tracker - Docker Setup${NC}\n"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker Desktop and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Check if containers are already running
if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Containers are already running${NC}"
    echo ""
    echo "Options:"
    echo "  1) Restart containers"
    echo "  2) Stop containers"
    echo "  3) View logs"
    echo "  4) Rebuild and restart"
    echo "  5) Exit"
    read -p "Choose option (1-5): " choice
    
    case $choice in
        1)
            echo -e "${BLUE}Restarting containers...${NC}"
            docker-compose -f docker-compose.dev.yml restart
            ;;
        2)
            echo -e "${BLUE}Stopping containers...${NC}"
            docker-compose -f docker-compose.dev.yml down
            exit 0
            ;;
        3)
            docker-compose -f docker-compose.dev.yml logs -f
            exit 0
            ;;
        4)
            echo -e "${BLUE}Rebuilding and restarting...${NC}"
            docker-compose -f docker-compose.dev.yml down
            docker-compose -f docker-compose.dev.yml up --build -d
            ;;
        5)
            exit 0
            ;;
        *)
            echo "Invalid option"
            exit 1
            ;;
    esac
else
    echo -e "${BLUE}Starting containers in development mode...${NC}\n"
    docker-compose -f docker-compose.dev.yml up -d
fi

# Wait for services to be healthy
echo -e "\n${BLUE}Waiting for services to start...${NC}"
sleep 5

# Check service status
echo -e "\n${GREEN}Service Status:${NC}"
docker-compose -f docker-compose.dev.yml ps

echo -e "\n${GREEN}✓ Application started successfully in DEV mode!${NC}\n"
echo -e "${BLUE}Access Points:${NC}"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8080"
echo "  Health:    http://localhost:8080/health"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  Stop services:    docker-compose -f docker-compose.dev.yml down"
echo "  Restart:          docker-compose -f docker-compose.dev.yml restart"
echo "  Database GUI:     docker-compose -f docker-compose.dev.yml exec backend npx prisma studio"
echo ""
echo -e "${YELLOW}Following logs... (Press Ctrl+C to exit)${NC}\n"

# Follow logs for both backend and frontend
docker-compose -f docker-compose.dev.yml logs -f backend frontend
