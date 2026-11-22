import httpx
from app.core.cache import TTLCache
from app.core.config import get_settings
from app.seismic.schemas import Advisory
TSUNAMI_EVENTS=["Tsunami Warning","Tsunami Watch","Tsunami Advisory"]
COVERAGE_NOTE=("NOAA/NWS alerts cover US and Canadian coasts only. An empty result does NOT mean no tsunami threat elsewhere; for the Indian Ocean check INCOIS (ITEWC), and for the Pacific check PTWC (tsunami.gov).")
_cache=TTLCache(120)
async def get_tsunami_advisories():
 cached=_cache.get("alerts")
 if cached is not None: return cached
 s=get_settings(); headers={"User-Agent":s.user_agent,"Accept":"application/geo+json"}
 try:
  async with httpx.AsyncClient(timeout=s.http_timeout_s,headers=headers) as c:
   r=await c.get(s.nws_alerts_url,params={"event":TSUNAMI_EVENTS}); r.raise_for_status(); features=r.json().get("features",[])
 except (httpx.HTTPError,ValueError): return "unavailable",[]
 out=[]
 for f in features:
  p=f.get("properties",{}); out.append(Advisory(id=p.get("id") or f.get("id", ""),event=p.get("event", ""),headline=p.get("headline"),area=p.get("areaDesc"),severity=p.get("severity"),sent=p.get("sent"),expires=p.get("expires"),sender=p.get("senderName")))
 result=("ok",out); _cache.set("alerts",result); return result
