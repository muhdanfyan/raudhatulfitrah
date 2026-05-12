import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, TENANT_ID, getHeaders } from '../../services/api';

// Helper to get Cloudinary optimized URL
const getCloudinaryUrl = (url: string | null, width = 400, height = 300) => {
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
  status_program: string;
  is_featured: boolean;
  total_donasi: number;
  jumlah_donatur: number;
  progress_persen: number;
  sisa_hari: number;
}

interface Stats {
  total_campaigns: number;
  total_collected: number;
  total_donors: number;
  completed_campaigns: number;
}



export default function CrowdfundLandingPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/crowdfund/campaigns?featured=1`).then(r => r.json()),
      fetch(`${API_URL}/crowdfund/campaigns`).then(r => r.json()),
      fetch(`${API_URL}/crowdfund/stats`).then(r => r.json())
    ]).then(([featuredRes, allRes, statsRes]) => {
      setFeaturedCampaigns(featuredRes.data || []);
      setCampaigns(allRes.data?.data || allRes.data || []);
      setStats(statsRes.data || null);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-lg" onError={(e) => { e.currentTarget.src = '/vite.svg'; }} />
            <div>
              <h1 className="font-bold text-lg">Donasi Pesantren</h1>
              <p className="text-emerald-100 text-sm">Crowdfunding untuk Kebaikan</p>
            </div>
          </div>
          <button onClick={() => navigate('/login')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
            Login Admin
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Berbagi Kebaikan</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Bersama membangun pesantren yang lebih baik melalui donasi dan kepedulian
          </p>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-3xl font-bold">{stats.total_campaigns}</div>
                <div className="text-emerald-100 text-sm">Program</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-3xl font-bold">{formatCurrency(stats.total_collected)}</div>
                <div className="text-emerald-100 text-sm">Terkumpul</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-3xl font-bold">{stats.total_donors}</div>
                <div className="text-emerald-100 text-sm">Donatur</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-3xl font-bold">{stats.completed_campaigns}</div>
                <div className="text-emerald-100 text-sm">Selesai</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Featured Campaigns */}
      {featuredCampaigns.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Program Unggulan</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredCampaigns.slice(0, 2).map((c) => (
              <div key={c.id_programdonasi} onClick={() => navigate(`/donasi/${c.slug}`)} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition group">
                <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-500 relative">
                  {c.gambar_url && <img src={getCloudinaryUrl(c.gambar_url, 600, 192) || ''} alt={c.nama_programdonasi} className="w-full h-full object-cover" />}
                  <span className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                    Unggulan
                  </span>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition">
                    {c.nama_programdonasi}
                  </h4>
                  <p className="text-gray-600 mb-4 line-clamp-2">{c.deskripsi_programdonasi}</p>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Terkumpul</span>
                      <span className="font-semibold text-emerald-600">{c.progress_persen}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(c.progress_persen, 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <div className="font-bold text-gray-800">{formatCurrency(c.total_donasi)}</div>
                      <div className="text-gray-500">dari {formatCurrency(c.anggaran_programdonasi)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{c.sisa_hari > 0 ? c.sisa_hari : 0}</div>
                      <div className="text-gray-500">hari lagi</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Campaigns */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Semua Program</h3>
        {campaigns.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p>Belum ada program donasi yang aktif</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => (
              <div key={c.id_programdonasi} onClick={() => navigate(`/donasi/${c.slug}`)}
                className="bg-white rounded-xl shadow overflow-hidden cursor-pointer hover:shadow-lg transition group">
                <div className="h-40 bg-gradient-to-br from-emerald-400 to-teal-500 relative">
                  {c.gambar_url && <img src={getCloudinaryUrl(c.gambar_url, 400, 160) || ''} alt={c.nama_programdonasi} className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition line-clamp-1">
                    {c.nama_programdonasi}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{c.deskripsi_programdonasi}</p>
                  <div className="mb-3">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(c.progress_persen, 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatCurrency(c.total_donasi)} terkumpul</span>
                    <span>{c.jumlah_donatur} donatur</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Pesantren Teknologi. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
