import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocalDateString } from '../../utils/date';
import { API_URL, TENANT_ID, getHeaders, getToken } from '../../services/api';

interface Santri {
  id_santri: number;
  nama_lengkap_santri: string;
  nama_panggilan_santri: string;
  email_santri: string;
  tempat_lahir_santri: string;
  tanggal_lahir_santri: string;
  alamat_lengkap_santri: string;
  asal_daerah_santri: string;
  konsentrasi_santri: number;
  alasan_mendaftar_santri: string;
  hafalan_quran_santri: string;
  skill_kelebihan_santri: string;
  foto_santri: string;
}

interface Ppdb {
  no_pendaftaran: string;
  status_pendaftaran: string;
  nama_ayah: string;
  pekerjaan_ayah: string;
  nama_ibu: string;
  pekerjaan_ibu: string;
  no_hp_ortu: string;
}

interface Dokumen {
  id_dokumen: number;
  jenis_dokumen: string;
  nama_file: string;
  path_file: string;
  status_verifikasi: string;
}

interface Konsentrasi {
  id_konsentrasi: number;
  nama_konsentrasi: string;
}

interface Pembayaran {
  id_pembayaran: number;
  jenis_pembayaran: string;
  nominal: string;
  tanggal_bayar: string;
  bukti_bayar: string[];
  status: string;
}

