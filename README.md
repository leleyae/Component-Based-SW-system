# Helena Beruke — Designer Platform

A Turborepo monorepo where each service runs independently and communicates through well-defined HTTP/REST APIs.

---

## System Architecture

```mermaid
graph TD
    subgraph Browser
        Client["Browser / Client"]
    end

    subgraph "apps/designer-portal (Next.js :3001)"
        Portal["designer-portal\nNext.js App Router"]
    end

    subgraph "apps/designer-api (FastAPI :8000)"
        API["designer-api\nFastAPI"]
        Router["routers/designer_router.py"]
        Controller["controllers/designer_controller.py"]
        Models["models/ — designer.py · approval.py"]
        Chappa["services/chappa_service.py"]
    end

    subgraph "packages/ui-shared (compile-time)"
        UIShared["@repo/ui-shared\nReact Components"]
    end

    subgraph "Future Independent Services"
        Auth["Auth Service (independent)"]
        AIRec["AI Recommendation (independent)"]
    end

    DB[("PostgreSQL")]

    Client -->|HTTP| Portal
    Portal -->|"HTTP REST — http://localhost:8000"| API
    Portal -.->|"compile-time import (workspace:*)"| UIShared
    API --> Router --> Controller --> Models
    Controller --> Chappa
    Controller --> DB
    API -.->|future HTTP/REST| Auth
    API -.->|future HTTP/REST| AIRec
```

### How the three parts communicate

| Connection | Type | Detail |
|---|---|---|
| `designer-portal` → `designer-api` | HTTP/REST at runtime | Base URL: `http://localhost:8000` (set via `NEXT_PUBLIC_API_URL`) |
| `designer-portal` → `@repo/ui-shared` | Compile-time import | Resolved by pnpm workspace, compiled inline by Next.js `transpilePackages` |
| `designer-api` → PostgreSQL | TCP | Connection string via `DATABASE_URL` env var |

Each backend component owns its own entry point, routes, controllers, models, and data store. They never share in-process state — all cross-service data exchange goes through HTTP/REST.

---

## Monorepo Structure

```
.
├── apps/
│   ├── designer-api/        # FastAPI backend service (port 8000)
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── requirements.txt
│   │   ├── package.json     # dev: uvicorn main:app --reload --port 8000
│   │   ├── routers/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── services/
│   └── designer-portal/     # Next.js frontend service (port 3001)
│       ├── app/
│       ├── lib/api.ts
│       ├── next.config.js
│       └── package.json     # dev: next dev --port 3001
├── packages/
│   ├── ui-shared/           # Shared React component library
│   │   └── src/Button.tsx
│   ├── typescript-config/   # Shared TS configs
│   └── eslint-config/       # Shared ESLint configs
├── package.json             # Root — turbo run dev/build/lint
├── pnpm-workspace.yaml
└── turbo.json
```

---

## API Contracts

### Designer Endpoints (`apps/designer-api`)

| Method | Path | Request Body | Response |
|---|---|---|---|
| `POST` | `/designers` | `{ name, style, email, bio?, portfolio_url? }` | `201 DesignerResponse` |
| `GET` | `/designers` | — | `200 DesignerResponse[]` |
| `GET` | `/designers/{id}` | — | `200 DesignerResponse` or `404` |
| `PUT` | `/designers/{id}` | `{ name?, style?, email?, bio?, portfolio_url? }` | `200 DesignerResponse` or `404` |
| `DELETE` | `/designers/{id}` | — | `204` or `404` |

**Error codes:** `422` invalid input · `404` not found · `409` duplicate email

### Health Check

```
GET /health → { "status": "ok" }
```

---

## Environment Variables

**`apps/designer-api/.env`**
```
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/designer_db
```

**`apps/designer-portal/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18, pnpm 9
- Python ≥ 3.11
- PostgreSQL running locally

### 1. Install JS dependencies
```bash
pnpm install
```

### 2. Install Python dependencies
```bash
pip install -r apps/designer-api/requirements.txt
```

### 3. Configure environment variables
```bash
# apps/designer-api/.env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/designer_db

# apps/designer-portal/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Run database migrations
```bash
cd apps/designer-api
alembic upgrade head
```

### 5. Start all services (via Turborepo)
```bash
pnpm dev
# or
turbo run dev
```

This starts in parallel:
- `designer-api` → `uvicorn main:app --reload --port 8000`
- `designer-portal` → `next dev --port 3001`
- `ui-shared` → `tsc --watch --noEmit`

### Start services individually
```bash
# Backend
cd apps/designer-api
uvicorn main:app --reload --port 8000

# Frontend
cd apps/designer-portal
npm run dev
```

## Final Project Status: Deployment Ready

# Final System Launch - May 2

The AI Interior Design Recommender is now fully functional with marketplace features and designer matching logic.
