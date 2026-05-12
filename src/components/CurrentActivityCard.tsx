import { useState, useEffect } from 'react';
import { Clock, ArrowRight, Play, Pause } from 'lucide-react';
import { API_URL, getHeaders } from '../services/api';

interface Activity {
  id_aktivitas: number;
  nama_aktivitas: string;
  deskripsi?: string;
  waktu_mulai: string;
  waktu_selesai: string;
  divisi_nama?: string;
  warna?: string;
}

interface ActivityData {
  waktu_sekarang: string;
  aktivitas_sekarang: Activity | null;
  aktivitas_selanjutnya: Activity | null;
}

export default function CurrentActivityCard() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchCurrentActivity();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      fetchCurrentActivity();
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchCurrentActivity = async () => {
    try {
      const res = await fetch(`${API_URL}/sop/current-activity`, {
        headers: getHeaders()
      });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error('Failed to fetch current activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => time?.slice(0, 5) || '--:--';

  const getProgress = () => {
    if (!data?.aktivitas_sekarang) return 0;
    const now = currentTime;
    const [startH, startM] = data.aktivitas_sekarang.waktu_mulai.split(':').map(Number);
    const [endH, endM] = data.aktivitas_sekarang.waktu_selesai.split(':').map(Number);
    
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    const current = now.getHours() * 60 + now.getMinutes();
    
    if (current <= start) return 0;
    if (current >= end) return 100;
    return Math.round(((current - start) / (end - start)) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-100 rounded"></div>
      </div>
    );
  }

  const progress = getProgress();

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="font-mono text-lg font-bold">
            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <a 
          href="/asrama/aktivitas" 
          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
        >
          Lihat Semua
        </a>
      </div>

      {/* Current Activity */}
      {data?.aktivitas_sekarang ? (
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Play className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-blue-200 mb-1">Sedang Berlangsung</div>
              <h3 className="font-bold text-lg truncate mb-1">{data.aktivitas_sekarang.nama_aktivitas}</h3>
              <div className="flex items-center gap-2">
                <div className="text-sm text-blue-100 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(data.aktivitas_sekarang.waktu_mulai)} - {formatTime(data.aktivitas_sekarang.waktu_selesai)}
                </div>
                {data.aktivitas_sekarang.divisi_nama && (
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                    PJ: {data.aktivitas_sekarang.divisi_nama}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-blue-200 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-3 text-center">
          <Pause className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-blue-200">Tidak ada aktivitas saat ini</p>
        </div>
      )}

      {/* Next Activity */}
      {data?.aktivitas_selanjutnya && (
        <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
          <ArrowRight className="w-4 h-4 text-blue-300" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-blue-300">Selanjutnya</div>
            <div className="text-sm font-medium truncate">{data.aktivitas_selanjutnya.nama_aktivitas}</div>
          </div>
          <div className="text-xs text-blue-300 shrink-0">
            {formatTime(data.aktivitas_selanjutnya.waktu_mulai)}
          </div>
        </div>
      )}
    </div>
  );
}
