# SEISMOS Backend (unified FastAPI service, port 8000)

One service containing both former backends.

```
backend/
├── app/
│   ├── main.py          app + CORS + routers
│   ├── core/            shared settings + TTL cache
│   ├── seismic/         USGS feed, hazard screening (api/, services/, schemas.py, sample_data.py)
│   └── impact/          impact indicators, SPI, satellite links (api/, geospatial/, services/, data.py)
├── tests/               test_seismic.py (9) + test_impact.py (5)
├── Dockerfile, requirements.txt, requirements-dev.txt, .env.example
```

```bash
python3 -m venv .venv && . .venv/bin/activate        # Windows: py -m venv .venv ; .venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000             # docs: http://127.0.0.1:8000/docs
python -m pytest -q
```

## Endpoints
- `GET /health`
- Seismic: `GET /api/earthquakes` (`?mock=true`, `min_magnitude`, `region`, `start_date`…), `GET /api/earthquakes/{event_id}`, `GET /api/hazards/{event_id}`
- Impact: `GET /api/impact/{event_id}`, `GET /api/priority/{event_id}`, `GET /api/satellite/{event_id}` (only `turkey-2023-demo`, simulated inputs)

Hazard outputs are preliminary heuristics, not official warnings. Impact inputs are fixed simulated assumptions;
SPI weights are unvalidated. Set `CORS_ORIGINS` to your public frontend URL in production.
