# Tasks: Designer Platform Setup

## Task List

- [x] 1. Scaffold `apps/designer-api` — FastAPI setup
  - [x] 1.1 Create `apps/designer-api/package.json` with `name: "designer-api"` and `dev` (`uvicorn main:app --reload --port 8000`), `start`, and `lint` scripts
  - [x] 1.2 Create `apps/designer-api/requirements.txt` listing `fastapi`, `uvicorn[standard]`, `pydantic[email]`, `sqlalchemy`, `asyncpg`, `alembic`, `pytest`, `hypothesis`
  - [x] 1.3 Create `apps/designer-api/main.py` with FastAPI app instance, `GET /health` health-check route, and router registration
  - [x] 1.4 Create `apps/designer-api/database.py` with SQLAlchemy async engine and session factory reading `DATABASE_URL` from environment
  - [x] 1.5 Create directory structure: `routers/`, `controllers/`, `models/`, `services/` with `__init__.py` files in each
  - [x] 1.6 Create `apps/designer-api/models/designer.py` with `DesignerCreate` (name, style, email, bio, portfolio_url), `DesignerUpdate`, and `DesignerResponse` Pydantic models
  - [x] 1.7 Create `apps/designer-api/models/approval.py` with `ApprovalState` enum (pending/approved/rejected), `ApprovalRequest`, and `ApprovalDecision` Pydantic models
  - [x] 1.8 Create `apps/designer-api/services/chappa_service.py` with `calculate_commission` function using `Decimal` arithmetic (20% platform commission, 80% designer payout)
  - [x] 1.9 Initialize Alembic in `apps/designer-api/` and create initial migration for the `designers` table including `id`, `name`, `style`, `email`, `bio`, `portfolio_url` columns
  - [x] 1.10 Create `apps/designer-api/.env` (gitignored) with `DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/designer_db` placeholder

- [ ] 2. Scaffold `apps/designer-portal` — Next.js setup
  - [x] 2.1 Create `apps/designer-portal/package.json` with `name: "designer-portal"`, `dev` script on port 3001, and `@repo/ui-shared: "workspace:*"` dependency
  - [x] 2.2 Create `apps/designer-portal/next.config.js` with `transpilePackages: ["@repo/ui-shared"]`
  - [x] 2.3 Create `apps/designer-portal/tsconfig.json` extending `@repo/typescript-config/nextjs.json`
  - [x] 2.4 Create `apps/designer-portal/app/layout.tsx`, `app/page.tsx`, and `app/globals.css` as minimal Next.js App Router entry points
  - [x] 2.5 Create `apps/designer-portal/lib/api.ts` with `fetchDesigners`, `getDesigner`, `createDesigner`, `updateDesigner`, and `deleteDesigner` functions reading `NEXT_PUBLIC_API_URL` from environment
  - [x] 2.6 Create `apps/designer-portal/.env.local` (gitignored) with `NEXT_PUBLIC_API_URL=http://localhost:8000`

- [ ] 3. Scaffold `packages/ui-shared` — reusable React components
  - [x] 3.1 Create `packages/ui-shared/package.json` with `name: "@repo/ui-shared"`, `exports: { "./*": "./src/*.tsx" }`, and `dev`, `check-types`, `lint` scripts
  - [x] 3.2 Create `packages/ui-shared/tsconfig.json` extending `@repo/typescript-config/react-library.json`
  - [x] 3.3 Create `packages/ui-shared/src/Button.tsx` with a `Button` component accepting `variant` (`"primary" | "secondary"`) and standard HTML button props
  - [x] 3.4 Create `packages/ui-shared/src/index.ts` re-exporting all components (`Button`)

- [-] 4. Configure pnpm workspace and Turborepo
  - [ ] 4.1 Confirm `pnpm-workspace.yaml` `apps/*` and `packages/*` globs cover all three new members — no file change required
  - [ ] 4.2 Run `pnpm install` from monorepo root and verify `@repo/ui-shared` resolves as a local symlink in `apps/designer-portal/node_modules/@repo/ui-shared`
  - [ ] 4.3 Verify `turbo run dev` invokes `dev` scripts for `designer-api`, `designer-portal`, and `ui-shared` in parallel alongside existing workspace members
  - [ ] 4.4 Verify `@repo/typescript-config` and `@repo/eslint-config` resolve correctly as shared dev dependencies in `designer-portal` and `ui-shared`

