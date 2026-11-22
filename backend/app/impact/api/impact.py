from fastapi import APIRouter, HTTPException

from app.impact.geospatial.population_exposure import estimate_population_exposure
from app.impact.geospatial.infrastructure import estimate_infrastructure_exposure
from app.impact.geospatial.terrain_analysis import estimate_terrain_vulnerability
from app.impact.services.priority_engine import calculate_spi
from app.impact.data import get_event

router = APIRouter()


@router.get("/impact/{event_id}")
def get_impact(event_id: str):
    event = get_event(event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found. Try turkey-2023-demo.")

    population = estimate_population_exposure(event)
    infrastructure = estimate_infrastructure_exposure(event)
    terrain = estimate_terrain_vulnerability(event)

    priority_inputs = {
        "population_exposure_score": population["exposure_score"],
        "infrastructure_score": infrastructure["infrastructure_score"],
        "communication_disruption": event["communication_disruption"],
        "accessibility_constraint": event["accessibility_constraint"],
        "terrain_vulnerability": terrain["terrain_vulnerability_score"],
    }
    priority = calculate_spi(priority_inputs)

    return {
        "event_id": event_id,
        "event_name": event["name"],
        "population_exposure": population["estimated_population_exposed"],
        "population_method": population["method"],
        "infrastructure_exposure": infrastructure["exposure_level"],
        "infrastructure_details": infrastructure["estimated_assets"],
        "terrain_vulnerability": terrain,
        "communication_disruption": event["communication_disruption"],
        "accessibility_constraint": event["accessibility_constraint"],
        "spi": priority["spi"],
        "priority_level": priority["priority_level"],
        "spi_breakdown": priority["breakdown"],
        "data_confidence": "low",
        "data_status": "SIMULATED DEMO INPUTS - not verified historical measurements",
    }
