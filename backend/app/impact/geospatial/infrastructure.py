def estimate_infrastructure_exposure(event: dict) -> dict:
    """Return transparent demo infrastructure indicators.

    Counts are placeholders, not OpenStreetMap queries or verified asset counts.
    """
    score = float(event["infrastructure_score"])
    if score >= 70:
        level = "high"
    elif score >= 40:
        level = "moderate"
    else:
        level = "low"

    return {
        "exposure_level": level,
        "infrastructure_score": score,
        "estimated_assets": {
            "roads": "not queried - connect OpenStreetMap for real counts",
            "hospitals": "not queried - connect OpenStreetMap for real counts",
            "schools": "not queried - connect OpenStreetMap for real counts",
            "bridges": "not queried - connect OpenStreetMap for real counts",
        },
        "method": "SIMULATED score; no live infrastructure dataset connected",
    }
