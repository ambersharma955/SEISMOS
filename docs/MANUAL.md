# SEISMOS Website & Operations Manual
**Project:** SEISMOS — Space-Enabled Seismic Intelligence and Multi-Hazard Operations System  
**Team:** ORBIT.EXE  
**Release bundle:** Integrated Frontend 1/2 and Backend 1/2

## 1. Purpose and safety boundary
SEISMOS combines seismic observations with geospatial and impact decision-support views. It is a prototype. It does not predict earthquakes, issue official tsunami warnings, determine safe evacuation routes, receive or dispatch real SOS requests, or replace emergency authorities.

The backend is one service (port 8000) with two modules:
- Seismic module: USGS earthquake feed and preliminary tsunami/landslide screening.
- Impact module: a fixed reference-scenario impact model, a prototype weighted Seismos Priority Index (SPI), and links to external satellite catalogues.

## 2. Installation and startup
Follow the root `README.md`. Start the backend and the frontend in two terminals. Keep both terminals open while using the local site.

Health checks:
- Backend 1: `http://127.0.0.1:8000/health`
- Backend 2: `http://127.0.0.1:8000/health`
- Backend 1 API docs: `http://127.0.0.1:8000/docs`
- Backend 2 API docs: `http://127.0.0.1:8000/docs`

If a health check fails, confirm the correct terminal is running and that the port is not occupied by another process.

## 3. Website navigation

### Overview
The landing dashboard summarises the seismic feed and provides access to the other modules. Earthquake count and feed status come from Backend 1 when available. The schematic overview graphic is illustrative and is not a navigational GIS basemap.

### Seismic Intelligence
1. Open **Seismic Intelligence** in the sidebar.
2. Use **Refresh feed** to request the latest earthquake records.
3. Search by place/region and filter by minimum magnitude.
4. Select an event to inspect magnitude, depth, time, coordinates and preliminary screening.
5. Read the detailed hazard assessment and advisory lookup when returned by Backend 1.

Tsunami and landslide outputs are preliminary rule-based screening indicators. They are not official alerts. Follow INCOIS, PTWC, NDMA and local authorities as applicable.

### Space Observation — 3D terrain and impact screening
1. Open **Space Observation**. The event selector combines coordinate-enabled records returned by Backend 1 with the separately labelled `turkey-2023-demo` Backend 2 reference scenario.
2. Select an earthquake. The event card shows magnitude, coordinates, timestamp and source. Use **Refresh events** to reload the Backend 1 feed.
3. **Before earthquake** shows a 3D terrain-context map centred on the epicentre. It uses public MapLibre demonstration elevation tiles when reachable. This is not a dated pre-event satellite acquisition.
4. **After earthquake** shows the same terrain context plus a dashed, magnitude-derived screening circle. This is an illustrative visualization radius only, not a measured damage boundary, terrain change or building-destruction footprint.
5. The **Difference & destruction** panel reports the selected event's magnitude and depth, the illustrative screening radius, data provenance and what is unavailable.
6. For the reference scenario, Backend 2 catalogue links are shown if its satellite endpoint responds. For other events, the app explicitly says event-specific acquisition metadata is not currently available.

**Current limitations:** the app does not yet retrieve date-matched pre/post satellite imagery, DEM acquisitions, InSAR displacement products or verified building-damage labels. It does not calculate elevation differences, collapsed-building counts or destruction percentages. The two maps are interactive 3D terrain-context views; the post-event screening overlay is estimated and labelled. Terrain tiles are external public demonstration data and may not load without internet access. Do not interpret these maps as proof of actual damage.

### Emergency Response
1. Open **Emergency Response**.
2. The page requests impact and priority results from Backend 2.
3. Review each indicator and its method note.
4. Review the SPI component breakdown and prototype weights.

The only bundled scenario is `turkey-2023-demo`. Its population density, infrastructure score, communication disruption, accessibility and terrain inputs are fixed illustrative assumptions. They are not verified event measurements. Infrastructure asset counts are not queried from a live map dataset. No DEM is processed. SPI weights are design assumptions, not validated scientific coefficients.

