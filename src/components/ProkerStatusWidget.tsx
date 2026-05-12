import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface ProkerStatusWidgetProps {
  division: string; // pembinaan, asrama, akademik
  title?: string;
}

export default function ProkerStatusWidget({ division, title }: ProkerStatusWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    terjadwal: number;
    terlaksana: number;
    pending: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.getProkerByDivision(division);
        if (response.success && response.stats) {
          setStats(response.stats);
        }
      } catch (err) {
        console.error('Failed to fetch proker stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [division]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <Link 
      to={`/proker/${division}`}
      className="block bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-[1.02] transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title || 'Program Kerja'}</h3>
            <p className="text-sm text-white/70">Lihat Kanban Board →</p>
          </div>
        </div>
        <div className="bg-white/10 px-3 py-1.5 rounded-full">
          <span className="text-2xl font-bold text-white">{stats?.total || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
          <Clock className="w-5 h-5 text-blue-200 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{stats?.terjadwal || 0}</div>
          <div className="text-[10px] text-white/70 uppercase tracking-wider">Terjadwal</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{stats?.terlaksana || 0}</div>
          <div className="text-[10px] text-white/70 uppercase tracking-wider">Terlaksana</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
          <Clock className="w-5 h-5 text-amber-200 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{stats?.pending || 0}</div>
          <div className="text-[10px] text-white/70 uppercase tracking-wider">Pending</div>
        </div>
      </div>
    </Link>
  );
}
