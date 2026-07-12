import React, { useEffect, useRef, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../slices/authSlice';
import { useGetUserProfileQuery } from '../slices/usersApiSlice';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from './Header';
import Footer from './Footer';
import SupportChatbot from './SupportChatbot';
import useCinematicScroll from '../hooks/useCinematicScroll';

gsap.registerPlugin(ScrollTrigger);

export default function CinemaLayout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const progressRef = useRef(null);

  const { data: userProfile, isSuccess } = useGetUserProfileQuery();

  useEffect(() => {
    if (isSuccess && userProfile) {
      dispatch(setCredentials(userProfile));
    }
  }, [isSuccess, userProfile, dispatch]);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progressRef.current) {
        progressRef.current.style.width = `${progress.toFixed(1)}%`;
      }
      ScrollTrigger.update();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    ScrollTrigger.refresh();
  }, [location.pathname]);

  useCinematicScroll();

  return (
    <div className="App" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
      <div className="scroll-progress" ref={progressRef} />

      {/* Premium mesh grid background */}
      <div className="mesh-grid-bg" />

      {/* Animated gradient orbs — fixed, very subtle */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-15vh', right: '-8vw', width: '45vw', height: '45vw',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.025) 0%, transparent 70%)',
          animation: 'orbFloat1 20s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15vh', left: '-8vw', width: '40vw', height: '40vw',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.02) 0%, transparent 70%)',
          animation: 'orbFloat2 25s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '30%', width: '30vw', height: '30vw',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.015) 0%, transparent 70%)',
          animation: 'orbFloat3 15s ease-in-out infinite',
        }} />
      </div>

      <header style={{ position: 'relative', zIndex: 50 }}>
        <Header />
      </header>

      <main style={{ position: 'relative', zIndex: 10, flex: 1, paddingTop: 'var(--navbar-height)', background: '#000', overflowAnchor: 'none' }}>
        <div style={{ position: 'relative', zIndex: 20 }}>
          <Suspense fallback={<div style={{ textAlign: 'center', padding: 24 }}><div className="spinner-border text-success" role="status"><span className="visually-hidden">Loading...</span></div></div>}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <footer style={{ position: 'relative', zIndex: 30 }}>
        <SupportChatbot />
        <Footer />
      </footer>
    </div>
  );
}
