import { Bell, Menu } from 'lucide-react';

export default function Header({ activePage, onMenu }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu /></button>
      <div className="crumb">SEISMOS <span>/</span> <b>{activePage}</b></div>
      <div className="top-right">
        <span className="preview">● SYSTEM PREVIEW</span>
        <button className="bell" aria-label="Notifications"><Bell size={17} /></button>
        <div className="mini-avatar">OE</div>
      </div>
    </header>
  );
}