- [ ] 5. Define API contracts and update architecture `README.md`
  - [x] 5.1 Replace root `README.md` with a Mermaid diagram showing `designer-portal → designer-api → PostgreSQL` and `designer-portal -.-> ui-shared` (compile-time)
  - [x] 5.2 Document all endpoint contracts: HTTP method, path, request body schema, response schema, and error codes
  - [x] 5.3 Document `NEXT_PUBLIC_API_URL` and `DATABASE_URL` environment variables with example values
  - [x] 5.4 Add "Getting Started" section with full run instructions
  - [x] 5.5 Document how `@repo/ui-shared` is consumed as a compile-time workspace dependency via `transpilePackages`

- [ ] 6. Implement CRUD endpoints with PostgreSQL
  - [x] 6.1 Create `apps/designer-api/controllers/designer_controller.py` with `DesignerController` class (in-memory store for now, replaced with SQLAlchemy in this task)
  - [x] 6.2 Create `apps/designer-api/routers/designer_router.py` with all five routes wired to `DesignerController`
  - [ ] 6.3 Replace in-memory store with SQLAlchemy async session — implement `POST /designers` persisting to PostgreSQL, return 201 `DesignerResponse`
  - [ ] 6.4 Implement `GET /designers` and `GET /designers/{id}` querying PostgreSQL; return 404 when not found
  - [ ] 6.5 Implement `PUT /designers/{id}` with partial update against PostgreSQL; return 404 when not found
  - [ ] 6.6 Implement `DELETE /designers/{id}` removing from PostgreSQL; return 204 or 404
  - [ ] 6.7 Run `alembic upgrade head` to apply the initial migration and verify the `designers` table is created in PostgreSQL

- [ ] 7. Integrate frontend with backend using shared components
  - [ ] 7.1 Create `apps/designer-portal/app/designers/page.tsx` — fetch and display the list of designers from `GET /designers`
  - [ ] 7.2 Create `apps/designer-portal/app/designers/new/page.tsx` — form to create a new designer calling `createDesigner` from `lib/api.ts`
  - [ ] 7.3 Create `apps/designer-portal/app/designers/[id]/page.tsx` — display a single designer profile
  - [ ] 7.4 Use `Button` from `@repo/ui-shared` in at least one portal page
  - [ ] 7.5 Verify `designer-portal` TypeScript compilation passes with `tsc --noEmit`

- [ ] 8. Testing — unit tests and property-based tests
  - [ ] 8.1 Create `apps/designer-api/tests/test_health.py` — assert `GET /health` returns `{"status": "ok"}` with HTTP 200
  - [ ] 8.2 Create `apps/designer-api/tests/test_designers.py` — assert `POST /designers` with valid payload returns 201; assert missing `name`, missing `style`, and invalid email each return 422; assert `GET /designers/{id}` with non-existent UUID returns 404
  - [ ] 8.3 Create `apps/designer-api/tests/test_chappa.py` — assert `calculate_commission(Decimal("100.00"))` returns `designer_payout=Decimal("80.00")` and `platform_commission=Decimal("20.00")`
  - [ ] 8.4 Create `apps/designer-api/tests/test_approval.py` — assert a newly created approval record has `state == ApprovalState.pending`
  - [ ] 8.5 Implement Property 1 (Hypothesis) — create-retrieve round-trip: generate random valid `DesignerCreate` payloads, POST then GET, assert `name`, `style`, `email`, `bio`, `portfolio_url` match (≥100 iterations)
  - [ ] 8.6 Implement Property 2 (Hypothesis) — invalid payload returns 422: generate payloads with missing required fields or invalid email, assert HTTP 422 (≥100 iterations)
  - [ ] 8.7 Implement Property 7 (Hypothesis) — commission invariant: generate random positive Decimal gross amounts, assert `designer_payout + platform_commission == gross` and `platform_commission == gross * Decimal("0.20")` (≥100 iterations)
  - [ ] 8.8 Implement Property 8 (Hypothesis) — approval initial state: generate random `ApprovalRequest` payloads, assert newly created approval has `state == ApprovalState.pending` (≥100 iterations)
