# Clearly labelled demonstration data. Replace with verified event/geospatial data
# before presenting any value as a real measurement.
EVENTS = {
    "turkey-2023-demo": {
        "name": "2023 Turkey-Syria earthquake (demonstration case)",
        "latitude": 37.17,
        "longitude": 37.03,
        "radius_km": 25,
        "population_density_per_km2": 250,
        "communication_disruption": 65,
        "accessibility_constraint": 40,
        "infrastructure_score": 75,
        "terrain_vulnerability": 55,
    }
}


def get_event(event_id: str):
    return EVENTS.get(event_id)
