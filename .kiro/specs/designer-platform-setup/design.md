# Design Document: Designer Platform Setup

## Overview

This document describes the technical design for the Designer Platform within a Turborepo monorepo. The feature introduces three workspace members:

- **`apps/designer-api`** — A FastAPI (Python) backend service exposing REST endpoints for designer profile management, approval workflows, and commission calculation via Chappa.
- **`apps/designer-portal`** — A Next.js frontend application (port 3001) that consumes `designer-api` over HTTP and renders the designer-facing UI.
- **`packages/ui-shared`** — A shared React component library consumed by `designer-portal` at compile time via pnpm workspace resolution.

All three members integrate into the existing Turborepo `dev` pipeline without changes to `turbo.json` or `pnpm-workspace.yaml`. The design follows the **Component Independence** principle: each backend service owns its own entry point, routes, controllers, models, and data store, communicating with other services exclusively through HTTP/REST.

---

## Architecture

### High-Level System Diagram

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

### Component Independence Principle

| Component | Entry Point | Port | Runtime Dependencies |
|---|---|---|---|
| `designer-api` | `main.py` | 8000 | PostgreSQL only |
| Auth (future) | `main.py` | 8001 | Database only |
| AI Recommendation (future) | `main.py` | 8002 | `designer-api` via HTTP |

---

## Components and Interfaces

### `apps/designer-api` — FastAPI Backend

#### Directory Structure

```
apps/designer-api/
├── main.py                          # FastAPI app instance, router registration, health check
├── database.py                      # SQLAlchemy async engine, session factory, Base
├── requirements.txt                 # Python dependencies
├── package.json                     # name: "designer-api", dev script for Turborepo
├── .env                             # DATABASE_URL (gitignored)
├── routers/
│   └── designer_router.py
├── controllers/
│   └── designer_controller.py
├── models/
│   ├── designer.py                  # DesignerCreate, DesignerUpdate, DesignerResponse
│   └── approval.py                  # ApprovalState, ApprovalRequest, ApprovalDecision
└── services/
    └── chappa_service.py            # calculate_commission()
```

#### Pydantic Models — `models/designer.py`

```python
class DesignerCreate(BaseModel):
    name: str
    style: str        # e.g. "Interior Style", "Graphic Design"
    email: EmailStr
    bio: Optional[str] = None
    portfolio_url: Optional[str] = None

class DesignerUpdate(BaseModel):
    name: Optional[str] = None
    style: Optional[str] = None
    email: Optional[EmailStr] = None
    bio: Optional[str] = None
    portfolio_url: Optional[str] = None

class DesignerResponse(BaseModel):
    id: UUID
    name: str
    style: str
    email: str
    bio: Optional[str] = None
    portfolio_url: Optional[str] = None
```

#### Pydantic Models — `models/approval.py`

```python
class ApprovalState(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class ApprovalRequest(BaseModel):
    designer_id: UUID
    notes: str = ""

class ApprovalDecision(BaseModel):
    designer_id: UUID
    decision: ApprovalState
    reviewer_notes: str = ""
```

#### Chappa Service — `services/chappa_service.py`

```python
PLATFORM_COMMISSION_RATE = Decimal("0.20")

def calculate_commission(gross_amount: Decimal) -> dict:
    platform_commission = (gross_amount * PLATFORM_COMMISSION_RATE).quantize(Decimal("0.01"))
    designer_payout = gross_amount - platform_commission  # derived to preserve sum invariant
    return {"gross_amount": gross_amount, "designer_payout": designer_payout, "platform_commission": platform_commission}
```

**Design decision**: `designer_payout = gross - commission` (not `gross * 0.80`) guarantees the sum invariant holds exactly under decimal rounding.

---

### `apps/designer-portal` — Next.js Frontend

- Port: **3001** (avoids conflict with other apps on 3000)
- `next.config.js` uses `transpilePackages: ["@repo/ui-shared"]` — required because `ui-shared` ships `.tsx` source
- `lib/api.ts` reads `NEXT_PUBLIC_API_URL ?? "http://localhost:8000"` for all API calls
- `tsconfig.json` extends `@repo/typescript-config/nextjs.json`

---

### `packages/ui-shared` — Shared React Component Library

- `exports: { "./*": "./src/*.tsx" }` — source-level resolution, no build step needed
- `dev` script: `tsc --watch --noEmit`
- `designer-portal` compiles it inline via `transpilePackages`

---

## Data Models

