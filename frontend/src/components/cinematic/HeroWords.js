import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const HeroWords = ({
  text,
  className = '',
  style = {},
  delay = 0.6,
  tag: Tag = 'h1',
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const words = el.querySelectorAll('.hero-word');

    gsap.fromTo(words,
      {
        opacity: 0,
        y: 60,
        rotationX: -40,
        transformOrigin: 'top center',
      },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        stagger: 0.08,
        duration: 1.2,
        delay,
        ease: 'power4.out',
      }
    );
  }, [delay, text]);

  const words = text.split(' ');

  return (
    <Tag ref={ref} className={className} style={{ ...style, perspective: 600 }}>
      {words.map((word, i) => (
        <span
          key={i}
          className="hero-word"
          style={{
            display: 'inline-block',
            marginRight: '0.3em',
            opacity: 0,
          }}
        >
          {word}
        </span>
      ))}
    </Tag>
  );
};

export default HeroWords;
