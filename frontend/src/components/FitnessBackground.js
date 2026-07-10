import React from 'react';

const FLOAT_ICONS = [
  { icon: '\uD83C\uDFCB', label: 'dumbbell' },
  { icon: '\uD83C\uDFC3', label: 'runner' },
  { icon: '\u2764\uFE0F', label: 'heart' },
  { icon: '\u26A1', label: 'bolt' },
  { icon: '\uD83D\uDCAA', label: 'muscle' },
  { icon: '\uD83D\uDC8A', label: 'pill' },
  { icon: '\uD83E\uDDD8', label: 'yoga' },
  { icon: '\uD83C\uDFCA', label: 'swim' },
  { icon: '\uD83D\uDEB4', label: 'cycle' },
  { icon: '\uD83E\uDDEC', label: 'anatomy' },
];

export default function FitnessBackground() {
  return (
    <>
      <div className="particle-overlay">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`particle particle-${['green', 'blue', 'cyan', 'green', 'blue'][i % 5]}`}
          />
        ))}
      </div>

      {FLOAT_ICONS.map((item, i) => (
        <div key={i} className={`fitness-float fitness-float-${i + 1}`}>
          {item.icon}
        </div>
      ))}

      <div className="ecg-float" style={{ top: '15%', right: '5%' }}>
        <svg viewBox="0 0 200 40" preserveAspectRatio="none">
          <path d="M0,20 L30,20 L40,20 L50,20 L55,10 L60,30 L65,20 L80,20 L100,20 L110,20 L115,15 L120,25 L125,20 L140,20 L160,20 L170,20 L175,12 L180,28 L185,20 L200,20" />
        </svg>
      </div>
      <div className="ecg-float" style={{ bottom: '20%', left: '3%', transform: 'rotate(-10deg)' }}>
        <svg viewBox="0 0 200 40" preserveAspectRatio="none">
          <path d="M0,20 L30,20 L40,20 L50,20 L55,10 L60,30 L65,20 L80,20 L100,20 L110,20 L115,15 L120,25 L125,20 L140,20 L160,20 L170,20 L175,12 L180,28 L185,20 L200,20" />
        </svg>
      </div>

      <div className="pulse-ring-bg" style={{ top: '20%', left: '10%' }} />
      <div className="pulse-ring-bg" style={{ bottom: '25%', right: '15%', animationDelay: '1.5s' }} />
      <div className="pulse-ring-bg" style={{ top: '50%', left: '50%', animationDelay: '3s', width: '80px', height: '80px' }} />
    </>
  );
}
