# Requirements Document

## Introduction

The Designer Platform Setup feature establishes the foundational monorepo structure for a graduation project built on top of an existing Turborepo + pnpm workspaces setup. The feature introduces three new workspace members:

1. **`apps/designer-api`** — A FastAPI (Python) backend service that exposes REST endpoints for the designer platform.
2. **`apps/designer-portal`** — A Next.js frontend application that consumes the API and renders the designer-facing UI.
3. **`packages/ui-shared`** — A shared React component library consumed by `designer-portal` (and any future apps).

Each workspace member must integrate cleanly with the existing Turborepo pipeline (build, dev, lint) and pnpm workspace resolution. A system architecture `README.md` at the monorepo root level must document how the three parts communicate.

The platform is designed with Component_Independence in mind. Each backend component — Designer, Auth, AI Recommendation, and others — runs independently with its own internal logic, routes, and data handling. Components do not share runtime state or in-process function calls; instead they exchange data exclusively through Inter_Component_Communication via HTTP/REST APIs, ensuring loose coupling and independent deployability.

---

## Glossary

- **Monorepo**: The single repository managed by Turborepo and pnpm workspaces.
- **Designer_API**: The FastAPI Python service located at `apps/designer-api`.
- **Designer_Portal**: The Next.js application located at `apps/designer-portal`.
- **UI_Shared**: The shared React component library located at `packages/ui-shared`.
- **Turborepo**: The build orchestration tool configured via `turbo.json` at the monorepo root.
- **pnpm_Workspace**: The pnpm workspace configuration defined in `pnpm-workspace.yaml`.
- **Dev_Script**: The `dev` entry in a workspace member's `package.json` `scripts` field.
- **Architecture_README**: The `README.md` file at the monorepo root that documents system architecture and inter-service communication.
- **Designer_Profile**: A data record representing a designer entity, containing fields such as unique identifier, name, style, email, and other relevant profile attributes stored in the database.
- **Designer_Router**: The FastAPI router module located at `apps/designer-api/routers/designer_router.py` that defines and handles all HTTP routes for designer-related operations.
- **Designer_Controller**: The module located at `apps/designer-api/controllers/designer_controller.py` that contains the business logic for creating, retrieving, updating, and deleting designer profiles.
- **Designer_Model**: The Pydantic/ORM model located at `apps/designer-api/models/designer.py` that defines the schema and database representation of a Designer_Profile.
- **Component_Independence**: The architectural principle that each backend component (Designer, Auth, AI Recommendation, etc.) has its own internal logic, routes, and data handling and can be developed, tested, and deployed without depending on other components.
- **Inter_Component_Communication**: The HTTP/REST API contracts through which independent components exchange data at runtime.

---

## Requirements

### Requirement 1: Backend Service Scaffold (`apps/designer-api`)

**User Story:** As a developer, I want a FastAPI service scaffolded at `apps/designer-api`, so that I have a runnable Python backend integrated into the Turborepo pipeline.

#### Acceptance Criteria

1. THE Monorepo SHALL contain a directory `apps/designer-api` with a `package.json` file whose `name` field is `"designer-api"`.
2. THE `package.json` for `designer-api` SHALL include a `dev` script that starts the FastAPI development server (`uvicorn main:app --reload --port 8000`).
3. THE `apps/designer-api` directory SHALL contain a `main.py` file that defines a FastAPI application instance and at least one health-check route (`GET /health`).
4. THE `apps/designer-api` directory SHALL contain a `requirements.txt` file listing all Python dependencies required to run the service.
5. WHEN `turbo run dev` is executed from the monorepo root, THE Turborepo SHALL invoke the `dev` script of `designer-api` alongside other workspace `dev` scripts.
6. THE `apps/designer-api` directory SHALL contain a `services/` subdirectory that encapsulates all Chappa Payment API integration logic, including a commission calculation module that applies a 20% platform commission to each transaction amount before disbursement.
7. WHEN a payment transaction is processed, THE Designer_API SHALL calculate the designer's net payout as 80% of the gross transaction amount and the platform commission as 20% of the gross transaction amount, with both values returned in the payment response.
8. THE `apps/designer-api` directory SHALL contain a `models/` subdirectory that defines all data models required for the Human-in-the-Loop designer approval flow, including models representing approval requests, approval states, reviewer assignments, and approval decisions.
9. WHEN a designer approval request is submitted, THE Designer_API SHALL persist an approval record with an initial state of `pending` and associate it with a reviewer before any downstream action is taken.

