import { useState, useEffect } from 'react';
import { API_URL, getHeaders } from '../services/api';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Loader2, CheckCircle, XCircle, AlertCircle, Search, Calendar, 
  ArrowLeft, Clock, Users, Save 
} from 'lucide-react';
import { getLocalDateString } from '../utils/date';



interface Agenda {
  id_agenda: number;
  nama_agenda: string;
  jenis: string;
  waktu_mulai: string;
  waktu_selesai: string;
}

interface SantriPresensi {
  santri_id: number;
  nama: string;
  foto_url?: string;
  status: 'tepat_waktu' | 'telat' | 'absen';
  waktu: string | null;
  presensi_id: number | null;
}

interface PresensiData {
  agenda: { id: number; nama: string; jenis: string; waktu_mulai: string; waktu_selesai: string; toleransi: number };
  tanggal: string;
  summary: { total: number; hadir: number; tepat_waktu: number; telat: number; absen: number };
  santri: SantriPresensi[];
}

export default function PresensiEventPage() {
  const { agendaId } = useParams<{ agendaId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tanggalParam = searchParams.get('tanggal') || getLocalDateString();

  const [agendaList, setAgendaList] = useState<Agenda[]>([]);
  const [data, setData] = useState<PresensiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSantri, setSelectedSantri] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);


  // Fetch agenda list
  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const res = await fetch(`${API_URL}/master/agenda`, {
          headers: getHeaders()
        });
        const json = await res.json();
        setAgendaList(json);
      } catch (err) {
        console.error('Failed to fetch agenda:', err);
      }
    };
    fetchAgenda();
  }, []);

  // Fetch presensi data
  useEffect(() => {
    if (!agendaId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/presensi/agenda/${agendaId}?tanggal=${tanggalParam}`, {
          headers: getHeaders()
        });
        const json = await res.json();
        if (json.status === 'success') {
          setData(json.data);
          setSelectedSantri([]);
        } else {
          setError(json.message || 'Gagal memuat data');
        }
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [agendaId, tanggalParam]);

  const handleDateChange = (newDate: string) => {
    setSearchParams({ tanggal: newDate });
  };

  const toggleSelect = (santriId: number) => {
    setSelectedSantri(prev => 
      prev.includes(santriId) 
        ? prev.filter(id => id !== santriId)
        : [...prev, santriId]
    );
  };

  const selectAllAbsen = () => {
    if (!data) return;
    const absenIds = data.santri.filter(s => s.status === 'absen').map(s => s.santri_id);
    setSelectedSantri(absenIds);
  };

  const handleBatchPresensi = async () => {
    if (selectedSantri.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/presensi/batch`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          agenda: parseInt(agendaId!),
          tanggal: tanggalParam,
          santri_ids: selectedSantri,
        }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        // Refresh data
        const dataRes = await fetch(`${API_URL}/presensi/agenda/${agendaId}?tanggal=${tanggalParam}`, {
          headers: getHeaders()
        });
        const dataJson = await dataRes.json();
        if (dataJson.status === 'success') {
          setData(dataJson.data);
          setSelectedSantri([]);
        }
      } else {
        alert(json.message || 'Gagal menyimpan presensi');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'tepat_waktu') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'telat') return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-300" />;
  };

  const formatTime = (time: string) => time?.substring(0, 5) || '-';

  // Agenda selector view
  if (!agendaId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Presensi per Agenda</h1>
          <p className="text-gray-600">Pilih agenda untuk melihat dan mengelola presensi</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
          <input
            type="date"
            value={tanggalParam}
            onChange={(e) => handleDateChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Agenda Harian</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agendaList.filter(a => a.jenis === 'harian').map((agenda) => (
              <Link
                key={agenda.id_agenda}
                to={`/presensi/event/${agenda.id_agenda}?tanggal=${tanggalParam}`}
                className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{agenda.nama_agenda}</h3>
                    <p className="text-sm text-gray-500">
                      {formatTime(agenda.waktu_mulai)} - {formatTime(agenda.waktu_selesai)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mt-6">Agenda Event</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agendaList.filter(a => a.jenis === 'event').map((agenda) => (
              <Link
                key={agenda.id_agenda}
                to={`/presensi/event/${agenda.id_agenda}?tanggal=${tanggalParam}`}
                className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md hover:border-green-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{agenda.nama_agenda}</h3>
                    <p className="text-sm text-gray-500">
                      {formatTime(agenda.waktu_mulai)} - {formatTime(agenda.waktu_selesai)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {agendaList.filter(a => a.jenis === 'event').length === 0 && (
              <div className="text-gray-500 text-sm">Belum ada agenda event</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error || 'Data tidak tersedia'}
      </div>
    );
  }

  const filteredSantri = data.santri.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/presensi/event" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.agenda.nama}</h1>
            <p className="text-gray-600">
              {new Date(data.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' | '}
              {formatTime(data.agenda.waktu_mulai)} - {formatTime(data.agenda.waktu_selesai)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={tanggalParam}
            onChange={(e) => handleDateChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Users className="w-4 h-4" /> Total
          </div>
          <div className="text-2xl font-bold">{data.summary.total}</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="text-green-600 text-sm mb-1">Hadir</div>
          <div className="text-2xl font-bold text-green-700">{data.summary.hadir}</div>
        </div>
        <div className="bg-primary/5 rounded-xl border border-blue-200 p-4">
          <div className="text-primary text-sm mb-1">Tepat Waktu</div>
          <div className="text-2xl font-bold text-primary-dark">{data.summary.tepat_waktu}</div>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <div className="text-yellow-600 text-sm mb-1">Telat</div>
          <div className="text-2xl font-bold text-yellow-700">{data.summary.telat}</div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <div className="text-red-600 text-sm mb-1">Absen</div>
          <div className="text-2xl font-bold text-red-700">{data.summary.absen}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari santri..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={selectAllAbsen}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Pilih Semua Absen
          </button>
          {selectedSantri.length > 0 && (
            <button
              onClick={handleBatchPresensi}
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Presensi ({selectedSantri.length})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                  <input
                    type="checkbox"
                    checked={selectedSantri.length === data.santri.filter(s => s.status === 'absen').length && selectedSantri.length > 0}
                    onChange={() => selectedSantri.length > 0 ? setSelectedSantri([]) : selectAllAbsen()}
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Santri</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Waktu</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSantri.map((s) => (
                <tr key={s.santri_id} className={`hover:bg-gray-50 ${selectedSantri.includes(s.santri_id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedSantri.includes(s.santri_id)}
                      onChange={() => toggleSelect(s.santri_id)}
                      disabled={s.status !== 'absen'}
                      className="w-4 h-4 disabled:opacity-30"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {s.foto_url ? (
                        <img src={s.foto_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                          {s.nama.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{s.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(s.status)}
                      <span className={`text-xs font-medium ${
                        s.status === 'tepat_waktu' ? 'text-green-600' :
                        s.status === 'telat' ? 'text-yellow-600' : 'text-red-400'
                      }`}>
                        {s.status === 'tepat_waktu' ? 'Tepat Waktu' : s.status === 'telat' ? 'Telat' : 'Absen'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {s.waktu || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSantri.length === 0 && (
          <div className="text-center py-12 text-gray-500">Tidak ada data</div>
        )}
      </div>
    </div>
  );
}
