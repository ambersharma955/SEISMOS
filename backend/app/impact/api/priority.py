from fastapi import APIRouter, HTTPException

from app.impact.data import get_event
from app.impact.geospatial.population_exposure import estimate_population_exposure
from app.impact.geospatial.infrastructure import estimate_infrastructure_exposure
from app.impact.geospatial.terrain_analysis import estimate_terrain_vulnerability
from app.impact.services.priority_engine import calculate_spi

router = APIRouter()


@router.get("/priority/{event_id}")
def get_priority(event_id: str):
    event = get_event(event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found. Try turkey-2023-demo.")

    pop = estimate_population_exposure(event)
    infra = estimate_infrastructure_exposure(event)
    terrain = estimate_terrain_vulnerability(event)

    result = calculate_spi({
        "population_exposure_score": pop["exposure_score"],
        "infrastructure_score": infra["infrastructure_score"],
        "communication_disruption": event["communication_disruption"],
        "accessibility_constraint": event["accessibility_constraint"],
        "terrain_vulnerability": terrain["terrain_vulnerability_score"],
    })

    return {
        "event_id": event_id,
        **result,
        "data_confidence": "low",
        "data_status": "SIMULATED DEMO INPUTS - not verified historical measurements",
    }
