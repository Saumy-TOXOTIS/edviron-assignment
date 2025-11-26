# Backend (Express + MongoDB)

REST API for reporting, payments analysis, and field-level access control.

## Setup
1) Copy `.env.example` to `.env` and fill values (Mongo URI, JWT secrets, allowed origins).  
2) Install deps: `npm install`  
3) Seed data: `npm run seed` (creates roles, super admin, school admins/viewers, sample schools/students/bills/transactions).  
4) Run: `npm run dev` (or `npm start`). API defaults to `http://localhost:4000/api`.

## Seeded users
- Super admin: `admin@example.com` / `ChangeMe123!`  
- School admin (per school): `admin+SCH0001@example.com` / `Admin@123`  
- Finance viewer (per school): `viewer+SCH0001@example.com` / `Viewer@123`  
Update `SEED_SCHOOLS` to generate more schools and matching users.

## Endpoints (high level)
- `POST /api/auth/login`, `POST /api/auth/refresh`  
- `GET /api/students` (filters: `schoolId`, `className`, `section`, `status`, `search`)  
- `GET /api/fee-bills` (filters: `status`, `paymentMethod`, `dueFrom`, `dueTo`, `schoolId`, `studentId`)  
- `GET /api/transactions` (filters: `status`, `paymentMethod`, `dateFrom`, `dateTo`, `schoolId`, `studentId`, `gateway`, `search`)  
- `GET /api/reports/fees/summary` (query `by=month|day|paymentMethod`, plus `schoolId`, `className`, `section`)  
- `GET /api/reports/fees/pending` (top pending bills, filter by class/section/due window)  
- `GET /api/reports/transactions/failures` (failure breakdown + paginated list)

Pagination: `page`, `limit` on list endpoints. Include `Authorization: Bearer <accessToken>`.

## Permissions model
Roles store a `permissions` object per resource. Example:
```json
{
  "students": { "read": ["*"] },
  "transactions": { "read": ["amount", "status", "paymentMethod", "gateway", "createdAt"] },
  "reports": { "read": ["*"] }
}
```
Field-level masking happens before responses; school-scoped roles are automatically limited to their `schoolId`.

## Postman
Import `backend/postman_collection.json`. Set `baseUrl` (default `http://localhost:4000/api`) and populate `accessToken`/`refreshToken` after login.

## Optional extensions (design)
- Exports: add an `exports` collection, enqueue CSV generation (Bull/Redis), stream to S3/Render disk, and expose `/api/exports` for status/download.  

## New endpoints (exports)
- `GET /api/exports/pending` -> streams CSV of pending payments (filterable by `schoolId`, `className`, `section`, `dueFrom`, `dueTo`).

## Notes
- Optional developer monitoring/alert endpoints were removed; only exports remain as the optional extension in this build.
- GenAI assistance used for error triage (morgan/chalk) and understanding/generating parts of `permissions.js`, `seed.js`, `auth.js`, `exportController.js`, `exportRoutes.js`, plus Docker/K8s/AWS suggestions. Full chat links:  
  - https://chatgpt.com/share/69278b89-fa44-8010-a7fe-640d7fc4713f  
  - https://chatgpt.com/share/69278bac-a6c4-8010-8ed1-b0ed9499a4f4
