import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, Circle, Loader2, Clock, ListChecks, ChevronDown, ChevronUp,
  Settings, Plus, Pencil, Trash2, X, Save
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface SopItem {
  id: number;
  jabatan_id: number;
  divisi: string;
  nama_sop: string;
  deskripsi?: string;
  frekuensi: 'harian' | 'mingguan' | 'bulanan';
  waktu_target?: string;
  urutan: number;
  checklist_id?: number;
  completed_by?: number;
  waktu_selesai?: string;
  catatan?: string;
  is_completed: number;
}

interface SopChecklistPanelProps {
  jabatanId: number;
  title?: string;
}

const defaultForm: {
  nama_sop: string;
  deskripsi: string;
  frekuensi: 'harian' | 'mingguan' | 'bulanan';
  waktu_target: string;
  urutan: number;
} = {
  nama_sop: '',
  deskripsi: '',
  frekuensi: 'harian',
  waktu_target: '08:00',
  urutan: 0
};

export default function SopChecklistPanel({ jabatanId, title = 'SOP Harian' }: SopChecklistPanelProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [items, setItems] = useState<SopItem[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, percentage: 0 });
  const [expanded, setExpanded] = useState(true);
  const [manageMode, setManageMode] = useState(false);
  const [tanggal, setTanggal] = useState('');
  
  // CRUD State
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<SopItem | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const canManage = user?.role && ['superadmin', 'akademik', 'pembinaan', 'asrama'].includes(user.role.toLowerCase());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data: any = await api.get(`/api/sop?jabatan_id=${jabatanId}`);
      if (data.success) {
        setItems(data.data.items || []);
        setStats(data.data.stats || { total: 0, completed: 0, pending: 0, percentage: 0 });
        setTanggal(data.data.tanggal || '');
      }
    } catch (err) {
      console.error('Error fetching SOP:', err);
    } finally {
      setLoading(false);
    }
  }, [jabatanId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggle = async (sop: SopItem) => {
    if (manageMode) return;
    try {
      setSubmitting(sop.id);
      
      if (sop.is_completed) {
        // Uncomplete
        await api.delete(`/api/sop/uncomplete/${sop.id}`);
      } else {
        // Complete
        await api.post(`/api/sop/complete`, { sop_id: sop.id });
      }
      fetchData();
    } catch (err) {
      console.error('Error toggling SOP:', err);
    } finally {
      setSubmitting(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editItem ? `/api/sop/${editItem.id}` : `/api/sop`;
      const data: any = editItem 
        ? await api.put(url, { ...form, jabatan_id: jabatanId })
        : await api.post(url, { ...form, jabatan_id: jabatanId });
        
      if (data.success) {
        fetchData();
        setShowModal(false);
        setEditItem(null);
        setForm(defaultForm);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus SOP ini?')) return;
    try {
      const data: any = await api.delete(`/api/sop/${id}`);
      if (data.success) fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const openEdit = (item: SopItem) => {
    setEditItem(item);
    setForm({
      nama_sop: item.nama_sop,
      deskripsi: item.deskripsi || '',
      frekuensi: item.frekuensi,
      waktu_target: item.waktu_target ? item.waktu_target.slice(0, 5) : '08:00',
      urutan: item.urutan
    });
    setShowModal(true);
  };

  if (loading && items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setExpanded(!expanded)}>
            <div className="bg-white/20 p-2 rounded-lg">
              <ListChecks className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-white/70 text-sm">
                {stats.completed}/{stats.total} selesai • {tanggal}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <button 
                onClick={() => setManageMode(!manageMode)}
                className={`p-2 rounded-lg transition-colors ${manageMode ? 'bg-white text-indigo-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
                title="Kelola SOP"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                <circle 
                  cx="24" cy="24" r="20" fill="none" stroke="white" strokeWidth="4"
                  strokeDasharray={125.6}
                  strokeDashoffset={125.6 - (125.6 * stats.percentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {stats.percentage}%
              </span>
            </div>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {expanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              {manageMode ? 'Manajemen Daftar SOP' : 'Checklist Hari Ini'}
            </h4>
            {manageMode && (
              <button
                onClick={() => {
                  setEditItem(null);
                  setForm(defaultForm);
                  setShowModal(true);
                }}
                className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-100 transition"
              >
                <Plus className="w-4 h-4" />
                Tambah SOP
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ListChecks className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Belum ada SOP untuk divisi ini</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((sop) => (
                <div 
                  key={sop.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    sop.is_completed 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {!manageMode && (
                    <button
                      onClick={() => handleToggle(sop)}
                      disabled={submitting === sop.id}
                      className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-full flex items-center justify-center transition-colors ${
                        sop.is_completed 
                          ? 'bg-emerald-500 text-white' 
                          : 'border-2 border-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      {submitting === sop.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : sop.is_completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${sop.is_completed && !manageMode ? 'text-emerald-700 line-through' : 'text-gray-900'}`}>
                        {sop.nama_sop}
                      </p>
                      {sop.waktu_target && (
                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                          {sop.waktu_target.slice(0, 5)}
                        </span>
                      )}
                    </div>
                    {sop.deskripsi && (
                      <p className="text-sm text-gray-500 mt-0.5">{sop.deskripsi}</p>
                    )}
                    {!manageMode && sop.is_completed && sop.waktu_selesai && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        Selesai pukul {sop.waktu_selesai.slice(0, 5)}
                      </p>
                    )}
                  </div>

                  {manageMode && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(sop)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sop.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">
                {editItem ? 'Edit SOP' : 'Tambah SOP Baru'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama SOP</label>
                <input
                  type="text"
                  value={form.nama_sop}
                  onChange={e => setForm({...form, nama_sop: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Contoh: Cek Kebersihan Kelas"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={e => setForm({...form, deskripsi: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  rows={2}
                  placeholder="Detail tugas..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frekuensi</label>
                  <select
                    value={form.frekuensi}
                    onChange={e => setForm({...form, frekuensi: e.target.value as any})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="harian">Harian</option>
                    <option value="mingguan">Mingguan</option>
                    <option value="bulanan">Bulanan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Waktu</label>
                  <input
                    type="time"
                    value={form.waktu_target}
                    onChange={e => setForm({...form, waktu_target: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                <input
                  type="number"
                  value={form.urutan}
                  onChange={e => setForm({...form, urutan: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

