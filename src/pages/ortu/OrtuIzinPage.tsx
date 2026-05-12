import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { API_URL, getHeaders } from '../../services/api';
import { Link } from 'react-router-dom';



interface IzinItem {
  id_izin: number;
  waktu_izin: string;
  selesai_izin: string;
  keperluan_izin: string;
  status_izin: string;
  pemberi_nama: string;
}

export default function OrtuIzinPage() {
  const [list, setList] = useState<IzinItem[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/ortu/izin`, {
        headers: getHeaders()
      });
      const json = await res.json();
      if (json.success) {
        setList(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'diizinkan':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'tidak diizinkan':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'sudah kembali':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'diizinkan':
        return 'bg-green-100 text-green-700';
      case 'tidak diizinkan':
        return 'bg-red-100 text-red-700';
      case 'sudah kembali':
        return 'bg-primary/10 text-primary-dark';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group by status
  const aktif = list.filter(i => i.status_izin === 'diizinkan' && new Date(i.selesai_izin) >= new Date());
  const riwayat = list.filter(i => !(i.status_izin === 'diizinkan' && new Date(i.selesai_izin) >= new Date()));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/ortu" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Perizinan</h1>
          <p className="text-sm text-gray-500">Riwayat izin anak Anda</p>
        </div>
      </div>

      {/* Izin Aktif */}
      {aktif.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Izin Aktif
          </h3>
          <div className="space-y-3">
            {aktif.map((item) => (
              <div key={item.id_izin} className="bg-white rounded-lg p-3 border border-orange-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{item.keperluan_izin}</p>
                    <p className="text-sm text-gray-600">Diizinkan oleh: {item.pemberi_nama || '-'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(item.waktu_izin)} - {formatDate(item.selesai_izin)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status_izin)}`}>
                    {item.status_izin}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Riwayat */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Riwayat Perizinan</h3>
        </div>
        {riwayat.length === 0 && aktif.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Belum ada riwayat perizinan</p>
          </div>
        ) : riwayat.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            Tidak ada riwayat izin sebelumnya
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {riwayat.map((item) => (
              <div key={item.id_izin} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status_izin)}
                    <div>
                      <h4 className="font-medium text-gray-900">{item.keperluan_izin}</h4>
                      <p className="text-sm text-gray-600">Diizinkan oleh: {item.pemberi_nama || '-'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(item.waktu_izin)} - {formatDate(item.selesai_izin)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status_izin)}`}>
                    {item.status_izin}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
