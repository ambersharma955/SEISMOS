from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.impact.api.impact import router as impact_router
from app.impact.api.priority import router as priority_router
from app.impact.geospatial.satellite_analysis import router as satellite_router
from app.seismic.api import earthquakes, hazards

settings = get_settings()

app = FastAPI(
    title="SEISMOS API",
    version="2.0.0",
    description=(
        "Unified SEISMOS backend: seismic feed + preliminary hazard screening, and impact / "
        "priority / satellite-catalogue indicators. Hazard screening outputs are preliminary "
        "decision-support indicators, not official warnings. Impact inputs are a labelled "
        "simulated reference scenario."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Seismic Intelligence: /api/earthquakes, /api/hazards
app.include_router(earthquakes.router)
app.include_router(hazards.router)
# Impact & Space: /api/impact, /api/priority, /api/satellite
app.include_router(impact_router, prefix="/api", tags=["Impact"])
app.include_router(priority_router, prefix="/api", tags=["Priority"])
app.include_router(satellite_router, prefix="/api", tags=["Satellite"])


@app.get("/", tags=["meta"])
def home():
    return {"project": "SEISMOS", "status": "running", "docs": "/docs"}


@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok", "service": "seismos-backend"}
