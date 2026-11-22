// Impact endpoints live on the same unified backend as the seismic feed (/api/impact, /api/priority, /api/satellite).
const API_BASE = `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')}/api`;

async function request(path, { signal } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Impact API request failed (${response.status})${detail ? `: ${detail.slice(0, 180)}` : ''}`);
  }
  return response.json();
}

export const REFERENCE_EVENT_ID = 'turkey-2023-demo';

// Labelled reference scenario served by Backend 2 (simulated inputs).
export const REFERENCE_EVENT = {
  id: REFERENCE_EVENT_ID,
  place: '2023 Türkiye–Syria earthquake (reference scenario)',
  region: 'Reference scenario',
  magnitude: 7.8,
  depthKm: 17.9,
  timestamp: '2023-02-06T01:17:00Z',
  latitude: 37.17,
  longitude: 37.03,
  source: 'backend2_reference_scenario',
  tsunamiScreening: 'unknown',
  landslideRisk: 'unknown',
};

export function getImpact(eventId = REFERENCE_EVENT_ID, options = {}) {
  return request(`/impact/${encodeURIComponent(eventId)}`, options);
}
export function getPriority(eventId = REFERENCE_EVENT_ID, options = {}) {
  return request(`/priority/${encodeURIComponent(eventId)}`, options);
}
export function getSatellite(eventId = REFERENCE_EVENT_ID, options = {}) {
  return request(`/satellite/${encodeURIComponent(eventId)}`, options);
}