---

### Requirement 2: Frontend Application Scaffold (`apps/designer-portal`)

**User Story:** As a developer, I want a Next.js application scaffolded at `apps/designer-portal`, so that I have a runnable frontend that can consume the Designer API.

#### Acceptance Criteria

1. THE Monorepo SHALL contain a directory `apps/designer-portal` with a `package.json` file whose `name` field is `"designer-portal"`.
2. THE `package.json` for `designer-portal` SHALL include a `dev` script that starts the Next.js development server on port 3001 (to avoid conflict with other apps on port 3000).
3. THE `apps/designer-portal` directory SHALL contain a valid `next.config.js` file.
4. THE `apps/designer-portal` directory SHALL contain a `tsconfig.json` that extends `@repo/typescript-config/nextjs.json`.
5. THE `package.json` for `designer-portal` SHALL declare `@repo/ui-shared` as a workspace dependency using `"workspace:*"`.
6. WHEN `turbo run dev` is executed from the monorepo root, THE Turborepo SHALL invoke the `dev` script of `designer-portal` alongside other workspace `dev` scripts.

---

### Requirement 3: Shared UI Component Library (`packages/ui-shared`)

**User Story:** As a developer, I want a shared React component library at `packages/ui-shared`, so that reusable UI components can be consumed by `designer-portal` and future applications without duplication.

#### Acceptance Criteria

1. THE Monorepo SHALL contain a directory `packages/ui-shared` with a `package.json` file whose `name` field is `"@repo/ui-shared"`.
2. THE `package.json` for `ui-shared` SHALL include a `dev` script (`tsc --watch --noEmit`) so that Turborepo can include it in the `dev` pipeline.
3. THE `packages/ui-shared` directory SHALL contain a `tsconfig.json` that extends `@repo/typescript-config/react-library.json`.
4. THE `packages/ui-shared/src` directory SHALL contain at least one exported React component (e.g., `Button`) as a `.tsx` file.
5. THE `package.json` for `ui-shared` SHALL define an `exports` field mapping `"./*"` to `"./src/*.tsx"` so consumers can import individual components.
6. WHEN `designer-portal` imports a component from `@repo/ui-shared`, THE pnpm_Workspace SHALL resolve the import to the local `packages/ui-shared/src` directory without requiring a build step.

---

### Requirement 4: pnpm Workspace Registration

**User Story:** As a developer, I want all three new workspace members registered in the pnpm workspace, so that cross-package dependencies resolve correctly during development.

#### Acceptance Criteria

1. THE `pnpm-workspace.yaml` SHALL cover `apps/*` and `packages/*` glob patterns, which SHALL automatically include `apps/designer-api`, `apps/designer-portal`, and `packages/ui-shared` without modification.
2. WHEN `pnpm install` is run from the monorepo root, THE pnpm_Workspace SHALL resolve `@repo/ui-shared` as a local workspace package for `designer-portal`.
3. IF a workspace dependency is declared with `"workspace:*"` and the target package does not exist, THEN THE pnpm_Workspace SHALL report a resolution error to the developer.

---

### Requirement 5: System Architecture Documentation

**User Story:** As a developer or stakeholder, I want a system architecture `README.md` that explains how the three platform parts communicate, so that I can understand the overall design at a glance.

#### Acceptance Criteria

1. THE Architecture_README SHALL exist at the monorepo root as `README.md`.
2. THE Architecture_README SHALL contain a Mermaid diagram that illustrates the communication flow between `designer-portal`, `designer-api`, and `ui-shared`.
3. THE Architecture_README SHALL describe the HTTP/REST communication path from `designer-portal` to `designer-api`, including the base URL convention used in development (`http://localhost:8000`).
4. THE Architecture_README SHALL describe how `ui-shared` is consumed by `designer-portal` as a compile-time workspace dependency (not a runtime HTTP call).
5. THE Architecture_README SHALL include a "Getting Started" section with the commands required to install dependencies and start all services in development mode.

---

