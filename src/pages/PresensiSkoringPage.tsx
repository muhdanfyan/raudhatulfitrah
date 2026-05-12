import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, CheckCircle, Clock, Target, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import SearchableSelect from '../components/SearchableSelect';

interface SkoringDetail {
  tanggal: string;
  id_agenda: number;
  nama_agenda: string;
  jenis: string;
  waktu: string;
  torelansi: number;
  batas_waktu: string;
  poin: number;
}

interface SkoringPerHari {
  tanggal: string;
  detail: SkoringDetail[];
  total_poin_harian: number;
  poin_event: number;
  total_poin: number;
}

interface SkoringData {
  santri: {
    id_santri: number;
    nama_lengkap_santri: string;
    foto_santri: string | null;
  };
  periode: {
    start: string;
    end: string;
    pekanan: boolean;
  };
  skoring: SkoringPerHari[];
  total_poin: number;
  target_poin: number | null;
  status: string | null;
}

interface SantriOption {
  id: number;
  name: string;
}



export default function PresensiSkoringPage() {
  const [santriList, setSantriList] = useState<SantriOption[]>([]);
  const [selectedSantri, setSelectedSantri] = useState<number | null>(null);
  const [isPekanan, setIsPekanan] = useState(true);
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [skoringData, setSkoringData] = useState<SkoringData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSantri, setLoadingSantri] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSantriList();
  }, []);

  useEffect(() => {
    if (selectedSantri) {
      fetchSkoring();
    }
  }, [selectedSantri, isPekanan, bulan]);

  const fetchSantriList = async () => {
    setLoadingSantri(true);
    try {
      const res = await api.getSantriList({ status: 'Mondok' });
      const mapped = (res || []).map((s: any) => ({
        id: s.id,
        name: s.name,
      }));
      setSantriList(mapped);
      if (mapped.length > 0) {
        setSelectedSantri(mapped[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data santri');
    } finally {
      setLoadingSantri(false);
    }
  };

  const fetchSkoring = async () => {
    if (!selectedSantri) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPresensiSkoring(
        selectedSantri,
        isPekanan,
        !isPekanan ? bulan : undefined
      );
      setSkoringData(res);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data skoring');
      setSkoringData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (time: string) => {
    return time ? time.substring(0, 5) : '-';
  };

  const getProgressColor = (poin: number, target: number) => {
    const percentage = (poin / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-primary-light';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skoring Presensi</h1>
          <p className="text-gray-600">Lihat poin presensi per santri</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Santri Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Santri</label>
            <SearchableSelect
              options={santriList.map(s => ({ value: s.id, label: s.name }))}
              value={selectedSantri || 0}
              onChange={(val) => setSelectedSantri(val ? Number(val) : null)}
              placeholder="Pilih santri"
              searchPlaceholder="Cari santri..."
              disabled={loadingSantri}
              showAvatar
            />
          </div>

          {/* Periode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setIsPekanan(true)}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  isPekanan ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Pekanan
              </button>
              <button
                onClick={() => setIsPekanan(false)}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  !isPekanan ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Bulanan
              </button>
            </div>
          </div>

          {/* Month Selector (if bulanan) */}
          {!isPekanan && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
              <input
                type="month"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
          <span className="ml-2 text-gray-600">Memuat data...</span>
        </div>
      ) : skoringData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Poin */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Poin</p>
                  <p className="text-3xl font-bold text-gray-900">{skoringData.total_poin}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            {/* Target (if pekanan) */}
            {skoringData.target_poin && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Target Pekanan</p>
                    <p className="text-3xl font-bold text-gray-900">{skoringData.target_poin}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            {skoringData.status && (
              <div className={`rounded-xl shadow-sm border p-6 ${
                skoringData.status === 'Terpenuhi' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`text-xl font-bold ${
                      skoringData.status === 'Terpenuhi' ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {skoringData.status}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    skoringData.status === 'Terpenuhi' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <CheckCircle className={`w-6 h-6 ${
                      skoringData.status === 'Terpenuhi' ? 'text-green-600' : 'text-yellow-600'
                    }`} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar (if pekanan) */}
          {skoringData.target_poin && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress Poin</span>
                <span className="text-sm text-gray-500">
                  {skoringData.total_poin} / {skoringData.target_poin} ({Math.round((skoringData.total_poin / skoringData.target_poin) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getProgressColor(skoringData.total_poin, skoringData.target_poin)}`}
                  style={{ width: `${Math.min((skoringData.total_poin / skoringData.target_poin) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Periode Info */}
          <div className="bg-primary/5 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-primary-dark">
              Periode: {formatDate(skoringData.periode.start)} - {formatDate(skoringData.periode.end)}
            </span>
          </div>

          {/* Detail per Hari */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Detail Skoring per Hari</h3>
            </div>
            
            {skoringData.skoring.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Tidak ada data presensi pada periode ini
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {skoringData.skoring.map((hari) => (
                  <div key={hari.tanggal} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">{formatDate(hari.tanggal)}</span>
                      <span className="px-3 py-1 bg-primary/10 text-primary-dark rounded-full text-sm font-medium">
                        {hari.total_poin} poin
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {hari.detail.map((d, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg text-center ${
                            d.poin === 10 ? 'bg-green-50 border border-green-200' :
                            d.poin === 5 ? 'bg-yellow-50 border border-yellow-200' :
                            'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <p className="text-xs text-gray-500">{d.nama_agenda}</p>
                          <p className="text-sm font-medium">{formatTime(d.waktu)}</p>
                          <p className={`text-xs font-bold ${
                            d.poin === 10 ? 'text-green-600' :
                            d.poin === 5 ? 'text-yellow-600' :
                            'text-gray-400'
                          }`}>
                            +{d.poin}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Pilih santri untuk melihat skoring presensi
        </div>
      )}
    </div>
  );
}
