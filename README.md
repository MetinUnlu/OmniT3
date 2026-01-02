# OmniT3 

A robust, enterprise-ready T3 Stack implementation featuring multi-tenancy, role-based access control (RBAC), and containerized deployment workflows. Built with Next.js, tRPC, Prisma, and Tailwind CSS and Mantine UI.

## Key Features ✨

- **Multi-Tenant System:** Built-in support for multiple organizations/companies.
- **Role-Based Access Control (RBAC):**
  - **Super User:** System-wide administration.
  - **Admin:** Company-level management.
  - **Member:** Standard user access.
- **Advanced Auth:** Powered by BetterAuth with social login support and session management.
- **Secure Tooling:** Prisma Studio deployed behind a protected Nginx reverse proxy (Basic Auth).
- **Dockerized Workflow:**
  - **Development:** Fast startup, hot-reloading (HMR), and file watching.
  - **Production:** Optimized Dockerfile with multi-stage builds.

---

## Quick Start ⚡

### 1. Prerequisites
- Docker & Docker Compose
- Node.js & npm/pnpm/yarn

### 2. Run Locally
The easiest way to start is using the dev-optimized Docker setup:

```bash
# Clone the repo
git clone https://github.com/yourusername/omnit3.git
cd omnit3

# Start development server
docker compose -f docker-compose.dev.yml up --build
```

- **App:** [http://localhost:3000](http://localhost:3000)
- **Prisma Studio:** [http://localhost:5555](http://localhost:5555)

### 3. Documentation
For detailed guides, check the documentation files:

- 🛠️ [**Development Guide**](./development.md) - Local setup, database management, and debugging.
- 🚀 [**Deployment Guide**](./deployment.md) - Production build, Nginx protection, and environment configuration.

---

## Tech Stack 📦

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15 (App Router) | React Framework |
| **Styling** | Tailwind CSS V4, Mantine UI | Utility-first CSS |
| **API** | tRPC | End-to-end typesafe APIs |
| **Database** | PostgreSQL + Prisma | Relational Data & ORM |
| **Auth** | BetterAuth | Authentication & Sessions |
| **Infra** | Docker & Nginx | Containerization & Proxy |

## License

This project is open source and available under the [MIT License](LICENSE).
