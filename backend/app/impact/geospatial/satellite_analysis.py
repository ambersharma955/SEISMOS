from fastapi import APIRouter, HTTPException
from app.impact.data import get_event

router = APIRouter()

@router.get("/satellite/{event_id}")
def get_satellite_resources(event_id: str):
    event = get_event(event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found. Use turkey-2023-demo for the documented reference scenario.")
    lat, lon = event["latitude"], event["longitude"]
    copernicus_browser = f"https://browser.dataspace.copernicus.eu/?lat={lat}&lng={lon}&zoom=8"
    return {
        "event_id": event_id,
        "centre": {"latitude": lat, "longitude": lon},
        "imagery_sources": [
            {"name": "Copernicus Data Space Browser", "url": copernicus_browser,
             "purpose": "Discover Sentinel-1 and Sentinel-2 acquisitions near the event",
             "status": "External catalogue link; imagery is not downloaded or analysed by this API"},
            {"name": "USGS EarthExplorer", "url": "https://earthexplorer.usgs.gov/",
             "purpose": "Discover Earth observation datasets",
             "status": "External catalogue link; imagery is not downloaded or analysed by this API"},
        ],
        "data_status": "No satellite imagery has been ingested or processed by this service."
    }
