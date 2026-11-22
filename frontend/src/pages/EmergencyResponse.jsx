import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RefreshCw, ShieldCheck, Info, MapPin, Activity, CalendarDays } from 'lucide-react';
import { fetchEarthquakes } from '../services/earthquakeApi';
import { getImpact, getPriority, REFERENCE_EVENT_ID, REFERENCE_EVENT } from '../services/impactApi';
import './space-response.css';

export default function EmergencyResponse() {
  const [events,setEvents]=useState([]);
  const [selectedId,setSelectedId]=useState('');
  const [impact,setImpact]=useState(null);
  const [priority,setPriority]=useState(null);
  const [loading,setLoading]=useState(true);
  const [detailLoading,setDetailLoading]=useState(false);
  const [error,setError]=useState('');
  const selected=useMemo(()=>events.find(e=>e.id===selectedId)||events[0]||null,[events,selectedId]);

  async function loadEvents(){
    setLoading(true);setError('');
    try{
      const records=await fetchEarthquakes();
      const all=[REFERENCE_EVENT,...records.filter(e=>e.id!==REFERENCE_EVENT_ID)];
      setEvents(all);
      setSelectedId(current=>all.some(e=>e.id===current)?current:(all[0]?.id||''));
    }catch(e){setError(`Earthquake feed unavailable: ${e.message}. Showing the reference scenario only.`);setEvents([REFERENCE_EVENT]);setSelectedId(c=>c||REFERENCE_EVENT_ID);}
    finally{setLoading(false);}
  }
  useEffect(()=>{loadEvents();},[]);
  useEffect(()=>{
    let cancelled=false;
    async function loadSelected(){
      setImpact(null);setPriority(null);
      if(!selected || selected.id!==REFERENCE_EVENT_ID)return;
      setDetailLoading(true);
      try{
        const [i,p]=await Promise.all([getImpact(selected.id),getPriority(selected.id)]);
        if(!cancelled){setImpact(i);setPriority(p);}
      }catch(e){if(!cancelled)setError(`Reference scenario assessment unavailable: ${e.message}`);}
      finally{if(!cancelled)setDetailLoading(false);}
    }
    loadSelected();return()=>{cancelled=true;};
  },[selected?.id]);

  const isReference=selected?.id===REFERENCE_EVENT_ID;
  const date=selected?.timestamp?new Date(selected.timestamp).toLocaleString():'Date unavailable';
  const radius=selected?Math.min(120,Math.max(8,Math.pow(10,(Number(selected.magnitude||2.5)-4.2)*.42)*8)):null;
  const exposureBand=selected?(selected.magnitude>=7?'Very high screening concern':selected.magnitude>=6?'High screening concern':selected.magnitude>=5?'Moderate screening concern':'Lower screening concern'):'—';

  return <div className="content">
    <div className="welcome"><div><small>MODULE 03 · IMPACT & RESPONSE SUPPORT</small><h1>Emergency Response Intelligence</h1><p>Choose any earthquake in the live feed to inspect its event details and preliminary response-screening indicators.</p></div>
      <button className="refresh-button" onClick={loadEvents} disabled={loading}><RefreshCw size={14}/> Refresh events</button></div>
    <div className="space-callout"><AlertTriangle size={17}/><span><b>Operational limitation:</b> These are preliminary decision-support indicators, not verified damage estimates, rescue priorities, live dispatch data or official emergency instructions.</span></div>
    {loading?<section className="panel"><p>Loading earthquake records…</p></section>:<>
      {error&&<section className="panel"><p className="api-error">{error}</p><button className="primary-button" onClick={loadEvents}>Retry</button></section>}
      <section className="panel">
        <div className="panel-head"><div><small>EARTHQUAKE CASE SELECTION</small><h3>{events.length} cases available</h3></div><span className="sample">LIVE FEED + REFERENCE</span></div>
        <label className="event-select-label" htmlFor="response-case">Select an earthquake case</label>
        <select id="response-case" className="response-case-select" value={selected?.id||''} onChange={e=>setSelectedId(e.target.value)}>
          {events.map(e=><option key={e.id} value={e.id}>{e.id===REFERENCE_EVENT_ID?'REFERENCE · ':''}M{Number(e.magnitude).toFixed(1)} · {e.place} · {e.id}</option>)}
        </select>
      </section>
      {selected&&<>
        <section className="panel">
          <div className="panel-head"><div><small>SELECTED EARTHQUAKE · {selected.id}</small><h3>{selected.place}</h3></div><span className="sample">EVENT SCREENING</span></div>
          <div className="assessment-grid">
            <Metric label="Magnitude" value={`M${Number(selected.magnitude).toFixed(1)}`} note="USGS / connected earthquake feed"/>
            <Metric label="Depth" value={`${selected.depthKm??'—'} km`} note="Reported hypocentral depth"/>
            <Metric label="Event time" value={date} note="Timestamp from earthquake feed"/>
            <Metric label="Coordinates" value={`${selected.latitude??'—'}, ${selected.longitude??'—'}`} note="Reported epicentre coordinates"/>
            <Metric label="Tsunami screening" value={selected.tsunamiScreening||'Not provided'} note="Preliminary backend screening only"/>
            <Metric label="Landslide screening" value={selected.landslideRisk||'Not provided'} note="Preliminary backend screening only"/>
            <Metric label="Magnitude-based concern band" value={exposureBand} note="Simple magnitude band; not a validated impact model"/>
            <Metric label="Indicative screening radius" value={radius?`~${radius.toFixed(1)} km`:'—'} note="Heuristic display radius, not a predicted damage boundary"/>
          </div>
          <div className="assessment-note"><Info size={16}/><span>Source: {selected.source||'Earthquake feed'}. Event details are available for every returned case. Population, infrastructure, communications and access measurements are not available for every event.</span></div>
        </section>
        {isReference&&detailLoading?<section className="panel"><p>Loading reference-scenario impact assessment…</p></section>:isReference&&impact&&priority?<section className="panel">
          <div className="panel-head"><div><small>ADDITIONAL MODEL OUTPUT · REFERENCE CASE</small><h3>{impact.event_name}</h3></div><span className="sample">SIMULATED INPUTS</span></div>
          <div className="assessment-grid">
            <Metric label="Modelled population exposure" value={Number(impact.population_exposure).toLocaleString()} note={impact.population_method}/>
            <Metric label="Infrastructure exposure" value={impact.infrastructure_exposure} note="Not live asset inventory"/>
            <Metric label="Communication disruption input" value={`${impact.communication_disruption}%`} note="Scenario input, not network telemetry"/>
            <Metric label="Accessibility constraint input" value={`${impact.accessibility_constraint}%`} note="Scenario input, not live route analysis"/>
            <Metric label="Terrain vulnerability" value={impact.terrain_vulnerability.category} note={impact.terrain_vulnerability.method}/>
            <Metric label="SEISMOS Priority Index" value={`${priority.spi}/100`} note={`Prototype category: ${priority.priority_level}`}/>
          </div>
          <div className="assessment-note"><Info size={16}/><span>{impact.data_status}. These additional values are only supplied for the reference scenario and must not be generalized to other earthquakes.</span></div>
          <div className="panel-head" style={{marginTop:18}}><div><small>SPI TRANSPARENCY</small><h3>Weighted score breakdown</h3></div></div>
          <div className="breakdown-list">{Object.entries(priority.breakdown||{}).map(([key,value])=><div className="breakdown-row" key={key}><div><b>{key.replaceAll('_',' ')}</b><span>{value.input_score}/100 · weight {(value.weight*100).toFixed(0)}%</span></div><strong>{Number(value.weighted_contribution).toFixed(2)}</strong></div>)}</div>
          <p className="space-disclaimer">{priority.formula}. {priority.weight_status}.</p>
        </section>:null}
      </>}
    </>}
    <section className="panel response-boundary">
      <div className="panel-head"><div><small>EMERGENCY OPERATIONS</small><h3>Dispatch and field reports</h3></div><ShieldCheck size={20}/></div>
      <p>Live SOS intake, responder rosters, rescue dispatch, relief-centre capacity and verified safe-route services are not connected in this prototype. This page displays available earthquake records and clearly separates reference-scenario model outputs from event-feed data.</p>
      <p>For an actual emergency, contact local emergency services and follow official government instructions.</p>
    </section>
  </div>;
}
function Metric({label,value,note}){return <article className="assessment-metric"><small>{label}</small><strong>{value??'—'}</strong><p>{note}</p></article>;}
