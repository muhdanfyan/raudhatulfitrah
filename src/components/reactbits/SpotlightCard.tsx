import { useRef, useState, ReactNode, CSSProperties, MouseEvent } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
}

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(59, 130, 246, 0.15)',
  spotlightSize = 300,
}: SpotlightCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const spotlightStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    background: isHovered
      ? `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`
      : 'transparent',
    transition: 'background 0.2s ease',
    borderRadius: 'inherit',
  };

  const borderStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    borderRadius: 'inherit',
    background: isHovered
      ? `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.3), transparent 60%)`
      : 'transparent',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'xor',
    WebkitMaskComposite: 'xor',
    padding: '1px',
    transition: 'background 0.2s ease',
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ isolation: 'isolate' }}
    >
      <div style={spotlightStyle} />
      <div style={borderStyle} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
