import { useState, useEffect } from 'react';
import { api, getPublicHeaders } from '../services/api';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Users, GraduationCap, Search, MapPin, X, Phone, Mail, LogIn,
  Briefcase, FileText, BookOpen, Loader2, Pencil, Trash2, Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SantriFormModal from '../components/SantriFormModal';
import { getStudentPhotoUrl, getStaticAsset } from '../utils/imageUtils';

interface Santri {
  id_santri: number;
  nama_lengkap_santri: string;
  nama_panggilan_santri: string;
  foto_santri: string | null;
  status_santri: string;
  asal_daerah_santri: string | null;
  nama_konsentrasi: string | null;
  nama_angkatan: string | null;
}

interface Stats {
  total: number;
  mondok: number;
  mengabdi: number;
}

interface Settings {
  namaPesantren: string;
  namaSingkat: string;
  tagline: string;
  logo: string;
  warnaUtama: string;
  alamat: string;
  telepon: string;
  email: string;
}

const konsentrasiColors: Record<string, string> = {
  'Programming': 'from-blue-500 to-indigo-600',
  'Frontend Development': 'from-cyan-500 to-blue-600',
  'Backend Development': 'from-green-500 to-emerald-600',
  'Fullstack Development': 'from-violet-500 to-purple-600',
  'Mobile Development': 'from-orange-500 to-red-600',
  'Desain Grafis': 'from-pink-500 to-rose-600',
  'UI/UX Design': 'from-fuchsia-500 to-pink-600',
  'Digital Marketing': 'from-green-500 to-teal-600',
  'Data Scientist': 'from-cyan-500 to-blue-600',
  'DevOps & Cloud': 'from-amber-500 to-orange-600',
  'default': 'from-gray-500 to-gray-600'
};

interface SantriStats {
  total_portofolio: number;
  total_tulisan: number;
  total_review: number;
}

