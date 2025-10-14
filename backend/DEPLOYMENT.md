# Orcus Backend Deployment Guide

## Prerequisites

- Docker and Docker Compose installed on your home server
- Git installed
- Access to your home server via SSH

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
POSTGRES_DB=orcus_prod
POSTGRES_USER=orcus_user
POSTGRES_PASSWORD=your_secure_password_here

# Hiero Testnet Configuration
OPERATOR_ACCOUNT_ID=your_hiero_account_id
OPERATOR_KEY=your_hiero_private_key
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

### Stop and Remove Data (CAUTION!)

```bash
sudo docker compose -f sudo docker compose.prod.yml down -v
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

## Database Backups

### Create Backup

```bash
docker exec orcusDB pg_dump -U orcus_user orcus_prod > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Backup

```bash
cat backup.sql | docker exec -i orcusDB psql -U orcus_user -d orcus_prod
```

## Monitoring

### Resource Usage

```bash
docker stats
```

### Container Health

```bash
sudo docker compose -f sudo docker compose.prod.yml ps
```

## Troubleshooting

### Database Won't Start

- Check disk space: `df -h`
- Check logs: `docker logs orcusDB`
- Verify volume permissions

### Backend Can't Connect to Database

- Ensure database is healthy: `docker ps`
- Check network: `docker network inspect orcus-network`
- Verify environment variables: `docker exec orcusBackend env`

### Port Already in Use

Change ports in `sudo docker compose.prod.yml`:

```yaml
ports:
  - "8081:8080" # Changed from 8080:8080
```

## Security Recommendations

1. **Change default passwords** in `.env`
2. **Use firewall rules** to restrict database port access
3. **Enable SSL/TLS** for production
4. **Regular backups** - Set up automated backup cron jobs
5. **Update regularly** - Keep Docker images up to date
6. **Consider reverse proxy** - Use Nginx/Caddy for HTTPS

## Optional: Nginx Reverse Proxy

If you want to add HTTPS and a domain:

```yaml
# Add to sudo docker compose.prod.yml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
    - ./ssl:/etc/nginx/ssl:ro
  depends_on:
    - backend
  restart: unless-stopped
  networks:
    - orcus-network
```
