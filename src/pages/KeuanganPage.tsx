import { useState, useEffect } from 'react';
import { API_URL, getHeaders } from '../services/api';
import { 
  Loader2, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, 
  X, Save, DollarSign, TrendingUp, TrendingDown, CheckCircle, AlertCircle,
  BarChart3, FileText, Calendar, Filter
} from 'lucide-react';
import { getLocalDateString } from '../utils/date';
import SearchableSelect from '../components/SearchableSelect';



interface AkunKeuangan {
  id_akun: number;
  kode_akun: string;
  nama_akun: string;
  tipe_akun: 'Aset' | 'Liabilitas' | 'Ekuitas' | 'Pendapatan' | 'Beban';
  sub_kategori: string | null;
}

interface Keuangan {
  id_keuangan: number;
  tgl_keuangan: string;
  aktifitas_keuangan: string;
  nominal_keuangan: number;
  jenis_keuangan: 'Debet' | 'Kredit' | 'Saldo';
  keterangan: string | null;
  file_lampiran: string | null;
  terlapor: boolean;
  akun_id: number | null;
  akun: AkunKeuangan | null;
}

interface Saldo {
  saldo_awal: number;
  tgl_saldo_terakhir: string | null;
  total_debet: number;
  total_kredit: number;
  saldo_sekarang: number;
  jumlah_transaksi_pending: number;
}