### Designer Profile

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID | auto | Generated on creation |
| `name` | string | yes | Designer's full name |
| `style` | string | yes | e.g. "Interior Style", "Graphic Design" |
| `email` | string (email) | yes | Unique, validated by Pydantic `EmailStr` |
| `bio` | string | no | Free-text biography |
| `portfolio_url` | string | no | URL to portfolio |

### Approval Record

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID | auto | Generated on creation |
| `designer_id` | UUID | yes | Foreign key to Designer |
| `state` | ApprovalState enum | auto | Always initialized to `pending` |
| `notes` | string | no | Reviewer notes |
| `created_at` | datetime | auto | Set on creation |

### Commission Calculation

| Field | Type | Notes |
|---|---|---|
| `gross_amount` | Decimal | Input |
| `designer_payout` | Decimal | `gross - commission` |
| `platform_commission` | Decimal | `gross * 0.20` |

---

## Database

- **PostgreSQL** for persistent storage
- **SQLAlchemy** (async) with **asyncpg** driver
- **Alembic** for schema migrations
- Connection via `DATABASE_URL` environment variable

### Key dependencies (`requirements.txt`)

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
pydantic[email]==2.7.4
sqlalchemy==2.0.36
asyncpg==0.29.0
alembic==1.13.3
pytest==8.3.3
pytest-asyncio==0.24.0
httpx==0.27.2
hypothesis==6.112.2
```

---

## Environment Variables

**`apps/designer-api/.env`** (gitignored)
```
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/designer_db
```

**`apps/designer-portal/.env.local`** (gitignored)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Getting Started

```bash
# 1. Install JS dependencies
pnpm install

# 2. Install Python dependencies
pip install -r apps/designer-api/requirements.txt

# 3. Run database migrations
cd apps/designer-api && alembic upgrade head

# 4. Start all services
pnpm dev
# or individually:
# Backend:  uvicorn main:app --reload --port 8000  (from apps/designer-api/)
# Frontend: npm run dev                             (from apps/designer-portal/)
```

---

## Turborepo Integration

`turbo.json` `dev` task (no changes needed):
```json
"dev": { "cache": false, "persistent": true }
```

All workspace `dev` scripts run in parallel:

| Workspace | Command | Port |
|---|---|---|
| `apps/designer-api` | `uvicorn main:app --reload --port 8000` | 8000 |
| `apps/designer-portal` | `next dev --port 3001` | 3001 |
| `packages/ui-shared` | `tsc --watch --noEmit` | — |

---

## Data Flow

```
Browser
  │
  ▼ HTTP (port 3001)
designer-portal (Next.js)
  │  compile-time import
  ├──────────────────────► @repo/ui-shared (no network)
  │
  ▼ HTTP REST (port 8000)
designer-api (FastAPI)
  │
  ├── routers/designer_router.py    (route matching)
  ├── controllers/designer_controller.py  (business logic)
  ├── models/designer.py            (Pydantic validation)
  └── PostgreSQL
```

---

## Correctness Properties

Property-based testing uses **Hypothesis** (Python).

### Property 1: Create-Retrieve Round-Trip
For any valid `DesignerCreate` payload, POST then GET SHALL return identical `name`, `style`, `email`, `bio`, `portfolio_url`. *(Validates Req 6.1, 6.4, 6.13)*

### Property 2: Invalid Payload Returns 422
For any payload missing a required field or with invalid email, POST SHALL return HTTP 422. *(Validates Req 6.2)*

### Property 3: List Contains All Created Designers
For N created designers, `GET /designers` SHALL contain all N ids. *(Validates Req 6.3)*

### Property 4: Update Round-Trip
After PUT, GET SHALL return updated fields; unspecified fields unchanged. *(Validates Req 6.6)*

### Property 5: Delete Removes Designer
After DELETE 204, GET SHALL return 404. *(Validates Req 6.8)*

### Property 6: Not-Found Returns 404
For any unknown UUID, GET/PUT/DELETE SHALL return 404. *(Validates Req 6.5, 6.7, 6.9)*

### Property 7: Commission Invariant
For any positive gross: `designer_payout + platform_commission == gross` AND `platform_commission == gross * 0.20`.

### Property 8: Approval Initial State Is Pending
For any `ApprovalRequest`, newly created approval SHALL have `state == ApprovalState.pending`.

---

## Error Handling

| Scenario | HTTP Status | Response |
|---|---|---|
| Invalid/missing field | 422 | `{"detail": [...]}` (FastAPI auto) |
| Resource not found | 404 | `{"detail": "Designer not found"}` |
| Duplicate email | 409 | `{"detail": "Email already registered"}` |
| Server error | 500 | `{"detail": "Internal server error"}` |