### Requirement 6: Designer Profile Management (`apps/designer-api`)

**User Story:** As a platform administrator, I want to create, view, update, and delete designer profiles through the API, so that the platform can manage its roster of designers.

#### Acceptance Criteria

1. THE Designer_API SHALL expose a `POST /designers` endpoint that accepts a JSON request body conforming to the Designer_Model schema and persists a new Designer_Profile to the database.
2. WHEN a `POST /designers` request is received with a missing or invalid required field, THE Designer_Router SHALL return an HTTP 422 response containing a structured validation error message.
3. THE Designer_API SHALL expose a `GET /designers` endpoint that retrieves and returns a list of all Designer_Profile records from the database as a JSON array.
4. THE Designer_API SHALL expose a `GET /designers/{id}` endpoint that retrieves and returns the Designer_Profile matching the given `id` as a JSON object.
5. WHEN a `GET /designers/{id}` request is received and no Designer_Profile with the given `id` exists, THE Designer_Router SHALL return an HTTP 404 response with a descriptive error message.
6. THE Designer_API SHALL expose a `PUT /designers/{id}` endpoint that accepts a JSON request body and updates the Designer_Profile matching the given `id` with the provided field values.
7. WHEN a `PUT /designers/{id}` request is received and no Designer_Profile with the given `id` exists, THE Designer_Router SHALL return an HTTP 404 response with a descriptive error message.
8. THE Designer_API SHALL expose a `DELETE /designers/{id}` endpoint that removes the Designer_Profile matching the given `id` from the database.
9. WHEN a `DELETE /designers/{id}` request is received and no Designer_Profile with the given `id` exists, THE Designer_Router SHALL return an HTTP 404 response with a descriptive error message.
10. THE Designer_Router SHALL be defined in `apps/designer-api/routers/designer_router.py` and registered on the FastAPI application instance in `main.py`.
11. THE Designer_Controller SHALL be defined in `apps/designer-api/controllers/designer_controller.py` and SHALL contain the business logic invoked by the Designer_Router for each CRUD operation.
12. THE Designer_Model SHALL be defined in `apps/designer-api/models/designer.py` and SHALL specify all required and optional fields of a Designer_Profile, including their data types.
13. WHEN a valid Designer_Profile is created via `POST /designers` and subsequently retrieved via `GET /designers/{id}`, THE Designer_API SHALL return a response body whose field values are identical to those submitted in the creation request (round-trip property).

---

### Requirement 7: Component Independence and Shared UI Architecture

**User Story:** As a platform architect, I want each backend component to run independently and communicate through well-defined HTTP/REST APIs, and I want frontend applications to consume a shared UI library, so that the system remains loosely coupled, consistently styled, and independently deployable.

#### Acceptance Criteria

1. THE Designer_API SHALL contain its own `main.py`, router modules, controller modules, and model definitions such that it can be started and tested without any other backend component being present.
2. WHEN the Designer_API process is started in isolation, THE Designer_API SHALL respond to requests on its designated port without requiring a running Auth or AI Recommendation service.
3. THE Auth component SHALL contain its own entry point, routes, and data handling logic such that it can be developed, tested, and deployed independently of the Designer_API and AI Recommendation components.
4. THE AI_Recommendation component SHALL contain its own entry point, routes, and data handling logic such that it can be developed, tested, and deployed independently of the Designer_API and Auth components.
5. WHEN one backend component requires data from another, THE requesting component SHALL obtain that data exclusively through an Inter_Component_Communication HTTP/REST API call to the target component's published endpoint.
6. THE Architecture_README SHALL document the Inter_Component_Communication contracts between all backend components, including the HTTP method, endpoint path, and expected request and response schemas for each cross-component call.
7. THE Designer_Portal SHALL import all reusable interface elements from `@repo/ui-shared` rather than defining duplicate implementations within its own source tree.
8. WHEN a UI element provided by UI_Shared is updated in `packages/ui-shared/src`, THE Designer_Portal SHALL reflect that update upon the next build or hot-reload without requiring changes to its own source files.
9. WHERE a new frontend application is added to the monorepo, THE new application SHALL declare `@repo/ui-shared` as a workspace dependency and consume shared interface elements from it rather than reimplementing them locally.
