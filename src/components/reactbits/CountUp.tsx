import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  once?: boolean;
  decimals?: number;
}

export default function CountUp({
  end,
  start = 0,
  duration = 2,
  suffix = '',
  prefix = '',
  className = '',
  once = true,
  decimals = 0,
}: CountUpProps) {
  const [count, setCount] = useState(start);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  const countRef = useRef({ value: start });

  useEffect(() => {
    if (!elementRef.current || (once && hasAnimated.current)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            hasAnimated.current = true;
            
            gsap.to(countRef.current, {
              value: end,
              duration,
              ease: 'power2.out',
              onUpdate: () => {
                setCount(Number(countRef.current.value.toFixed(decimals)));
              },
            });

            if (once) observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [end, duration, once, decimals]);

  return (
    <span ref={elementRef} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}
