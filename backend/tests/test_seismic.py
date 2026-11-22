from fastapi.testclient import TestClient
from app.main import app
from app.seismic.sample_data import SAMPLE_BY_ID
from app.seismic.schemas import SeismicEvent
from app.seismic.services.hazard_assessment import quick_levels,screen_landslide,screen_tsunami
client=TestClient(app)
def ev(m,d,loc="Somewhere",flag=False): return SeismicEvent("t",m,d,loc,0.0,0.0,"2026-01-01T00:00:00Z",usgs_tsunami_flag=flag)
def test_sample_contract(): assert quick_levels(SAMPLE_BY_ID["usgs-example-001"])==("requires_review","moderate")
def test_small_quake(): assert quick_levels(ev(4.2,10))==("unlikely","low")
def test_big_shallow_offshore(): assert screen_tsunami(ev(7.8,20,"off the coast of X"),True).level=="elevated"
def test_deep_quake(): assert screen_tsunami(ev(7.5,300,"Ocean"),True).level=="unlikely"
def test_landslide_threshold(): assert screen_landslide(ev(5.5,5)).level!="high"
def test_mock_endpoint():
 r=client.get("/api/earthquakes?mock=true"); assert r.status_code==200; body=r.json(); assert body["source"]=="simulated_sample" and body["count"]==3
 assert {"event_id","magnitude","depth_km","location","latitude","longitude","timestamp","tsunami_screening","landslide_risk"}<=body["earthquakes"][0].keys()
def test_sample_hazard_offline():
 r=client.get("/api/hazards/usgs-example-001?use_terrain=false&include_advisories=false"); assert r.status_code==200; j=r.json(); assert j["preliminary"] is True and j["tsunami_screening"]=="requires_review"
def test_invalid_region(): assert client.get("/api/earthquakes?region=narnia").status_code==400
def test_health(): assert client.get("/health").json()["status"]=="ok"
