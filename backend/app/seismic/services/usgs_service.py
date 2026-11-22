from datetime import date,datetime,timedelta,timezone
from typing import Any,Optional
import httpx
from app.core.cache import TTLCache
from app.core.config import get_settings
from app.seismic.sample_data import SAMPLE_BY_ID,SAMPLE_EVENTS
from app.seismic.schemas import SeismicEvent
class USGSError(RuntimeError): pass
class EventNotFound(LookupError): pass
REGIONS={"india":(6,38,68,98),"andaman_nicobar":(6,15,91,95),"indian_ocean":(-40,25,40,110),"japan":(24,46,122,146),"indonesia":(-11,6,95,141),"himalaya":(26,36,72,96),"alaska":(51,72,-170,-130),"chile":(-56,-17,-76,-66),"california":(32,42,-125,-114)}
_cache=TTLCache(get_settings().cache_ttl_s)
def _parse_feature(f:dict[str,Any])->Optional[SeismicEvent]:
 try:
  p=f["properties"]; lon,lat,*rest=f["geometry"]["coordinates"]; depth=float(rest[0]) if rest and rest[0] is not None else 0.0
  ts=datetime.fromtimestamp(p["time"]/1000,tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
  return SeismicEvent(event_id=f["id"],magnitude=float(p["mag"]) if p.get("mag") is not None else 0.0,depth_km=depth,location=p.get("place") or "Unknown location",latitude=float(lat),longitude=float(lon),timestamp=ts,usgs_tsunami_flag=bool(p.get("tsunami")),url=p.get("url"),alert=p.get("alert"))
 except (KeyError,TypeError,ValueError,IndexError): return None
async def _get(params):
 s=get_settings()
 try:
  async with httpx.AsyncClient(timeout=s.http_timeout_s,headers={"User-Agent":s.user_agent}) as c: r=await c.get(f"{s.usgs_base_url}/query",params=params)
 except httpx.HTTPError as e: raise USGSError(f"USGS unreachable: {e}") from e
 if r.status_code in (204,404): return None
 if r.status_code>=400: raise USGSError(f"USGS returned {r.status_code}: {r.text[:200]}")
 return r.json()
async def fetch_events(min_magnitude=2.5,max_magnitude=None,start=None,end=None,bbox=None,place_contains=None,limit=100):
 start=start or ((end or date.today())-timedelta(days=7)); params={"format":"geojson","orderby":"time","minmagnitude":min_magnitude,"starttime":start.isoformat(),"limit":max(1,min(limit,500))}
 if end: params["endtime"]=(end+timedelta(days=1)).isoformat()
 if max_magnitude is not None: params["maxmagnitude"]=max_magnitude
 if bbox: params.update(minlatitude=bbox[0],maxlatitude=bbox[1],minlongitude=bbox[2],maxlongitude=bbox[3])
 key="list:"+"&".join(f"{k}={v}" for k,v in sorted(params.items())); cached=_cache.get(key)
 if cached is None:
  data=await _get(params); cached=data.get("features",[]) if data else []; _cache.set(key,cached)
 events=[e for e in (_parse_feature(f) for f in cached) if e]
 if place_contains: events=[e for e in events if place_contains.lower() in e.location.lower()]
 return events
async def get_event(event_id):
 if event_id in SAMPLE_BY_ID: return SAMPLE_BY_ID[event_id]
 key=f"event:{event_id}"; ev=_cache.get(key)
 if ev: return ev
 data=await _get({"format":"geojson","eventid":event_id})
 if not data: raise EventNotFound(event_id)
 feature=data["features"][0] if data.get("type")=="FeatureCollection" and data.get("features") else data; ev=_parse_feature(feature)
 if not ev: raise EventNotFound(event_id)
 _cache.set(key,ev,ttl=600); return ev
