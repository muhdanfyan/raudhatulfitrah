import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { API_URL, getHeaders } from '../../services/api';
import { Link } from 'react-router-dom';



interface SanksiItem {
  id_sanksi: number;
  created_at: string;
  status_sanksi: string;
  deskripsi_sanksi: string;
  pelanggaran_nama: string;
  pelanggaran_poin: number;
  tatib_nama: string;
}

interface Stats {
  aktif: number;
  selesai: number;
  total: number;
}

export default function OrtuSanksiPage() {
  const [list, setList] = useState<SanksiItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/ortu/sanksi`, {
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
          <h1 className="text-xl font-bold text-gray-900">Sanksi</h1>
          <p className="text-sm text-gray-500">Pelanggaran & sanksi anak Anda</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.aktif}</p>
            <p className="text-xs text-gray-500">Sanksi Aktif</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.selesai}</p>
            <p className="text-xs text-gray-500">Selesai</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>
      )}

      {/* Status Info */}
      {stats && stats.aktif === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Tidak ada sanksi aktif</p>
            <p className="text-sm text-green-600">Anak Anda tidak memiliki sanksi yang sedang berjalan</p>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {list.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Tidak ada riwayat sanksi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {list.map((item) => (
              <div key={item.id_sanksi} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.pelanggaran_nama || 'Pelanggaran'}</h3>
                    <p className="text-sm text-gray-500">{item.tatib_nama || '-'}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(item.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      ['belum diberikan', 'ditinjau kembali'].includes(item.status_sanksi)
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.status_sanksi}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{item.pelanggaran_poin || 0} poin</p>
                  </div>
                </div>
                {item.deskripsi_sanksi && (
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                    {item.deskripsi_sanksi}
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
