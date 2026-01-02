# Local Development Guide 🛠️

This guide covers how to set up and run the project locally using Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- Node.js (v18+ recommended)
- npm, pnpm, or yarn

## Quick Start (Docker)

The recommended way to run the application locally is using the development docker-compose file. This setup includes hot-reloading (HMR), a PostgreSQL database, and Redis.

```bash
# Start the development environment
docker compose -f docker-compose.dev.yml up --build

# Stop the environment
docker compose -f docker-compose.dev.yml down
```

### Features Enabled in Dev Mode:
- **Hot Reloading:** Source code (`src/` directory) is mounted into the container, so changes update immediately.
- **Database Persistence:** Postgres data is persisted in a docker volume `postgres_data_dev`.
- **Prisma Studio:** An instance of Prisma Studio runs automatically on port `5555`.

## Access Points

- **Web App:** [http://localhost:3000](http://localhost:3000)
- **Prisma Studio (Docker):** [http://localhost:5555](http://localhost:5555)
- **Postgres Database:** `localhost:5432`

## Database Management

### Connecting to the Database

- **Inside Docker:** The app connects to `db:5432`.
- **From Host (Your Machine):** You can connect to `localhost:5432` using a GUI tool (DataGrip, pgAdmin) or local CLI tools.

### Running Prisma Commands

Since the database runs inside Docker, you have two options for running schema migrations or generating clients:

#### Option 1: Run Inside Docker (Recommended for Consistency)
Execute commands within the running app container:

```bash
docker compose -f docker-compose.dev.yml exec app npx prisma migrate dev
docker compose -f docker-compose.dev.yml exec app npx prisma db push
```

#### Option 2: Run Locally (Requires Env Adjustment)
If you want to run `npx prisma ...` from your local terminal, you must point the `DATABASE_URL` to localhost.

1. Updates `.env`:
   ```env
   # .env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/omnit3"
   ```
2. Run your command:
   ```bash
   npx prisma migrate dev
   ```
3. **Important:** Revert `.env` back to `db:5432` if you plan to restart the docker container, although the `docker-compose.dev.yml` overrides this env var for the container anyway.

## Troubleshooting

### "P1001: Can't reach database server"
This usually means you are trying to run a local command (like `npx prisma db push`) using the Docker internal hostname (`db`) instead of `localhost`.
- **Fix:** Update your local `.env` file to use `localhost:5432` for the `DATABASE_URL`, or use the "Run Inside Docker" method above.

### Changes not reflecting?
- Ensure the volume mounts in `docker-compose.dev.yml` are correct.
- If you installed a new package, you might need to rebuild the container:
  ```bash
  docker compose -f docker-compose.dev.yml up --build
  ```
