# SEISMOS · ORBIT.EXE

Space-enabled seismic intelligence and multi-hazard decision-support prototype.

```
SEISMOS_ORBIT_EXE/
├── backend/              Unified FastAPI service (seismic feed + hazards + impact/SPI + satellite links), port 8000
├── frontend/             React 18 + Vite 6 single-page app (nginx Dockerfile included)
├── docs/                 MANUAL.md, SPACE_OBSERVATION_MODES.md, VALIDATION.md
├── docker-compose.yml    One-command deployment (frontend+nginx, backend)
├── render.yaml           Render Blueprint (API web service + static site)
├── .env.example          Compose settings (PORT, CORS_ORIGINS)
└── .gitignore
```

## Option A – Deploy with Docker (recommended)

Requires Docker + Docker Compose v2.

```bash
cp .env.example .env          # set CORS_ORIGINS to your public URL, e.g. https://seismos.example.com
docker compose up -d --build
```

Open `http://<server>:8080` (change with `PORT`). nginx serves the frontend and reverse-proxies
`/api/*` and `/health` → backend, so no extra frontend configuration is needed.

Put a TLS terminator (Caddy, Traefik, Cloudflare, or nginx + Let's Encrypt) in front for HTTPS.

Checks: `curl localhost:8080/health`.

## Option B – Deploy without Docker (VPS / VM)

```bash
cd backend && python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt && cp .env.example .env      # edit CORS_ORIGINS
uvicorn app.main:app --host 127.0.0.1 --port 8000 --proxy-headers   # run under systemd/supervisor

cd ../frontend && npm ci && npm run build                    # outputs frontend/dist
```

Serve `frontend/dist` with nginx using `frontend/deploy/nginx.conf` as the template (replace `backend:8000`
with `127.0.0.1:8000`).

## Option C – Render (API web service + static site)

Fastest: **New → Blueprint** → pick the repo (uses `render.yaml`). Then confirm the two URLs match your real
service URLs (`CORS_ORIGINS` on the API, `VITE_API_BASE_URL` on the static site).

Manual setup:

1. **Web Service** → Language: Docker. Leave *Root Directory* empty and set
   *Dockerfile Path* `./backend/Dockerfile`, *Docker Build Context Directory* `./backend`,
   *Health Check Path* `/health`, env `CORS_ORIGINS=https://<your-frontend>.onrender.com`.
2. **Static Site** → *Root Directory* `frontend`, Build `npm ci && npm run build`, Publish `dist`,
   env `NODE_VERSION=22` and `VITE_API_BASE_URL=https://<your-api>.onrender.com` (no trailing slash),
   plus a **Rewrite** rule `/*` → `/index.html`.

`VITE_` values are baked in at build time: after changing one, redeploy with "Clear build cache & deploy".
Free web services sleep after ~15 min idle (first request may take 30-60 s).

## Local development

```bash
# terminal 1
cd backend && pip install -r requirements-dev.txt && uvicorn app.main:app --reload --port 8000
# terminal 2
cd frontend && npm install && npm run dev        # http://localhost:5173
```

Tests: `python -m pytest -q` inside `backend/` (14 tests).
Requirements: Python 3.10+ (3.12 used in Docker), Node.js 20.19+ / 22.12+.

## Environment variables

| Where | Variable | Purpose |
|---|---|---|
| root `.env` | `PORT`, `CORS_ORIGINS` | Docker Compose port and allowed origins |
| backend | `CORS_ORIGINS`, `USGS_BASE_URL`, `HTTP_TIMEOUT_S`, `CACHE_TTL_S`, `USE_SAMPLE_FALLBACK`, `USER_AGENT` … | see `backend/.env.example` |
| frontend (build time) | `VITE_API_BASE_URL` | only when frontend and API are on different hosts (Render, Netlify…) |

## Important

This is a hackathon prototype, not a certified disaster-management system. Backend 2 uses fixed, simulated
reference-scenario inputs, and hazard outputs are preliminary heuristics. Read `docs/MANUAL.md` and
`docs/VALIDATION.md` before any public/operational use. Do not describe simulated values as live or official.