export default function SantriPage() {
  const [santri, setSantri] = useState<Santri[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterKonsentrasi, setFilterKonsentrasi] = useState<string>('all');
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [santriStats, setSantriStats] = useState<SantriStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'superadmin' || user?.role === 'kepsek';

  // Form Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editSantriId, setEditSantriId] = useState<number | null>(null);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [santriData, settingsData] = await Promise.all([
        api.get('/api/public/santri-aktif'),
        api.get('/public/settings', { headers: getPublicHeaders() })
      ]);
      
      if (santriData.success) {
        setSantri(santriData.data);
        setStats(santriData.stats);
      }
      setSettings(settingsData.data || settingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const konsentrasiList = [...new Set(santri.map(s => s.nama_konsentrasi).filter(Boolean))];

  const filteredSantri = santri.filter(s => {
    const matchSearch = s.nama_lengkap_santri.toLowerCase().includes(search.toLowerCase()) ||
                       s.nama_panggilan_santri?.toLowerCase().includes(search.toLowerCase()) ||
                       s.asal_daerah_santri?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status_santri === filterStatus;
    const matchKonsentrasi = filterKonsentrasi === 'all' || s.nama_konsentrasi === filterKonsentrasi;
    return matchSearch && matchStatus && matchKonsentrasi;
  });

  const getColor = (konsentrasi: string | null) => konsentrasiColors[konsentrasi || ''] || konsentrasiColors.default;
  const primaryColor = settings?.warnaUtama || '#2563EB';

  const handleSantriClick = async (s: Santri) => {
    setSelectedSantri(s);
    setSantriStats(null);
    setLoadingStats(true);
    try {
      const res = await api.get(`/api/public/santri-stats/${s.id_santri}`);
      if (res.success) {
        setSantriStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch santri stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setSelectedSantri(null);
    fetchData();
  };

  const handleEdit = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFormMode('edit');
    setEditSantriId(id);
    setShowFormModal(true);
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await api.deleteSantri(id);
      setDeleteConfirm(null);
      setSelectedSantri(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus santri');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Memuat data santri...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Santri Aktif - {settings?.namaPesantren || 'Pondok Informatika'}</title>
        <meta name="description" content={`Daftar santri yang sedang mondok dan mengabdi di ${settings?.namaPesantren || 'Pondok Informatika'}`} />
      </Helmet>

      <div className="min-h-screen bg-white flex flex-col">
        {/* Header - Same as Landing Page */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src={settings?.logo || getStaticAsset('logo.png', 'branding')} alt="Logo" className="h-10 w-auto" />
                <span className="font-bold text-gray-900 hidden sm:block">{settings?.namaSingkat || 'PISANTRI'}</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/tulisan" className="text-gray-600 hover:text-primary font-medium">Tulisan</Link>
                <Link to="/santri" className="text-primary font-medium">Santri</Link>
                <Link to="/digitalisasi-pesantren" className="text-gray-600 hover:text-primary font-medium">Digitalisasi</Link>
              </nav>
              <div className="flex items-center gap-3">
                <Link to="/ppdb" className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                  <span className="hidden sm:inline">Daftar</span> PPDB
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-white rounded-lg font-medium transition-colors" style={{ backgroundColor: primaryColor }}>
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Masuk</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pt-16">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                  SANTRI AKTIF
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Kenali Lebih Dekat <span className="text-primary">Santri Kami</span>
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                  Daftar santri yang sedang mondok dan mengabdi di {settings?.namaPesantren || 'Pondok Informatika'}
                </p>
                
                {/* Stats */}
                {stats && (
                  <div className="flex justify-center gap-6 sm:gap-12">
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.total}</div>
                      <div className="text-gray-500 text-sm">Total Santri</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-bold text-green-600">{stats.mondok}</div>
                      <div className="text-gray-500 text-sm">Mondok</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-bold text-amber-600">{stats.mengabdi}</div>
                      <div className="text-gray-500 text-sm">Mengabdi</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Filter Bar */}
          <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau daerah..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                  />
                </div>
                
                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="all">Semua Status</option>
                    <option value="Mondok">Mondok</option>
                    <option value="Mengabdi">Mengabdi</option>
                  </select>

                  <select
                    value={filterKonsentrasi}
                    onChange={(e) => setFilterKonsentrasi(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="all">Semua Konsentrasi</option>
                    {konsentrasiList.map(k => (
                      <option key={k} value={k!}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Results count */}
              <div className="flex justify-between items-center mt-3">
                <p className="text-gray-500 text-sm">
                  Menampilkan {filteredSantri.length} santri
                </p>
                {isAdmin && (
                  <button 
                    onClick={() => {
                      setFormMode('create');
                      setEditSantriId(null);
                      setShowFormModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Santri
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Santri Grid */}
          <section className="py-8 sm:py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {filteredSantri.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Tidak ada santri ditemukan</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {filteredSantri.map((s) => (
                    <div 
                      key={s.id_santri}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
                      onClick={() => handleSantriClick(s)}
                    >
                      {/* Photo */}
                      <div className="relative aspect-square overflow-hidden">
                        <img 
                          src={getStudentPhotoUrl(s.foto_santri)} 
                          alt={s.nama_lengkap_santri}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.nama_lengkap_santri)}&background=F1F5F9&color=475569&size=200`;
                          }}
                        />
                        
                        {/* Status Badge */}
                        <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium z-10 ${
                          s.status_santri === 'Mengabdi' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {s.status_santri}
                        </div>

                        {/* Admin Actions */}
                        {isAdmin && (
                          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => handleEdit(e, s.id_santri)}
                              className="p-1.5 bg-white/90 hover:bg-white text-yellow-600 rounded-lg shadow-md transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(s.id_santri);
                              }}
                              className="p-1.5 bg-white/90 hover:bg-white text-red-600 rounded-lg shadow-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="p-3 sm:p-4">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {s.nama_lengkap_santri}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                          {s.nama_konsentrasi || 'Santri'}
                        </p>
                        {s.asal_daerah_santri && (
                          <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{s.asal_daerah_santri}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Detail Modal */}
        {selectedSantri && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <div 
              className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo */}
              <div className="relative aspect-square">
                <img 
                  src={getStudentPhotoUrl(selectedSantri.foto_santri)} 
                  alt={selectedSantri.nama_lengkap_santri}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSantri.nama_lengkap_santri)}&background=F1F5F9&color=475569&size=400`;
                  }}
                />
                
                {/* Close Button */}
                <button 
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full text-gray-600 hover:text-gray-900 transition shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Status Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
                  selectedSantri.status_santri === 'Mengabdi' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {selectedSantri.status_santri}
                </div>
              </div>
              
              {/* Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {selectedSantri.nama_lengkap_santri}
                </h3>
                {selectedSantri.nama_panggilan_santri && (
                  <p className="text-gray-500 text-sm mb-4">"{selectedSantri.nama_panggilan_santri}"</p>
                )}
                
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {loadingStats ? (
                    <div className="col-span-3 flex justify-center py-4">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  ) : santriStats ? (
                    <>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-100">
                        <Briefcase className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-xl font-bold text-blue-700">{santriStats.total_portofolio}</div>
                        <div className="text-xs text-blue-600">Portfolio</div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 text-center border border-emerald-100">
                        <FileText className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                        <div className="text-xl font-bold text-emerald-700">{santriStats.total_tulisan}</div>
                        <div className="text-xs text-emerald-600">Tulisan</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 text-center border border-purple-100">
                        <BookOpen className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                        <div className="text-xl font-bold text-purple-700">{santriStats.total_review}</div>
                        <div className="text-xs text-purple-600">Review</div>
                      </div>
                    </>
                  ) : null}
                </div>
                
                <div className="space-y-3">
                  {selectedSantri.nama_konsentrasi && (
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${getColor(selectedSantri.nama_konsentrasi)}`}>
                        <GraduationCap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Konsentrasi</p>
                        <p className="text-gray-900 text-sm font-medium">{selectedSantri.nama_konsentrasi}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedSantri.asal_daerah_santri && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <MapPin className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Asal Daerah</p>
                        <p className="text-gray-900 text-sm font-medium">{selectedSantri.asal_daerah_santri}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedSantri.nama_angkatan && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Users className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Angkatan</p>
                        <p className="text-gray-900 text-sm font-medium">{selectedSantri.nama_angkatan}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Detail Button */}
                <div className="flex gap-2 mt-4">
                  <Link 
                    to={`/santri/${selectedSantri.id_santri}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                  >
                    Detail Lengkap
                  </Link>
                  {isAdmin && (
                    <>
                      <button
                        onClick={(e) => handleEdit(e, selectedSantri.id_santri)}
                        className="p-3 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(selectedSantri.id_santri)}
                        className="p-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showFormModal && (
          <SantriFormModal
            mode={formMode}
            santriId={editSantriId || undefined}
            onClose={() => {
              setShowFormModal(false);
              setEditSantriId(null);
            }}
            onSuccess={handleFormSuccess}
          />
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}></div>
              <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Konfirmasi Hapus</h3>
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus santri ini? Status akan diubah menjadi "Keluar" dan data akan disembunyikan dari daftar santri aktif.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={deleting}
                    className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer - Same as Landing Page */}
        <footer className="bg-gray-900 text-gray-300 py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
              <div className="col-span-2">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <img src={settings?.logo || '/logo.png'} alt="Logo" className="h-10 sm:h-12 w-auto" />
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-lg">{settings?.namaSingkat || 'Pondok Informatika'}</h3>
                    <p className="text-xs sm:text-sm text-gray-400">{settings?.tagline || 'Mencetak Generasi IT Rabbani'}</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-4 text-xs sm:text-sm max-w-md">
                  Lembaga pendidikan yang mengintegrasikan teknologi informasi (IT) dan pendidikan agama (Pesantren).
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Link Cepat</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <li><Link to="/" className="hover:text-white transition-colors">Beranda</Link></li>
                  <li><Link to="/tulisan" className="hover:text-white transition-colors">Tulisan</Link></li>
                  <li><Link to="/santri" className="hover:text-white transition-colors">Santri</Link></li>
                  <li><Link to="/ppdb" className="hover:text-white transition-colors">PPDB Online</Link></li>
                  <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Kontak</h4>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-400">{settings?.alamat || 'Indonesia Timur'}</span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <a href={`https://wa.me/${(settings?.telepon || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white text-gray-400">{settings?.telepon || '-'}</a>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <a href={`mailto:${settings?.email}`} className="hover:text-white text-gray-400 truncate">{settings?.email || '-'}</a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-500 text-xs sm:text-sm">
              <p>&copy; {new Date().getFullYear()} {settings?.namaPesantren || 'Pondok Informatika'}. All rights reserved.</p>
              <p className="mt-1 sm:mt-2">Powered by <span className="text-primary-light">PISANTRI</span></p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