interface DashboardData {
  santri: Santri;
  ppdb: Ppdb;
  gelombang: { nama_gelombang: string; biaya_pendaftaran: string };
  dokumen: Dokumen[];
  progress: {
    total: number;
    biodata: number;
    dokumen: number;
    missing_docs: string[];
  };
  konsentrasi_list: Konsentrasi[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string; step: number; guidance: string }> = {
  draft: {
    label: 'Draft',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: '📝',
    step: 1,
    guidance: 'Lengkapi data diri, data orang tua, dan upload dokumen yang diperlukan. Setelah lengkap, klik tombol "Submit Pendaftaran".'
  },
  submitted: {
    label: 'Menunggu Verifikasi',
    color: 'text-primary-dark',
    bgColor: 'bg-primary/10',
    icon: '📤',
    step: 2,
    guidance: 'Pendaftaran Anda sedang dalam antrian verifikasi. Tim kami akan memeriksa kelengkapan dokumen. Mohon tunggu 1-3 hari kerja.'
  },
  verifikasi: {
    label: 'Sedang Diverifikasi',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: '🔍',
    step: 3,
    guidance: 'Dokumen Anda sedang diperiksa oleh tim verifikasi. Jika ada dokumen yang kurang, Anda akan dihubungi melalui WhatsApp.'
  },
  wawancara: {
    label: 'Tahap Wawancara',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: '🎤',
    step: 4,
    guidance: 'Selamat! Anda lolos verifikasi dokumen. Silakan tunggu jadwal wawancara yang akan diinformasikan melalui WhatsApp.'
  },
  diterima: {
    label: 'Diterima',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '✅',
    step: 5,
    guidance: 'Selamat! Anda diterima di pondok pesantren kami. Silakan lakukan daftar ulang dengan mengupload bukti pembayaran.'
  },
  daftar_ulang: {
    label: 'Daftar Ulang',
    color: 'text-teal-700',
    bgColor: 'bg-teal-100',
    icon: '💳',
    step: 6,
    guidance: 'Silakan upload bukti pembayaran daftar ulang. Setelah pembayaran diverifikasi, proses pendaftaran selesai.'
  },
  selesai: {
    label: 'Selesai',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '🎉',
    step: 7,
    guidance: 'Pendaftaran Anda telah selesai. Selamat bergabung! Informasi selanjutnya akan disampaikan via WhatsApp.'
  },
  ditolak: {
    label: 'Ditolak',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '❌',
    step: 0,
    guidance: 'Mohon maaf, pendaftaran Anda tidak dapat kami terima. Silakan hubungi admin untuk informasi lebih lanjut.'
  }
};

const STEPS = ['Draft', 'Submitted', 'Verifikasi', 'Wawancara', 'Diterima', 'Daftar Ulang', 'Selesai'];

export default function PpdbDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [pembayaran, setPembayaran] = useState<Pembayaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('status');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const paymentFilesRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nama_lengkap: '',
    nama_panggilan: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat_lengkap: '',
    asal_daerah: '',
    konsentrasi: 0,
    alasan_mendaftar: '',
    hafalan_quran: '',
    skill_kelebihan: '',
    nama_ayah: '',
    pekerjaan_ayah: '',
    nama_ibu: '',
    pekerjaan_ibu: '',
    no_hp_ortu: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    jenis_pembayaran: 'daftar_ulang',
    nominal: '',
    tanggal_bayar: getLocalDateString()
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.warn('[PpdbDashboard] No token found, redirecting to login');
      navigate('/ppdb/login');
      return;
    }
    
    // Prevent multiple fetches if already loading or data exists
    if (data) return;

    fetchDashboard();
    fetchPembayaran();
  }, [navigate]);

  const fetchDashboard = async () => {
    try {
      console.log(`[PpdbDashboard] Fetching dashboard for Tenant: ${TENANT_ID}`);
      const res = await fetch(`${API_URL}/ppdb/dashboard?cb=${Date.now()}`, {
        headers: getHeaders()
      });
      console.log(`[PpdbDashboard] Dashboard Response: ${res.status}`);
      const result = await res.json();
      
      if (result.success) {
        setData(result.data);
        const s = result.data.santri;
        const p = result.data.ppdb;
        setForm({
          nama_lengkap: s.nama_lengkap_santri || '',
          nama_panggilan: s.nama_panggilan_santri || '',
          tempat_lahir: s.tempat_lahir_santri || '',
          tanggal_lahir: s.tanggal_lahir_santri || '',
          alamat_lengkap: s.alamat_lengkap_santri || '',
          asal_daerah: s.asal_daerah_santri || '',
          konsentrasi: s.konsentrasi_santri || 0,
          alasan_mendaftar: s.alasan_mendaftar_santri || '',
          hafalan_quran: s.hafalan_quran_santri || '',
          skill_kelebihan: s.skill_kelebihan_santri || '',
          nama_ayah: p?.nama_ayah || '',
          pekerjaan_ayah: p?.pekerjaan_ayah || '',
          nama_ibu: p?.nama_ibu || '',
          pekerjaan_ibu: p?.pekerjaan_ibu || '',
          no_hp_ortu: p?.no_hp_ortu || ''
        });
      } else {
        localStorage.removeItem('ppdb_token');
        localStorage.removeItem('pisantri_token');
        navigate('/ppdb/login');
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPembayaran = async () => {
    try {
      console.log(`[PpdbDashboard] Fetching pembayaran...`);
      const res = await fetch(`${API_URL}/ppdb/pembayaran?cb=${Date.now()}`, {
        headers: getHeaders()
      });
      console.log(`[PpdbDashboard] Pembayaran Response: ${res.status}`);
      const result = await res.json();
      if (result.success) {
        setPembayaran(result.data);
      }
    } catch {
      // Ignore
    }
  };

  const handleSaveBiodata = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        ...form,
        tanggal_lahir: form.tanggal_lahir || null
      };
      const res = await fetch(`${API_URL}/ppdb/biodata`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Data berhasil disimpan' });
        fetchDashboard();
      } else {
        setMessage({ type: 'error', text: result.message || 'Gagal menyimpan' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDokumen = async (jenis: string, file: File) => {
    const formData = new FormData();
    formData.append('jenis_dokumen', jenis);
    formData.append('file', file);

    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_URL}/ppdb/dokumen`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Dokumen berhasil diupload' });
        fetchDashboard();
      } else {
        setMessage({ type: 'error', text: result.message || 'Gagal upload' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal upload dokumen' });
    }
  };

  const handleDeleteDokumen = async (id: number) => {
    if (!confirm('Hapus dokumen ini?')) return;
    
    try {
      const res = await fetch(`${API_URL}/ppdb/dokumen/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Dokumen berhasil dihapus' });
        fetchDashboard();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghapus dokumen' });
    }
  };

  const handleUploadPayment = async () => {
    const files = paymentFilesRef.current?.files;
    if (!files || files.length === 0) {
      setMessage({ type: 'error', text: 'Pilih file bukti pembayaran' });
      return;
    }
    if (!paymentForm.nominal) {
      setMessage({ type: 'error', text: 'Masukkan nominal pembayaran' });
      return;
    }

    setUploadingPayment(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files[]', files[i]);
    }
    formData.append('jenis_pembayaran', paymentForm.jenis_pembayaran);
    formData.append('nominal', paymentForm.nominal);
    formData.append('tanggal_bayar', paymentForm.tanggal_bayar);

    try {
      const res = await fetch(`${API_URL}/ppdb/bukti-bayar`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Bukti pembayaran berhasil diupload' });
        setPaymentForm({ jenis_pembayaran: 'daftar_ulang', nominal: '', tanggal_bayar: getLocalDateString() });
        if (paymentFilesRef.current) paymentFilesRef.current.value = '';
        fetchPembayaran();
        fetchDashboard();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal upload bukti pembayaran' });
    } finally {
      setUploadingPayment(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Apakah Anda yakin ingin submit pendaftaran?')) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/ppdb/submit`, {
        method: 'POST',
        headers: getHeaders()
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchDashboard();
      } else {
        setMessage({ type: 'error', text: result.message || 'Gagal submit' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ppdb_token');
    localStorage.removeItem('pisantri_token');
    localStorage.removeItem('ppdb_user');
    navigate('/ppdb');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!data) return null;

  const status = data.ppdb?.status_pendaftaran || 'draft';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const canEdit = ['draft', 'submitted', 'verifikasi'].includes(status);
  const canSubmit = status === 'draft' && data.progress.total >= 80;
  const showPayment = ['diterima', 'daftar_ulang', 'selesai'].includes(status);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-600 text-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard PPDB</h1>
            <p className="text-green-100 text-sm">{data.ppdb?.no_pendaftaran}</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Message */}
        {message.text && (
          <div className={`mb-4 px-4 py-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <span>{message.type === 'success' ? '✓' : '!'}</span>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto">×</button>
          </div>
        )}

        {/* Status Progress Card */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Status Pendaftaran</h2>
          
          {/* Progress Steps */}
          {status !== 'ditolak' && (
            <div className="mb-6 overflow-x-auto pb-2">
              <div className="flex items-center min-w-[600px]">
                {STEPS.map((step, idx) => {
                  const stepNum = idx + 1;
                  const currentStep = statusConfig.step;
                  const isCompleted = stepNum < currentStep;
                  const isCurrent = stepNum === currentStep;
                  
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`flex flex-col items-center ${idx > 0 ? 'flex-1' : ''}`}>
                        {idx > 0 && (
                          <div className={`h-1 w-full mb-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                        )}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-green-600 text-white ring-4 ring-green-100' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {isCompleted ? '✓' : stepNum}
                        </div>
                        <span className={`text-xs mt-1 text-center ${isCurrent ? 'font-semibold text-green-600' : 'text-gray-500'}`}>
                          {step}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Current Status */}
          <div className={`p-4 rounded-lg ${statusConfig.bgColor}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{statusConfig.icon}</span>
              <div className="flex-1">
                <h3 className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</h3>
                <p className="text-sm text-gray-600 mt-1">{statusConfig.guidance}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Kelengkapan Data</span>
                <span className="font-semibold">{data.progress.total}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${data.progress.total}%` }} />
              </div>
            </div>
            {canSubmit && (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
              >
                {saving ? 'Memproses...' : 'Submit Pendaftaran'}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="border-b flex overflow-x-auto">
            {[
              { key: 'status', label: 'Ringkasan' },
              { key: 'biodata', label: 'Data Diri' },
              { key: 'ortu', label: 'Data Orang Tua' },
              { key: 'dokumen', label: 'Dokumen' },
              ...(showPayment ? [{ key: 'pembayaran', label: 'Pembayaran' }] : [])
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 font-medium whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Tab Ringkasan */}
            {activeTab === 'status' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800">Data Pendaftar</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Nama:</span> <span className="font-medium">{data.santri.nama_lengkap_santri || '-'}</span></p>
                      <p><span className="text-gray-500">TTL:</span> <span className="font-medium">{data.santri.tempat_lahir_santri}, {data.santri.tanggal_lahir_santri || '-'}</span></p>
                      <p><span className="text-gray-500">Alamat:</span> <span className="font-medium">{data.santri.alamat_lengkap_santri || '-'}</span></p>
                      <p><span className="text-gray-500">Asal:</span> <span className="font-medium">{data.santri.asal_daerah_santri || '-'}</span></p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800">Data Orang Tua</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Ayah:</span> <span className="font-medium">{data.ppdb?.nama_ayah || '-'}</span></p>
                      <p><span className="text-gray-500">Pekerjaan Ayah:</span> <span className="font-medium">{data.ppdb?.pekerjaan_ayah || '-'}</span></p>
                      <p><span className="text-gray-500">Ibu:</span> <span className="font-medium">{data.ppdb?.nama_ibu || '-'}</span></p>
                      <p><span className="text-gray-500">Pekerjaan Ibu:</span> <span className="font-medium">{data.ppdb?.pekerjaan_ibu || '-'}</span></p>
                      <p><span className="text-gray-500">No HP Ortu:</span> <span className="font-medium">{data.ppdb?.no_hp_ortu || '-'}</span></p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Dokumen Terupload</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['foto', 'kk', 'akta', 'ijazah'].map(jenis => {
                      const doc = data.dokumen.find(d => d.jenis_dokumen === jenis);
                      return (
                        <div key={jenis} className={`p-3 rounded-lg border ${doc ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex items-center gap-2">
                            <span className={doc ? 'text-green-500' : 'text-gray-400'}>{doc ? '✓' : '○'}</span>
                            <span className="text-sm font-medium">
                              {jenis === 'foto' ? 'Pas Foto' : jenis === 'kk' ? 'KK' : jenis === 'akta' ? 'Akta' : 'Ijazah'}
                            </span>
                          </div>
                          {doc && (
                            <button
                              onClick={() => setPreviewUrl(doc.path_file)}
                              className="text-xs text-green-600 hover:underline mt-1"
                            >
                              Lihat
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab Biodata */}
            {activeTab === 'biodata' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      value={form.nama_lengkap}
                      onChange={e => setForm({ ...form, nama_lengkap: e.target.value })}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Panggilan</label>
                    <input
                      type="text"
                      value={form.nama_panggilan}
                      onChange={e => setForm({ ...form, nama_panggilan: e.target.value })}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={form.tempat_lahir}
                      onChange={e => setForm({ ...form, tempat_lahir: e.target.value })}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir *</label>
                    <input
                      type="date"
                      value={form.tanggal_lahir}
                      onChange={e => setForm({ ...form, tanggal_lahir: e.target.value })}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label>
                    <textarea
                      value={form.alamat_lengkap}
                      onChange={e => setForm({ ...form, alamat_lengkap: e.target.value })}
                      disabled={!canEdit}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asal Daerah *</label>
                    <input
                      type="text"
                      value={form.asal_daerah}
                      onChange={e => setForm({ ...form, asal_daerah: e.target.value })}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konsentrasi Pilihan *</label>
                    <select
                      value={form.konsentrasi}
                      onChange={e => setForm({ ...form, konsentrasi: Number(e.target.value) })}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                    >
                      <option value={0}>-- Pilih Konsentrasi --</option>
                      {data.konsentrasi_list.map(k => (
                        <option key={k.id_konsentrasi} value={k.id_konsentrasi}>{k.nama_konsentrasi}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hafalan Quran</label>
                    <input
                      type="text"
                      value={form.hafalan_quran}
                      onChange={e => setForm({ ...form, hafalan_quran: e.target.value })}
                      disabled={!canEdit}
                      placeholder="Contoh: 5 Juz"
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skill / Kelebihan</label>
                    <input
                      type="text"
                      value={form.skill_kelebihan}
                      onChange={e => setForm({ ...form, skill_kelebihan: e.target.value })}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Mendaftar</label>
                    <textarea
                      value={form.alasan_mendaftar}
                      onChange={e => setForm({ ...form, alasan_mendaftar: e.target.value })}
                      disabled={!canEdit}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                </div>
                {canEdit && (
                  <div className="pt-4">
                    <button onClick={handleSaveBiodata} disabled={saving} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                      {saving ? 'Menyimpan...' : 'Simpan Biodata'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab Orang Tua */}
            {activeTab === 'ortu' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ayah *</label>
                    <input type="text" value={form.nama_ayah} onChange={e => setForm({ ...form, nama_ayah: e.target.value })} disabled={!canEdit} className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan Ayah</label>
                    <input type="text" value={form.pekerjaan_ayah} onChange={e => setForm({ ...form, pekerjaan_ayah: e.target.value })} disabled={!canEdit} className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ibu *</label>
                    <input type="text" value={form.nama_ibu} onChange={e => setForm({ ...form, nama_ibu: e.target.value })} disabled={!canEdit} className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan Ibu</label>
                    <input type="text" value={form.pekerjaan_ibu} onChange={e => setForm({ ...form, pekerjaan_ibu: e.target.value })} disabled={!canEdit} className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. HP Orang Tua *</label>
                    <input type="tel" value={form.no_hp_ortu} onChange={e => setForm({ ...form, no_hp_ortu: e.target.value })} disabled={!canEdit} placeholder="08xxxxxxxxxx" className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
                  </div>
                </div>
                {canEdit && (
                  <div className="pt-4">
                    <button onClick={handleSaveBiodata} disabled={saving} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                      {saving ? 'Menyimpan...' : 'Simpan Data Orang Tua'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab Dokumen */}
            {activeTab === 'dokumen' && (
              <div className="space-y-4">
                {['foto', 'kk', 'akta', 'ijazah', 'rapor', 'surat_sehat', 'bukti_bayar'].map(jenis => {
                  const doc = data.dokumen.find(d => d.jenis_dokumen === jenis);
                  const isRequired = ['foto', 'kk', 'bukti_bayar'].includes(jenis);
                  const labels: Record<string, string> = {
                    foto: 'Pas Foto', kk: 'Kartu Keluarga', akta: 'Akta Kelahiran',
                    ijazah: 'Ijazah/SKL', rapor: 'Rapor Terakhir', surat_sehat: 'Surat Keterangan Sehat',
                    bukti_bayar: 'Bukti Pembayaran Pendaftaran'
                  };
                  return (
                    <div key={jenis} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {labels[jenis]}{isRequired && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        {doc ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500 truncate max-w-[200px]">{doc.nama_file}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              doc.status_verifikasi === 'valid' ? 'bg-green-100 text-green-700' :
                              doc.status_verifikasi === 'invalid' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {doc.status_verifikasi}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 mt-1">Belum diupload</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {doc && (
                          <>
                            <button
                              onClick={() => setPreviewUrl(doc.path_file)}
                              className="px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg"
                            >
                              Lihat
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => handleDeleteDokumen(doc.id_dokumen)}
                                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                Hapus
                              </button>
                            )}
                          </>
                        )}
                        {canEdit && (
                          <label className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 text-sm">
                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadDokumen(jenis, file);
                            }} />
                            {doc ? 'Ganti' : 'Upload'}
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
                <p className="text-sm text-gray-500 mt-4">* Dokumen wajib. Format: JPG, PNG, PDF. Maks 5MB.</p>
              </div>
            )}

            {/* Tab Pembayaran */}
            {activeTab === 'pembayaran' && showPayment && (
              <div className="space-y-6">
                {/* Info */}
                <div className="p-4 border border-blue-200 rounded-lg bg-primary/5">
                  <p className="text-sm text-primary-dark">
                    <strong>Catatan:</strong> Bukti pembayaran pendaftaran diupload di tab Dokumen. 
                    Tab ini khusus untuk upload bukti pembayaran daftar ulang setelah Anda diterima.
                  </p>
                </div>

                {/* Form Upload */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold mb-4">Upload Bukti Daftar Ulang</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                      <input
                        type="number"
                        value={paymentForm.nominal}
                        onChange={e => setPaymentForm({ ...paymentForm, nominal: e.target.value })}
                        placeholder="500000"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Bayar</label>
                      <input
                        type="date"
                        value={paymentForm.tanggal_bayar}
                        onChange={e => setPaymentForm({ ...paymentForm, tanggal_bayar: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Pembayaran (bisa pilih beberapa)</label>
                    <input
                      ref={paymentFilesRef}
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maks 5 file, format JPG/PNG/PDF</p>
                  </div>
                  <button
                    onClick={handleUploadPayment}
                    disabled={uploadingPayment}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {uploadingPayment ? 'Mengupload...' : 'Upload Bukti Daftar Ulang'}
                  </button>
                </div>

                {/* Riwayat Pembayaran */}
                <div>
                  <h3 className="font-semibold mb-4">Riwayat Pembayaran</h3>
                  {pembayaran.length === 0 ? (
                    <p className="text-gray-500 text-sm">Belum ada pembayaran</p>
                  ) : (
                    <div className="space-y-3">
                      {pembayaran.map(p => (
                        <div key={p.id_pembayaran} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium capitalize">{p.jenis_pembayaran.replace('_', ' ')}</span>
                              <p className="text-sm text-gray-500">{p.tanggal_bayar}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">Rp {Number(p.nominal).toLocaleString('id-ID')}</p>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                p.status === 'verified' ? 'bg-green-100 text-green-700' :
                                p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {p.status === 'verified' ? 'Terverifikasi' : p.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                              </span>
                            </div>
                          </div>
                          {p.bukti_bayar && p.bukti_bayar.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {p.bukti_bayar.map((url, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setPreviewUrl(url)}
                                  className="text-xs text-primary hover:underline"
                                >
                                  Bukti {idx + 1}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Preview Dokumen</h3>
              <button onClick={() => setPreviewUrl(null)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <div className="p-4">
              {previewUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe src={previewUrl} className="w-full h-[70vh]" />
              ) : (
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[70vh] mx-auto" />
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
