import { useState, useEffect } from 'react';
import { Calendar, Plus, Loader2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL, getHeaders } from '../../services/api';


export default function SantriIzinPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ list: [], aktif: null });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    jenis_izin: 'Pulang',
    alasan_izin: '',
    tgl_izin_mulai: '',
    tgl_izin_selesai: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.santri_id) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/santri-feature/izin/${user?.santri_id}`, {
        headers: getHeaders()
      });
      const json = await res.json();
      setData(json.data || { list: [], aktif: null });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/santri-feature/izin`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          ...formData,
          santri: user?.santri_id
        })
      });
      fetchData();
      setShowForm(false);
      setFormData({ jenis_izin: 'Pulang', alasan_izin: '', tgl_izin_mulai: '', tgl_izin_selesai: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'diizinkan': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'ditolak': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'diizinkan': return 'bg-green-100 text-green-700';
      case 'ditolak': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Izin Saya</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
        >
          <Plus className="w-4 h-4" /> Ajukan Izin
        </button>
      </div>

      {/* Izin Aktif */}
      {data.aktif && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-bold text-green-800">Izin Aktif</h3>
              <p className="text-sm text-green-600">
                {data.aktif.jenis_izin} - {data.aktif.tgl_izin_mulai} s/d {data.aktif.tgl_izin_selesai}
              </p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jenis Izin</label>
              <select
                value={formData.jenis_izin}
                onChange={(e) => setFormData({...formData, jenis_izin: e.target.value})}
                className="w-full border rounded-lg p-3"
              >
                <option value="Pulang">Pulang</option>
                <option value="Sakit">Sakit</option>
                <option value="Keperluan">Keperluan Lain</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alasan</label>
              <textarea
                value={formData.alasan_izin}
                onChange={(e) => setFormData({...formData, alasan_izin: e.target.value})}
                className="w-full border rounded-lg p-3"
                rows={3}
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={formData.tgl_izin_mulai}
                  onChange={(e) => setFormData({...formData, tgl_izin_mulai: e.target.value})}
                  className="w-full border rounded-lg p-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  value={formData.tgl_izin_selesai}
                  onChange={(e) => setFormData({...formData, tgl_izin_selesai: e.target.value})}
                  className="w-full border rounded-lg p-3"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {submitting ? 'Mengajukan...' : 'Ajukan Izin'}
            </button>
          </form>
        </div>
      )}

      {/* Riwayat */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-bold mb-4">Riwayat Izin</h2>
        <div className="space-y-3">
          {data.list?.map((item: any, i: number) => (
            <div key={i} className="flex items-start justify-between border-b pb-3">
              <div className="flex gap-3">
                {getStatusIcon(item.status_izin)}
                <div>
                  <div className="font-medium">{item.jenis_izin}</div>
                  <div className="text-sm text-gray-500">
                    {item.tgl_izin_mulai} s/d {item.tgl_izin_selesai}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.alasan_izin}</p>
                  {item.nama_pemberi_izin && (
                    <p className="text-xs text-gray-400 mt-1">Diizinkan oleh: {item.nama_pemberi_izin}</p>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status_izin)}`}>
                {item.status_izin || 'pending'}
              </span>
            </div>
          ))}
        </div>
        {data.list?.length === 0 && (
          <div className="text-center py-8 text-gray-500">Belum ada riwayat izin</div>
        )}
      </div>
    </div>
  );
}
