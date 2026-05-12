import { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, Square, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function SantriTimeTrackingPage() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    if (time > 0) {
      setSessions(prev => [...prev, {
        id: Date.now(),
        duration: time,
        endTime: new Date().toLocaleTimeString('id-ID')
      }]);
    }
    setIsRunning(false);
    setTime(0);
  };

  const totalToday = sessions.reduce((acc, s) => acc + s.duration, 0) + (isRunning ? time : 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600">Lacak waktu produktif Anda</p>
        </div>
        <Link to="/" className="text-primary hover:underline text-sm">
          Kembali
        </Link>
      </div>

      {/* Timer Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white text-center">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-80" />
        <div className="text-6xl font-mono font-bold mb-6">
          {formatTime(time)}
        </div>
        <div className="flex justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
            >
              <Play className="w-5 h-5" />
              Mulai
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 bg-white text-amber-600 rounded-xl font-semibold hover:bg-amber-50 transition-colors"
            >
              <Pause className="w-5 h-5" />
              Pause
            </button>
          )}
          <button
            onClick={handleStop}
            disabled={time === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square className="w-5 h-5" />
            Selesai
          </button>
        </div>
      </div>

      {/* Today Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Ringkasan Hari Ini
          </h2>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Waktu</div>
            <div className="text-2xl font-bold text-emerald-600">{formatTime(totalToday)}</div>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Belum ada sesi hari ini</p>
            <p className="text-sm">Klik "Mulai" untuk memulai tracking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Sesi {index + 1}</div>
                    <div className="text-sm text-gray-500">Selesai: {session.endTime}</div>
                  </div>
                </div>
                <div className="font-mono font-semibold text-gray-700">
                  {formatTime(session.duration)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-primary/5 border border-blue-200 rounded-xl p-4 text-sm text-primary-dark">
        <p className="font-medium mb-1">Tips Produktivitas:</p>
        <ul className="list-disc list-inside space-y-1 text-primary">
          <li>Gunakan teknik Pomodoro: 25 menit fokus, 5 menit istirahat</li>
          <li>Catat waktu belajar dan mengerjakan project</li>
          <li>Evaluasi produktivitas harian Anda</li>
        </ul>
      </div>
    </div>
  );
}
