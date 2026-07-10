import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CounterStat = ({
  target = 0,
  prefix = '',
  suffix = '',
  label = '',
  duration = 2.5,
  className = '',
  style = {},
}) => {
  const numRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;

    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            const v = Math.round(obj.val);
            setDisplayValue(`${prefix}${v.toLocaleString()}${suffix}`);
          },
        });
      },
    });
  }, [target, prefix, suffix, duration]);

  return (
    <div className={`text-center ${className}`} style={style}>
      <div
        ref={numRef}
        className="stat-num gradient-text athletic-heading"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1 }}
      >
        {displayValue}
      </div>
      {label && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2, marginTop: 8, fontWeight: 600 }}>
          {label}
        </div>
      )}
    </div>
  );
};

export default CounterStat;
