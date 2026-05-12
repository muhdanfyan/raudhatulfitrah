import { useRef, useState, ReactNode, CSSProperties, MouseEvent } from 'react';

interface MagnetProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  range?: number;
}

export default function Magnet({
  children,
  className = '',
  strength = 0.3,
  range = 100,
}: MagnetProps) {
  const magnetRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!magnetRef.current) return;
    
    const rect = magnetRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
    
    if (distance < range) {
      const factor = 1 - distance / range;
      setTransform({
        x: distanceX * strength * factor,
        y: distanceY * strength * factor,
      });
    }
  };

  const handleMouseLeave = () => {
    setTransform({ x: 0, y: 0 });
  };

  const style: CSSProperties = {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
    transition: transform.x === 0 && transform.y === 0 ? 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)' : 'none',
  };

  return (
    <div
      ref={magnetRef}
      className={`inline-block ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      {children}
    </div>
  );
}
