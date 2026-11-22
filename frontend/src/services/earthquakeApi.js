const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function relativeTime(timestamp) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000));
  if (!Number.isFinite(minutes)) return 'Time unavailable';
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours} hr ago` : `${Math.floor(hours / 24)} day(s) ago`;
}

// Normalises Backend 1's exact Pydantic contract.
function normalizeEvent(item) {
  return {
    id: String(item.event_id ?? item.id ?? ''),
    place: item.location ?? item.place ?? 'Unknown location',
    region: item.region ?? 'Region not provided',
    magnitude: Number(item.magnitude ?? item.mag ?? 0),
    depthKm: Number(item.depth_km ?? item.depthKm ?? item.depth ?? 0),
    timeLabel: item.timestamp ? relativeTime(item.timestamp) : (item.timeLabel ?? 'Time unavailable'),
    timestamp: item.timestamp ?? null,
    latitude: item.latitude == null ? null : Number(item.latitude),
    longitude: item.longitude == null ? null : Number(item.longitude),
    source: item.data_source ?? item.source ?? 'unknown',
    tsunamiScreening: item.tsunami_screening ?? 'unknown',
    landslideRisk: item.landslide_risk ?? 'unknown',
    url: item.url ?? null,
  };
}

async function request(path, { signal } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Backend request failed (${response.status})${detail ? `: ${detail.slice(0, 180)}` : ''}`);
  }
  return response.json();
}

export async function fetchEarthquakes({ signal, mock = false } = {}) {
  const payload = await request(`/api/earthquakes${mock ? '?mock=true' : ''}`, { signal });
  // Backend 1 contract: { count, source, earthquakes: [...] }
  const records = Array.isArray(payload)
    ? payload
    : payload.earthquakes ?? payload.features ?? payload.data ?? [];
  return records.map(normalizeEvent).sort((a, b) => b.magnitude - a.magnitude);
}

export async function fetchHazardAssessment(eventId, { signal, useTerrain = true, includeAdvisories = true } = {}) {
  const params = new URLSearchParams({
    use_terrain: String(useTerrain),
    include_advisories: String(includeAdvisories),
  });
  return request(`/api/hazards/${encodeURIComponent(eventId)}?${params.toString()}`, { signal });
}
