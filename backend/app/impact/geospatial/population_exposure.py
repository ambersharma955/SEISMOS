import math


def estimate_population_exposure(event: dict) -> dict:
    """Rough demo estimate using a circular impact zone and assumed density.

    This is NOT a census-based or validated earthquake exposure model.
    Replace the density input with a gridded population dataset for real use.
    """
    radius_km = float(event["radius_km"])
    area_km2 = math.pi * radius_km ** 2
    density = float(event["population_density_per_km2"])
    estimate = round(area_km2 * density)

    # Normalise the estimate to a 0-100 indicator for the priority engine.
    exposure_score = min(100.0, round((estimate / 500_000) * 100, 2))

    return {
        "estimated_population_exposed": estimate,
        "impact_area_km2": round(area_km2, 2),
        "assumed_population_density_per_km2": density,
        "exposure_score": exposure_score,
        "method": "SIMULATED: circular radius x assumed average population density",
    }
