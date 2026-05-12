import { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle, Clock, XCircle, ChevronLeft, Loader2, 
  TrendingUp, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { API_URL, getHeaders } from '../../services/api';


export default function SantriPresensiPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user?.santri_id) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/santri-feature/presensi/${user?.santri_id}`, {
        headers: getHeaders()
      });
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  const formatTime = (timeStr: string) => {
    return timeStr?.slice(0, 5) || '-';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'on-time':
      case 'pertamax':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Tepat Waktu' };
      case 'telat':
        return { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle, label: 'Telat' };
      default:
        return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Absen' };
    }
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const stats = data?.statistik || {};
  const presensiPekan = data?.presensi_pekan || {};

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-7 h-7" />
              Presensi Saya
            </h1>
            <p className="text-teal-100 text-sm">Riwayat kehadiran bulan {formatMonth(data?.bulan || '')}</p>
          </div>
        </div>

        {/* Statistik Bulan Ini */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{stats.total || 0}</div>
            <div className="text-xs text-teal-100">Total Presensi</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{stats.on_time || 0}</div>
            <div className="text-xs text-teal-100">Tepat Waktu</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{stats.telat || 0}</div>
            <div className="text-xs text-teal-100">Telat</div>
          </div>
        </div>
      </div>

      {/* Presensi Pekan Ini */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          Presensi Pekan Ini
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Periode: {data?.periode_pekan?.start} s/d {data?.periode_pekan?.end}
        </p>
        
        <div className="space-y-4">
          {Object.entries(presensiPekan).map(([tanggal, items]: [string, any]) => (
            <div key={tanggal} className="border rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 font-medium text-gray-700">
                {formatDate(tanggal)}
              </div>
              <div className="divide-y">
                {items.map((p: any, i: number) => {
                  const config = getStatusConfig(p.status);
                  const StatusIcon = config.icon;
                  return (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${config.bg}`}>
                          <StatusIcon className={`w-4 h-4 ${config.text}`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{p.nama_agenda}</div>
                          <div className="text-xs text-gray-500">Jam: {formatTime(p.waktu)}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(presensiPekan).length === 0 && (
            <p className="text-gray-500 text-center py-8">Belum ada presensi minggu ini</p>
          )}
        </div>
      </div>

      {/* Riwayat Presensi Bulan Ini */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Riwayat Bulan {formatMonth(data?.bulan || '')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Tanggal</th>
                <th className="px-3 py-2 text-left">Agenda</th>
                <th className="px-3 py-2 text-left">Waktu</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.presensi_bulan?.slice(0, 50).map((p: any, i: number) => {
                const config = getStatusConfig(p.status);
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{p.tanggal}</td>
                    <td className="px-3 py-2">{p.nama_agenda}</td>
                    <td className="px-3 py-2">{formatTime(p.waktu)}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(!data?.presensi_bulan || data.presensi_bulan.length === 0) && (
            <p className="text-gray-500 text-center py-8">Belum ada data presensi</p>
          )}
        </div>
      </div>
    </div>
  );
}
