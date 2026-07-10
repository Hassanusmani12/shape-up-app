import React from 'react';

const SkeletonLoader = ({ width = '100%', height = 20, borderRadius = 8, style = {}, variant = 'dark' }) => (
  <div
    className={`skeleton-loader skeleton-${variant}`}
    style={{
      width,
      height,
      borderRadius,
      background: 'rgba(255,255,255,0.04)',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}
  >
    <div className="skeleton-shimmer" style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,136,0.04) 50%, transparent 100%)',
      animation: 'shimmer 1.5s ease-in-out infinite',
    }} />
  </div>
);

export default SkeletonLoader;
