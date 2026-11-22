# SEISMOS Space Observation — three modes

The Space Observation page now has three selectable modes:

1. **Terrain 3D** — Esri World Imagery satellite/aerial basemap draped over a public MapLibre demonstration elevation model, with a 3D tilt and earthquake epicentre marker.
2. **Satellite comparison** — NASA GIBS MODIS Terra Corrected Reflectance True Color daily imagery tiles for the UTC day before and the UTC day after the event. MODIS is genuine satellite imagery but is relatively coarse (up to roughly 250 m for this product); cloud cover, missing acquisitions, and tile coverage can limit usefulness. The displayed dates are requested product dates, not proof of a clear scene acquisition.
3. **Impact difference** — real Esri imagery with an illustrative magnitude-derived screening radius. It is not a measured damage boundary.

## Important data integrity notes

- The Esri World Imagery layer is a real satellite/aerial imagery mosaic, but is not guaranteed to be captured on the earthquake date.
- NASA GIBS MODIS tiles are real dated satellite imagery, but are not high-resolution building-damage imagery. For detailed event analysis, use Sentinel-1 SAR / Sentinel-2 scenes from Copernicus Data Space and verify acquisition time, cloud cover, and processing.
- The prototype does not currently download or process a validated Sentinel pre/post pair, pre/post DEM, or InSAR deformation product. It must not report building collapse counts, destruction percentages, or measured ground-height differences.
- The DEM is geographic elevation context, not earthquake-specific deformation. The impact ring is an estimated visualization only.
- Satellite tiles require internet access. NASA GIBS and Esri service availability/terms may change.
