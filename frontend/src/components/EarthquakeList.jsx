import { ArrowUpRight, Search } from 'lucide-react';

function levelClass(value = '') {
  if (value === 'elevated' || value === 'high') return 'risk-high';
  if (value === 'requires_review' || value === 'moderate') return 'risk-review';
  if (value === 'unlikely' || value === 'low') return 'risk-low';
  return 'risk-unknown';
}

export default function EarthquakeList({ events, selectedId, onSelect, query, onQuery, loading, error, sourceLabel }) {
  return (
    <section className="panel events">
      <div className="panel-head">
        <div><small>EARTHQUAKE FEED</small><h3>Recent events</h3></div>
        <span className={sourceLabel === 'LIVE USGS' || sourceLabel === 'USGS LIVE' ? 'live-tag' : 'sample'}>{sourceLabel}</span>
      </div>
      <label className="search"><Search size={15} /><input value={query} onChange={e => onQuery(e.target.value)} placeholder="Search region or location" /></label>
      {loading && <p className="feed-message">Loading earthquake events…</p>}
      {error && <p className="feed-warning">{error}</p>}
      <div className="event-list">
        {events.map(event => (
          <button key={event.id} className={`event ${selectedId === event.id ? 'sel' : ''}`} onClick={() => onSelect(event.id)}>
            <b className={`mag ${Number(event.magnitude) >= 5 ? 'high' : 'mid'}`}>{Number(event.magnitude).toFixed(1)}</b>
            <span>
              <strong>{event.place}</strong>
              <small>{event.region} · {event.timeLabel}</small>
              <small>{event.depthKm} km depth</small>
              <span className="risk-pills">
                <i className={levelClass(event.tsunamiScreening)}>Tsunami: {event.tsunamiScreening.replace('_', ' ')}</i>
                <i className={levelClass(event.landslideRisk)}>Landslide: {event.landslideRisk}</i>
              </span>
            </span>
            <ArrowUpRight size={14} />
          </button>
        ))}
        {!loading && events.length === 0 && <p className="empty">No matching events found.</p>}
      </div>
    </section>
  );
}
