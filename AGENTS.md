# AGENTS.md

## Cursor Cloud specific instructions

This is a two-package monorepo for the "Economic Data World Map":
- `backend/` — Node.js + Express + TypeScript API. Uses a file-based JSON database (written under `backend/data/`, gitignored); no external DB/Redis is required. On startup it seeds ~214 countries and kicks off a background fetch of live economic data from free public APIs (exchangerate.host + World Bank). Exchange rates populate within seconds; the full World Bank indicator fetch takes 10-15 minutes due to upstream rate limits, so most non-exchange indicators are empty shortly after boot.
- `frontend/` — React + Vite + Mapbox GL JS SPA that consumes the backend API.

### Env files (required, gitignored — recreate them, they are not committed)
- `backend/.env`: `PORT=3001` and `CORS_ORIGIN=http://localhost:5173`. Note: `backend/src/index.ts` defaults `PORT` to `3000`, but the frontend's API client and docs assume `3001`, so set `PORT=3001`.
- `frontend/.env`: `VITE_API_URL=http://localhost:3001/api` and `VITE_MAPBOX_TOKEN=<mapbox public token>`. Without a valid `VITE_MAPBOX_TOKEN` the map shows a "Map Unavailable" error. A working public token is in `VERCEL_DEPLOYMENT_GUIDE.md`. Vite only reads `.env` at server start, so restart `npm run dev` after changing it.

### Run / build / typecheck
- Dev servers (run from each package dir): `npm run dev`. Backend → `http://localhost:3001`, frontend → `http://localhost:5173`. Backend uses `tsx watch` and frontend uses Vite HMR.
- There is no separate lint script. The build script doubles as the typecheck: `npm run build` (backend = `tsc`, frontend = `tsc && vite build`). There is no automated test suite.
- Health check: `curl http://localhost:3001/api/health`. Data endpoints live under `/api/rates/*` and `/api/countries` (see `README.md`).
