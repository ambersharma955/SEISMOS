from datetime import date
from fastapi import APIRouter,HTTPException,Query
from app.core.config import get_settings
from app.seismic.schemas import Earthquake,EarthquakeList
from app.seismic.sample_data import SAMPLE_EVENTS
from app.seismic.services import usgs_service,hazard_assessment
router=APIRouter(prefix="/api/earthquakes",tags=["earthquakes"])
def serialize(ev):
 tsunami,landslide=hazard_assessment.quick_levels(ev)
 return Earthquake(event_id=ev.event_id,magnitude=ev.magnitude,depth_km=ev.depth_km,location=ev.location,latitude=ev.latitude,longitude=ev.longitude,timestamp=ev.timestamp,tsunami_screening=tsunami,landslide_risk=landslide,data_source=ev.data_source)
@router.get("",response_model=EarthquakeList)
async def list_earthquakes(min_magnitude:float=Query(2.5,ge=0,le=10),max_magnitude:float|None=Query(None,ge=0,le=10),start_date:date|None=None,end_date:date|None=None,region:str|None=None,place_contains:str|None=None,limit:int=Query(100,ge=1,le=500),mock:bool=False):
 if region and region not in usgs_service.REGIONS: raise HTTPException(400,f"Unknown region '{region}'. Valid regions: {', '.join(sorted(usgs_service.REGIONS))}")
 if start_date and end_date and start_date>end_date: raise HTTPException(400,"start_date must be on or before end_date")
 if mock:
  events=[e for e in SAMPLE_EVENTS if e.magnitude>=min_magnitude and (max_magnitude is None or e.magnitude<=max_magnitude)]
  if region: events=[e for e in events if region in ("india","andaman_nicobar","indian_ocean","himalaya")]
  if place_contains: events=[e for e in events if place_contains.lower() in e.location.lower()]
  events=events[:limit]; source="simulated_sample"
 else:
  bbox=usgs_service.REGIONS.get(region) if region else None
  try: events=await usgs_service.fetch_events(min_magnitude,max_magnitude,start_date,end_date,bbox,place_contains,limit); source="usgs_live"
  except usgs_service.USGSError as exc:
   if not get_settings().use_sample_fallback: raise HTTPException(502,str(exc))
   events=[e for e in SAMPLE_EVENTS if e.magnitude>=min_magnitude and (max_magnitude is None or e.magnitude<=max_magnitude)]; source="simulated_sample"
 return EarthquakeList(count=len(events),source=source,earthquakes=[serialize(e) for e in events])
@router.get("/{event_id}",response_model=Earthquake)
async def get_earthquake(event_id:str):
 try: return serialize(await usgs_service.get_event(event_id))
 except usgs_service.EventNotFound: raise HTTPException(404,f"Event '{event_id}' not found")
 except usgs_service.USGSError as exc: raise HTTPException(502,str(exc))
