import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.fromTo(el,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      }
    );
  }, [location.pathname]);

  return (
    <div ref={ref} style={{ minHeight: '100%' }}>
      {children}
    </div>
  );
};

export default PageTransition;
