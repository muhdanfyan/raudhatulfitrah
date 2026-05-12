import { ReactNode, CSSProperties } from 'react';

interface AuroraProps {
  children?: ReactNode;
  className?: string;
  colorStops?: string[];
  speed?: number;
  blur?: number;
}

export default function Aurora({
  children,
  className = '',
  colorStops = ['#3b82f6', '#8b5cf6', '#06b6d4', '#3b82f6'],
  speed = 6,
  blur = 80,
}: AuroraProps) {
  const gradientStops = colorStops.join(', ');
  
  const style: CSSProperties = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    zIndex: 0,
  };

  const auroraStyle: CSSProperties = {
    position: 'absolute',
    inset: `-${blur}px`,
    background: `
      radial-gradient(ellipse 80% 50% at 50% 0%, ${colorStops[0]}40, transparent 50%),
      radial-gradient(ellipse 60% 40% at 0% 50%, ${colorStops[1]}30, transparent 50%),
      radial-gradient(ellipse 60% 40% at 100% 50%, ${colorStops[2]}30, transparent 50%),
      radial-gradient(ellipse 80% 50% at 50% 100%, ${colorStops[3] || colorStops[0]}20, transparent 50%)
    `,
    filter: `blur(${blur}px)`,
    animation: `aurora ${speed}s ease-in-out infinite`,
  };

  return (
    <div style={style} className={className}>
      <style>
        {`
          @keyframes aurora {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg) scale(1);
              opacity: 0.8;
            }
            25% {
              transform: translate(2%, 2%) rotate(1deg) scale(1.02);
              opacity: 1;
            }
            50% {
              transform: translate(-1%, 1%) rotate(-1deg) scale(0.98);
              opacity: 0.9;
            }
            75% {
              transform: translate(1%, -2%) rotate(0.5deg) scale(1.01);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={auroraStyle} />
      {children && <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>}
    </div>
  );
}
