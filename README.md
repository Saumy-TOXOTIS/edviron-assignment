# Edviron Reporting Assignment

Node/Express + MongoDB backend and React frontend for a reporting and payments dashboard. Optional developer portal/monitoring for failed transactions has been removed per request.

## Project structure
- `backend/` - Express API (auth, ACL, reporting, exports, seeds).
- `frontend/` - React dashboard (login, metrics, transactions, pending fees).
- `k8s/` - Sample Deployment/Service manifests for backend/frontend.
- `docker-compose.yml` - Local containers for backend, frontend, MongoDB.
- `render.yaml` - Render blueprint (if deploying there instead of Docker/K8s).

## Key features
- Auth with JWT access/refresh, role + school-based scoping, field-level masking on transactions.
- Reports: collections summary by month/day/payment method; pending fees list; transaction failure breakdown.
- Exports: pending payments CSV download endpoint.
- Frontend dashboard: metrics cards, charts, filters, paginated transactions, pending list, CSV download, field-level visibility per role.
- Health endpoint at `/health` and `/api/health`.

## Getting started (local, no containers)
1) Prereqs: Node 18+, npm, MongoDB reachable locally or in the cloud.
2) Backend: copy `backend/.env.example` to `backend/.env`, fill Mongo URI + JWT secrets + allowed origins. Run `npm install` then `npm run seed` and `npm run dev` (default API base `http://localhost:4000/api`).
3) Frontend: copy `frontend/.env.example` to `frontend/.env`, set `VITE_API_BASE_URL` to backend API. Run `npm install` then `npm run dev` (http://localhost:5173).

## Docker (containerised)
- Local stack: `docker-compose up --build` from repo root. Brings up backend, frontend, MongoDB. Adjust envs in compose if needed.
- Standalone images: `docker build -t edviron-backend ./backend` and `docker build -t edviron-frontend ./frontend`.

## Kubernetes (sample)
- Manifests in `k8s/` for backend and frontend Deployments + Services.
- Set image references, secrets (Mongo URI, JWT), and point frontend `VITE_API_BASE_URL` to the backend service (e.g., `http://edviron-backend/api`).

## Environments
- Backend envs: `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ALLOWED_ORIGINS`, optional SMTP vars if you add alerts later.
- Frontend envs: `VITE_API_BASE_URL`.

## Testing
- Frontend: `npm run build` (Vite).  
- Backend: run against a Mongo instance (`npm run seed` then `npm run dev` or `npm start`). No automated test suite shipped.

## Design decisions and assumptions
- Field-level ACL: backend masks transaction fields based on role permissions; frontend renders only allowed columns.
- School scoping: non-super users are constrained to their school via middleware-applied filters.
- Removed functionality: the optional developer portal/monitoring for failed transactions (UI and endpoints) was removed intentionally.
- Deployment targets: Render blueprint kept; Docker Compose and K8s manifests added to satisfy container/K8s readiness.
