from app.seismic.schemas import SeismicEvent
SAMPLE_EVENTS=[
 SeismicEvent("usgs-example-001",6.8,18.5,"Example Region",12.5,93.2,"2026-11-21T10:30:00Z",data_source="simulated_sample"),
 SeismicEvent("usgs-example-002",7.6,25.0,"Off the coast of Example Island",-3.2,99.8,"2026-11-21T08:05:00Z",usgs_tsunami_flag=True,data_source="simulated_sample"),
 SeismicEvent("usgs-example-003",4.2,9.0,"12 km N of Example Town",30.1,78.4,"2026-11-20T22:40:00Z",data_source="simulated_sample"),
]
SAMPLE_BY_ID={e.event_id:e for e in SAMPLE_EVENTS}
