import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL, TENANT_ID, getHeaders } from '../../services/api';

// Helper to get Cloudinary optimized URL
const getCloudinaryUrl = (url: string | null, width = 800, height = 400) => {
  if (!url) return null;
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
  }
  return url;
};

interface Campaign {
  id_programdonasi: number;
  nama_programdonasi: string;
  slug: string;
  deskripsi_programdonasi: string;
  gambar_url: string | null;
  anggaran_programdonasi: number;
  tanggal_mulai: string;
  tanggal_akhir: string;
  kriteria_donasi: string;
  status_program: string;
  is_featured: boolean;
  total_donasi: number;
  jumlah_donatur: number;
  progress_persen: number;
  sisa_hari: number;
  recent_donors: { nama: string; nominal: number; message: string; created_at: string }[];
}


const NOMINAL_OPTIONS = [50000, 100000, 250000, 500000, 1000000, 2500000];

export default function CrowdfundCampaignPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateForm, setDonateForm] = useState({
    nama_donatur: '',
    email_donatur: '',
    hp_donatur: '',
    nominal_donasi: 100000,
    is_anonymous: false,
    message: '',
    bukti_transfer: null as File | null
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/crowdfund/campaigns/${slug}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setCampaign(res.data);
        else setError(res.message || 'Program tidak ditemukan');
      })
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('program_donasi', campaign.id_programdonasi.toString());
      formData.append('nama_donatur', donateForm.is_anonymous ? 'Hamba Allah' : donateForm.nama_donatur);
      formData.append('email_donatur', donateForm.email_donatur);
      formData.append('hp_donatur', donateForm.hp_donatur);
      formData.append('nominal_donasi', donateForm.nominal_donasi.toString());
      formData.append('is_anonymous', donateForm.is_anonymous ? '1' : '0');
      formData.append('message', donateForm.message);
      if (donateForm.bukti_transfer) {
        formData.append('bukti_transfer', donateForm.bukti_transfer);
      }

      const res = await fetch(`${API_URL}/crowdfund/donate`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowDonateModal(false);
          setSubmitSuccess(false);
          window.location.reload();
        }, 3000);
      } else {
        alert(data.message || 'Gagal mengirim donasi');
      }
    } catch {
      alert('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{error || 'Program tidak ditemukan'}</h2>
          <button onClick={() => navigate('/donasi')} className="text-emerald-600 hover:underline">
            Kembali ke daftar program
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/donasi')} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-bold text-gray-800 line-clamp-1 flex-1">{campaign.nama_programdonasi}</h1>
        </div>
      </header>

      {/* Campaign Image */}
      <div className="h-64 md:h-80 bg-gradient-to-br from-emerald-400 to-teal-500 relative">
        {campaign.gambar_url && (
          <img src={getCloudinaryUrl(campaign.gambar_url, 1200, 400) || ''} alt={campaign.nama_programdonasi} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 pb-24">
        {/* Progress Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-3xl font-bold text-emerald-600">{formatCurrency(campaign.total_donasi)}</div>
              <div className="text-gray-500">terkumpul dari {formatCurrency(campaign.anggaran_programdonasi)}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">{campaign.sisa_hari > 0 ? campaign.sisa_hari : 0}</div>
              <div className="text-gray-500">hari lagi</div>
            </div>
          </div>
          <div className="mb-4">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(campaign.progress_persen, 100)}%` }}></div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{campaign.jumlah_donatur} donatur</span>
            <span>{campaign.progress_persen}% tercapai</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Tentang Program</h2>
          <p className="text-gray-600 whitespace-pre-line">{campaign.deskripsi_programdonasi}</p>
          {campaign.kriteria_donasi && (
            <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
              <h3 className="font-medium text-emerald-800 mb-2">Kriteria Donasi</h3>
              <p className="text-emerald-700 text-sm">{campaign.kriteria_donasi}</p>
            </div>
          )}
          <div className="mt-4 flex gap-4 text-sm text-gray-500">
            <span>Mulai: {formatDate(campaign.tanggal_mulai)}</span>
            <span>Berakhir: {formatDate(campaign.tanggal_akhir)}</span>
          </div>
        </div>

        {/* Recent Donors */}
        {campaign.recent_donors && campaign.recent_donors.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Donatur Terbaru</h2>
            <div className="space-y-4">
              {campaign.recent_donors.map((d, i) => (
                <div key={i} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{d.nama}</div>
                    <div className="text-sm text-emerald-600">{formatCurrency(d.nominal)}</div>
                    {d.message && <p className="text-sm text-gray-500 mt-1">{d.message}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Donate Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowDonateModal(true)}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition"
          >
            Donasi Sekarang
          </button>
        </div>
      </div>

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {submitSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Terima Kasih!</h3>
                <p className="text-gray-600">Donasi Anda telah dikirim dan akan segera diverifikasi.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitDonation}>
                <div className="p-6 border-b flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">Form Donasi</h3>
                  <button type="button" onClick={() => setShowDonateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Nominal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nominal Donasi</label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {NOMINAL_OPTIONS.map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setDonateForm({ ...donateForm, nominal_donasi: n })}
                          className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                            donateForm.nominal_donasi === n
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 hover:border-emerald-300'
                          }`}
                        >
                          {formatCurrency(n)}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      value={donateForm.nominal_donasi}
                      onChange={(e) => setDonateForm({ ...donateForm, nominal_donasi: parseInt(e.target.value) || 0 })}
                      className="w-full border rounded-lg px-4 py-2"
                      placeholder="Atau masukkan nominal lain"
                      min={10000}
                      required
                    />
                  </div>

                  {/* Anonymous Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={donateForm.is_anonymous}
                      onChange={(e) => setDonateForm({ ...donateForm, is_anonymous: e.target.checked })}
                      className="w-5 h-5 text-emerald-600 rounded"
                    />
                    <span className="text-gray-700">Sembunyikan nama saya (Hamba Allah)</span>
                  </label>

                  {/* Name */}
                  {!donateForm.is_anonymous && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        value={donateForm.nama_donatur}
                        onChange={(e) => setDonateForm({ ...donateForm, nama_donatur: e.target.value })}
                        className="w-full border rounded-lg px-4 py-2"
                        required={!donateForm.is_anonymous}
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={donateForm.email_donatur}
                      onChange={(e) => setDonateForm({ ...donateForm, email_donatur: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
                    <input
                      type="tel"
                      value={donateForm.hp_donatur}
                      onChange={(e) => setDonateForm({ ...donateForm, hp_donatur: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2"
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pesan/Doa (opsional)</label>
                    <textarea
                      value={donateForm.message}
                      onChange={(e) => setDonateForm({ ...donateForm, message: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2"
                      rows={2}
                    />
                  </div>

                  {/* Bukti Transfer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Transfer</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDonateForm({ ...donateForm, bukti_transfer: e.target.files?.[0] || null })}
                      className="w-full border rounded-lg px-4 py-2"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload bukti transfer (JPG/PNG, max 2MB)</p>
                  </div>
                </div>
                <div className="p-6 border-t">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Mengirim...' : `Donasi ${formatCurrency(donateForm.nominal_donasi)}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
