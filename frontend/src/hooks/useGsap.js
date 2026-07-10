import { useEffect, useRef } from 'react';

async function loadGSAP() {
  const [gsapModule, ScrollTriggerModule] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  const gsap = gsapModule.default;
  const ScrollTrigger = ScrollTriggerModule.ScrollTrigger || ScrollTriggerModule.default;
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}

export function useGsapReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ctx;
    const init = async () => {
      try {
        const { gsap, ScrollTrigger } = await loadGSAP();
        const { y = 60, opacity = 0, duration = 1, delay = 0, start = 'top 85%' } = options;

        ctx = gsap.context(() => {
          gsap.fromTo(el,
            { y, opacity },
            {
              y: 0,
              opacity: 1,
              duration,
              delay,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start,
                toggleActions: 'play none none none',
              },
            }
          );
        });
      } catch (e) {
        el.style.opacity = '1';
        el.style.transform = '';
      }
    };

    init();

    return () => {
      if (ctx) ctx.revert();
      el.style.opacity = '';
      el.style.transform = '';
    };
  }, []);

  return ref;
}

export function useGsapParallax(speed = 0.5) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ctx;
    const init = async () => {
      try {
        const { gsap, ScrollTrigger } = await loadGSAP();

        ctx = gsap.context(() => {
          gsap.to(el, {
            y: speed * 100,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        });
      } catch (e) {
        // GSAP unavailable, silently degrade
      }
    };

    init();

    return () => {
      if (ctx) ctx.revert();
    };
  }, [speed]);

  return ref;
}

export function useGsapTimeline() {
  const timelineRef = useRef(null);

  useEffect(() => {
    let ctx;
    const init = async () => {
      try {
        const { gsap, ScrollTrigger } = await loadGSAP();

        ctx = gsap.context(() => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: timelineRef.current, start: 'top 80%', toggleActions: 'play none none none' } });
          return tl;
        });
      } catch (e) {
        // GSAP unavailable, silently degrade
      }
    };

    init();

    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  return timelineRef;
}
