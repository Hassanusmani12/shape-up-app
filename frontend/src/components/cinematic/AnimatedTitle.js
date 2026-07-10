import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AnimatedTitle = ({
  children,
  tag: Tag = 'h2',
  className = '',
  style = {},
  delay = 0,
  clipPath = true,
  as,
}) => {
  const ref = useRef(null);
  const usedTag = as || Tag;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (clipPath) {
      gsap.fromTo(el,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1.2,
          delay,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    } else {
      gsap.fromTo(el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }
  }, [delay, clipPath]);

  return (
    <Tag ref={ref} className={`section-title ${className}`} style={style}>
      {children}
    </Tag>
  );
};

export default AnimatedTitle;
