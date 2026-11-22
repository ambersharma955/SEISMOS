from fastapi import APIRouter,HTTPException,Query
from app.seismic.schemas import HazardAssessment
from app.seismic.services import hazard_assessment,usgs_service
router=APIRouter(prefix="/api/hazards",tags=["hazards"])
@router.get("/{event_id}",response_model=HazardAssessment)
async def get_hazards(event_id:str,use_terrain:bool=Query(True),include_advisories:bool=Query(True)):
 try: ev=await usgs_service.get_event(event_id)
 except usgs_service.EventNotFound: raise HTTPException(404,f"Event '{event_id}' not found")
 except usgs_service.USGSError as exc: raise HTTPException(502,str(exc))
 return await hazard_assessment.assess(ev,use_terrain=use_terrain,include_advisories=include_advisories)
