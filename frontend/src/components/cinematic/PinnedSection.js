import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PinnedSection = ({
  children,
  className = '',
  style = {},
  pinDuration = 600,
  scrub = 1,
  id,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: `+=${pinDuration}`,
        pin: true,
        scrub,
        anticipatePin: 1,
      },
    });

    const children = el.querySelectorAll('[data-pin-child]');
    if (children.length) {
      tl.fromTo(children,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out' }
      );
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [pinDuration, scrub]);

  return (
    <div ref={ref} id={id} className={`cinematic-section ${className}`} style={style}>
      {children}
    </div>
  );
};

export default PinnedSection;
