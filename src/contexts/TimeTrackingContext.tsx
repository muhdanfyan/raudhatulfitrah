import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface TimeTrackingContextType {
  isRunning: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => { startTime: Date; endTime: Date; duration: number } | null;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | null>(null);

export function TimeTrackingProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('timetracking');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.isRunning && data.startTime) {
        setStartTime(new Date(data.startTime));
        setIsRunning(true);
        setPausedTime(data.pausedTime || 0);
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isRunning && startTime) {
      localStorage.setItem('timetracking', JSON.stringify({
        isRunning,
        startTime: startTime.toISOString(),
        pausedTime
      }));
    } else {
      localStorage.removeItem('timetracking');
    }
  }, [isRunning, startTime, pausedTime]);

  // Update elapsed time every second
  useEffect(() => {
    if (isRunning && !isPaused && startTime) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000) - pausedTime;
        setElapsedSeconds(Math.max(0, diff));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, startTime, pausedTime]);

  const start = () => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    setPausedTime(0);
  };

  const pause = () => {
    setIsPaused(true);
  };

  const resume = () => {
    if (isPaused && startTime) {
      setPausedTime(prev => prev + Math.floor((new Date().getTime() - startTime.getTime()) / 1000) - elapsedSeconds - prev);
    }
    setIsPaused(false);
  };

  const stop = () => {
    if (!startTime) return null;
    
    const endTime = new Date();
    const duration = elapsedSeconds;
    const result = { startTime, endTime, duration };
    
    setIsRunning(false);
    setIsPaused(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setPausedTime(0);
    localStorage.removeItem('timetracking');
    
    return result;
  };

  return (
    <TimeTrackingContext.Provider value={{
      isRunning,
      startTime,
      elapsedSeconds,
      start,
      pause,
      resume,
      stop
    }}>
      {children}
    </TimeTrackingContext.Provider>
  );
}

export function useTimeTracking() {
  const context = useContext(TimeTrackingContext);
  if (!context) {
    throw new Error('useTimeTracking must be used within TimeTrackingProvider');
  }
  return context;
}

export function formatElapsedTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
