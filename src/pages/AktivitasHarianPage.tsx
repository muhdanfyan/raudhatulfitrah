import { useState, useEffect } from 'react';
import { Clock, Plus, Pencil, Trash2, Loader2, X, Save, Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { API_URL, getHeaders } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Aktivitas {
  id_aktivitas: number;
  nama_aktivitas: string;
  icon?: string;
  deskripsi?: string;
  waktu_mulai: string;
  waktu_selesai: string;
  divisi_id?: number | null;
  divisi_nama?: string | null;
  warna?: string;
  urutan: number;
  status: 'aktif' | 'nonaktif';
}

interface Jabatan {
  id_jabatan: number;
  nama_jabatan: string;
}

const defaultForm = {
  nama_aktivitas: '',
  deskripsi: '',
  divisi_id: null as number | null,
  waktu_mulai: '06:00',
  waktu_selesai: '07:00',
  warna: '#3B82F6',
  urutan: 0,
  status: 'aktif' as const
};

const colorOptions = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export default function AktivitasHarianPage() {
  const { user } = useAuth();
  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [jabatans, setJabatans] = useState<Jabatan[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const canEdit = user?.role && ['superadmin', 'asrama'].includes(user.role.toLowerCase());

  useEffect(() => {
    fetchAktivitas();
    fetchJabatans();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchJabatans = async () => {
    try {
      const res = await fetch(`${API_URL}/crud/jabatan`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        // Filter only Asrama, Pembinaan, Akademik if needed, but let's show all for flexibility
        setJabatans(data.data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch jabatans:', err);
    }
  };

  const fetchAktivitas = async () => {
    try {
      const res = await fetch(`${API_URL}/aktivitas-harian`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) setAktivitas(data.data);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editId 
        ? `${API_URL}/aktivitas-harian/${editId}` 
        : `${API_URL}/aktivitas-harian`;
      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        fetchAktivitas();
        closeModal();
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/aktivitas-harian/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchAktivitas();
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const openEdit = (item: Aktivitas) => {
    setEditId(item.id_aktivitas);
    setForm({
      nama_aktivitas: item.nama_aktivitas,
      deskripsi: item.deskripsi || '',
      divisi_id: item.divisi_id || null,
      waktu_mulai: item.waktu_mulai.slice(0, 5),
      waktu_selesai: item.waktu_selesai.slice(0, 5),
      warna: item.warna || '#3B82F6',
      urutan: item.urutan,
      status: item.status
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(defaultForm);
  };

  const formatTime = (time: string) => time.slice(0, 5);

  const isCurrentActivity = (mulai: string, selesai: string) => {
    const now = currentTime.toTimeString().slice(0, 5);
    return now >= mulai.slice(0, 5) && now <= selesai.slice(0, 5);
  };

  const isPastActivity = (selesai: string) => {
    const now = currentTime.toTimeString().slice(0, 5);
    return now > selesai.slice(0, 5);
  };

  const getTimeIcon = (waktu: string) => {
    const hour = parseInt(waktu.slice(0, 2));
    if (hour >= 5 && hour < 10) return <Sunrise className="w-4 h-4" />;
    if (hour >= 10 && hour < 16) return <Sun className="w-4 h-4" />;
    if (hour >= 16 && hour < 19) return <Sunset className="w-4 h-4" />;
    return <Moon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Jadwal Aktivitas Harian</h1>
          <p className="text-gray-500 text-sm mt-1">Timeline kegiatan santri setiap hari</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="font-mono text-lg font-semibold">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {canEdit && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Tambah</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl">
          <div className="text-3xl font-bold">{aktivitas.filter(a => isPastActivity(a.waktu_selesai)).length}</div>
          <div className="text-green-100 text-sm">Selesai</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl">
          <div className="text-3xl font-bold">{aktivitas.filter(a => isCurrentActivity(a.waktu_mulai, a.waktu_selesai)).length}</div>
          <div className="text-blue-100 text-sm">Berlangsung</div>
        </div>
        <div className="bg-gradient-to-br from-gray-400 to-gray-500 text-white p-4 rounded-xl">
          <div className="text-3xl font-bold">{aktivitas.filter(a => !isPastActivity(a.waktu_selesai) && !isCurrentActivity(a.waktu_mulai, a.waktu_selesai)).length}</div>
          <div className="text-gray-100 text-sm">Mendatang</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-400 to-gray-200" />
        
        <div className="space-y-3">
          {aktivitas.map((item) => {
            const isCurrent = isCurrentActivity(item.waktu_mulai, item.waktu_selesai);
            const isPast = isPastActivity(item.waktu_selesai);
            
            return (
              <div
                key={item.id_aktivitas}
                className={`relative pl-14 pr-4 py-4 rounded-xl transition-all group ${
                  isCurrent
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-400 shadow-lg scale-[1.01]'
                    : isPast
                    ? 'bg-gray-50/80 opacity-70'
                    : 'bg-white border border-gray-200 hover:shadow-md hover:border-gray-300'
                }`}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center ${
                    isCurrent
                      ? 'bg-blue-500 text-white animate-pulse shadow-lg shadow-blue-300'
                      : isPast
                      ? 'bg-green-500 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {getTimeIcon(item.waktu_mulai)}
                </div>
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isCurrent && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full animate-pulse">
                          SEKARANG
                        </span>
                      )}
                      {isPast && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Selesai
                        </span>
                      )}
                      <h3 className={`font-semibold truncate ${isCurrent ? 'text-blue-800' : 'text-gray-800'}`}>
                        {item.nama_aktivitas}
                      </h3>
                      {item.divisi_nama && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-600 rounded border border-gray-200">
                          PJ: {item.divisi_nama}
                        </span>
                      )}
                    </div>
                    {item.deskripsi && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.deskripsi}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div 
                        className="font-mono text-sm font-semibold px-3 py-1 rounded-lg"
                        style={{ 
                          backgroundColor: isCurrent ? item.warna + '20' : '#f3f4f6',
                          color: isCurrent ? item.warna : '#6b7280'
                        }}
                      >
                        {formatTime(item.waktu_mulai)} - {formatTime(item.waktu_selesai)}
                      </div>
                    </div>
                    
                    {canEdit && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item.id_aktivitas)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Color indicator */}
                <div 
                  className="absolute left-0 top-4 bottom-4 w-1 rounded-r"
                  style={{ backgroundColor: item.warna || '#3B82F6' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">
                {editId ? 'Edit Aktivitas' : 'Tambah Aktivitas'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Aktivitas</label>
                <input
                  type="text"
                  value={form.nama_aktivitas}
                  onChange={e => setForm({...form, nama_aktivitas: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={e => setForm({...form, deskripsi: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penanggung Jawab (PJ)</label>
                <select
                  value={form.divisi_id || ''}
                  onChange={e => setForm({...form, divisi_id: e.target.value ? parseInt(e.target.value) : null})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">-- Pilih PJ / Divisi --</option>
                  {jabatans.map(j => (
                    <option key={j.id_jabatan} value={j.id_jabatan}>{j.nama_jabatan}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mulai</label>
                  <input
                    type="time"
                    value={form.waktu_mulai}
                    onChange={e => setForm({...form, waktu_mulai: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selesai</label>
                  <input
                    type="time"
                    value={form.waktu_selesai}
                    onChange={e => setForm({...form, waktu_selesai: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warna</label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({...form, warna: color})}
                      className={`w-8 h-8 rounded-full transition-transform ${form.warna === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                  <input
                    type="number"
                    value={form.urutan}
                    onChange={e => setForm({...form, urutan: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({...form, status: e.target.value as 'aktif' | 'nonaktif'})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Hapus Aktivitas?</h3>
            <p className="text-gray-500 mb-4">Aktivitas yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
