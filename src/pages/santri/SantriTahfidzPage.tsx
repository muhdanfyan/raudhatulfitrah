import { useState, useEffect } from 'react';
import { Book, Calendar, Award, TrendingUp, Loader2, ChevronLeft, Star, Clock, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { API_URL, getHeaders } from '../../services/api';


export default function SantriTahfidzPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'riwayat' | 'progres'>('riwayat');

  useEffect(() => {
    if (user?.santri_id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/santri-feature/tahfidz/${user?.santri_id}`, {
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

  const getNilaiColor = (nilai: string) => {
    switch (nilai) {
      case 'Mumtaz': return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
      case 'Jayyid Jiddan': return 'bg-gradient-to-r from-emerald-400 to-green-500 text-white';
      case 'Jayyid': return 'bg-gradient-to-r from-blue-400 to-blue-500 text-white';
      case 'Maqbul': return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-3 text-gray-500">Memuat data tahfidz...</p>
        </div>
      </div>
    );
  }

  const pencapaian = data?.pencapaian;
  const maxSetoran = Math.max(...(data?.progres_bulanan?.map((p: any) => p.jumlah_setoran) || [1]));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Laporan Tahfidz</h1>
            <p className="text-blue-100 text-sm">Pantau perkembangan hafalan Anda</p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Book className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold">{pencapaian?.total_juz || 0}</div>
            <div className="text-xs text-blue-100 mt-1">Juz Dihafal</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold">{pencapaian?.total_hafalan_baru || 0}</div>
            <div className="text-xs text-blue-100 mt-1">Hafalan Baru</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold">{pencapaian?.total_murojaah || 0}</div>
            <div className="text-xs text-blue-100 mt-1">Murojaah</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold">{data?.riwayat?.length || 0}</div>
            <div className="text-xs text-blue-100 mt-1">Total Setoran</div>
          </div>
        </div>
      </div>

      {/* Juz List */}
      {pencapaian?.daftar_juz && (
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Juz yang sudah dihafal</h3>
          <div className="flex flex-wrap gap-2">
            {pencapaian.daftar_juz.split(', ').map((juz: string, i: number) => (
              <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-full">
                {juz}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'riwayat' 
                ? 'text-primary border-b-2 border-primary bg-primary/5' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Riwayat Setoran
          </button>
          <button
            onClick={() => setActiveTab('progres')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'progres' 
                ? 'text-primary border-b-2 border-primary bg-primary/5' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Progres Bulanan
          </button>
        </div>

        {/* Riwayat Tab */}
        {activeTab === 'riwayat' && (
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {data?.riwayat?.map((item: any, i: number) => (
              <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.status === 'Hafalan Baru' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-primary/10 text-primary-dark'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-gray-400">{item.waktu_nyetor}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">{item.surah}</h4>
                    <p className="text-sm text-gray-600">Ayat {item.ayat} • {item.juz_hafalan}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.tgl_tahfidz)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {item.nama_pengontrol}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${getNilaiColor(item.nilaitahfidz)}`}>
                      {item.nilaitahfidz}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {(!data?.riwayat || data.riwayat.length === 0) && (
              <div className="p-8 text-center text-gray-500">
                <Book className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Belum ada riwayat setoran</p>
              </div>
            )}
          </div>
        )}

        {/* Progres Tab */}
        {activeTab === 'progres' && (
          <div className="p-4 space-y-3">
            {data?.progres_bulanan?.map((item: any, i: number) => (
              <div key={i} className="group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{formatMonth(item.bulan)}</span>
                  <span className="text-sm font-bold text-primary">{item.jumlah_setoran} setoran</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${(item.jumlah_setoran / maxSetoran) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {(!data?.progres_bulanan || data.progres_bulanan.length === 0) && (
              <div className="p-8 text-center text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Belum ada data progres</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
