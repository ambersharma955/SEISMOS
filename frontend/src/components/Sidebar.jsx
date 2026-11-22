import { X } from 'lucide-react';

export default function Sidebar({ navigation, activePage, onNavigate, mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><span>∿</span></div>
          <div><b>SEISMOS<span>•</span></b><small>BY ORBIT.EXE</small></div>
          <button className="close" onClick={onClose} aria-label="Close menu"><X /></button>
        </div>
        <div className="side-label">WORKSPACE</div>
        {navigation.map(({ label, icon: Icon }) => (
          <button key={label} className={`nav ${activePage === label ? 'chosen' : ''}`}
            onClick={() => onNavigate(label)} title={label}>
            <Icon size={17} /><span>{label}</span>
          </button>
        ))}
        <div className="side-bottom">
          <div className="profile"><div>OE</div><section><b>ORBIT.EXE</b><small>Project team</small></section></div>
        </div>
      </aside>
    </>
  );
}
