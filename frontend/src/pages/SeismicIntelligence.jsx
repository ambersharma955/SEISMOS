import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, ArrowUpRight, Clock3, Crosshair, Info, RefreshCw, Waves, Mountain, ShieldCheck } from 'lucide-react';
import EarthquakeList from '../components/EarthquakeList';
import { fetchEarthquakes, fetchHazardAssessment } from '../services/earthquakeApi';

export default function SeismicIntelligence() {
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [minMagnitude, setMinMagnitude] = useState('0');
  const [loading, setLoading] = useState(false);
  const [hazardLoading, setHazardLoading] = useState(false);
  const [sourceLabel, setSourceLabel] = useState('WAITING FOR API');
  const [notice, setNotice] = useState('No cached or simulated events are displayed while Backend 1 is unavailable.');
  const [assessment, setAssessment] = useState(null);
  const [assessmentError, setAssessmentError] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchEarthquakes();
      if (!data.length) throw new Error('Backend returned no earthquake records.');
      setEvents(data);
      setSelectedId(data[0].id);
      setSourceLabel(data[0].source === 'usgs_live' ? 'USGS LIVE' : 'SIMULATED SAMPLE');
      setNotice(`Loaded ${data.length} earthquake record(s) from Backend 1. Data source: ${data[0].source}.`);
    } catch (error) {
      setSourceLabel('NO LIVE DATA');
      setNotice(`Backend 1 unavailable: ${error.message}. No local sample events are displayed.`);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadEvents(); }, []);

  useEffect(() => {
    if (!selectedId) {
      setAssessment(null);
      setAssessmentError('');
      return;
    }
    const controller = new AbortController();
    setHazardLoading(true);
    setAssessmentError('');
    fetchHazardAssessment(selectedId, { signal: controller.signal })
      .then(setAssessment)
      .catch(error => {
        if (error.name !== 'AbortError') {
          setAssessment(null);
          setAssessmentError(`Hazard assessment unavailable: ${error.message}`);
        }
      })
      .finally(() => { if (!controller.signal.aborted) setHazardLoading(false); });
    return () => controller.abort();
  }, [selectedId]);

  const filtered = useMemo(() => events.filter(e =>
    e.magnitude >= Number(minMagnitude) &&
    `${e.place} ${e.region}`.toLowerCase().includes(query.toLowerCase())
  ), [events, minMagnitude, query]);
  const selected = events.find(e => e.id === selectedId) || filtered[0] || events[0];

  return (
    <div className="content">
      <div className="welcome">
        <div><small>MODULE 01</small><h1>Seismic Intelligence</h1><p>Review earthquake events and the preliminary evidence for secondary-hazard screening.</p></div>
        <button className="refresh-button" onClick={loadEvents} disabled={loading}><RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh feed</button>
      </div>
      <div className="notice"><Info size={15} /><span>{notice}</span></div>
      <div className="stats">
        <Metric icon={Activity} label="Events loaded" value={String(events.length)} note={sourceLabel} />
        <Metric icon={AlertTriangle} label="Magnitude 5.0+" value={String(events.filter(e => e.magnitude >= 5).length)} note="Display filter / triage context" />
        <Metric icon={Waves} label="Tsunami screening" value={selected?.tsunamiScreening?.replace('_', ' ') || '—'} note="Preliminary, not an alert" />
        <Metric icon={Mountain} label="Landslide screening" value={selected?.landslideRisk || '—'} note="Preliminary, terrain may be coarse" />
      </div>
      <div className="filter-row">
        <label>Minimum magnitude
          <select value={minMagnitude} onChange={e => setMinMagnitude(e.target.value)}>
            <option value="0">All events</option><option value="4">M 4.0+</option><option value="5">M 5.0+</option><option value="6">M 6.0+</option><option value="7">M 7.0+</option>
          </select>
        </label>
        <span>Screening categories are Backend 1's preliminary rule-based outputs.</span>
      </div>
      <div className="seismic-layout">
        <EarthquakeList events={filtered} selectedId={selected?.id} onSelect={setSelectedId} query={query} onQuery={setQuery} loading={loading} sourceLabel={sourceLabel} />
        <section className="panel event-inspector">
          <div className="panel-head"><div><small>EVENT INSPECTOR</small><h3>Earthquake details</h3></div><span className="sample">{selected?.source || sourceLabel}</span></div>
          {selected ? <>
            <div className="inspector-mag"><b>{selected.magnitude.toFixed(1)}</b><span>Magnitude</span></div>
            <h2>{selected.place}</h2><p className="muted">{selected.region}</p>
            <div className="inspector-grid">
              <InfoCell label="Depth" value={`${selected.depthKm} km`} />
              <InfoCell label="Observed (UTC)" value={selected.timestamp || selected.timeLabel} />
              <InfoCell label="Latitude" value={selected.latitude ?? '—'} />
              <InfoCell label="Longitude" value={selected.longitude ?? '—'} />
              <InfoCell label="Tsunami screening" value={selected.tsunamiScreening} />
              <InfoCell label="Landslide risk" value={selected.landslideRisk} />
            </div>
            <HazardDetails assessment={assessment} loading={hazardLoading} error={assessmentError} />
          </> : <p className="empty">Select an event to inspect its details.</p>}
        </section>
      </div>
      <section className="panel screening-guidance">
        <div className="panel-head"><div><small>SCREENING LOGIC</small><h3>Evidence the system considers</h3></div><span className="sample">DECISION SUPPORT</span></div>
        <div className="guidance-grid">
          <Guidance title="Earthquake characteristics" text="Magnitude, depth, epicentre location, time and offshore / onshore context." />
          <Guidance title="Ocean evidence" text="Backend 1 attaches NOAA/NWS tsunami advisories where available. For the Indian Ocean, check INCOIS; for the Pacific, check PTWC." />
          <Guidance title="Terrain & provenance" text="Coarse elevation / slope proxies can refine landslide screening. Always show data source, missing evidence and uncertainty." />
        </div>
      </section>
      <div className="disclaimer"><AlertTriangle size={15} /><span><b>Safety boundary:</b> Backend 1's tsunami and landslide categories are preliminary heuristics, not physical models or official warnings. Follow INCOIS, PTWC, NDMA and relevant local authorities.</span></div>
      <footer><span>© 2026 SEISMOS · ORBIT.EXE</span><span>MODULE 01 · SEISMIC INTELLIGENCE</span></footer>
    </div>
  );
}

