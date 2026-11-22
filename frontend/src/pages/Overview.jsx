import { useEffect, useMemo, useState } from 'react';
import { Activity, Satellite, Waves, ShieldCheck, ArrowUpRight, Crosshair, AlertTriangle } from 'lucide-react';
import StatCard from '../components/StatCard';
import EarthquakeList from '../components/EarthquakeList';
import { fetchEarthquakes } from '../services/earthquakeApi';

export default function Overview({ onNavigate }) {
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sourceLabel, setSourceLabel] = useState('WAITING FOR API');
  const [feedError, setFeedError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchEarthquakes({ signal: controller.signal })
      .then(data => {
        if (data.length) {
          setEvents(data);
          setSelectedId(data[0].id);
          setSourceLabel(data[0]?.source === 'usgs_live' ? 'USGS LIVE' : 'SIMULATED SAMPLE');
          setFeedError('');
        } else {
          setFeedError('The API responded, but no earthquake records were returned. No local sample records are displayed.');
        }
      })
      .catch(error => {
        if (error.name !== 'AbortError') setFeedError('Backend 1 is not connected yet. No local sample records are displayed.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => events.filter(e => `${e.place} ${e.region}`.toLowerCase().includes(query.toLowerCase())), [events, query]);
  const selected = events.find(e => e.id === selectedId) || events[0];

  return (
    <div className="content">
      <div className="welcome">
        <div><small>SPACE-ENABLED MULTI-HAZARD INTELLIGENCE</small><h1>Disaster intelligence, connected.</h1><p>One operational picture for seismic events, secondary hazards and emergency response.</p></div>
        <span className="prototype">◷ Prototype</span>
      </div>
      <section className="hero">
        <div className="hero-text"><small>● ORBIT.EXE PRESENTS</small><h2>From seismic signals<br /><em>to smarter response.</em></h2><p>Bring earthquake observations, ocean signals and satellite intelligence into one clear view.</p><button onClick={() => onNavigate('Seismic Intelligence')}>Explore seismic intelligence <ArrowUpRight size={15} /></button></div>
        <div className="earth-art"><div className="orbit one" /><div className="orbit two" /><div className="planet" /><div className="sat">✦</div><i className="pulse p1" /><i className="pulse p2" /><i className="pulse p3" /></div>
      </section>
      <div className="stats">
        <StatCard icon={Activity} label="Earthquakes in feed" value={String(events.length).padStart(2, '0')} note={sourceLabel === 'USGS LIVE' ? 'Live USGS feed' : 'Waiting for backend data'} />
        <StatCard icon={Waves} label="Ocean observations" value="—" note="NOAA/NWS advisories on detail view" />
        <StatCard icon={Satellite} label="Satellite layers" value="—" note="Catalogue discovery available in Space Observation" />
        <StatCard icon={ShieldCheck} label="System status" value="Ready" note={sourceLabel === 'USGS LIVE' ? 'API feed active' : 'Backend connection needed'} />
      </div>
      <div className="dash">
        <section className="panel">
          <div className="panel-head"><div><small>GLOBAL MONITORING</small><h3>Seismic activity map</h3></div><span className="sample">SCHEMATIC</span></div>
          <div className="map">
            <div className="mapgrid" /><div className="continent c1" /><div className="continent c2" /><div className="continent c3" /><div className="continent c4" />
            <span className="maplabel pac">PACIFIC OCEAN</span><span className="maplabel asia">ASIA</span><span className="maplabel amer">NORTH AMERICA</span>
            {events.filter(e => e.latitude != null && e.longitude != null).map(event => {
              const left = `${((event.longitude + 180) / 360) * 100}%`;
              const top = `${((90 - event.latitude) / 180) * 100}%`;
              return <button key={event.id} title={`${event.place} · M${event.magnitude}`} className={`quake ${selectedId === event.id ? 'active' : ''}`} style={{ left, top }} onClick={() => setSelectedId(event.id)} />;
            })}
            <div className="legend"><span>● M5.0+</span><span>● M4.0–4.9</span></div><span className="mapnote">Schematic world view · not a navigation map</span>
          </div>
          <div className="mapfoot"><span>● {sourceLabel === 'USGS LIVE' ? 'Backend event coordinates' : 'No live coordinate data'}</span><span>Select a marker to inspect</span></div>
        </section>
        <EarthquakeList events={filtered} selectedId={selectedId} onSelect={setSelectedId} query={query} onQuery={setQuery} loading={loading} error={feedError} sourceLabel={sourceLabel} />
      </div>
      {selected && <div className="selected-event"><div><small><Crosshair size={13} /> SELECTED EVENT</small><b>{selected.place}</b></div><div className="event-metrics"><span>Magnitude<strong>{selected.magnitude.toFixed(1)}</strong></span><span>Depth<strong>{selected.depthKm} km</strong></span><span>Latitude<strong>{selected.latitude ?? '—'}</strong></span><span>Longitude<strong>{selected.longitude ?? '—'}</strong></span></div></div>}
      <div className="modules">
        <Module icon={Activity} number="01" title="Seismic Intelligence" description="Magnitude, depth, event location and secondary-hazard screening." action={() => onNavigate('Seismic Intelligence')} />
        <Module icon={Satellite} number="02" title="Space Observation" description="Reference-event mapping and satellite catalogue discovery." action={() => onNavigate('Space Observation')} />
        <Module icon={ShieldCheck} number="03" title="Emergency Response" description="Reference-scenario impact indicators and transparent priority scoring." action={() => onNavigate('Emergency Response')} />
      </div>
      <div className="disclaimer"><AlertTriangle size={15} /><span><b>Important:</b> SEISMOS is a prototype decision-support concept. It does not predict earthquakes or replace official tsunami and emergency warnings.</span></div>
      <footer><span>© 2026 SEISMOS · ORBIT.EXE</span><span>OVERVIEW</span></footer>
    </div>
  );
}

function Module({ icon: Icon, number, title, description, action }) {
  return <article className="module"><div className="module-icon sage"><Icon /></div><div><small>MODULE {number}</small><h4>{title}</h4><p>{description}</p>{action && <button className="text-action" onClick={action}>Open module <ArrowUpRight size={12} /></button>}</div></article>;
}
