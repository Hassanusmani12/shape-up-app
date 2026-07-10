import React, { useRef } from 'react';

const MagneticButton = ({ children, className = '', style = {}, as: Tag = 'button', ...props }) => {
  const ref = useRef(null);
  const magneticStrength = 0.4;

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * magneticStrength}px, ${y * magneticStrength}px)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translate(0px, 0px)';
  };

  return (
    <Tag
      ref={ref}
      className={`magnetic-btn ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        ...style,
      }}
      {...props}
    >
      <span className="magnetic-ripple" />
      {children}
    </Tag>
  );
};

export default MagneticButton;
