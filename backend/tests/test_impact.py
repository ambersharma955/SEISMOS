from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_impact_reference_scenario_is_disclosed():
    response = client.get("/api/impact/turkey-2023-demo")
    assert response.status_code == 200
    payload = response.json()
    assert payload["event_id"] == "turkey-2023-demo"
    assert "SIMULATED" in payload["data_status"]

def test_priority_reference_scenario():
    response = client.get("/api/priority/turkey-2023-demo")
    assert response.status_code == 200
    payload = response.json()
    assert 0 <= payload["spi"] <= 100
    assert payload["data_confidence"] == "low"

def test_satellite_catalogue_discovery():
    response = client.get("/api/satellite/turkey-2023-demo")
    assert response.status_code == 200
    assert response.json()["imagery_sources"]

def test_unknown_event_returns_404():
    assert client.get("/api/impact/not-a-real-event").status_code == 404
