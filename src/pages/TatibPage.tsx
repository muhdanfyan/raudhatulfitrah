import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { 
  ChevronDown, ChevronRight, AlertTriangle, Shield, Search, 
  Loader2, Check, X, BookOpen, Plus, Edit2, Trash2, Users,
  BarChart3, Clock, AlertCircle, RefreshCw
} from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';



interface Santri {
  id: number;
  name: string;
  nickname?: string;
  status?: string;
  photo?: string;
}

interface Tatib {
  id_tatib: number;
  nama_tatib: string;
  deskripsi_tatib?: string;
}

interface Pelanggaran {
  id_langgar: number;
  tatib: number;
  pelanggaran: string;
  sanksi: string;
  pj_sanksi?: string;
  nama_tatib?: string;
}

interface Sanksi {
  id_sanksi: number;
  santri: number;
  pelanggaran: number;
  deskripsi_sanksi: string;
  status_sanksi: string;
  created_at: string;
  updated_at?: string;
  nama_santri: string;
  nama_pelanggaran: string;
  nama_tatib: string;
}

interface GroupedData {
  tatib: Tatib;
  pelanggaranList: Pelanggaran[];
}

type TabType = 'tatib' | 'melanggar' | 'statistik';

export default function TatibPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tatib');
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [tatibList, setTatibList] = useState<Tatib[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [sanksiList, setSanksiList] = useState<Sanksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTatib, setExpandedTatib] = useState<number | null>(null);
  
  // CRUD Modal states
  const [showTatibModal, setShowTatibModal] = useState(false);
  const [showLanggarModal, setShowLanggarModal] = useState(false);
  const [showSanksiInputModal, setShowSanksiInputModal] = useState(false);
  const [editingTatib, setEditingTatib] = useState<Tatib | null>(null);
  const [editingLanggar, setEditingLanggar] = useState<Pelanggaran | null>(null);
  const [selectedPelanggaran, setSelectedPelanggaran] = useState<Pelanggaran | null>(null);
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [searchSantri, setSearchSantri] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form states
  const [tatibForm, setTatibForm] = useState({ nama_tatib: '', deskripsi_tatib: '' });
  const [langgarForm, setLanggarForm] = useState({ tatib: 0, pelanggaran: '', sanksi: '' });
  
  // Violation details modal state
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [selectedViolatorName, setSelectedViolatorName] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch tatib
      const jsonTatib: any = await api.get('/api/master/tatib');
      const tatibListData: Tatib[] = Array.isArray(jsonTatib) ? jsonTatib : (jsonTatib.data || []);
      setTatibList(tatibListData);

      // Fetch pelanggaran (langgar)
      const jsonLanggar: any = await api.get('/api/master/langgar');
      const pelanggaranList: Pelanggaran[] = Array.isArray(jsonLanggar) ? jsonLanggar : (jsonLanggar.data || []);

      // Fetch santri
      const jsonSantri: any = await api.get('/api/santri?per_page=200');
      const santriListData = Array.isArray(jsonSantri) ? jsonSantri : (jsonSantri.data?.data || jsonSantri.data || []);
      setSantriList(santriListData);

      // Fetch sanksi
      const jsonSanksi: any = await api.get('/api/master/sanksi');
      setSanksiList(jsonSanksi.data || []);

      // Group pelanggaran by tatib
      const grouped: GroupedData[] = tatibListData.map(tatib => ({
        tatib,
        pelanggaranList: pelanggaranList.filter(p => p.tatib === tatib.id_tatib)
      }));

      setGroupedData(grouped);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTatib = (tatibId: number) => {
    setExpandedTatib(expandedTatib === tatibId ? null : tatibId);
  };

  // Show success toast
  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // CRUD Tatib
  const openTatibModal = (tatib?: Tatib) => {
    if (tatib) {
      setEditingTatib(tatib);
      setTatibForm({ nama_tatib: tatib.nama_tatib, deskripsi_tatib: tatib.deskripsi_tatib || '' });
    } else {
      setEditingTatib(null);
      setTatibForm({ nama_tatib: '', deskripsi_tatib: '' });
    }
    setShowTatibModal(true);
  };

  const saveTatib = async () => {
    if (!tatibForm.nama_tatib.trim()) return;
    setSaving(true);
    try {
      if (editingTatib) {
        await api.put(`/api/crud/tatib/${editingTatib.id_tatib}`, tatibForm);
      } else {
        await api.post('/api/crud/tatib', tatibForm);
      }
      
      showSuccessToast(editingTatib ? 'Tatib berhasil diupdate' : 'Tatib berhasil ditambahkan');
      setShowTatibModal(false);
      fetchData();
    } catch (err) {
      alert('Gagal menyimpan tatib');
    } finally {
      setSaving(false);
    }
  };

  const deleteTatib = async (tatib: Tatib) => {
    if (!confirm(`Hapus tata tertib "${tatib.nama_tatib}"?`)) return;
    try {
      await api.delete(`/api/crud/tatib/${tatib.id_tatib}`);
      showSuccessToast('Tatib berhasil dihapus');
      fetchData();
    } catch (err) {
      alert('Gagal menghapus tatib');
    }
  };

  // CRUD Pelanggaran
  const openLanggarModal = (tatibId: number, langgar?: Pelanggaran) => {
    if (langgar) {
      setEditingLanggar(langgar);
      setLanggarForm({ tatib: langgar.tatib, pelanggaran: langgar.pelanggaran, sanksi: langgar.sanksi || '' });
    } else {
      setEditingLanggar(null);
      setLanggarForm({ tatib: tatibId, pelanggaran: '', sanksi: '' });
    }
    setShowLanggarModal(true);
  };

  const saveLanggar = async () => {
    if (!langgarForm.pelanggaran.trim()) return;
    setSaving(true);
    try {
      if (editingLanggar) {
        await api.put(`/api/crud/langgar/${editingLanggar.id_langgar}`, langgarForm);
      } else {
        await api.post('/api/crud/langgar', langgarForm);
      }
      
      showSuccessToast(editingLanggar ? 'Pelanggaran berhasil diupdate' : 'Pelanggaran berhasil ditambahkan');
      setShowLanggarModal(false);
      fetchData();
    } catch (err) {
      alert('Gagal menyimpan pelanggaran');
    } finally {
      setSaving(false);
    }
  };

  const deleteLanggar = async (langgar: Pelanggaran) => {
    if (!confirm(`Hapus pelanggaran "${langgar.pelanggaran}"?`)) return;
    try {
      await api.delete(`/api/crud/langgar/${langgar.id_langgar}`);
      showSuccessToast('Pelanggaran berhasil dihapus');
      fetchData();
    } catch (err) {
      alert('Gagal menghapus pelanggaran');
    }
  };

  // Input Sanksi
  const openSanksiInputModal = (pelanggaran: Pelanggaran) => {
    setSelectedPelanggaran(pelanggaran);
    setSelectedSantri(null);
    setSearchSantri('');
    setDeskripsi('');
    setShowSanksiInputModal(true);
  };

  const closeSanksiInputModal = () => {
    setShowSanksiInputModal(false);
    setSelectedPelanggaran(null);
    setSelectedSantri(null);
  };

  const submitSanksi = async () => {
    if (!selectedSantri || !selectedPelanggaran) return;
    setSaving(true);
    try {
      await api.post('/api/crud/sanksi', {
        santri: selectedSantri.id,
        pelanggaran: selectedPelanggaran.id_langgar,
        deskripsi_sanksi: deskripsi || selectedPelanggaran.pelanggaran,
        status_sanksi: 'Belum Diberikan'
      });
      showSuccessToast('Sanksi berhasil dicatat');
      closeSanksiInputModal();
      fetchData();
    } catch (err) {
      alert('Gagal menyimpan sanksi');
    } finally {
      setSaving(false);
    }
  };

  // Update Sanksi Status
  const updateSanksiStatus = async (sanksi: Sanksi, newStatus: string) => {
    try {
      await api.put(`/api/crud/sanksi/${sanksi.id_sanksi}`, { status_sanksi: newStatus });
      showSuccessToast('Status sanksi berhasil diupdate');
      fetchData();
    } catch (err) {
      alert('Gagal update status');
    }
  };

  // Delete Sanksi
  const deleteSanksi = async (sanksi: Sanksi) => {
    if (!confirm(`Hapus sanksi untuk ${sanksi.nama_santri}?`)) return;
    try {
      await api.delete(`/api/crud/sanksi/${sanksi.id_sanksi}`);
      showSuccessToast('Sanksi berhasil dihapus');
      fetchData();
    } catch (err) {
      alert('Gagal menghapus sanksi');
    }
  };

  const filteredSantri = santriList
    .filter(s => s.status === 'Mondok')
    .filter(s => s.name?.toLowerCase().includes(searchSantri.toLowerCase()));

  // Statistics calculations
  const aktiveSanksi = sanksiList.filter(s => {
    const status = s.status_sanksi?.toLowerCase();
    return status === 'belum diberikan' || status === 'ditinjau kembali';
  });

  const topViolators = Object.entries(
    sanksiList.reduce((acc, s) => {
      acc[s.nama_santri] = (acc[s.nama_santri] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const fastestHandled = sanksiList
    .filter(s => s.status_sanksi?.toLowerCase() === 'sudah diberikan' && s.updated_at)
    .map(s => {
      const created = new Date(s.created_at);
      const updated = new Date(s.updated_at!);
      const diffHours = Math.round((updated.getTime() - created.getTime()) / (1000 * 60 * 60));
      return { ...s, diffHours };
    })
    .sort((a, b) => a.diffHours - b.diffHours)
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Tata Tertib Santri</h1>
              <p className="text-indigo-100">Kelola peraturan, pelanggaran, dan sanksi</p>
            </div>
          </div>
          <button onClick={fetchData} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-50">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex gap-1">
        {[
          { key: 'tatib', label: 'Daftar Tatib', icon: BookOpen },
          { key: 'melanggar', label: 'Santri Melanggar', icon: Users, badge: aktiveSanksi.length },
          { key: 'statistik', label: 'Statistik', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.key ? 'bg-white text-indigo-600' : 'bg-red-500 text-white'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'tatib' && (
        <div className="space-y-4">
          {/* Add Tatib Button */}
          <button
            onClick={() => openTatibModal()}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl hover:bg-indigo-50 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Tambah Tata Tertib
          </button>

          {/* Tatib List */}
          {groupedData.map(({ tatib, pelanggaranList }) => (
            <div key={tatib.id_tatib} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tatib Header */}
              <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                <button
                  onClick={() => toggleTatib(tatib.id_tatib)}
                  className="flex-1 flex items-center gap-4 text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow">
                    {tatib.id_tatib}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{tatib.nama_tatib}</h3>
                    <p className="text-sm text-gray-500">{pelanggaranList.length} pelanggaran</p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => openTatibModal(tatib)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteTatib(tatib)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedTatib === tatib.id_tatib ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedTatib === tatib.id_tatib && (
                <div className="border-t border-gray-100 bg-gray-50">
                  {/* Deskripsi Tatib */}
                  {tatib.deskripsi_tatib && (
                    <div className="p-4 bg-indigo-50 border-b border-indigo-100">
                      <div className="text-sm text-indigo-800 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: tatib.deskripsi_tatib }} />
                    </div>
                  )}

                  {/* Add Pelanggaran Button */}
                  <button
                    onClick={() => openLanggarModal(tatib.id_tatib)}
                    className="w-full flex items-center justify-center gap-2 py-3 text-indigo-600 hover:bg-indigo-50 transition text-sm font-medium border-b border-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Pelanggaran
                  </button>

                  {/* Pelanggaran List */}
                  {pelanggaranList.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {pelanggaranList.map((p, idx) => (
                        <div key={p.id_langgar} className="p-4 hover:bg-white transition">
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">{p.pelanggaran}</p>
                              {p.sanksi && (
                                <div className="mt-2 flex items-start gap-2">
                                  <Shield className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  <div className="text-sm text-red-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: p.sanksi }} />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => openLanggarModal(tatib.id_tatib, p)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteLanggar(p)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openSanksiInputModal(p)}
                                className="ml-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-xs font-semibold hover:from-red-600 hover:to-orange-600 transition shadow flex items-center gap-1"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Input
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Belum ada pelanggaran
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {groupedData.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Belum ada data tata tertib</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'melanggar' && (
        <div className="space-y-4">
          {aktiveSanksi.length > 0 ? (
            aktiveSanksi.map(sanksi => (
              <div key={sanksi.id_sanksi} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {sanksi.nama_santri?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-gray-900">{sanksi.nama_santri}</h4>
                        <p className="text-sm font-medium text-red-600 mt-1">{sanksi.nama_pelanggaran}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {sanksi.nama_tatib} • {new Date(sanksi.created_at).toLocaleDateString('id-ID')}
                        </p>
                        {sanksi.deskripsi_sanksi && sanksi.deskripsi_sanksi !== sanksi.nama_pelanggaran && (
                          <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded italic">
                            📝 {sanksi.deskripsi_sanksi.replace(/<[^>]*>/g, '')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          sanksi.status_sanksi?.toLowerCase() === 'belum diberikan' 
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : sanksi.status_sanksi?.toLowerCase() === 'ditinjau kembali'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {sanksi.status_sanksi}
                        </span>
                        <div className="flex items-center gap-1">
                          <select
                            value={sanksi.status_sanksi?.toLowerCase()}
                            onChange={(e) => updateSanksiStatus(sanksi, e.target.value)}
                            className="text-xs bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer hover:border-indigo-400 transition shadow-sm"
                          >
                            <option value="belum diberikan">✋ Belum Diberikan</option>
                            <option value="ditinjau kembali">🔍 Ditinjau Kembali</option>
                            <option value="sudah diberikan">✅ Sudah Diberikan</option>
                            <option value="dibatalkan">❌ Dibatalkan</option>
                          </select>
                          <button
                            onClick={() => deleteSanksi(sanksi)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus sanksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Check className="w-16 h-16 mx-auto mb-4 text-green-300" />
              <p className="text-lg font-medium text-green-600">Tidak ada santri yang melanggar</p>
              <p className="text-sm">Semua sanksi sudah ditangani</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'statistik' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Violators */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold">Santri Terbanyak Melanggar</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {topViolators.length > 0 ? topViolators.map(([name, count], idx) => (
                <button 
                  key={name} 
                  onClick={() => { setSelectedViolatorName(name); setShowViolationModal(true); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-red-50 transition cursor-pointer text-left"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx < 3 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="flex-1 font-medium text-gray-900">{name}</span>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                    {count}x
                  </span>
                </button>
              )) : (
                <div className="p-6 text-center text-gray-500">Belum ada data</div>
              )}
            </div>
          </div>

          {/* Fastest Handled */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <h3 className="font-bold">Penanganan Tercepat</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {fastestHandled.length > 0 ? fastestHandled.map((sanksi, idx) => (
                <div key={sanksi.id_sanksi} className="flex items-center gap-3 p-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx < 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{sanksi.nama_santri}</p>
                    <p className="text-xs text-gray-500 truncate">{sanksi.nama_pelanggaran}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold whitespace-nowrap">
                    {sanksi.diffHours < 24 ? `${sanksi.diffHours}j` : `${Math.round(sanksi.diffHours / 24)}h`}
                  </span>
                </div>
              )) : (
                <div className="p-6 text-center text-gray-500">Belum ada data penanganan</div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Tatib', value: tatibList.length, color: 'indigo' },
              { label: 'Total Sanksi', value: sanksiList.length, color: 'purple' },
              { label: 'Sanksi Aktif', value: aktiveSanksi.length, color: 'red' },
              { label: 'Sudah Ditangani', value: sanksiList.filter(s => s.status_sanksi === 'Sudah Diberikan').length, color: 'green' },
            ].map(stat => (
              <div key={stat.label} className={`bg-${stat.color}-50 rounded-xl p-4 text-center`}>
                <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                <p className={`text-sm text-${stat.color}-600`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Tatib */}
      {showTatibModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTatib ? 'Edit Tata Tertib' : 'Tambah Tata Tertib'}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tatib *</label>
                <input
                  type="text"
                  value={tatibForm.nama_tatib}
                  onChange={(e) => setTatibForm({ ...tatibForm, nama_tatib: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Contoh: 01. Bangun sebelum Adzan Shubuh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <RichTextEditor
                  value={tatibForm.deskripsi_tatib}
                  onChange={(value) => setTatibForm({ ...tatibForm, deskripsi_tatib: value })}
                  placeholder="Penjelasan tambahan tentang tata tertib..."
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowTatibModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
                Batal
              </button>
              <button onClick={saveTatib} disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Check className="w-4 h-4" /> Simpan</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pelanggaran */}
      {showLanggarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLanggar ? 'Edit Pelanggaran' : 'Tambah Pelanggaran'}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pelanggaran *</label>
                <input
                  type="text"
                  value={langgarForm.pelanggaran}
                  onChange={(e) => setLanggarForm({ ...langgarForm, pelanggaran: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Deskripsi pelanggaran..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sanksi</label>
                <RichTextEditor
                  value={langgarForm.sanksi}
                  onChange={(value) => setLanggarForm({ ...langgarForm, sanksi: value })}
                  placeholder="Sanksi yang diberikan..."
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowLanggarModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
                Batal
              </button>
              <button onClick={saveLanggar} disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Check className="w-4 h-4" /> Simpan</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Input Sanksi */}
      {showSanksiInputModal && selectedPelanggaran && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Input Sanksi</h2>
                </div>
                <button onClick={closeSanksiInputModal} className="hover:bg-white/20 p-1 rounded-lg transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-sm text-orange-600 font-medium mb-1">Pelanggaran:</p>
                <p className="font-semibold text-gray-900">{selectedPelanggaran.pelanggaran}</p>
                {selectedPelanggaran.sanksi && (
                  <div className="mt-2">
                    <strong className="text-sm text-red-600">Sanksi:</strong>
                    <div className="text-sm text-red-600 mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedPelanggaran.sanksi }} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Santri *</label>
                {selectedSantri ? (
                  <div className="p-3 bg-indigo-50 rounded-lg border-2 border-indigo-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {selectedSantri.name?.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900">{selectedSantri.name}</span>
                      </div>
                      <button onClick={() => setSelectedSantri(null)} className="text-gray-500 hover:text-red-500">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari nama santri..."
                        value={searchSantri}
                        onChange={(e) => setSearchSantri(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                      {filteredSantri.slice(0, 30).map((santri) => (
                        <button
                          key={santri.id}
                          onClick={() => setSelectedSantri(santri)}
                          className="w-full text-left p-3 hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 transition flex items-center gap-3"
                        >
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                            {santri.name?.charAt(0)}
                          </div>
                          <span className="text-gray-700">{santri.name}</span>
                        </button>
                      ))}
                      {filteredSantri.length === 0 && (
                        <p className="text-gray-500 text-center py-4">Tidak ada santri ditemukan</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan (opsional)</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Tambahkan catatan..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button onClick={closeSanksiInputModal} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition">
                Batal
              </button>
              <button
                onClick={submitSanksi}
                disabled={!selectedSantri || saving}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 transition flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</> : <><Check className="w-5 h-5" /> Simpan Sanksi</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Violation Details Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowViolationModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 bg-gradient-to-r from-red-500 to-orange-500 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                    {selectedViolatorName?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{selectedViolatorName}</h2>
                    <p className="text-white/80 text-sm">{sanksiList.filter(s => s.nama_santri === selectedViolatorName).length} pelanggaran tercatat</p>
                  </div>
                </div>
                <button onClick={() => setShowViolationModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[60vh] divide-y divide-gray-100">
              {sanksiList.filter(s => s.nama_santri === selectedViolatorName).map(sanksi => (
                <div key={sanksi.id_sanksi} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      sanksi.status_sanksi?.toLowerCase() === 'belum diberikan' ? 'bg-yellow-100 text-yellow-700' :
                      sanksi.status_sanksi?.toLowerCase() === 'sudah diberikan' ? 'bg-green-100 text-green-700' :
                      sanksi.status_sanksi?.toLowerCase() === 'dibatalkan' ? 'bg-gray-100 text-gray-500' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {sanksi.status_sanksi?.toLowerCase() === 'belum diberikan' ? '✋' :
                       sanksi.status_sanksi?.toLowerCase() === 'sudah diberikan' ? '✅' :
                       sanksi.status_sanksi?.toLowerCase() === 'dibatalkan' ? '❌' : '🔍'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{sanksi.nama_pelanggaran}</p>
                      <p className="text-xs text-gray-500 mt-1">{sanksi.nama_tatib}</p>
                      {sanksi.deskripsi_sanksi && sanksi.deskripsi_sanksi !== sanksi.nama_pelanggaran && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded italic">
                          📝 {sanksi.deskripsi_sanksi.replace(/<[^>]*>/g, '')}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          sanksi.status_sanksi?.toLowerCase() === 'belum diberikan' ? 'bg-yellow-100 text-yellow-700' :
                          sanksi.status_sanksi?.toLowerCase() === 'sudah diberikan' ? 'bg-green-100 text-green-700' :
                          sanksi.status_sanksi?.toLowerCase() === 'dibatalkan' ? 'bg-gray-100 text-gray-500' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {sanksi.status_sanksi}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(sanksi.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {sanksiList.filter(s => s.nama_santri === selectedViolatorName).length === 0 && (
                <div className="p-8 text-center text-gray-500">Tidak ada data pelanggaran</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
