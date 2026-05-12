import { ReactNode, CSSProperties } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
  direction?: 'horizontal' | 'diagonal';
}

export default function GradientText({
  children,
  className = '',
  colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#3b82f6'],
  speed = 3,
  direction = 'horizontal',
}: GradientTextProps) {
  const gradientDirection = direction === 'horizontal' ? '90deg' : '135deg';
  const gradientStops = colors.join(', ');

  const style: CSSProperties = {
    background: `linear-gradient(${gradientDirection}, ${gradientStops})`,
    backgroundSize: '300% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
    animation: `gradientShift ${speed}s ease infinite`,
    display: 'inline',
  };

  return (
    <>
      <style>
        {`
          @keyframes gradientShift {
            0%, 100% {
              background-position: 0% center;
            }
            50% {
              background-position: 100% center;
            }
          }
        `}
      </style>
      <span className={className} style={style}>
        {children}
      </span>
    </>
  );
}
