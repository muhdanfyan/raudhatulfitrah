import { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Pencil, Trash2, Loader2, Filter, 
  AlertCircle, Clock, Save
} from 'lucide-react';
import { api } from '../../services/api';

interface SopItem {
  id: number;
  jabatan_id: number;
  divisi: string;
  nama_sop: string;
  deskripsi?: string;
  frekuensi: 'harian' | 'mingguan' | 'bulanan';
  waktu_target?: string;
  urutan: number;
  is_active: number;
}

interface Jabatan {
  id_jabatan: number;
  nama_jabatan: string;
}

export default function SopTablePage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SopItem[]>([]);
  const [jabatans, setJabatans] = useState<Jabatan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState<string>('all');
  
  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SopItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    jabatan_id: '',
    nama_sop: '',
    deskripsi: '',
    frekuensi: 'harian',
    waktu_target: '08:00',
    urutan: 0
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sopRes, jabRes]: any = await Promise.all([
        api.get('/api/sop'),
        api.get('/api/master/jabatan')
      ]);

      if (sopRes.success) {
        setItems(sopRes.data.items || []);
      }
      if (jabRes.success) {
        setJabatans(jabRes.data || jabRes || []);
      } else if (Array.isArray(jabRes)) {
        setJabatans(jabRes);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.jabatan_id || !form.nama_sop) return alert('Mohon lengkapi data');
    
    setSaving(true);
    try {
      const url = editingItem ? `/api/sop/${editingItem.id}` : `/api/sop`;
      const res: any = editingItem 
        ? await api.put(url, form)
        : await api.post(url, form);
        
      if (res.success) {
        fetchData();
        setShowModal(false);
        setEditingItem(null);
        setForm({
          jabatan_id: '',
          nama_sop: '',
          deskripsi: '',
          frekuensi: 'harian',
          waktu_target: '08:00',
          urutan: 0
        });
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (item: SopItem) => {
    setEditingItem(item);
    setForm({
      jabatan_id: item.jabatan_id.toString(),
      nama_sop: item.nama_sop,
      deskripsi: item.deskripsi || '',
      frekuensi: item.frekuensi,
      waktu_target: item.waktu_target?.slice(0, 5) || '08:00',
      urutan: item.urutan
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus SOP ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      const res: any = await api.delete(`/api/sop/${id}`);
      if (res.success) fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredItems = items.filter(item => {
    const matchSearch = item.nama_sop.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       item.divisi?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDivisi = selectedDivisi === 'all' || item.jabatan_id.toString() === selectedDivisi;
    return matchSearch && matchDivisi;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Master SOP</h1>
          <p className="text-gray-500">Kelola definisi SOP untuk seluruh divisi</p>
        </div>
        <button 
          onClick={() => {
            setEditingItem(null);
            setForm({
              jabatan_id: '',
              nama_sop: '',
              deskripsi: '',
              frekuensi: 'harian',
              waktu_target: '08:00',
              urutan: 0
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Tambah SOP
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search SOP or Division..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-xl border border-gray-100">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={selectedDivisi}
            onChange={e => setSelectedDivisi(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none min-w-[150px]"
          >
            <option value="all">Semua Divisi</option>
            {jabatans.map(j => (
              <option key={j.id_jabatan} value={j.id_jabatan}>{j.nama_jabatan}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Divisi</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nama SOP</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Frekuensi</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Target</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Urutan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-4" />
                    <p className="text-gray-500">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada data SOP</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                        {item.divisi}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{item.nama_sop}</p>
                      {item.deskripsi && <p className="text-xs text-gray-500 truncate max-w-xs">{item.deskripsi}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm text-gray-600 font-medium">{item.frekuensi}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-sm text-gray-600">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {item.waktu_target?.slice(0, 5)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-400">
                      {item.urutan}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEdit(item)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Edit SOP' : 'Tambah SOP Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Divisi / Jabatan</label>
                <select 
                  value={form.jabatan_id}
                  onChange={e => setForm({...form, jabatan_id: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Pilih Divisi</option>
                  {jabatans.map(j => (
                    <option key={j.id_jabatan} value={j.id_jabatan}>{j.nama_jabatan}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama SOP</label>
                <input 
                  type="text"
                  value={form.nama_sop}
                  onChange={e => setForm({...form, nama_sop: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Contoh: Piket Kebersihan Masjid"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi (Opsional)</label>
                <textarea 
                  value={form.deskripsi}
                  onChange={e => setForm({...form, deskripsi: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                  placeholder="Keterangan singkat tentang SOP ini..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Frekuensi</label>
                  <select 
                    value={form.frekuensi}
                    onChange={e => setForm({...form, frekuensi: e.target.value as any})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="harian">Harian</option>
                    <option value="mingguan">Mingguan</option>
                    <option value="bulanan">Bulanan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Target Waktu</label>
                  <input 
                    type="time"
                    value={form.waktu_target}
                    onChange={e => setForm({...form, waktu_target: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Urutan Tampilan</label>
                <input 
                  type="number"
                  value={form.urutan}
                  onChange={e => setForm({...form, urutan: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {editingItem ? 'Simpan Perubahan' : 'Buat SOP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
