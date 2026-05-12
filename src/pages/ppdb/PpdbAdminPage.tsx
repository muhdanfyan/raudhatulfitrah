import { useState, useEffect } from 'react';
import { api, API_URL } from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';
import { Settings, MapPin, Phone, CreditCard, Image as ImageIcon, Save, Globe } from 'lucide-react';

const DOC_LABELS: Record<string, string> = {
  foto: 'Pas Foto', kk: 'Kartu Keluarga', akta: 'Akta Kelahiran',
  ijazah: 'Ijazah/SKL', rapor: 'Rapor', surat_sehat: 'Surat Sehat', bukti_bayar: 'Bukti Bayar', lainnya: 'Lainnya'
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-gray-700', bg: 'bg-gray-100' },
  submitted: { label: 'Submitted', color: 'text-primary-dark', bg: 'bg-primary/10' },
  verifikasi: { label: 'Verifikasi', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  wawancara: { label: 'Wawancara', color: 'text-purple-700', bg: 'bg-purple-100' },
  diterima: { label: 'Diterima', color: 'text-green-700', bg: 'bg-green-100' },
  ditolak: { label: 'Ditolak', color: 'text-red-700', bg: 'bg-red-100' },
  daftar_ulang: { label: 'Daftar Ulang', color: 'text-teal-700', bg: 'bg-teal-100' },
  selesai: { label: 'Selesai', color: 'text-green-700', bg: 'bg-green-100' }
};

interface Pendaftar {
  id_santri: number;
  nama_lengkap_santri: string;
  email_santri: string;
  foto_santri: string;
  no_pendaftaran: string;
  status_pendaftaran: string;
  no_hp: string;
  tanggal_daftar: string;
  nama_gelombang: string;
  nama_konsentrasi: string;
}

interface Stats {
  total: number;
  draft: number;
  submitted: number;
  verifikasi: number;
  wawancara: number;
  diterima: number;
  ditolak: number;
}

interface Gelombang {
  id_gelombang: number;
  nama_gelombang: string;
  tahun_ajaran: string;
  tanggal_buka: string;
  tanggal_tutup: string;
  biaya_pendaftaran: string;
  kuota: number;
  is_active: number;
  pendaftar_count: number;
}

export default function PpdbAdminPage() {
  const [pendaftar, setPendaftar] = useState<Pendaftar[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [gelombangList, setGelombangList] = useState<Gelombang[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', gelombang_id: '', search: '', foto_missing: false });
  const [selectedPendaftar, setSelectedPendaftar] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('pendaftar');
  const [detailTab, setDetailTab] = useState('info');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { settings: globalSettings, refetchSettings } = useSettings();
  
  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    contact_whatsapp: '',
    contact_map_url: '',
    ppdb_registration_address: '',
    ppdb_pesantren_address: '',
    ppdb_boarding_fee: '',
  });
  const [ppdbHeroFile, setPpdbHeroFile] = useState<File | null>(null);
  const [ppdbHeroPreview, setPpdbHeroPreview] = useState('');
  
  // Gelombang CRUD states
  const [showGelombangForm, setShowGelombangForm] = useState(false);
  const [editingGelombang, setEditingGelombang] = useState<Gelombang | null>(null);
  const [gelombangForm, setGelombangForm] = useState({
    nama_gelombang: '',
    tahun_ajaran: '',
    tanggal_buka: '',
    tanggal_tutup: '',
    biaya_pendaftaran: '',
    biaya_daftar_ulang: '',
    kuota: '',
    keterangan: '',
    is_active: 1
  });

  const fetchPendaftar = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.gelombang_id) params.append('gelombang_id', filter.gelombang_id);
      if (filter.search) params.append('search', filter.search);

      const result = await api.get(`/ppdb-admin/pendaftar?${params}`);
      if (result.success) {
        let data = result.data?.data || [];
        // Client-side filter for missing photos
        if (filter.foto_missing) {
          data = data.filter((p: Pendaftar) => !p.foto_santri);
        }
        setPendaftar(data);
        setStats(result.stats || null);
        setGelombangList(result.gelombang || []);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchGelombang = async () => {
    try {
      const result = await api.get('/ppdb-admin/gelombang');
      if (result.success) {
        setGelombangList(result.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPendaftar();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPendaftar();
    }, 300);
    return () => clearTimeout(timer);
  }, [filter.status, filter.gelombang_id, filter.search, filter.foto_missing]);

  useEffect(() => {
    if (activeTab === 'gelombang') {
      fetchGelombang();
    }
    if (activeTab === 'pengaturan') {
      setSettingsForm({
        contact_whatsapp: globalSettings.contactWhatsapp || '',
        contact_map_url: globalSettings.contactMapUrl || '',
        ppdb_registration_address: globalSettings.ppdbRegistrationAddress || '',
        ppdb_pesantren_address: globalSettings.ppdbPesantrenAddress || '',
        ppdb_boarding_fee: globalSettings.ppdbBoardingFee || '',
      });
      setPpdbHeroPreview(globalSettings.ppdbHeroImage || '');
    }
  }, [activeTab, globalSettings]);

  const fetchDetail = async (id: number) => {
    try {
      const result = await api.get(`/ppdb-admin/pendaftar/${id}`);
      if (result.success) {
        setDetailData(result.data);
        setSelectedPendaftar(id);
        setDetailTab('info');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    if (!confirm(`Ubah status menjadi "${status}"?`)) return;

    setActionLoading(true);
    try {
      const result = await api.put(`/ppdb-admin/pendaftar/${id}/status`, { status });
      if (result.success) {
        alert('Status berhasil diupdate');
        fetchPendaftar();
        fetchDetail(id);
      } else {
        alert(result.message || 'Gagal update status');
      }
    } catch {
      alert('Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const deletePendaftar = async (id: number) => {
    if (!confirm('PERINGATAN: Semua data pendaftar akan dihapus permanen termasuk dokumen dan akun user. Lanjutkan?')) return;
    if (!confirm('Anda yakin? Aksi ini tidak dapat dibatalkan!')) return;

    setActionLoading(true);
    try {
      const result = await api.delete(`/ppdb-admin/pendaftar/${id}`);
      if (result.success) {
        alert('Data pendaftar berhasil dihapus');
        setSelectedPendaftar(null);
        setDetailData(null);
        fetchPendaftar();
      } else {
        alert(result.message || 'Gagal menghapus data');
      }
    } catch {
      alert('Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const resetPassword = async (id: number) => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }

    setActionLoading(true);
    try {
      const result = await api.post(`/ppdb-admin/pendaftar/${id}/reset-password`, { password: newPassword });
      if (result.success) {
        alert('Password berhasil direset');
        setShowResetPassword(false);
        setNewPassword('');
      } else {
        alert(result.message || 'Gagal reset password');
      }
    } catch {
      alert('Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleGelombangActive = async (id: number, isActive: boolean) => {
    try {
      const result = await api.put(`/ppdb-admin/gelombang/${id}`, { is_active: isActive ? 1 : 0 });
      if (result.success) {
        fetchGelombang();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openAddGelombang = () => {
    setEditingGelombang(null);
    setGelombangForm({
      nama_gelombang: '',
      tahun_ajaran: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      tanggal_buka: '',
      tanggal_tutup: '',
      biaya_pendaftaran: '',
      biaya_daftar_ulang: '',
      kuota: '',
      keterangan: '',
      is_active: 1
    });
    setShowGelombangForm(true);
  };

  const openEditGelombang = (g: Gelombang) => {
    setEditingGelombang(g);
    setGelombangForm({
      nama_gelombang: g.nama_gelombang,
      tahun_ajaran: g.tahun_ajaran,
      tanggal_buka: g.tanggal_buka,
      tanggal_tutup: g.tanggal_tutup,
      biaya_pendaftaran: g.biaya_pendaftaran,
      biaya_daftar_ulang: '',
      kuota: String(g.kuota),
      keterangan: '',
      is_active: g.is_active
    });
    setShowGelombangForm(true);
  };

  const saveGelombang = async () => {
    if (!gelombangForm.nama_gelombang || !gelombangForm.tahun_ajaran || !gelombangForm.tanggal_buka || !gelombangForm.tanggal_tutup) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }
    if (!gelombangForm.biaya_pendaftaran || !gelombangForm.kuota) {
      alert('Biaya pendaftaran dan kuota harus diisi');
      return;
    }
    setActionLoading(true);
    try {
      const payload: Record<string, any> = {
        nama_gelombang: gelombangForm.nama_gelombang,
        tahun_ajaran: gelombangForm.tahun_ajaran,
        tanggal_buka: gelombangForm.tanggal_buka,
        tanggal_tutup: gelombangForm.tanggal_tutup,
        biaya_pendaftaran: Number(gelombangForm.biaya_pendaftaran) || 0,
        biaya_daftar_ulang: Number(gelombangForm.biaya_daftar_ulang) || 0,
        kuota: Number(gelombangForm.kuota) || 1,
        is_active: gelombangForm.is_active
      };
      // Only include keterangan if not empty
      if (gelombangForm.keterangan && gelombangForm.keterangan.trim()) {
        payload.keterangan = gelombangForm.keterangan;
      }
      let result;
      if (editingGelombang) {
        result = await api.put(`/ppdb-admin/gelombang/${editingGelombang.id_gelombang}`, payload);
      } else {
        result = await api.post('/ppdb-admin/gelombang', payload);
      }
      if (result.success) {
        alert(editingGelombang ? 'Gelombang berhasil diupdate' : 'Gelombang berhasil ditambahkan');
        setShowGelombangForm(false);
        fetchGelombang();
      } else {
        alert(result.message || 'Gagal menyimpan gelombang');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteGelombang = async (id: number) => {
    if (!confirm('Yakin ingin menghapus gelombang ini? Data pendaftar terkait TIDAK akan dihapus.')) return;
    setActionLoading(true);
    try {
      const result = await api.delete(`/ppdb-admin/gelombang/${id}`);
      if (result.success) {
        alert('Gelombang berhasil dihapus');
        fetchGelombang();
      } else {
        alert(result.message || 'Gagal menghapus gelombang');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      Object.entries(settingsForm).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      if (ppdbHeroFile) {
        formData.append('ppdb_hero_image', ppdbHeroFile);
      }
      
      const result = await api.post('/settings/general', formData);
      if (result.success) {
        alert('Pengaturan berhasil disimpan');
        await refetchSettings();
      } else {
        alert(result.message || 'Gagal menyimpan pengaturan');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat menyimpan pengaturan');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPhotoUrl = (foto: string, name?: string) => {
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=e0e0e0&color=666&size=80`;
    if (!foto) return fallback;
    if (foto.startsWith('http')) return foto;
    return `${API_URL}/storage/fotosantri/${foto}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen PPDB</h1>
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-4">
        {[
          { key: 'pendaftar', label: 'Data Pendaftar' },
          { key: 'gelombang', label: 'Gelombang Pendaftaran' },
          { key: 'pengaturan', label: 'Pengaturan PPDB' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-medium border-b-2 -mb-px transition ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'pendaftar' && (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(stats).map(([key, value]) => {
                const config = STATUS_CONFIG[key] || { bg: 'bg-white', color: 'text-gray-800' };
                return (
                  <div key={key} className={`rounded-xl p-4 shadow-sm border ${key === 'total' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-primary' : `${config.bg} border-gray-100`}`}>
                    <p className={`text-xs font-medium uppercase tracking-wide ${key === 'total' ? 'text-blue-100' : 'text-gray-500'}`}>{key}</p>
                    <p className={`text-2xl font-bold mt-1 ${key === 'total' ? 'text-white' : config.color}`}>{value}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Cari nama/email/no pendaftaran..."
                value={filter.search}
                onChange={e => setFilter({ ...filter, search: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary"
              />
            </div>
            <select
              value={filter.status}
              onChange={e => setFilter({ ...filter, status: e.target.value })}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <select
              value={filter.gelombang_id}
              onChange={e => setFilter({ ...filter, gelombang_id: e.target.value })}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Gelombang</option>
              {gelombangList.map(g => (
                <option key={g.id_gelombang} value={g.id_gelombang}>{g.nama_gelombang}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={filter.foto_missing}
                onChange={e => setFilter({ ...filter, foto_missing: e.target.checked })}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Tanpa Foto</span>
            </label>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Pendaftar</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">No. Pendaftaran</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Konsentrasi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Tanggal</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendaftar.map(p => (
                  <tr key={p.id_santri} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={getPhotoUrl(p.foto_santri, p.nama_lengkap_santri)}
                            alt=""
                            className={`w-10 h-10 rounded-full object-cover bg-gray-200 ring-2 shadow ${!p.foto_santri ? 'ring-amber-400' : 'ring-white'}`}
                            onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama_lengkap_santri || 'User')}&background=e0e0e0&color=666&size=80`; }}
                          />
                          {!p.foto_santri && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold" title="Foto belum diupload">
                              !
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{p.nama_lengkap_santri}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500">{p.email_santri}</p>
                            {!p.foto_santri && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">No Photo</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{p.no_pendaftaran || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.nama_konsentrasi || '-'}</td>
                    <td className="px-4 py-3">{getStatusBadge(p.status_pendaftaran || 'draft')}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {p.tanggal_daftar ? new Date(p.tanggal_daftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => fetchDetail(p.id_santri)}
                        className="px-3 py-1.5 bg-primary/5 text-primary rounded-lg hover:bg-primary/10 transition text-sm font-medium"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
                {pendaftar.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p>Tidak ada data pendaftar</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'gelombang' && (
        <div className="space-y-4">
          {/* Add Button */}
          <div className="flex justify-end">
            <button
              onClick={openAddGelombang}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Gelombang
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Gelombang</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tahun Ajaran</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Periode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Biaya</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kuota</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pendaftar</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {gelombangList.map(g => (
                  <tr key={g.id_gelombang} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{g.nama_gelombang}</td>
                    <td className="px-4 py-3">{g.tahun_ajaran}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(g.tanggal_buka).toLocaleDateString('id-ID')} - {new Date(g.tanggal_tutup).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm">Rp {Number(g.biaya_pendaftaran).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">{g.kuota}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${(g.pendaftar_count || 0) >= g.kuota ? 'text-red-600' : 'text-green-600'}`}>
                        {g.pendaftar_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${g.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {g.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditGelombang(g)}
                          className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleGelombangActive(g.id_gelombang, !g.is_active)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${g.is_active ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                        >
                          {g.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => deleteGelombang(g.id_gelombang)}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {gelombangList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      <p>Belum ada gelombang pendaftaran</p>
                      <button
                        onClick={openAddGelombang}
                        className="mt-2 text-primary hover:underline"
                      >
                        + Tambah Gelombang Pertama
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pengaturan' && (
        <div className="max-w-4xl space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Identitas & Kontak PPDB
            </h3>
            
            <div className="space-y-6">
              {/* Hero Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Banner PPDB (Hero Image)</label>
                <div className="flex items-start gap-4">
                  <div className="w-48 h-28 rounded-lg border bg-gray-50 overflow-hidden flex-shrink-0">
                    {ppdbHeroPreview ? (
                      <img src={ppdbHeroPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="ppdb_hero"
                      className="hidden"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPpdbHeroFile(file);
                          setPpdbHeroPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <label
                      htmlFor="ppdb_hero"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition shadow-sm"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Ganti Banner
                    </label>
                    <p className="mt-2 text-xs text-gray-500">Rekomendasi ukuran 1200x400px. Maksimal 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Admin PPDB</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={settingsForm.contact_whatsapp}
                      onChange={e => setSettingsForm({ ...settingsForm, contact_whatsapp: e.target.value })}
                      placeholder="62812345678"
                      className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Gunakan format 62 (Tanpa + atau 0)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Mondok Bulanan (SPP)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={settingsForm.ppdb_boarding_fee}
                      onChange={e => setSettingsForm({ ...settingsForm, ppdb_boarding_fee: e.target.value })}
                      placeholder="1400000"
                      className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lokasi Pendaftaran</label>
                <textarea
                  rows={2}
                  value={settingsForm.ppdb_registration_address}
                  onChange={e => setSettingsForm({ ...settingsForm, ppdb_registration_address: e.target.value })}
                  className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Masukkan alamat lengkap kantor pendaftaran..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lokasi Pesantren</label>
                <textarea
                  rows={2}
                  value={settingsForm.ppdb_pesantren_address}
                  onChange={e => setSettingsForm({ ...settingsForm, ppdb_pesantren_address: e.target.value })}
                  className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Masukkan alamat lengkap lokasi pesantren..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Google Maps (Embed URL)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={settingsForm.contact_map_url}
                    onChange={e => setSettingsForm({ ...settingsForm, contact_map_url: e.target.value })}
                    placeholder="https://www.google.com/maps/embed?..."
                    className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Ambil dari Google Maps &gt; Share &gt; Embed a map &gt; Copy 'src' attribute only.</p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={actionLoading}
                  className="inline-flex items-center px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {actionLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gelombang Form Modal */}
      {showGelombangForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowGelombangForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                {editingGelombang ? 'Edit Gelombang' : 'Tambah Gelombang Baru'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Gelombang *</label>
                <input
                  type="text"
                  value={gelombangForm.nama_gelombang}
                  onChange={e => setGelombangForm({ ...gelombangForm, nama_gelombang: e.target.value })}
                  placeholder="Contoh: Gelombang 1"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran *</label>
                <input
                  type="text"
                  value={gelombangForm.tahun_ajaran}
                  onChange={e => setGelombangForm({ ...gelombangForm, tahun_ajaran: e.target.value })}
                  placeholder="2025-2026"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Buka *</label>
                  <input
                    type="date"
                    value={gelombangForm.tanggal_buka}
                    onChange={e => setGelombangForm({ ...gelombangForm, tanggal_buka: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Tutup *</label>
                  <input
                    type="date"
                    value={gelombangForm.tanggal_tutup}
                    onChange={e => setGelombangForm({ ...gelombangForm, tanggal_tutup: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Pendaftaran (Rp)</label>
                  <input
                    type="number"
                    value={gelombangForm.biaya_pendaftaran}
                    onChange={e => setGelombangForm({ ...gelombangForm, biaya_pendaftaran: e.target.value })}
                    placeholder="150000"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Daftar Ulang (Rp)</label>
                  <input
                    type="number"
                    value={gelombangForm.biaya_daftar_ulang}
                    onChange={e => setGelombangForm({ ...gelombangForm, biaya_daftar_ulang: e.target.value })}
                    placeholder="7000000"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kuota Pendaftar</label>
                <input
                  type="number"
                  value={gelombangForm.kuota}
                  onChange={e => setGelombangForm({ ...gelombangForm, kuota: e.target.value })}
                  placeholder="50"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea
                  value={gelombangForm.keterangan}
                  onChange={e => setGelombangForm({ ...gelombangForm, keterangan: e.target.value })}
                  placeholder="Keterangan tambahan (opsional)"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={gelombangForm.is_active === 1}
                  onChange={e => setGelombangForm({ ...gelombangForm, is_active: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Aktifkan gelombang ini</label>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowGelombangForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={saveGelombang}
                disabled={actionLoading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition"
              >
                {actionLoading ? 'Menyimpan...' : (editingGelombang ? 'Update' : 'Simpan')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPendaftar && detailData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPendaftar(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={getPhotoUrl(detailData.santri.foto_santri, detailData.santri.nama_lengkap_santri)}
                    alt=""
                    className="w-20 h-20 rounded-xl object-cover bg-white/20 ring-4 ring-white/30 shadow-lg"
                    onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(detailData.santri.nama_lengkap_santri || 'User')}&background=e0e0e0&color=666&size=80`; }}
                  />
                  <div>
                    <h2 className="text-2xl font-bold">{detailData.santri.nama_lengkap_santri}</h2>
                    <p className="text-blue-100 flex items-center gap-2 mt-1">
                      <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-sm">{detailData.santri.no_pendaftaran || 'No Pendaftaran'}</span>
                    </p>
                    <div className="mt-2">{getStatusBadge(detailData.santri.status_pendaftaran || 'draft')}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedPendaftar(null)} className="p-2 hover:bg-white/20 rounded-lg transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="border-b flex">
              {[
                { key: 'info', label: 'Informasi' },
                { key: 'dokumen', label: 'Dokumen' },
                { key: 'pembayaran', label: 'Pembayaran' },
                { key: 'aksi', label: 'Aksi' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setDetailTab(tab.key)}
                  className={`px-6 py-3 font-medium text-sm transition ${
                    detailTab === tab.key ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
              {detailTab === 'info' && (
                <div className="space-y-6">
                  {/* Data Diri */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Data Diri</h4>
                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                      <div><span className="text-gray-500 text-sm">Email</span><p className="font-medium">{detailData.santri.email_santri}</p></div>
                      <div><span className="text-gray-500 text-sm">No HP</span><p className="font-medium">{detailData.santri.no_hp || '-'}</p></div>
                      <div><span className="text-gray-500 text-sm">Tempat, Tanggal Lahir</span><p className="font-medium">{detailData.santri.tempat_lahir_santri}, {detailData.santri.tanggal_lahir_santri}</p></div>
                      <div><span className="text-gray-500 text-sm">Asal Daerah</span><p className="font-medium">{detailData.santri.asal_daerah_santri || '-'}</p></div>
                      <div className="col-span-2"><span className="text-gray-500 text-sm">Alamat Lengkap</span><p className="font-medium">{detailData.santri.alamat_lengkap_santri || '-'}</p></div>
                      <div><span className="text-gray-500 text-sm">Konsentrasi</span><p className="font-medium">{detailData.santri.nama_konsentrasi || '-'}</p></div>
                      <div><span className="text-gray-500 text-sm">Hafalan Quran</span><p className="font-medium">{detailData.santri.hafalan_quran_santri || '-'}</p></div>
                      <div className="col-span-2"><span className="text-gray-500 text-sm">Alasan Mendaftar</span><p className="font-medium">{detailData.santri.alasan_mendaftar_santri || '-'}</p></div>
                    </div>
                  </div>

                  {/* Data Orang Tua */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Data Orang Tua</h4>
                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                      <div><span className="text-gray-500 text-sm">Nama Ayah</span><p className="font-medium">{detailData.santri.nama_ayah || '-'}</p></div>
                      <div><span className="text-gray-500 text-sm">Pekerjaan Ayah</span><p className="font-medium">{detailData.santri.pekerjaan_ayah || '-'}</p></div>
                      <div><span className="text-gray-500 text-sm">Nama Ibu</span><p className="font-medium">{detailData.santri.nama_ibu || '-'}</p></div>
                      <div><span className="text-gray-500 text-sm">Pekerjaan Ibu</span><p className="font-medium">{detailData.santri.pekerjaan_ibu || '-'}</p></div>
                      <div><span className="text-gray-500 text-sm">No HP Orang Tua</span><p className="font-medium">{detailData.santri.no_hp_ortu || '-'}</p></div>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'dokumen' && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Dokumen Terupload</h4>
                  {detailData.dokumen?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {detailData.dokumen.map((d: any) => (
                        <div key={d.id_dokumen} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          {d.path_file && (
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border flex-shrink-0">
                              {d.path_file.toLowerCase().endsWith('.pdf') ? (
                                <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500">
                                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M4 18h12V6h-4V2H4v16zm8-14l4 4h-4V4z"/></svg>
                                </div>
                              ) : (
                                <img
                                  src={d.path_file.startsWith('http') ? d.path_file : `${API_URL}/storage/${d.path_file}`}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={e => { e.currentTarget.style.display = 'none'; }}
                                />
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800">{DOC_LABELS[d.jenis_dokumen] || d.jenis_dokumen}</p>
                            <p className="text-xs text-gray-500 truncate">{d.nama_file}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              d.status_verifikasi === 'valid' ? 'bg-green-100 text-green-700' :
                              d.status_verifikasi === 'invalid' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {d.status_verifikasi}
                            </span>
                            <button
                              onClick={() => setPreviewUrl(d.path_file.startsWith('http') ? d.path_file : `${API_URL}/storage/${d.path_file}`)}
                              className="p-2 text-primary hover:bg-primary/5 rounded-lg transition"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>Belum ada dokumen terupload</p>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'pembayaran' && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Riwayat Pembayaran</h4>
                  {detailData.pembayaran?.length > 0 ? (
                    <div className="space-y-3">
                      {detailData.pembayaran.map((p: any) => (
                        <div key={p.id_pembayaran} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-semibold text-gray-800 capitalize">{p.jenis_pembayaran.replace('_', ' ')}</span>
                              <p className="text-sm text-gray-500 mt-0.5">{new Date(p.tanggal_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-800">Rp {Number(p.nominal).toLocaleString('id-ID')}</p>
                              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                                p.status === 'verified' ? 'bg-green-100 text-green-700' :
                                p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {p.status === 'verified' ? 'Terverifikasi' : p.status === 'rejected' ? 'Ditolak' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          {p.bukti_bayar && (
                            <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                              {(Array.isArray(p.bukti_bayar) ? p.bukti_bayar : JSON.parse(p.bukti_bayar || '[]')).map((url: string, idx: number) => (
                                <button key={idx} onClick={() => setPreviewUrl(url)} className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-sm hover:bg-primary/10 transition">
                                  Bukti {idx + 1}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p>Belum ada pembayaran</p>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'aksi' && (
                <div className="space-y-6">
                  {/* Update Status */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => updateStatus(selectedPendaftar, key)}
                          disabled={detailData.santri.status_pendaftaran === key || actionLoading}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            detailData.santri.status_pendaftaran === key
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : `${val.bg} ${val.color} hover:opacity-80`
                          }`}
                        >
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset Password */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Reset Password</h4>
                    {showResetPassword ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="Password baru (min 6 karakter)"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="flex-1 px-4 py-2 border rounded-lg"
                          />
                          <button
                            onClick={() => resetPassword(selectedPendaftar)}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                          >
                            {actionLoading ? 'Menyimpan...' : 'Reset'}
                          </button>
                          <button
                            onClick={() => { setShowResetPassword(false); setNewPassword(''); }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowResetPassword(true)}
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
                      >
                        Reset Password
                      </button>
                    )}
                  </div>

                  {/* Delete */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Hapus Data</h4>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-700 text-sm mb-3">
                        Menghapus pendaftar akan menghapus semua data termasuk dokumen, pembayaran, dan akun user secara permanen.
                      </p>
                      <button
                        onClick={() => deletePendaftar(selectedPendaftar)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                      >
                        {actionLoading ? 'Menghapus...' : 'Hapus Pendaftar'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Preview Dokumen</h3>
              <button onClick={() => setPreviewUrl(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {previewUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe src={previewUrl} className="w-full h-[70vh]" />
              ) : (
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[70vh] mx-auto rounded-lg" />
              )}
            </div>
            <div className="p-4 border-t text-center">
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Buka di tab baru
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
