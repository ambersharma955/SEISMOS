def calculate_spi(inputs: dict) -> dict:
    """Calculate an explainable SEISMOS Priority Index (0-100).

    Weights are prototype design choices, not scientifically validated weights.
    Higher scores mean greater urgency. All inputs are expected on a 0-100 scale.
    """
    weights = {
        "population_exposure_score": 0.30,
        "infrastructure_score": 0.25,
        "communication_disruption": 0.15,
        "accessibility_constraint": 0.15,
        "terrain_vulnerability": 0.15,
    }

    breakdown = {}
    total = 0.0
    for name, weight in weights.items():
        value = max(0.0, min(100.0, float(inputs.get(name, 0))))
        contribution = value * weight
        total += contribution
        breakdown[name] = {
            "input_score": round(value, 2),
            "weight": weight,
            "weighted_contribution": round(contribution, 2),
        }

    spi = round(total, 2)
    if spi >= 70:
        level = "critical"
    elif spi >= 50:
        level = "high"
    elif spi >= 30:
        level = "moderate"
    else:
        level = "low"

    return {
        "spi": spi,
        "priority_level": level,
        "scale": "0-100; higher means more urgent",
        "breakdown": breakdown,
        "formula": "SPI = population*0.30 + infrastructure*0.25 + communication*0.15 + accessibility*0.15 + terrain*0.15",
        "weight_status": "prototype assumptions; validate with disaster-management experts",
    }
