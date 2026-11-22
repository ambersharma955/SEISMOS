from __future__ import annotations
from dataclasses import dataclass
from typing import Literal, Optional
from pydantic import BaseModel
TsunamiLevel=Literal["unlikely","requires_review","elevated"]
LandslideLevel=Literal["low","moderate","high"]
DataSource=Literal["usgs_live","simulated_sample"]
@dataclass
class SeismicEvent:
    event_id:str; magnitude:float; depth_km:float; location:str; latitude:float; longitude:float; timestamp:str
    usgs_tsunami_flag:bool=False; data_source:str="usgs_live"; url:Optional[str]=None; alert:Optional[str]=None
class Earthquake(BaseModel):
    event_id:str; magnitude:float; depth_km:float; location:str; latitude:float; longitude:float; timestamp:str
    tsunami_screening:TsunamiLevel; landslide_risk:LandslideLevel; data_source:DataSource="usgs_live"
class EarthquakeList(BaseModel): count:int; source:DataSource; earthquakes:list[Earthquake]
class TerrainStats(BaseModel):
    epicenter_elevation_m:float; relief_m:float; mean_slope_deg:float; max_slope_deg:float; sample_radius_km:float; source:str
class Advisory(BaseModel):
    id:str; event:str; headline:Optional[str]=None; area:Optional[str]=None; severity:Optional[str]=None; sent:Optional[str]=None; expires:Optional[str]=None; sender:Optional[str]=None; source:str="NOAA/NWS (api.weather.gov)"
class TsunamiDetail(BaseModel): level:TsunamiLevel; score:int; offshore:Optional[bool]=None; usgs_tsunami_flag:bool=False; factors:list[str]
class LandslideDetail(BaseModel): level:LandslideLevel; score:int; basis:Literal["magnitude_depth_only","magnitude_depth_terrain"]; factors:list[str]; terrain:Optional[TerrainStats]=None
class HazardAssessment(BaseModel):
    event_id:str; magnitude:float; depth_km:float; location:str; latitude:float; longitude:float; timestamp:str
    tsunami_screening:TsunamiLevel; landslide_risk:LandslideLevel; tsunami:TsunamiDetail; landslide:LandslideDetail
    advisories_status:Literal["ok","unavailable","skipped"]; advisories:list[Advisory]; advisories_note:str
    preliminary:bool=True; data_source:DataSource; data_labels:dict[str,str]; disclaimer:str
