import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import SupportChatbot from './components/SupportChatbot';
import FitnessBackground from './components/FitnessBackground';
import useScrollProgress from './hooks/useScrollProgress';

import './App.css';
import './styles/4d-effects.css';

const HeroScene = lazy(() => import('./components/HeroScene'));

const LayoutFallback = () => (
  <div className="text-center py-5" style={{ marginTop: '20vh' }}>
    <div className="spinner-border" style={{ width: 48, height: 48, color: 'var(--accent-green)' }} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const App = () => {
  const scrollProgress = useScrollProgress();
  const location = useLocation();
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollPos(height > 0 ? (winScroll / height) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="App">
      <div className="scroll-progress" style={{ width: `${scrollPos}%` }} />

      <Suspense fallback={null}>
        <HeroScene scrollProgress={scrollProgress} route={location.pathname} />
      </Suspense>

      <FitnessBackground />

      <Header />
      <main className="cinematic-section" style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Suspense fallback={<LayoutFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <SupportChatbot />
      <Footer />
    </div>
  );
};

export default App;