Live SOS intake, responder assignment, dispatch, relief-centre inventory and route planning are not implemented in this release. The interface deliberately does not display fabricated requests or team positions.

## 4. Backend API reference

### Backend 1
- `GET /api/earthquakes` — earthquake list (supports the query parameters documented in Swagger).
- `GET /api/earthquakes/{event_id}` — one event.
- `GET /api/hazards/{event_id}` — preliminary hazard assessment.
- `GET /health` — health.

### Backend 2
- `GET /api/impact/turkey-2023-demo` — scenario impact indicators.
- `GET /api/priority/turkey-2023-demo` — SPI score and weighted breakdown.
- `GET /api/satellite/turkey-2023-demo` — event coordinates and catalogue discovery URLs.
- `GET /health` — health.

## 5. Understanding the Seismos Priority Index
Backend 2 computes a 0–100 weighted score:
- Population exposure score: 30%
- Infrastructure score: 25%
- Communication disruption: 15%
- Accessibility constraint: 15%
- Terrain vulnerability: 15%

Higher values map to higher prototype priority categories. The weights and input scores are not scientifically validated. A score is not a casualty estimate or a dispatch instruction. Inspect the API's `breakdown` field to see each input, weight and weighted contribution.

## 6. Data provenance and current limitations
- USGS earthquake feed: live external source when Backend 1 reports `usgs_live`; network/API outages can prevent retrieval.
- Backend 1 hazard screening: preliminary heuristics; consult its response disclaimer.
- Backend 2 scenario data: fixed simulated inputs; low confidence.
- Satellite sources: external discovery portals; no imagery is ingested by this app.
- OpenStreetMap: used only for the reference location map embed; it is not used here to calculate asset counts or routes.
- SOS and responder operations: not connected.

Never describe a simulated or assumed value as live, measured, verified or official.

## 7. Troubleshooting
**Frontend cannot load earthquakes:** verify Backend 1 `/health`; check port 8000; restart its server; refresh the frontend.

**Impact or satellite page reports API unavailable:** verify the backend `/health`; confirm it runs on port 8000; check the Vite proxy configuration and restart Vite.

**CORS or network error:** use the Vite development URL and the included proxy configuration. If deploying separately, set `CORS_ORIGINS` on the backend and set `VITE_API_BASE_URL` for the deployed API host.

**Port already in use:** stop the other process or change the service port and update the matching proxy/environment setting.

**Map or catalogue link does not load:** check internet access and the third-party provider's availability. External map/catalogue providers have their own terms and availability.

## 8. Production-readiness checklist
Before operational deployment, complete all of the following:
- Replace fixed scenario inputs with verified, versioned geospatial/population/infrastructure/terrain datasets.
- Implement satellite authentication, acquisition search, download, processing, storage, provenance and quality checks.
- Validate exposure and SPI methodology with domain experts; publish uncertainty and limitations.
- Implement secure SOS intake, identity verification, abuse prevention, responder workflows, audit trail and incident escalation before showing any operational claims.
- Add persistent storage, authentication, role-based access, rate limiting, monitoring, backups and incident response.
- Restrict CORS, enforce HTTPS, remove debug/reload mode and store secrets securely.
- Conduct accessibility, load, security and disaster-recovery testing.
- Obtain approval from relevant emergency-management authorities before any real-world use.

## 9. Quick acceptance test
1. Confirm both backend health URLs return healthy.
2. Confirm `/api/earthquakes` on Backend 1 returns HTTP 200 and a source field.
3. Confirm Backend 2 `/api/impact/turkey-2023-demo` returns HTTP 200 and includes a simulated-data disclosure.
4. Confirm Backend 2 `/api/priority/turkey-2023-demo` returns an SPI between 0 and 100.
5. Open all four website pages and confirm no API errors.
6. Confirm satellite catalogue links open externally and no claim is made that imagery has been processed.
