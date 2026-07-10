import React, { useEffect, useState } from 'react';

const PageLoader = ({ minLoadTime = 1500 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), minLoadTime);
    return () => clearTimeout(timer);
  }, [minLoadTime]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
    }}>
      <div style={{
        display: 'flex',
        gap: 6,
        marginBottom: 24,
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="loader-dot" style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'var(--neon-green)',
            animation: `loaderDot 1.4s ease-in-out ${i * 0.16}s infinite`,
          }} />
        ))}
      </div>
      <div className="gradient-text" style={{
        fontFamily: 'var(--font-athletic)',
        fontSize: '1.2rem',
        letterSpacing: 4,
        fontWeight: 700,
        textTransform: 'uppercase',
      }}>
        Shape Up
      </div>
    </div>
  );
};

export default PageLoader;
