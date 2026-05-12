import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Loader2, Check } from 'lucide-react';
import { API_URL, getHeaders } from '../../services/api';
import { Link } from 'react-router-dom';



interface PresensiItem {
  id_presensi: number;
  tanggal: string;
  waktu: string;
  agenda: string;
  nama_agenda: string;
}

interface StatAgenda {
  agenda: number;
  nama_agenda: string;
  total: number;
  hadir: number;
}

export default function OrtuPresensiPage() {
  const [list, setList] = useState<PresensiItem[]>([]);
  const [statsPerAgenda, setStatsPerAgenda] = useState<StatAgenda[]>([]);
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchData();
  }, [bulan]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/ortu/presensi?bulan=${bulan}`, {
        headers: getHeaders()
      });
      const json = await res.json();
      if (json.success) {
        setList(json.data.list || []);
        setStatsPerAgenda(json.data.stats_per_agenda || []);
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { 
      weekday: 'short', day: 'numeric', month: 'short'
    });
  };

  const groupByDate = () => {
    const grouped: { [key: string]: PresensiItem[] } = {};
    list.forEach(item => {
      if (!grouped[item.tanggal]) {
        grouped[item.tanggal] = [];
      }
      grouped[item.tanggal].push(item);
    });
    return grouped;
  };

  const groupedData = groupByDate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/ortu" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Presensi</h1>
          <p className="text-sm text-gray-500">Kehadiran anak Anda per bulan</p>
        </div>
      </div>

      {/* Filter Bulan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Bulan</label>
        <input
          type="month"
          value={bulan}
          onChange={(e) => setBulan(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stats per Agenda */}
      {statsPerAgenda.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {statsPerAgenda.map((stat) => (
            <div key={stat.agenda} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-700 truncate">{stat.nama_agenda}</h4>
              <div className="flex items-end gap-1 mt-2">
                <span className="text-2xl font-bold text-green-600">{stat.hadir}</span>
                <span className="text-gray-400 text-sm mb-1">/ {stat.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-green-500 h-1.5 rounded-full"
                  style={{ width: `${stat.total > 0 ? (stat.hadir / stat.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List by Date */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : Object.keys(groupedData).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p>Tidak ada data presensi bulan ini</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedData).map(([date, items]) => (
            <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">{formatDate(date)}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id_presensi} className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.nama_agenda || item.agenda}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                      <Check className="w-3 h-3" />
                      Hadir {item.waktu}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
