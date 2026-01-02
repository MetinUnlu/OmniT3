# Deployment Guide

This project is designed to be containerized and deployed easily using Docker and Nginx.

## Production Stack

- **App:** Next.js application (standalone build)
- **Database:** PostgreSQL
- **Cache:** Redis
- **Tooling:** Nginx (Reverse Proxy) & Prisma Studio (Database GUI)

## Environment Setup

Create a production `.env` file (or set these variables in your CI/CD or hosting provider):

```env
# Database
DATABASE_URL="postgresql://postgres:password@db:5432/omnit3"

# Auth (BetterAuth)
BETTER_AUTH_SECRET="your-secure-random-secret"
BETTER_AUTH_URL="https://yourdomain.com" # or http://localhost:3000 for local prod testing

# Super User (Initial Admin)
SUPER_USER_EMAIL="admin@example.com"
SUPER_USER_PASSWORD="secure_password"

# Prisma Studio Protection (Nginx)
STUDIO_USERNAME="admin"
STUDIO_PASSWORD="studio_password"
```

## Running with Docker Compose

The `docker-compose.yml` file is configured for production-like usage.

### 1. Build and Start Application
This starts the main application, database, and redis.

```bash
docker compose up -d --build
```

The app will be available at port `3000`.

### 2. Monitoring & Tools (Prisma Studio)
For security, Prisma Studio is hidden behind an Nginx reverse proxy with Basic Authentication. It is defined in a separate profile called `tools`.

To start the protected Prisma Studio:

```bash
docker compose --profile tools up -d --build
```

- **URL:** [http://localhost:8080](http://localhost:8080) (or your server IP:8080)
- **Credentials:** The values you set for `STUDIO_USERNAME` and `STUDIO_PASSWORD`.

### How it works:
1. **Nginx** container starts and generates an `.htpasswd` file using the provided environment variables.
2. It proxies traffic from port 8080 to the internal **Prisma Studio** container on port 5555.
3. Access is restricted to users with valid credentials.

## Deployment Checklist

1. **Security:**
   - Change all default passwords in `.env`.
   - Ensure `BETTER_AUTH_SECRET` is a long, random string.
   - Using a reverse proxy (like separate Nginx, Traefik, or Cloudflare) in front of port 3000 for SSL termination is recommended.

2. **Database Migrations:**
   Run migrations against the production database container:
   ```bash
   docker compose exec app npx prisma migrate deploy
   ```

3. **Persistence:**
   - Database data is stored in the `postgres_data` volume.
   - Redis data is stored in the `redis_data` volume.
   Ensure you have a backup strategy for these volumes.
