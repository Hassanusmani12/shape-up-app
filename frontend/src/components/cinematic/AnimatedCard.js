import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AnimatedCard = ({
  children,
  className = '',
  style = {},
  index = 0,
  staggerDelay = 0.1,
  triggerSelector,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const trigger = triggerSelector
      ? el.closest(triggerSelector) || el.parentElement
      : el.parentElement;

    gsap.fromTo(el,
      { opacity: 0, y: 60, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        delay: index * staggerDelay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, [index, staggerDelay, triggerSelector]);

  return (
    <div ref={ref} className={`anim-card ${className}`} style={style}>
      {children}
    </div>
  );
};

export default AnimatedCard;
