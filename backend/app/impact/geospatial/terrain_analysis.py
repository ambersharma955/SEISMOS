def estimate_terrain_vulnerability(event: dict) -> dict:
    """Expose a demo terrain vulnerability input.

    A real version should calculate slope/elevation from a DEM (e.g. Copernicus
    DEM) and combine it with geology/landslide susceptibility layers.
    """
    score = float(event["terrain_vulnerability"])
    if score >= 70:
        category = "high"
    elif score >= 40:
        category = "moderate"
    else:
        category = "low"

    return {
        "terrain_vulnerability_score": score,
        "category": category,
        "method": "SIMULATED placeholder; no elevation raster processed",
    }
