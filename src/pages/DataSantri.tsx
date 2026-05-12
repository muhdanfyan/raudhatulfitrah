import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Loader2, RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react';
import SantriDetailModal from '../components/SantriDetailModal';
import SantriFormModal from '../components/SantriFormModal';
import SearchableSelect from '../components/SearchableSelect';
import { api } from '../services/api';
import { getStudentPhotoUrl } from '../utils/imageUtils';

interface SantriListItem {
  id: number;
  name: string;
  nickname: string;
  status: string;
  program_santri?: string;
  photo: string | null;
  foto_url?: string;
  angkatan: number;
  angkatan_nama?: string;
  konsentrasi: number;
  konsentrasi_nama?: string;
  asal_daerah?: string;
}

interface Angkatan {
  id_angkatan: number;
  angkatan: string;
}

export default function DataSantri() {
  const [santriList, setSantriList] = useState<SantriListItem[]>([]);
  const [angkatanList, setAngkatanList] = useState<Angkatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Mondok');
  const [angkatanFilter, setAngkatanFilter] = useState<number | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  
  // Detail Modal
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);
  const [selectedSantriData, setSelectedSantriData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Form Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editSantriId, setEditSantriId] = useState<number | null>(null);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSantri = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (angkatanFilter) params.angkatan = angkatanFilter;
      if (searchTerm) params.search = searchTerm;
      
      const data = await api.getSantriList(params);
      setSantriList(data || []);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data santri');
    } finally {
      setLoading(false);
    }
  };

  const fetchAngkatan = async () => {
    try {
      const data = await api.getMasterAngkatan();
      setAngkatanList(data || []);
    } catch (err) {
      console.error('Gagal mengambil data angkatan:', err);
    }
  };

  useEffect(() => {
    fetchAngkatan();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchSantri();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, statusFilter, angkatanFilter]);

  const handleViewDetail = async (santriId: number) => {
    setSelectedSantriId(santriId);
    setLoadingDetail(true);
    try {
      const [detail, tahfidzData, presensiData] = await Promise.all([
        api.getSantriDetail(santriId),
        api.getSantriTahfidz(santriId),
        api.getSantriPresensi(santriId),
      ]);
      
      setSelectedSantriData({
        santri: {
          id_santri: detail.id,
          nama_lengkap_santri: detail.name,
          nama_panggilan_santri: detail.nickname,
          status_santri: detail.status,
          angkatan_santri: detail.angkatan,
          angkatan_nama: detail.angkatan_nama,
          tempat_lahir_santri: detail.tempat_lahir,
          tanggal_lahir_santri: detail.tanggal_lahir,
          alamat_lengkap_santri: detail.alamat,
          asal_daerah_santri: detail.asal_daerah,
          kota_domisili_sekarang_santri: detail.domisili,
          kondisi_keluarga_santri: detail.kondisi_keluarga,
          anak_ke_santri: detail.anak_ke,
          jumlah_saudara_santri: detail.jumlah_saudara,
          konsentrasi_santri: detail.konsentrasi,
          konsentrasi_nama: detail.konsentrasi_nama,
          hafalan_quran_santri: detail.hafalan,
          skill_kelebihan_santri: detail.skill,
          foto_santri: detail.foto_url,
          musyrif: detail.is_musyrif ? 1 : 0,
          punya_tanggungan: detail.punya_tanggungan,
          izin_ortu: detail.izin_ortu,
          alasan_mendaftar: detail.alasan_mendaftar,
          target: detail.target,
        },
        achievements: {
          tahfidz: tahfidzData?.tahfidz || [],
          portofolio: [],
        },
        discipline: {
          presensi: presensiData?.presensi || [],
          sanksi: [],
        },
      });
    } catch (err: any) {
      console.error('Gagal mengambil detail santri:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAddNew = () => {
    setFormMode('create');
    setEditSantriId(null);
    setShowFormModal(true);
  };

  const handleEdit = (santriId: number) => {
    setFormMode('edit');
    setEditSantriId(santriId);
    setShowFormModal(true);
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setEditSantriId(null);
    fetchSantri();
  };

  const handleDelete = async (santriId: number) => {
    setDeleting(true);
    try {
      await api.deleteSantri(santriId);
      setDeleteConfirm(null);
      fetchSantri();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus santri');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Mondok': return 'bg-green-100 text-green-800';
      case 'Alumni': return 'bg-primary/10 text-primary-dark';
      case 'Mengabdi': return 'bg-purple-100 text-purple-800';
      case 'Keluar': return 'bg-red-100 text-red-800';
      case 'Daftar': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Santri</h1>
          <p className="text-gray-600">Total: {santriList.length} santri</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari santri..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 ${showFilter ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
          >
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="hidden sm:inline text-gray-700">Filter</span>
          </button>
          <button 
            onClick={fetchSantri}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: '', label: 'Semua' },
          { id: 'Mondok', label: 'Mondok' },
          { id: 'Mengabdi', label: 'Mengabdi' },
          { id: 'Alumni', label: 'Alumni' },
          { id: 'Daftar', label: 'Daftar' },
          { id: 'Keluar', label: 'Keluar' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              statusFilter === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showFilter && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-wrap gap-4">
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Angkatan</label>
            <SearchableSelect
              options={angkatanList.map(a => ({ value: a.id_angkatan, label: a.angkatan }))}
              value={angkatanFilter || 0}
              onChange={(val) => setAngkatanFilter(val ? Number(val) : null)}
              placeholder="Semua Angkatan"
              searchPlaceholder="Cari angkatan..."
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        ) : santriList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Tidak ada data santri
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Santri</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Angkatan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Konsentrasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Asal</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {santriList.map((santri) => (
                  <tr key={santri.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover bg-gray-200" 
                            src={getStudentPhotoUrl(santri.foto_url, `https://ui-avatars.com/api/?name=${encodeURIComponent(santri.name)}&background=random`)} 
                            alt={santri.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(santri.name)}&background=random`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{santri.name}</div>
                          <div className="text-sm text-gray-500">{santri.nickname}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(santri.status)}`}>
                        {santri.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      <span className="capitalize">{santri.program_santri || 'mondok'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {santri.angkatan_nama || santri.angkatan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {santri.konsentrasi_nama || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {santri.asal_daerah || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(santri.id)}
                          disabled={loadingDetail && selectedSantriId === santri.id}
                          className="flex items-center gap-1.5 px-2 py-1.5 text-primary hover:bg-blue-50 rounded-lg transition-all border border-blue-100"
                          title="Lihat Detail"
                        >
                          {loadingDetail && selectedSantriId === santri.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                          <span className="text-xs font-bold hidden xl:inline">Detail</span>
                        </button>
                        
                        <button
                          onClick={() => handleEdit(santri.id)}
                          className="flex items-center gap-1.5 px-2 py-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all border border-yellow-200 bg-yellow-50/50"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="text-xs font-bold">Edit</span>
                        </button>

                        <button
                          onClick={() => setDeleteConfirm(santri.id)}
                          className="flex items-center gap-1.5 px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all border border-red-200 bg-red-50/50"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs font-bold hidden xl:inline">Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSantriData && (
        <SantriDetailModal
          santri={selectedSantriData.santri}
          onClose={() => {
            setSelectedSantriId(null);
            setSelectedSantriData(null);
          }}
          achievements={selectedSantriData.achievements}
          discipline={selectedSantriData.discipline}
        />
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setDeleteConfirm(null)}></div>
            <div className="relative bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Hapus</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus santri ini? Status akan diubah menjadi "Keluar".
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
