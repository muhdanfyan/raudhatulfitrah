import { useRef, useEffect, ReactNode } from 'react';
import gsap from 'gsap';

interface SplitTextProps {
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  once?: boolean;
}

export default function SplitText({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  stagger = 0.02,
  once = true,
}: SplitTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!containerRef.current || (once && hasAnimated.current)) return;

    const words = containerRef.current.querySelectorAll('.word');
    
    gsap.set(words, { 
      opacity: 0, 
      y: 20,
      rotateX: -90,
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            hasAnimated.current = true;
            gsap.to(words, {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration,
              stagger,
              delay,
              ease: 'power3.out',
            });
            if (once) observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [delay, duration, stagger, once]);

  const words = children.split(' ');

  return (
    <span ref={containerRef} className={`inline ${className}`} style={{ perspective: '1000px' }}>
      {words.map((word, i) => (
        <span
          key={i}
          className="word inline-block"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {word}
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
