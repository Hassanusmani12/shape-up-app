import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function useCinematicScroll() {
  const ctxRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      document.querySelectorAll('[data-scene]').forEach((section) => {
        gsap.fromTo(section,
          { opacity: 0, y: 24 },
          {
            opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      document.querySelectorAll('[data-reveal]').forEach((el) => {
        gsap.fromTo(el,
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      document.querySelectorAll('[data-fade]').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      document.querySelectorAll('[data-count]').forEach((el) => {
        const target = parseFloat(el.getAttribute('data-count')) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        const obj = { val: 0 };

        el.textContent = `${prefix}0${suffix}`;

        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              val: target,
              duration: 1.5,
              ease: 'power2.out',
              onUpdate: () => {
                const v = Math.round(obj.val);
                el.textContent = `${prefix}${v.toLocaleString()}${suffix}`;
              },
            });
          },
        });
      });

      document.querySelectorAll('[data-card-stagger]').forEach((container) => {
        const cards = container.querySelectorAll('.cinematic-card, .anim-card');
        if (cards.length) {
          gsap.fromTo(cards,
            { opacity: 0, y: 30 },
            {
              opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out',
              scrollTrigger: {
                trigger: container,
                start: 'top 88%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });
    });

    ctxRef.current = ctx;

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, []);
}
