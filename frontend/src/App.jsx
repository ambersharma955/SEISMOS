import { Suspense, lazy, useEffect, useState } from 'react';
import { Activity, Globe2, Satellite, Siren } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
const SeismicIntelligence = lazy(() => import('./pages/SeismicIntelligence'));
const SpaceObservation = lazy(() => import('./pages/SpaceObservation'));
const EmergencyResponse = lazy(() => import('./pages/EmergencyResponse'));

const navigation = [
  { label: 'Overview', icon: Globe2 },
  { label: 'Seismic Intelligence', icon: Activity },
  { label: 'Space Observation', icon: Satellite },
  { label: 'Emergency Response', icon: Siren },
];

export default function App() {
  const [activePage, setActivePage] = useState('Overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { document.title = `SEISMOS | ${activePage}`; }, [activePage]);
  const navigate = (page) => { setActivePage(page); setMobileOpen(false); };

  return <div className="shell">
    <Sidebar navigation={navigation} activePage={activePage} onNavigate={navigate}
      mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    <main className="main-area">
      <Header activePage={activePage} onMenu={() => setMobileOpen(true)} />
      <Suspense fallback={<div className="content"><p>Loading…</p></div>}>
        {activePage === 'Seismic Intelligence' ? <SeismicIntelligence />
          : activePage === 'Space Observation' ? <SpaceObservation />
          : activePage === 'Emergency Response' ? <EmergencyResponse />
          : <Overview onNavigate={navigate} />}
      </Suspense>
    </main>
  </div>;
}
