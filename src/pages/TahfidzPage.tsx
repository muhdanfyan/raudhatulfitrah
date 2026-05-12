import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, XCircle, Loader2, Trash2, Book, Edit2, Eye, ChevronLeft, ChevronRight, X, Filter, User, Calendar, Clock, Award, MessageSquare, BookOpen, Copy } from 'lucide-react';
import { api } from '../services/api';
import SearchableSelect from '../components/SearchableSelect';
import { getLocalDateString } from '../utils/date';
import QuranPreview from '../components/QuranPreview';

interface TahfidzRecord {
  id: number;
  tanggal: string;
  santri_id: number;
  santri_nama: string;
  waktu_nyetor: number;
  waktu_nyetor_nama: string;
  juz: string;
  surah: string;
  ayat: string;
  status: string;
  nilai: number;
  nilai_nama: string;
  komentar: string;
  pengontrol_id: number;
  pengontrol_nama: string;
}

interface Santri {
  id: number;
  name: string;
  photo?: string | null;
  nis?: string;
  angkatan_nama?: string;
  status?: string;
}

interface WaktuNyetor {
  id_wktnyetor: number;
  waktu_nyetor: string;
  start_waktu: string;
  end_waktu: string;
}

interface NilaiTahfidz {
  id_nilaitahfidz: number;
  nilaitahfidz: string;
  ket: string;
  bobot: number;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const SURAH_LIST = [
  "Al-Fatihah", "Al-Baqarah", "Ali Imran", "An-Nisa", "Al-Maidah", "Al-Anam", "Al-A'raf", "Al-Anfal",
  "At-Taubah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf",
  "Maryam", "Ta Ha", "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Asy-Syuara", "An-Naml",
  "Al-Qasas", "Al-Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba'", "Fatir", "Ya Sin",
  "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat", "Asy-Syura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jasiyah",
  "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Az-Zariyat", "At-Tur", "An-Najm", "Al-Qamar",
  "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah", "Al-Hasyr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah",
  "Al-Munafiqun", "At-Tagabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
  "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddassir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba'",
  "An-Nazi'at", "Abasa", "At-Takwir", "Al-Infitar", "Al-Muthaffifiyn", "Al-Insyiqaq", "Al-Buruj", "At-Tariq",
  "Al-A'la", "Al-Gasyiyah", "Al-Fajr", "Al-Balad", "Asy-Syams", "Al-Lail", "Ad-Duha", "Al-Insyirah", "At-Tin",
  "Al-Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat", "Al-Qariah", "At-Takasur", "Al-Asr",
  "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un", "Al-Kausar", "Al-Kafirun", "An-Nasr", "Al-Lahab",
  "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

// Mapping Juz ke indeks Surah (0-based index)
const JUZ_TO_SURAH: Record<number, number[]> = {
  1: [0, 1], // Al-Fatihah, Al-Baqarah (1-141)
  2: [1], // Al-Baqarah (142-252)
  3: [1, 2], // Al-Baqarah (253-286), Ali Imran (1-92)
  4: [2, 3], // Ali Imran (93-200), An-Nisa (1-23)
  5: [3], // An-Nisa (24-147)
  6: [3, 4], // An-Nisa (148-176), Al-Maidah (1-81)
  7: [4, 5], // Al-Maidah (82-120), Al-Anam (1-110)
  8: [5, 6], // Al-Anam (111-165), Al-A'raf (1-87)
  9: [6, 7], // Al-A'raf (88-206), Al-Anfal (1-40)
  10: [7, 8], // Al-Anfal (41-75), At-Taubah (1-92)
  11: [8, 9, 10], // At-Taubah (93-129), Yunus, Hud (1-5)
  12: [10, 11], // Hud (6-123), Yusuf (1-52)
  13: [11, 12, 13], // Yusuf (53-111), Ar-Ra'd, Ibrahim (1-52)
  14: [14, 15], // Al-Hijr, An-Nahl (1-128)
  15: [16, 17], // Al-Isra, Al-Kahf (1-74)
  16: [17, 18, 19], // Al-Kahf (75-110), Maryam, Ta Ha (1-135)
  17: [20, 21], // Al-Anbiya, Al-Hajj (1-78)
  18: [22, 23, 24], // Al-Mu'minun, An-Nur, Al-Furqan (1-20)
  19: [24, 25, 26], // Al-Furqan (21-77), Asy-Syuara, An-Naml (1-55)
  20: [26, 27, 28], // An-Naml (56-93), Al-Qasas, Al-Ankabut (1-45)
  21: [28, 29, 30, 31, 32], // Al-Ankabut (46-69), Ar-Rum, Luqman, As-Sajdah, Al-Ahzab (1-30)
  22: [32, 33, 34, 35], // Al-Ahzab (31-73), Saba', Fatir, Ya Sin (1-27)
  23: [35, 36, 37, 38], // Ya Sin (28-83), As-Saffat, Sad, Az-Zumar (1-31)
  24: [38, 39, 40], // Az-Zumar (32-75), Ghafir, Fussilat (1-46)
  25: [40, 41, 42, 43, 44], // Fussilat (47-54), Asy-Syura, Az-Zukhruf, Ad-Dukhan, Al-Jasiyah (1-37)
  26: [44, 45, 46, 47, 48, 49, 50], // Al-Jasiyah (38-), Al-Ahqaf, Muhammad, Al-Fath, Al-Hujurat, Qaf, Az-Zariyat (1-30)
  27: [50, 51, 52, 53, 54, 55, 56], // Az-Zariyat (31-60), At-Tur, An-Najm, Al-Qamar, Ar-Rahman, Al-Waqi'ah, Al-Hadid (1-29)
  28: [57, 58, 59, 60, 61, 62, 63, 64, 65], // Al-Mujadilah - At-Tahrim
  29: [66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76], // Al-Mulk - Al-Mursalat
  30: [77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113] // An-Naba' - An-Nas
};

// Helper function untuk mendapatkan surah berdasarkan juz
const getSurahByJuz = (juz: number): string[] => {
  const indices = JUZ_TO_SURAH[juz] || [];
  return indices.map(idx => SURAH_LIST[idx]);
};

export default function TahfidzPage() {
  const [records, setRecords] = useState<TahfidzRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSantri, setFilterSantri] = useState('');
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Master data
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [musyrifList, setMusyrifList] = useState<Santri[]>([]);
  const [waktuNyetorList, setWaktuNyetorList] = useState<WaktuNyetor[]>([]);
  const [nilaiList, setNilaiList] = useState<NilaiTahfidz[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    tanggal: getLocalDateString(),
    santri: '',
    waktu_nyetor: '',
    juz: '',
    surah: '',
    ayat: '',
    status: 'Hafalan Baru',
    nilai: '',
    komentar: '',
    pengontrol: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<TahfidzRecord | null>(null);
  const [detailView, setDetailView] = useState<TahfidzRecord | null>(null);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filterDate, filterStatus, filterSantri, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: currentPage, per_page: 20 };
      if (filterDate) params.tanggal = filterDate;
      if (filterStatus) params.status = filterStatus;
      if (filterSantri) params.santri_id = filterSantri;
      
      const response = await api.getTahfidzList(params);
      setRecords(response.data || []);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data tahfidz');
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [santriRes, musyrifRes, waktuRes, nilaiRes] = await Promise.all([
        api.getSantriList({ status: 'Mondok' }),
        api.getMasterMusyrif(),
        api.getMasterWaktuNyetor(),
        api.getMasterNilaiTahfidz(),
      ]);
      setSantriList(santriRes || []);
      setMusyrifList(musyrifRes || []);
      setWaktuNyetorList(waktuRes || []);
      setNilaiList(nilaiRes || []);
    } catch (err) {
      console.error('Gagal mengambil master data:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi frontend
    if (!formData.santri) {
      alert('Pilih santri terlebih dahulu');
      return;
    }
    if (!formData.nilai) {
      alert('Pilih nilai terlebih dahulu');
      return;
    }
    if (!formData.waktu_nyetor) {
      alert('Pilih waktu nyetor terlebih dahulu');
      return;
    }
    if (!formData.pengontrol) {
      alert('Pilih pengontrol/musyrif terlebih dahulu');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        tgl_tahfidz: formData.tanggal,
        santri: parseInt(formData.santri),
        wkt_nyetor: parseInt(formData.waktu_nyetor),
        juz_hafalan: formData.juz,
        surah: formData.surah,
        ayat: formData.ayat,
        status: formData.status,
        nilai: parseInt(formData.nilai),
        komentar: formData.komentar,
        pengontrol: parseInt(formData.pengontrol),
      };

      if (editMode && editId) {
        await api.updateTahfidz(editId, payload);
      } else {
        await api.createTahfidz(payload);
      }
      
      setShowForm(false);
      setEditMode(false);
      setEditId(null);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClone = (record: TahfidzRecord) => {
    setFormData({
      tanggal: getLocalDateString(),
      santri: record.santri_id.toString(),
      waktu_nyetor: record.waktu_nyetor.toString(),
      juz: record.juz,
      surah: record.surah,
      ayat: record.ayat,
      status: record.status,
      nilai: record.nilai.toString(),
      komentar: record.komentar || '',
      pengontrol: record.pengontrol_id.toString(),
    });
    setEditId(null);
    setEditMode(false);
    setShowForm(true);
  };

  const handleEdit = (record: TahfidzRecord) => {
    setFormData({
      tanggal: record.tanggal,
      santri: record.santri_id.toString(),
      waktu_nyetor: record.waktu_nyetor.toString(),
      juz: record.juz,
      surah: record.surah,
      ayat: record.ayat,
      status: record.status,
      nilai: record.nilai.toString(),
      komentar: record.komentar || '',
      pengontrol: record.pengontrol_id.toString(),
    });
    setEditId(record.id);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.deleteTahfidz(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus data');
    }
  };

  const resetForm = () => {
    setFormData({
      tanggal: getLocalDateString(),
      santri: '',
      waktu_nyetor: '',
      juz: '',
      surah: '',
      ayat: '',
      status: 'Hafalan Baru',
      nilai: '',
      komentar: '',
      pengontrol: '',
    });
  };

  const clearFilters = () => {
    setFilterDate('');
    setFilterStatus('');
    setFilterSantri('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = filterDate || filterStatus || filterSantri;

  const filteredRecords = records.filter(record =>
    record.santri_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.surah?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hafalan Baru': return 'bg-green-100 text-green-800';
      case 'Murojaah': return 'bg-primary/10 text-primary-dark';
      case 'Murojaah Lama': return 'bg-indigo-100 text-indigo-800';
      case 'Murojaah Pekanan': return 'bg-cyan-100 text-cyan-800';
      case 'Tasmi': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNilaiColor = (nama: string) => {
    switch (nama) {
      case 'Mumtaz': return 'text-green-600 font-semibold';
      case 'Jayyid Jiddan': return 'text-emerald-600';
      case 'Jayyid': return 'text-primary';
      case 'Maqbul': return 'text-yellow-600';
      case 'Dhoif': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Tahfidz</h1>
          <p className="text-gray-600">Pencatatan dan monitoring hafalan santri</p>
        </div>
        <button
          onClick={() => {
            setEditMode(false);
            setEditId(null);
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Input Hafalan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari santri/surah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <SearchableSelect
              options={santriList.map(s => ({ value: s.id, label: s.name }))}
              value={filterSantri ? parseInt(filterSantri) : 0}
              onChange={(val) => { setFilterSantri(val ? val.toString() : ''); setCurrentPage(1); }}
              placeholder="Semua Santri"
              searchPlaceholder="Cari santri..."
              showAvatar
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Semua Status</option>
              <option value="Hafalan Baru">Hafalan Baru</option>
              <option value="Murojaah">Murojaah</option>
              <option value="Murojaah Lama">Murojaah Lama</option>
              <option value="Murojaah Pekanan">Murojaah Pekanan</option>
              <option value="Tasmi">Tasmi</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}
            <span className="text-sm text-gray-500">
              {pagination?.total || 0} data
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="ml-2">Memuat data...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Santri</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hafalan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengontrol</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        <Book className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>Tidak ada data setoran</p>
                        {hasActiveFilters && (
                          <button onClick={clearFilters} className="mt-2 text-emerald-600 hover:underline text-sm">
                            Reset filter
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(record.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{record.santri_nama}</div>
                          <div className="text-xs text-gray-500">{record.waktu_nyetor_nama}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <span className="font-medium">{record.surah}</span>
                            <span className="text-gray-500 ml-1">({record.juz})</span>
                          </div>
                          <div className="text-xs text-gray-500">Ayat: {record.ayat}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={getNilaiColor(record.nilai_nama)}>{record.nilai_nama}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {record.pengontrol_nama}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setDetailView(record)}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                              title="Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(record)}
                              className="p-1.5 text-primary-light hover:bg-primary/5 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleClone(record)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Clone/Copy"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(record)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                              title="Hapus"
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

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                  Halaman {pagination.current_page} dari {pagination.last_page}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
                    disabled={currentPage === pagination.last_page}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input/Edit Form Modal - Redesigned */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white px-6 py-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {editMode ? 'Edit Setoran Hafalan' : 'Input Setoran Hafalan'}
                    </h2>
                    <p className="text-emerald-100 text-sm">Catat progress hafalan santri</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowForm(false); setEditMode(false); setEditId(null); }} 
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                
                {/* TOP SECTION: Santri Selection - Full Width */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-5 border border-emerald-200 shadow-sm">
                  <label className="block text-sm font-bold text-emerald-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    Santri yang Menyetor
                  </label>
                  
                  <div className="flex flex-col lg:flex-row gap-5">
                    {/* Selected Santri Preview - Enhanced */}
                    {formData.santri && (() => {
                      const selectedSantri = santriList.find(s => s.id === parseInt(formData.santri));
                      if (selectedSantri) {
                        return (
                          <div className="flex items-center gap-5 p-4 bg-white rounded-2xl shadow-md border border-emerald-100 flex-1 min-w-0">
                            <div className="relative flex-shrink-0">
                              {selectedSantri.photo ? (
                                <img
                                  src={selectedSantri.photo}
                                  alt={selectedSantri.name}
                                  className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl object-cover shadow-lg ring-4 ring-emerald-100"
                                />
                              ) : (
                                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                  <span className="text-white text-3xl font-bold">
                                    {selectedSantri.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md ring-2 ring-white">
                                <BookOpen className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate text-xl mb-1">
                                {selectedSantri.name}
                              </h4>
                              <div className="flex flex-wrap gap-2 items-center">
                                {selectedSantri.nis && (
                                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                                    NIS: {selectedSantri.nis}
                                  </span>
                                )}
                                {selectedSantri.angkatan_nama && (
                                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-lg font-medium">
                                    {selectedSantri.angkatan_nama}
                                  </span>
                                )}
                                {selectedSantri.status && (
                                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-medium">
                                    {selectedSantri.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Santri Selector */}
                    <div className={`${formData.santri ? 'lg:w-80' : 'w-full'}`}>
                      <SearchableSelect
                        options={santriList.map(s => ({ value: s.id, label: s.name }))}
                        value={formData.santri ? parseInt(formData.santri) : 0}
                        onChange={(val) => setFormData({ ...formData, santri: val ? val.toString() : '' })}
                        placeholder="🔍 Cari dan pilih santri..."
                        searchPlaceholder="Ketik nama santri..."
                        showAvatar
                      />
                    </div>
                  </div>
                </div>

                {/* MAIN CONTENT: Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  
                  {/* Left Column - Date, Time, Musyrif & Hafalan Details */}
                  <div className="lg:col-span-2 space-y-5">
                    
                    {/* Date & Time Section */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        Waktu Setoran
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">📅 Tanggal</label>
                          <input
                            type="date"
                            name="tanggal"
                            value={formData.tanggal}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-sm hover:bg-white transition-colors"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">🕐 Waktu</label>
                          <select
                            name="waktu_nyetor"
                            value={formData.waktu_nyetor}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-sm hover:bg-white transition-colors"
                            required
                          >
                            <option value="">Pilih waktu</option>
                            {waktuNyetorList.map(w => (
                              <option key={w.id_wktnyetor} value={w.id_wktnyetor}>{w.waktu_nyetor}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Pengontrol/Musyrif */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        Pengontrol (Musyrif)
                      </h4>
                      <SearchableSelect
                        options={musyrifList.map(s => ({ value: s.id, label: s.name }))}
                        value={formData.pengontrol ? parseInt(formData.pengontrol) : 0}
                        onChange={(val) => setFormData({ ...formData, pengontrol: val ? val.toString() : '' })}
                        placeholder="Pilih musyrif pengontrol..."
                        searchPlaceholder="Cari musyrif..."
                        showAvatar
                      />
                    </div>

                    {/* Status Setoran */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-orange-600" />
                        </div>
                        Status Setoran
                      </h4>
                      <div className="flex flex-col gap-2">
                        {['Hafalan Baru', 'Murojaah', 'Murojaah Pekanan', 'Murojaah Lama', 'Tasmi'].map((status) => {
                          const getStatusStyle = (s: string, isSelected: boolean) => {
                            if (!isSelected) return 'bg-gray-50 border-2 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300';
                            switch (s) {
                              case 'Hafalan Baru': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200 ring-2 ring-green-300';
                              case 'Murojaah': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-300';
                              case 'Murojaah Pekanan': return 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-200 ring-2 ring-cyan-300';
                              case 'Murojaah Lama': return 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-300';
                              case 'Tasmi': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200 ring-2 ring-purple-300';
                              default: return 'bg-gray-500 text-white';
                            }
                          };
                          const getStatusIcon = (s: string) => {
                            switch (s) {
                              case 'Hafalan Baru': return '🆕';
                              case 'Murojaah': return '🔄';
                              case 'Murojaah Pekanan': return '📆';
                              case 'Murojaah Lama': return '📚';
                              case 'Tasmi': return '🎤';
                              default: return '📖';
                            }
                          };
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setFormData({ ...formData, status })}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${getStatusStyle(status, formData.status === status)}`}
                            >
                              <span className="text-lg">{getStatusIcon(status)}</span>
                              <span>{status}</span>
                              {formData.status === status && <span className="ml-auto">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Detail Hafalan, Quran Preview, Nilai & Catatan */}
                  <div className="lg:col-span-3 space-y-5">
                    
                    {/* Detail Hafalan Card - Above Quran Preview */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 shadow-sm">
                      <h4 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
                        <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
                          <Book className="w-4 h-4 text-white" />
                        </div>
                        Detail Hafalan
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Juz</label>
                          <select
                            name="juz"
                            value={formData.juz}
                            onChange={(e) => {
                              const newJuz = e.target.value;
                              setFormData({ ...formData, juz: newJuz, surah: '' });
                            }}
                            className="w-full px-3 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-sm"
                            required
                          >
                            <option value="">📖 Pilih Juz</option>
                            {Array.from({ length: 30 }, (_, i) => (
                              <option key={i + 1} value={`Juz ${i + 1}`}>Juz {i + 1}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Surah</label>
                          {(() => {
                            const juzNum = formData.juz ? parseInt(formData.juz.replace('Juz ', '')) : 0;
                            const filteredSurah = juzNum ? getSurahByJuz(juzNum) : SURAH_LIST;
                            
                            return (
                              <SearchableSelect
                                options={filteredSurah.map((surah) => {
                                  const idx = SURAH_LIST.indexOf(surah);
                                  return { value: surah, label: `${idx + 1}. ${surah}` };
                                })}
                                value={formData.surah || ''}
                                onChange={(val) => setFormData({ ...formData, surah: val as string })}
                                placeholder={juzNum ? `📝 Pilih Surah` : "⚠️ Pilih Juz dulu"}
                                searchPlaceholder="Cari surah..."
                                disabled={!juzNum}
                              />
                            );
                          })()}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Ayat</label>
                          <input
                            type="text"
                            name="ayat"
                            value={formData.ayat}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-sm"
                            placeholder="Contoh: 1-10"
                            required
                          />
                        </div>
                      </div>
                      
                      {formData.juz && (
                        <div className="mt-3 p-2 bg-amber-100/50 rounded-lg">
                          <p className="text-xs text-amber-700 font-medium">
                            📖 {getSurahByJuz(parseInt(formData.juz.replace('Juz ', ''))).length} surah tersedia di {formData.juz}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Quran Preview - Below Detail Hafalan */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      {formData.surah && formData.ayat ? (
                        <div>
                          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3">
                            <h4 className="text-white font-semibold flex items-center gap-2">
                              <BookOpen className="w-5 h-5" />
                              Preview Al-Quran
                              <span className="ml-auto text-sm font-normal opacity-90">
                                {formData.surah} : {formData.ayat}
                              </span>
                            </h4>
                          </div>
                          <QuranPreview
                            surahName={formData.surah}
                            ayatRange={formData.ayat}
                            showTranslation={false}
                            className="border-0 rounded-none"
                          />
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">Preview Al-Quran</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Pilih Juz, Surah, dan Ayat untuk melihat preview
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Nilai Section - Below Quran Preview */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200 shadow-sm">
                      <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        Nilai Hafalan
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {nilaiList.map((n, index) => {
                          const icons = ['🏆', '⭐', '✨', '👍', '📝', '💪'];
                          const gradients = [
                            'from-yellow-400 to-amber-500',
                            'from-emerald-400 to-green-500',
                            'from-blue-400 to-cyan-500',
                            'from-indigo-400 to-purple-500',
                            'from-orange-400 to-red-500',
                            'from-gray-400 to-slate-500'
                          ];
                          return (
                            <button
                              key={n.id_nilaitahfidz}
                              type="button"
                              onClick={() => setFormData({ ...formData, nilai: n.id_nilaitahfidz.toString() })}
                              className={`relative flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                formData.nilai === n.id_nilaitahfidz.toString()
                                  ? `bg-gradient-to-r ${gradients[index] || gradients[0]} text-white shadow-lg scale-105 ring-2 ring-white`
                                  : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-300 hover:shadow-md'
                              }`}
                            >
                              <span className="text-base">{icons[index] || '📖'}</span>
                              <span className="text-xs">{n.nilaitahfidz}</span>
                              {formData.nilai === n.id_nilaitahfidz.toString() && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center ring-1 ring-emerald-400">
                                  <span className="text-emerald-500 text-xs">✓</span>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {formData.nilai && (() => {
                        const selectedNilai = nilaiList.find(n => n.id_nilaitahfidz.toString() === formData.nilai);
                        if (selectedNilai?.ket) {
                          return (
                            <p className="mt-4 text-sm text-emerald-700 bg-white rounded-xl p-3 border border-emerald-100 shadow-sm">
                              💡 <span className="font-bold">{selectedNilai.nilaitahfidz}:</span> {selectedNilai.ket}
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Catatan / Komentar Section */}
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                      <label className="block font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-indigo-600" />
                        </div>
                        Catatan / Komentar
                      </label>
                      <textarea
                        name="komentar"
                        value={formData.komentar}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 hover:bg-white text-sm resize-none transition-colors"
                        placeholder="✍️ Tuliskan catatan untuk santri, misalnya koreksi bacaan tajwid, pujian, atau saran perbaikan..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-sm text-gray-500 hidden sm:block">
                  {formData.santri && formData.surah && formData.ayat && formData.nilai && formData.pengontrol ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      Siap disimpan
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-amber-600">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      {!formData.santri ? 'Pilih santri' : !formData.nilai ? 'Pilih nilai' : !formData.pengontrol ? 'Pilih pengontrol' : 'Lengkapi data hafalan'}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditMode(false); setEditId(null); }}
                    className="flex-1 sm:flex-none px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.santri || !formData.surah || !formData.ayat || !formData.nilai || !formData.pengontrol}
                    className="flex-1 sm:flex-none px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editMode ? 'Update Setoran' : 'Simpan Setoran'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {detailView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Detail Setoran</h2>
              <button onClick={() => setDetailView(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tanggal</p>
                  <p className="font-medium">{new Date(detailView.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Waktu Nyetor</p>
                  <p className="font-medium">{detailView.waktu_nyetor_nama}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Santri</p>
                  <p className="font-medium text-lg">{detailView.santri_nama}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Juz</p>
                  <p className="font-medium">{detailView.juz}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Surah</p>
                  <p className="font-medium">{detailView.surah}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ayat</p>
                  <p className="font-medium">{detailView.ayat}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(detailView.status)}`}>
                    {detailView.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nilai</p>
                  <p className={`font-medium ${getNilaiColor(detailView.nilai_nama)}`}>{detailView.nilai_nama}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pengontrol</p>
                  <p className="font-medium">{detailView.pengontrol_nama}</p>
                </div>
                {detailView.komentar && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Komentar</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{detailView.komentar}</p>
                  </div>
                )}
                
                {/* Quran Preview in Detail View */}
                <div className="col-span-2">
                  <QuranPreview
                    surahName={detailView.surah}
                    ayatRange={detailView.ayat}
                    showTranslation={true}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => { handleEdit(detailView); setDetailView(null); }}
                  className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/5 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setDetailView(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Hapus Setoran?</h3>
            <p className="text-gray-600 mb-4">
              Hapus setoran <strong>{deleteConfirm.santri_nama}</strong> - {deleteConfirm.surah} ({deleteConfirm.ayat})?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
