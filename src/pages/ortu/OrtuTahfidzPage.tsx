import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { API_URL, getHeaders } from '../../services/api';
import { Link } from 'react-router-dom';



interface TahfidzItem {
  id_tahfidz: number;
  tgl_tahfidz: string;
  surah: string;
  juz_hafalan: string;
  ayat: string;
  status: string;
  pengontrol_nama: string;
  waktu_nama: string;
  nilai_nama: string;
  komentar: string;
}

interface Stats {
  total_setoran: number;
  total_surah: number;
  total_juz: number;
}

export default function OrtuTahfidzPage() {
  const [list, setList] = useState<TahfidzItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/ortu/tahfidz`, {
        headers: getHeaders()
      });
      const json = await res.json();
      if (json.success) {
        setList(json.data.list || []);
        setStats(json.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { 
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/ortu" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Riwayat Tahfidz</h1>
          <p className="text-sm text-gray-500">Hafalan Al-Quran anak Anda</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.total_setoran}</p>
            <p className="text-xs text-gray-500">Total Setoran</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.total_surah}</p>
            <p className="text-xs text-gray-500">Surah Dihafal</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.total_juz}</p>
            <p className="text-xs text-gray-500">Juz Dihafal</p>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {list.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Belum ada riwayat tahfidz</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {list.map((item) => (
              <div key={item.id_tahfidz} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.surah}</h3>
                    <p className="text-sm text-gray-600">
                      {item.juz_hafalan} - Ayat {item.ayat}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(item.tgl_tahfidz)} - {item.waktu_nama || item.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      item.nilai_nama === 'Mumtaz' ? 'bg-green-100 text-green-700' :
                      item.nilai_nama === 'Jayyid Jiddan' ? 'bg-primary/10 text-primary-dark' :
                      item.nilai_nama === 'Jayyid' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.nilai_nama || 'Belum Dinilai'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">ke: {item.pengontrol_nama || '-'}</p>
                  </div>
                </div>
                {item.komentar && (
                  <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                    {item.komentar}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
