# Validation record (deployment-ready build)

Verified in the packaging environment:

- Unified `backend`: `python -m pytest -q` → **14 passed** (9 seismic + 5 impact).
- Frontend: `npm install && npm run build` → **succeeds** (Vite 6, Node 22). Pages are code-split; MapLibre is a
  separate lazy-loaded chunk that loads only on Space Observation.
- Live smoke test through the Vite preview proxy: `/health`, `/api/earthquakes`, `/api/earthquakes/{id}`,
  `/api/hazards/{id}`, `/api/{impact,priority,satellite}/turkey-2023-demo`
  all returned HTTP 200, and the SPA index served correctly.

Not verified here (no Docker daemon / browser / internet in the packaging environment): `docker compose up`
end-to-end, live USGS feed responses, and map/terrain tile loading in a real browser. Run the acceptance test in
`MANUAL.md` §9 after deploying.

## Interpretation limits

- Before/after maps are terrain/satellite context, not verified damage observations; the screening circle is
  magnitude-derived and illustrative.
- Backend 2 has a single fixed reference scenario with simulated inputs; SPI weights are unvalidated.
- Passing tests do not establish scientific validity or operational readiness.
