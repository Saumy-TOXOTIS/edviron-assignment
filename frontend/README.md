# Frontend (React + Vite)

React dashboard consuming the Edviron reporting API.

## Setup
1) Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` (default `http://localhost:4000/api`).  
2) Install deps: `npm install`  
3) Run dev server: `npm run dev` (http://localhost:5173)  
4) Build for production: `npm run build`

## Features
- Login flow; stores JWTs in local storage.  
- Dashboard cards (due, collected, rate, recent failures).  
- Collections chart over time (monthly).  
- Pending payments list (top owed).  
- Recent transactions table with field-level visibility based on role permissions returned by the backend.  
- Filters for transaction status and payment method.

## Notes
- Developer portal/monitoring UI for failed transactions was intentionally removed in this build.
- GenAI usage and links are documented in the root README and backend README.