function HazardDetails({ assessment, loading, error }) {
  if (loading) return <div className="screening-box"><b>Loading detailed hazard assessment…</b></div>;
  if (error) return <div className="screening-box"><p>{error}</p></div>;
  if (!assessment) return <div className="screening-box"><div><Info size={15} /><b>Detailed screening</b></div><p>Detailed factors and official advisory lookup appear when a Backend 1 event ID is selected. Select an event returned by Backend 1 to request its assessment.</p></div>;
  return (
    <div className="hazard-details">
      <div className="screening-box">
        <div><Waves size={15} /><b>Tsunami screening · {assessment.tsunami?.level || assessment.tsunami_screening}</b><strong className="score">Score {assessment.tsunami?.score ?? '—'}</strong></div>
        <ul>{(assessment.tsunami?.factors || []).map((factor, i) => <li key={i}>{factor}</li>)}</ul>
      </div>
      <div className="screening-box">
        <div><Mountain size={15} /><b>Landslide risk · {assessment.landslide?.level || assessment.landslide_risk}</b><strong className="score">Score {assessment.landslide?.score ?? '—'}</strong></div>
        <ul>{(assessment.landslide?.factors || []).map((factor, i) => <li key={i}>{factor}</li>)}</ul>
        {assessment.landslide?.terrain && <p>Terrain proxy: mean slope {assessment.landslide.terrain.mean_slope_deg}°, relief {assessment.landslide.terrain.relief_m} m · {assessment.landslide.terrain.source}</p>}
      </div>
      <div className="advisory-box">
        <div><ShieldCheck size={15} /><b>NOAA / NWS advisories: {assessment.advisories_status}</b></div>
        <p>{assessment.advisories_note}</p>
        {assessment.advisories?.length ? assessment.advisories.map(item => <p key={item.id}><b>{item.event}:</b> {item.headline || item.area || 'Active advisory'}</p>) : <small>No matching advisories returned by this source. This does not establish that there is no tsunami threat.</small>}
      </div>
      <p className="backend-disclaimer">{assessment.disclaimer}</p>
    </div>
  );
}

function Metric({ icon: Icon, label, value, note }) {
  return <article className="stat"><div><Icon size={16} /><span>{label}</span></div><b>{value}</b><small>{note}</small></article>;
}
function InfoCell({ label, value }) {
  return <div className="info-cell"><small>{label}</small><b>{value}</b></div>;
}
function Guidance({ title, text }) {
  return <article className="guidance-item"><div><Crosshair size={15} /></div><section><b>{title}</b><p>{text}</p></section></article>;
}
