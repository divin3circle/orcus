# Orcus Backend Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Git installed
- Access via SSH

## Deployment Steps

### 1. Clone Repository on Server

```bash
git clone <your-repo-url>
cd orcus/backend
```

### 2. Create Environment Variables

Create a `.env` file:

```bash
cat > .env << EOF
# Database Configuration


# Hiero Testnet Configuration


# Stablecoin Configuration

EOF
```

### 3. Build and Start Services

```bash
# Build and start in detached mode
sudo docker compose -f sudo docker compose.prod.yml up -d --build

# View logs
sudo docker compose -f sudo docker compose.prod.yml logs -f
```

### 4. Verify Deployment

```bash
# Check running containers
docker ps

# Check backend health
curl http://localhost:8080/health  # Adjust endpoint as needed

# Check database connection
docker exec -it orcusDB psql -U orcus_user -d orcus_prod
```

## Management Commands

### Stop Services

```bash
sudo docker compose -f sudo docker compose.prod.yml down
```

### View Logs

```bash
# All services
sudo docker compose -f sudo docker compose.prod.yml logs -f

# Specific service
sudo docker compose -f sudo docker compose.prod.yml logs -f backend
```

### Restart Services

```bash
sudo docker compose -f sudo docker compose.prod.yml restart
```

### Update Deployment

```bash
git pull
sudo docker compose -f sudo docker compose.prod.yml up -d --build
```

### Container Health

```bash
sudo docker compose -f sudo docker compose.prod.yml ps
```
