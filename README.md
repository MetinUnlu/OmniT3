# TemplateStack

A lightweight T3 Stack project for building modern web applications using Next.js, tRPC, Prisma, and Tailwind CSS.

---

## Quick start ⚡

Prerequisites: Docker, Node.js, and a package manager (pnpm, npm, or yarn).

- Start development with Docker Compose (recommended):

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Stop containers:

```bash
docker compose -f docker-compose.dev.yml down
```

---

## Tech stack 📦

| Layer      | Technology                          | Purpose                                              |
|------------|-------------------------------------|------------------------------------------------------|
| Frontend   | Next.js 15 (App Router)             | UI framework with server components                  |
| Styling    | Tailwind CSS, Mantine v8, @tabler/icons-react | Design system and utilities                          |
| API        | tRPC                                | Typesafe, lightweight APIs                           |
| Auth       | BetterAuth                          | Session handling and social logins                   |
| Database   | PostgreSQL + Prisma                 | Production-ready relational DB with type-safe ORM    |
| Real-time  | Socket.io (planned)                 | Real-time features (chat, notifications, etc.)       |
| Async jobs | BullMQ + Redis (planned)            | Background jobs (emails, processing, etc.)           |


## Database

This project uses PostgreSQL with Prisma as the ORM. Docker Compose creates and manages the database by default in development.

To inspect the database locally with Prisma Studio (PowerShell):

```powershell
$env:DATABASE_URL = "postgresql://postgres:password@localhost:5432/templatestack"; npx prisma studio
```

## Database Migration

Docker Compose manages the database and migrations by default. If you need to run Prisma commands locally (optional), temporarily point DATABASE_URL to your local Postgres, run the migration, then restore the Docker URL.

1. Update `.env` to use localhost:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/templatestack"
# DATABASE_URL="postgresql://postgres:password@db:5432/templatestack"
```

2. Run the migration:
```bash
npx prisma migrate dev --name add_multi_tenant_system
```

3. Revert `.env` for Docker:
```env
# DATABASE_URL="postgresql://postgres:password@localhost:5432/templatestack"
DATABASE_URL="postgresql://postgres:password@db:5432/templatestack"
```

Note: This workflow is optional — Docker Compose handles the database in development.




# T3 STACK NOTES:
# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
