import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, Clock, Layout, CheckCircle2, Circle, AlertCircle, 
  ChevronRight, Search, Loader2, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { getStudentPhotoUrl } from '../utils/imageUtils';

interface GlobalStats {
  total_sop: number;
  total_completed: number;
  divisions_count: number;
  percentage: number;
}

interface DivisionStatus {
  id_jabatan: number;
  nama_jabatan: string;
  total: number;
  completed: number;
  percentage: number;
  personnel?: {
    id_santri: number;
    nama_lengkap_santri: string;
    foto_santri?: string;
  }[];
}

interface ActivityEntry {
  id: number;
  tanggal: string;
  waktu_selesai: string;
  catatan?: string;
  nama_sop: string;
  divisi: string;
  username: string;
  id_santri?: number;
  nama_pengurus: string;
  foto_santri?: string;
}

export default function SopMonitoringPanel() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [divisions, setDivisions] = useState<DivisionStatus[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [monitoringRes, activitiesRes]: any = await Promise.all([
        api.get('/api/sop/monitoring'),
        api.get('/api/sop/activities')
      ]);

      if (monitoringRes.success) {
        setStats(monitoringRes.data.global_stats);
        setDivisions(monitoringRes.data.divisions);
      }

      if (activitiesRes.success) {
        setActivities(activitiesRes.data);
      }
    } catch (err) {
      console.error('Error fetching monitoring data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredDivisions = divisions.filter(d => 
    d.nama_jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatActivityTime = (dateStr: string, timeStr: string) => {
    const activityDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    activityDate.setHours(0, 0, 0, 0);

    const time = timeStr.slice(0, 5);
    
    if (activityDate.getTime() === today.getTime()) {
      return `Hari ini, ${time}`;
    }
    
    // Check if yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (activityDate.getTime() === yesterday.getTime()) {
      return `Kemarin, ${time}`;
    }

    // Format: DD MMM, HH:mm
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]}, ${time}`;
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-gray-500 font-medium">Memuat data monitoring...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layout className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Tingkat Penyelesaian</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats?.percentage}%</span>
            <span className="text-sm text-gray-500 mb-1">Global</span>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500" 
              style={{ width: `${stats?.percentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">SOP Selesai</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats?.total_completed}</span>
            <span className="text-sm text-gray-500 mb-1">dari {stats?.total_sop}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">SOP Pending</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{(stats?.total_sop || 0) - (stats?.total_completed || 0)}</span>
            <span className="text-sm text-gray-500 mb-1">hari ini</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Divisi Aktif</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats?.divisions_count}</span>
            <span className="text-sm text-gray-500 mb-1">Terpantau</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Divisions Status List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-500" />
              Progress Per Divisi
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari divisi..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDivisions.map((div) => (
              <div 
                key={div.id_jabatan}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {div.nama_jabatan}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {div.completed} dari {div.total} SOP selesai
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    div.percentage === 100 ? 'bg-emerald-50 text-emerald-600' : 
                    div.percentage > 50 ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-600'
                  }`}>
                    {div.percentage}%
                  </div>
                </div>
                
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      div.percentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${div.percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {div.personnel?.map((p) => (
                      <div 
                        key={p.id_santri} 
                        className="relative"
                        title={p.nama_lengkap_santri}
                      >
                        <img 
                          src={getStudentPhotoUrl(p.foto_santri)} 
                          alt={p.nama_lengkap_santri}
                          className="w-7 h-7 rounded-lg border-2 border-white object-cover shadow-sm bg-gray-50"
                        />
                      </div>
                    ))}
                    {(!div.personnel || div.personnel.length === 0) && (
                      <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center">
                        <span className="text-[8px] text-gray-400 font-bold">N/A</span>
                      </div>
                    )}
                  </div>
                  <button className="text-xs font-semibold text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Detail <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredDivisions.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Tidak ada divisi yang sesuai pencarian</p>
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              Aktivitas Terbaru
            </h3>
            <button 
              onClick={fetchData}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Clock className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <Circle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Belum ada aktivitas hari ini</p>
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-3">
                    <div 
                      className="relative group/photo" 
                      title={act.id_santri ? `ID Santri: ${act.id_santri}` : 'Bukan Santri'}
                    >
                      <img 
                        src={getStudentPhotoUrl(act.foto_santri)} 
                        alt={act.nama_pengurus}
                        className="w-10 h-10 rounded-lg object-cover ring-2 ring-white shadow-sm bg-gray-50 group-hover/photo:scale-105 transition-transform"
                      />
                      {act.id_santri && (
                        <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-[8px] text-white px-1 shadow-sm rounded-sm font-bold opacity-0 group-hover/photo:opacity-100 transition-opacity">
                          #{act.id_santri}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {act.nama_pengurus}
                        </p>
                        <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          {formatActivityTime(act.tanggal, act.waktu_selesai)}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-600 font-medium mt-0.5">
                        {act.divisi}
                      </p>
                      <div className="mt-2 flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        <p className="text-xs text-gray-600 line-clamp-1">
                          {act.nama_sop}
                        </p>
                      </div>
                      {act.catatan && (
                        <p className="text-[10px] text-gray-400 mt-2 italic">
                          "{act.catatan}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-gray-50/50 border-t border-gray-50">
            <button className="w-full text-center text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
              Lihat Semua Riwayat <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
