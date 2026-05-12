import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, AlertCircle, RefreshCw, Loader2, ChevronLeft, ChevronRight, Plus, TrendingUp, QrCode, Edit2, Trash2, X, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import PresensiInputModal from '../components/PresensiInputModal';
import { getStudentPhotoUrl } from '../utils/imageUtils';
import { getLocalDateString } from '../utils/date';

interface PresensiSantri {
  id_santri: number;
  nama_santri: string;
  foto_santri: string | null;
  shubuh: string;
  waktu_shubuh: string | null;
  waktu_produktif: string;
  waktu_produktif_jam: string | null;
  dzuhur: string;
  waktu_dzuhur: string | null;
  ashar: string;
  waktu_ashar: string | null;
  maghrib_isya: string;
  waktu_maghrib: string | null;
}

interface RekapAgenda {
  id_agenda: number;
  nama_agenda: string;
  hadir: number;
  tidak_hadir: number;
  tepat_waktu: number;
  telat: number;
}

interface RawPresensi {
  id_presensi: number;
  santri: number;
  santri_nama: string;
  agenda: number;
  agenda_nama: string;
  tanggal: string;
  waktu: string;
}



const AGENDA_NAMES: { [key: number]: string } = {
  1: 'Shubuh',
  2: 'Waktu Produktif',
  3: 'Dzuhur',
  4: 'Ashar',
  5: 'Maghrib-Isya',
};

export default function PresensiPage() {
  const [tanggal, setTanggal] = useState(getLocalDateString());
  const [presensiData, setPresensiData] = useState<PresensiSantri[]>([]);
  const [rekapData, setRekapData] = useState<RekapAgenda[]>([]);
  const [totalSantri, setTotalSantri] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  
  // Edit presensi state
  const [rawPresensi, setRawPresensi] = useState<RawPresensi[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editWaktu, setEditWaktu] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [presensiRes, rekapRes, rawRes] = await Promise.all([
        api.getPresensiHariIni(tanggal),
        api.getPresensiRekap(tanggal),
        api.getPresensiList({ tanggal }),
      ]);
      setPresensiData(presensiRes.data || []);
      setRekapData(rekapRes.rekap || []);
      setTotalSantri(rekapRes.total_santri_mondok || 0);
      
      // Map raw presensi data
      const rawData = (rawRes.data || []).map((p: any) => ({
        id_presensi: p.id_presensi,
        santri: p.santri,
        santri_nama: p.santri_relation?.nama_lengkap_santri || p.santri_nama || 'Unknown',
        agenda: p.agenda,
        agenda_nama: p.agenda_relation?.nama_agenda || AGENDA_NAMES[p.agenda] || 'Unknown',
        tanggal: p.tanggal,
        waktu: p.waktu,
      }));
      setRawPresensi(rawData);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data presensi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tanggal]);

  const changeDate = (days: number) => {
    const date = new Date(tanggal);
    date.setDate(date.getDate() + days);
    setTanggal(date.toISOString().split('T')[0]);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'on-time') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'telat') return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-300" />;
  };


  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  // Edit presensi handlers
  const handleStartEdit = (presensi: RawPresensi) => {
    setEditingId(presensi.id_presensi);
    setEditWaktu(presensi.waktu.substring(0, 5)); // HH:MM
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditWaktu('');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editWaktu) return;
    setSaving(true);
    try {
      await api.updatePresensi(editingId, editWaktu + ':00'); // Add seconds
      await fetchData();
      setEditingId(null);
      setEditWaktu('');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus presensi ini?')) return;
    setDeleting(id);
    try {
      await api.deletePresensi(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus presensi');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presensi Harian</h1>
          <p className="text-gray-600">{formatDate(tanggal)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => changeDate(1)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTanggal(getLocalDateString())}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            Hari Ini
          </button>
          <button
            onClick={fetchData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/presensi/skoring"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="hidden sm:inline">Skoring</span>
          </Link>
          <Link
            to="/presensi/scan"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            <span className="hidden sm:inline">Scan QR</span>
          </Link>
          <button
            onClick={() => setShowInputModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Input Manual</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Rekap Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {rekapData.map((item) => (
          <div key={item.id_agenda} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{item.nama_agenda}</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{item.hadir}</p>
                <p className="text-xs text-gray-500">dari {totalSantri}</p>
              </div>
              <div className="text-right text-xs">
                <p className="text-green-600">{item.tepat_waktu} tepat</p>
                <p className="text-yellow-600">{item.telat} telat</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabel Presensi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        ) : presensiData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Tidak ada data presensi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">Santri</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div>Shubuh</div>
                    <div className="text-gray-400 font-normal">04:40</div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div>Produktif</div>
                    <div className="text-gray-400 font-normal">08:00</div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div>Dzuhur</div>
                    <div className="text-gray-400 font-normal">12:15</div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div>Ashar</div>
                    <div className="text-gray-400 font-normal">15:40</div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div>Maghrib</div>
                    <div className="text-gray-400 font-normal">18:20</div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {presensiData.map((santri) => (
                  <tr key={santri.id_santri} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white">
                      <div className="flex items-center">
                        <img
                          src={getStudentPhotoUrl(santri.foto_santri)}
                          alt={santri.nama_santri}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(santri.nama_santri)}&background=EEF2FF&color=4F46E5`;
                          }}
                        />
                        <span className="ml-3 text-sm font-bold text-gray-900">{santri.nama_santri}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        {getStatusIcon(santri.shubuh)}
                        <span className="text-xs text-gray-500 mt-1">{formatTime(santri.waktu_shubuh)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        {getStatusIcon(santri.waktu_produktif)}
                        <span className="text-xs text-gray-500 mt-1">{formatTime(santri.waktu_produktif_jam)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        {getStatusIcon(santri.dzuhur)}
                        <span className="text-xs text-gray-500 mt-1">{formatTime(santri.waktu_dzuhur)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        {getStatusIcon(santri.ashar)}
                        <span className="text-xs text-gray-500 mt-1">{formatTime(santri.waktu_ashar)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        {getStatusIcon(santri.maghrib_isya)}
                        <span className="text-xs text-gray-500 mt-1">{formatTime(santri.waktu_maghrib)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Presensi Panel */}
      {rawPresensi.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              Edit Presensi Hari Ini ({rawPresensi.length} record)
            </h2>
            <p className="text-sm text-gray-500 mt-1">Klik edit untuk mengubah waktu kehadiran</p>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Santri</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agenda</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Waktu</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rawPresensi.map((p) => (
                  <tr key={p.id_presensi} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{p.santri_nama}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.agenda_nama}</td>
                    <td className="px-4 py-3 text-center">
                      {editingId === p.id_presensi ? (
                        <input
                          type="time"
                          value={editWaktu}
                          onChange={(e) => setEditWaktu(e.target.value)}
                          className="px-2 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{formatTime(p.waktu)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingId === p.id_presensi ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                            title="Simpan"
                          >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="Batal"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStartEdit(p)}
                            className="p-1 text-primary hover:bg-primary/5 rounded"
                            title="Edit waktu"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id_presensi)}
                            disabled={deleting === p.id_presensi}
                            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                            title="Hapus"
                          >
                            {deleting === p.id_presensi ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Tepat Waktu</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-500" />
          <span>Telat</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-300" />
          <span>Tidak Hadir</span>
        </div>
      </div>

      {/* Input Modal */}
      <PresensiInputModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        onSuccess={fetchData}
        tanggal={tanggal}
      />
    </div>
  );
}