export default function KeuanganPage() {
  const [data, setData] = useState<Keuangan[]>([]);
  const [saldo, setSaldo] = useState<Saldo | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');

  // Akun Keuangan state
  const [groupedAkun, setGroupedAkun] = useState<Record<string, AkunKeuangan[]>>({});
  const [activeTab, setActiveTab] = useState<'transaksi' | 'laporan'>('transaksi');
  const [labaRugi, setLabaRugi] = useState<any>(null);
  const [labaRugiLoading, setLabaRugiLoading] = useState(false);
  const [reportFilter, setReportFilter] = useState({
    period: 'month',
    start_date: '',
    end_date: '',
  });

  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  const [showAkunModal, setShowAkunModal] = useState(false);
  const [akunModalMode, setAkunModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAkunId, setSelectedAkunId] = useState<number | null>(null);
  const [akunFormData, setAkunFormData] = useState({
    kode_akun: '',
    nama_akun: '',
    tipe_akun: 'Beban',
    parent_akun: '',
    saldo_normal: 'Kredit',
    deskripsi: '',
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<Keuangan | null>(null);
  const [formData, setFormData] = useState({
    tgl_keuangan: getLocalDateString(),
    aktifitas_keuangan: '',
    nominal_keuangan: '',
    jenis_keuangan: 'Kredit',
    keterangan: '',
    akun_id: '',
  });
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showTutupModal, setShowTutupModal] = useState(false);
  const [tutupLoading, setTutupLoading] = useState(false);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const [perPage, setPerPage] = useState(15);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/keuangan?page=${currentPage}&per_page=${perPage}`;
      if (filterJenis) url += `&jenis=${filterJenis}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const [dataRes, saldoRes] = await Promise.all([
        fetch(url, { headers: getHeaders() }),
        fetch(`${API_URL}/keuangan/saldo`, { headers: getHeaders() })
      ]);

      const dataJson = await dataRes.json();
      const saldoJson = await saldoRes.json();

      if (dataJson.success) {
        setData(dataJson.data.data);
        setTotalPages(dataJson.data.last_page);
        setTotal(dataJson.data.total);
      }
      if (saldoJson.success) {
        setSaldo(saldoJson.data);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAkun = async () => {
    try {
      const res = await fetch(`${API_URL}/akun-keuangan/grouped`, { headers: getHeaders() });
      const json = await res.json();
      if (json.success) {
        setGroupedAkun(json.data);
      }
    } catch (err) {
      console.error('Error fetching akun:', err);
    }
  };

  const fetchTrend = async () => {
    setTrendLoading(true);
    try {
      const res = await fetch(`${API_URL}/akun-keuangan/trend`, { headers: getHeaders() });
      const json = await res.json();
      if (json.success) setTrendData(json.data);
    } catch (err) {
      console.error('Error fetching trend:', err);
    } finally {
      setTrendLoading(false);
    }
  };

  const fetchLabaRugi = async () => {
    setLabaRugiLoading(true);
    try {
      let params = new URLSearchParams();
      if (reportFilter.period !== 'all') {
        const today = new Date();
        let start = '';
        let end = getLocalDateString();

        if (reportFilter.period === 'month') {
          start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        } else if (reportFilter.period === 'semester') {
          const isSecondHalf = today.getMonth() >= 6;
          start = new Date(today.getFullYear(), isSecondHalf ? 6 : 0, 1).toISOString().split('T')[0];
        } else if (reportFilter.period === 'year') {
          start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        } else if (reportFilter.period === 'custom') {
          if (!reportFilter.start_date || !reportFilter.end_date) {
            setLabaRugiLoading(false);
            return;
          }
          start = reportFilter.start_date;
          end = reportFilter.end_date;
        }

        if (start) params.append('start_date', start);
        if (end) params.append('end_date', end);
      }

      const res = await fetch(`${API_URL}/akun-keuangan/laba-rugi?${params.toString()}`, { headers: getHeaders() });
      const json = await res.json();
      if (json.success) {
        setLabaRugi(json.data);
      }
    } catch (err) {
      console.error('Error fetching laba rugi:', err);
    } finally {
      setLabaRugiLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAkun();
    fetchTrend();
  }, [currentPage, filterJenis, perPage]);

  useEffect(() => {
    fetchLabaRugi();
  }, [reportFilter]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedItem(null);
    setFormData({
      tgl_keuangan: getLocalDateString(),
      aktifitas_keuangan: '',
      nominal_keuangan: '',
      jenis_keuangan: 'Kredit',
      keterangan: '',
      akun_id: '',
    });
    setShowModal(true);
  };

  const handleEdit = (item: Keuangan) => {
    if (item.terlapor) {
      alert('Tidak dapat mengedit transaksi yang sudah dilaporkan');
      return;
    }
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({
      tgl_keuangan: item.tgl_keuangan.split('T')[0],
      aktifitas_keuangan: item.aktifitas_keuangan === '-' ? '' : item.aktifitas_keuangan,
      nominal_keuangan: String(item.nominal_keuangan),
      jenis_keuangan: item.jenis_keuangan,
      keterangan: item.keterangan || '',
      akun_id: item.akun_id ? String(item.akun_id) : '',
    });
    setShowModal(true);
  };

  const handleCreateAkun = () => {
    setAkunModalMode('create');
    setSelectedAkunId(null);
    setAkunFormData({
      kode_akun: '',
      nama_akun: '',
      tipe_akun: 'Beban',
      parent_akun: '',
      saldo_normal: 'Kredit',
      deskripsi: '',
    });
    setShowAkunModal(true);
  };

  const handleEditAkun = (akun: any) => {
    setAkunModalMode('edit');
    setSelectedAkunId(akun.id_akun);
    setAkunFormData({
      kode_akun: akun.kode_akun,
      nama_akun: akun.nama_akun,
      tipe_akun: akun.tipe_akun || 'Beban',
      parent_akun: akun.parent_id ? String(akun.parent_id) : '',
      saldo_normal: akun.saldo_normal || 'Kredit',
      deskripsi: akun.deskripsi || '',
    });
    setShowAkunModal(true);
  };

  const handleDeleteAkun = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus akun ini? Akun tidak dapat dihapus jika memiliki sub-akun atau transaksi.')) return;

    try {
      const res = await fetch(`${API_URL}/akun-keuangan/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      const json = await res.json();
      if (json.success) {
        alert('Akun berhasil dihapus');
        fetchAkun();
        if (activeTab === 'laporan') fetchLabaRugi();
      } else {
        alert(json.message || 'Gagal menghapus akun');
      }
    } catch (err) {
      console.error('Error deleting akun:', err);
      alert('Terjadi kesalahan sistem');
    }
  };

  const handleSaveAkun = async () => {
    if (!akunFormData.kode_akun || !akunFormData.nama_akun) {
      alert('Semua field bertanda * harus diisi');
      return;
    }

    try {
      const url = akunModalMode === 'edit' 
        ? `${API_URL}/akun-keuangan/${selectedAkunId}`
        : `${API_URL}/akun-keuangan`;
      
      const res = await fetch(url, {
        method: akunModalMode === 'edit' ? 'PUT' : 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(akunFormData),
      });
      const json = await res.json();
      if (json.success) {
        alert(akunModalMode === 'edit' ? 'Akun berhasil diperbarui' : 'Akun berhasil ditambahkan');
        setShowAkunModal(false);
        fetchAkun();
        if (activeTab === 'laporan') fetchLabaRugi();
      } else {
        alert(json.message || `Gagal ${akunModalMode === 'edit' ? 'memperbarui' : 'menambahkan'} akun`);
      }
    } catch (err) {
      console.error('Error saving akun:', err);
      alert('Terjadi kesalahan sistem');
    }
  };

  const handleSave = async () => {
    // Akun is mandatory, Aktifitas is optional (default to '-')
    if (!formData.akun_id || !formData.nominal_keuangan) {
      alert('Kategori Akun dan nominal harus diisi');
      return;
    }
    
    setSaving(true);
    const finalFormData = {
      ...formData,
      aktifitas_keuangan: formData.aktifitas_keuangan.trim() || '-',
    };

    try {
      const url = modalMode === 'create'
        ? `${API_URL}/keuangan`
        : `${API_URL}/keuangan/${selectedItem?.id_keuangan}`;

      const res = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({
          ...finalFormData,
          nominal_keuangan: parseInt(finalFormData.nominal_keuangan),
          akun_id: parseInt(finalFormData.akun_id),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        fetchData();
      } else {
        alert(json.message || 'Gagal menyimpan');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      const res = await fetch(`${API_URL}/keuangan/${deleteId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setDeleteId(null);
        fetchData();
      } else {
        alert(json.message);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleTutupPeriode = async () => {
    setTutupLoading(true);
    try {
      const res = await fetch(`${API_URL}/keuangan/tutup-periode`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Periode berhasil ditutup!\nSaldo: ${formatCurrency(json.data.saldo_sekarang)}`);
        setShowTutupModal(false);
        fetchData();
      } else {
        alert(json.message);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTutupLoading(false);
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Keuangan Pondok</h1>
          <p className="text-gray-600">Total: {total} transaksi</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={handleCreateAkun}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Plus className="w-5 h-5" />
              Tambah Akun
            </button>
          )}
          {activeTab === 'transaksi' && (
            <>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                <Plus className="w-5 h-5" />
                Tambah
              </button>
              {saldo && saldo.jumlah_transaksi_pending > 0 && (
                <button
                  onClick={() => setShowTutupModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  <CheckCircle className="w-5 h-5" />
                  Tutup Periode
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('transaksi')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'transaksi'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline-block mr-1" />
            Transaksi
          </button>
          <button
            onClick={() => setActiveTab('laporan')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'laporan'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline-block mr-1" />
            Laporan Laba Rugi
          </button>
        </div>

        {activeTab === 'laporan' && (
          <div className="flex items-center gap-2 pb-2 sm:pb-0">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={reportFilter.period}
              onChange={(e) => setReportFilter({ ...reportFilter, period: e.target.value })}
              className="text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            >
              <option value="month">Bulan Ini</option>
              <option value="semester">Semester Ini</option>
              <option value="year">Tahun Ini</option>
              <option value="custom">Custom Range</option>
              <option value="all">Semua Waktu</option>
            </select>
            {reportFilter.period === 'custom' && (
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={reportFilter.start_date}
                  onChange={(e) => setReportFilter({ ...reportFilter, start_date: e.target.value })}
                  className="text-sm border-gray-300 rounded-lg p-1"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={reportFilter.end_date}
                  onChange={(e) => setReportFilter({ ...reportFilter, end_date: e.target.value })}
                  className="text-sm border-gray-300 rounded-lg p-1"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'transaksi' ? (
        <>
          {/* Saldo Cards */}
          {saldo && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Saldo Awal</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(saldo.saldo_awal)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Debet</p>
                    <p className="text-lg font-bold text-emerald-600">+{formatCurrency(saldo.total_debet)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Kredit</p>
                    <p className="text-lg font-bold text-red-600">-{formatCurrency(saldo.total_kredit)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-violet-100 p-2 rounded-lg">
                    <DollarSign className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Saldo Sekarang</p>
                    <p className="text-lg font-bold text-violet-600">{formatCurrency(saldo.saldo_sekarang)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trend Chart (Simple CSS Bar Chart) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Tren Arus Kas (6 Bulan Terakhir)
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                  <span>Debet (Masuk)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                  <span>Kredit (Keluar)</span>
                </div>
              </div>
            </div>
            
            <div className="relative h-48 flex items-stretch justify-between gap-2 px-2">
              {trendLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : trendData.length > 0 ? (() => {
                const maxVal = Math.max(...trendData.map(v => Math.max(v.debet, v.kredit, 1)));
                return trendData.map((d, i) => {
                  const debetHeight = (d.debet / maxVal) * 100;
                  const kreditHeight = (d.kredit / maxVal) * 100;

                  return (
                    <div key={i} className="flex-1 h-full flex flex-col items-center group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap shadow-lg">
                        <div className="font-bold border-b border-gray-700 mb-1 pb-1">{d.label}</div>
                        <div className="text-emerald-400">Masuk: {formatCurrency(d.debet)}</div>
                        <div className="text-red-300">Keluar: {formatCurrency(d.kredit)}</div>
                        <div className="text-gray-300 mt-1 pt-1 border-t border-gray-700">Net: {formatCurrency(d.debet - d.kredit)}</div>
                      </div>

                      <div className="w-full flex-1 flex justify-center gap-1 items-end pt-4">
                        <div 
                          className="w-3 sm:w-6 bg-emerald-500 rounded-t-sm transition-all duration-500 min-h-[2px]" 
                          style={{ height: `${debetHeight}%` }}
                        ></div>
                        <div 
                          className="w-3 sm:w-6 bg-red-400 rounded-t-sm transition-all duration-500 min-h-[2px]" 
                          style={{ height: `${kreditHeight}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-2 rotate-[-45deg] sm:rotate-0 origin-top-left sm:origin-center">
                        {d.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                });
              })() : (
                <div className="w-full text-center text-gray-400 text-sm">Tidak ada data tren</div>
              )}
            </div>
          </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Cari aktifitas..."
            className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 w-48"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
        >
          Cari
        </button>
        <select
          value={filterJenis}
          onChange={(e) => { setFilterJenis(e.target.value); setCurrentPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Semua Jenis</option>
          <option value="Debet">Debet (Masuk)</option>
          <option value="Kredit">Kredit (Keluar)</option>
        </select>
        <select
          value={perPage}
          onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value={10}>10 / halaman</option>
          <option value={15}>15 / halaman</option>
          <option value={25}>25 / halaman</option>
          <option value={50}>50 / halaman</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Tidak ada transaksi</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akun</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Nominal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktifitas</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item) => (
                  <tr key={item.id_keuangan} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(item.tgl_keuangan).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      {item.akun ? (
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                          {item.akun.kode_akun} - {item.akun.nama_akun}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Belum dikategorikan</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        item.jenis_keuangan === 'Debet' ? 'bg-emerald-100 text-emerald-700' :
                        item.jenis_keuangan === 'Kredit' ? 'bg-red-100 text-red-700' :
                        'bg-primary/10 text-primary-dark'
                      }`}>
                        {item.jenis_keuangan}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      item.jenis_keuangan === 'Debet' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {item.jenis_keuangan === 'Debet' ? '+' : '-'}{formatCurrency(item.nominal_keuangan)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {item.aktifitas_keuangan}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.terlapor ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Dilaporkan</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!item.terlapor && (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(item)} className="p-1.5 text-primary hover:bg-primary/5 rounded">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(item.id_keuangan)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, total)} dari {total} transaksi
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Awal
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPageNumbers().map((page, idx) => (
                typeof page === 'number' ? (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-sm rounded-lg ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={idx} className="px-1 text-gray-400">...</span>
                )
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Akhir
              </button>
            </div>
          </div>
        )}
      </div>
        </>
      ) : (
        /* Laporan Laba Rugi View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Laporan Laba Rugi</h2>
            {labaRugi && labaRugi.period && (
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Calendar className="w-4 h-4" />
                <span>
                  Periode: {labaRugi.period.start ? new Date(labaRugi.period.start).toLocaleDateString('id-ID', { month: 'short', year: 'numeric', day: 'numeric' }) : 'Awal'} 
                  {' sampai '}
                  {labaRugi.period.end ? new Date(labaRugi.period.end).toLocaleDateString('id-ID', { month: 'short', year: 'numeric', day: 'numeric' }) : 'Sekarang'}
                </span>
              </div>
            )}
          </div>
          
          {labaRugiLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : labaRugi ? (
            <div className="space-y-6">
              {/* Pendapatan */}
              <div>
                <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  PENDAPATAN
                </h3>
                <div className="space-y-2 ml-7">
                  {labaRugi.pendapatan.items.map((item: any) => (
                    <div key={item.kode_akun} className="group flex justify-between items-center py-1 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-700">{item.kode_akun} - {item.nama_akun}</span>
                        {isAdmin && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditAkun(item)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit Akun"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAkun(item.id_akun)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-emerald-600">{formatCurrency(Number(item.saldo))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2 border-emerald-200">
                    <span>Total Pendapatan</span>
                    <span className="text-emerald-600">{formatCurrency(labaRugi.pendapatan.total)}</span>
                  </div>
                </div>
              </div>

              {/* Beban */}
              <div>
                <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  BEBAN
                </h3>
                <div className="space-y-2 ml-7">
                  {labaRugi.beban.items.map((item: any) => (
                    <div key={item.kode_akun} className="group flex justify-between items-center py-1 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-700">{item.kode_akun} - {item.nama_akun}</span>
                        {isAdmin && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditAkun(item)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit Akun"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAkun(item.id_akun)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-red-600">{formatCurrency(Number(item.saldo))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2 border-red-200">
                    <span>Total Beban</span>
                    <span className="text-red-600">{formatCurrency(labaRugi.beban.total)}</span>
                  </div>
                </div>
              </div>

              {/* Laba/Rugi */}
              <div className={`p-4 rounded-lg ${labaRugi.laba_rugi >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">
                    {labaRugi.laba_rugi >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH'}
                  </span>
                  <span className={`text-2xl font-bold ${labaRugi.laba_rugi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(labaRugi.laba_rugi))}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Tidak ada data laporan</div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="border-b px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{modalMode === 'create' ? 'Tambah' : 'Edit'} Transaksi</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.tgl_keuangan}
                    onChange={(e) => setFormData({ ...formData, tgl_keuangan: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Akun *</label>
                  <SearchableSelect
                    options={Object.values(groupedAkun).flat().map(a => ({
                      value: String(a.id_akun),
                      label: `${a.kode_akun} - ${a.nama_akun}`,
                      subLabel: a.tipe_akun
                    }))}
                    value={formData.akun_id}
                    onChange={(val) => setFormData({ ...formData, akun_id: String(val) })}
                    placeholder="Pilih Kategori Akun..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
                  <select
                    value={formData.jenis_keuangan}
                    onChange={(e) => setFormData({ ...formData, jenis_keuangan: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  >
                    <option value="Kredit">Kredit (Pengeluaran)</option>
                    <option value="Debet">Debet (Pemasukan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominal *</label>
                  <input
                    type="number"
                    value={formData.nominal_keuangan}
                    onChange={(e) => setFormData({ ...formData, nominal_keuangan: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Aktivitas (Opsional)</label>
                  <input
                    type="text"
                    value={formData.aktifitas_keuangan === '-' ? '' : formData.aktifitas_keuangan}
                    onChange={(e) => setFormData({ ...formData, aktifitas_keuangan: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                    placeholder="Bisa dikosongkan jika akun sudah jelas"
                  />
                </div>

              </div>
              <div className="bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-gray-700">
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" /> Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setDeleteId(null)} />
            <div className="relative bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus</h3>
              <p className="text-gray-600 mb-6">Yakin ingin menghapus transaksi ini?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteId(null)} className="px-4 py-2 border rounded-lg">Batal</button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />} Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Akun Modal */}
      {showAkunModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowAkunModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="border-b px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{akunModalMode === 'edit' ? 'Edit Akun Keuangan' : 'Tambah Akun Keuangan'}</h3>
                <button onClick={() => setShowAkunModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode Akun *</label>
                    <input
                      type="text"
                      value={akunFormData.kode_akun}
                      onChange={(e) => setAkunFormData({ ...akunFormData, kode_akun: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                      placeholder="Contoh: 4001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe *</label>
                    <select
                      value={akunFormData.tipe_akun}
                      onChange={(e) => setAkunFormData({ ...akunFormData, tipe_akun: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                    >
                      <option value="Pendapatan">Pendapatan</option>
                      <option value="Beban">Beban</option>
                      <option value="Aset">Aset</option>
                      <option value="Liabilitas">Liabilitas</option>
                      <option value="Ekuitas">Ekuitas</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Akun *</label>
                  <input
                    type="text"
                    value={akunFormData.nama_akun}
                    onChange={(e) => setAkunFormData({ ...akunFormData, nama_akun: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                    placeholder="Contoh: Honor Pengajar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Akun (Level 1 biarkan kosong)</label>
                  <SearchableSelect
                    options={Object.values(groupedAkun).flat().map(a => ({
                      value: String(a.id_akun),
                      label: `${a.kode_akun} - ${a.nama_akun}`,
                      subLabel: a.tipe_akun
                    }))}
                    value={akunFormData.parent_akun}
                    onChange={(val) => setAkunFormData({ ...akunFormData, parent_akun: String(val) })}
                    placeholder="Pilih Parent..."
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowAkunModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveAkun}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    {akunModalMode === 'edit' ? 'Perbarui Akun' : 'Simpan Akun'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tutup Periode Modal */}
      {showTutupModal && saldo && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowTutupModal(false)} />
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-amber-500" />
                <h3 className="text-lg font-semibold">Tutup Periode Keuangan</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Saldo Awal:</span>
                  <span className="font-medium">{formatCurrency(saldo.saldo_awal)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Total Debet:</span>
                  <span className="font-medium">+{formatCurrency(saldo.total_debet)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Total Kredit:</span>
                  <span className="font-medium">-{formatCurrency(saldo.total_kredit)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Saldo Akhir:</span>
                  <span className="text-violet-600">{formatCurrency(saldo.saldo_sekarang)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {saldo.jumlah_transaksi_pending} transaksi akan ditandai sebagai dilaporkan
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowTutupModal(false)} className="px-4 py-2 border rounded-lg">Batal</button>
                <button
                  onClick={handleTutupPeriode}
                  disabled={tutupLoading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2"
                >
                  {tutupLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <CheckCircle className="w-4 h-4" /> Tutup Periode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
