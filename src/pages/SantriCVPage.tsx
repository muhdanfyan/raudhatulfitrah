import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Helmet } from 'react-helmet-async';
import { 
  Users, GraduationCap, MapPin, Phone, Mail, LogIn, ChevronLeft,
  Briefcase, FileText, BookOpen, Calendar, ExternalLink, Play,
  Book, Loader2
} from 'lucide-react';
import { getStudentPhotoUrl, getStaticAsset } from '../utils/imageUtils';

interface SantriData {
  id_santri: number;
  nama_lengkap_santri: string;
  nama_panggilan_santri: string | null;
  foto_santri: string | null;
  status_santri: string;
  asal_daerah_santri: string | null;
  tgl_masuk_santri: string | null;
  nama_konsentrasi: string | null;
  nama_angkatan: string | null;
}

interface Stats {
  total_portofolio: number;
  total_tulisan: number;
  total_review: number;
  total_tahfidz: number;
}

interface TahfidzSummary {
  total_baris: number | null;
  total_juz: number | null;
}

interface Portfolio {
  id_portofolio: number;
  nama_portofolio: string;
  deskripsi: string;
  demo_link: string | null;
  techstack: string | null;
  gambar_urls: string[] | null;
  created_at: string;
}

interface Tulisan {
  id: number;
  title: string;
  slug: string;
  kategori: string;
  image_url: string | null;
  excerpt: string;
  created_at: string;
}

interface Review {
  id_review: number;
  judul_review: string;
  jenis_review: string;
  deskripsi: string;
  video_link: string | null;
  source_link: string | null;
  thumbnail: string | null;
  created_at: string;
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

export default function SantriCVPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [santri, setSantri] = useState<SantriData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tahfidzSummary, setTahfidzSummary] = useState<TahfidzSummary | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [tulisan, setTulisan] = useState<Tulisan[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [cvData, settingsData] = await Promise.all([
        api.get(`/api/public/santri-cv/${id}`),
        api.get('/public/settings')
      ]);
      
      if (cvData.success) {
        setSantri(cvData.data.santri);
        setStats(cvData.data.stats);
        setTahfidzSummary(cvData.data.tahfidz_summary);
        setPortfolio(cvData.data.portfolio || []);
        setTulisan(cvData.data.tulisan || []);
        setReviews(cvData.data.reviews || []);
      }
      setSettings(settingsData.data || settingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = settings?.warnaUtama || '#2563EB';
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Memuat data santri...</p>
        </div>
      </div>
    );
  }

  if (!santri) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Santri Tidak Ditemukan</h1>
          <Link to="/santri" className="text-primary hover:underline">Kembali ke daftar santri</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{santri.nama_lengkap_santri} - {settings?.namaSingkat || 'Pondok Informatika'}</title>
        <meta name="description" content={`Profil dan progress ${santri.nama_lengkap_santri} di ${settings?.namaPesantren || 'Pondok Informatika'}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
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
          {/* Back Link */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <Link to="/santri" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary">
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali ke daftar santri</span>
              </Link>
            </div>
          </div>

          {/* Hero/Profile Header */}
          <section className="bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white py-12 sm:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                {/* Photo */}
                <div className="flex-shrink-0">
                  <img 
                    src={getStudentPhotoUrl(santri.foto_santri)} 
                    alt={santri.nama_lengkap_santri}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(santri.nama_lengkap_santri)}&background=3B82F6&color=fff&size=200`;
                    }}
                  />
                </div>
                
                {/* Info */}
                <div className="text-center sm:text-left flex-1">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                    santri.status_santri === 'Mengabdi' 
                      ? 'bg-amber-500/20 text-amber-300' 
                      : 'bg-green-500/20 text-green-300'
                  }`}>
                    {santri.status_santri}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">{santri.nama_lengkap_santri}</h1>
                  {santri.nama_panggilan_santri && (
                    <p className="text-gray-400 text-sm mb-3">"{santri.nama_panggilan_santri}"</p>
                  )}
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-300">
                    {santri.nama_konsentrasi && (
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        <span>{santri.nama_konsentrasi}</span>
                      </div>
                    )}
                    {santri.asal_daerah_santri && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{santri.asal_daerah_santri}</span>
                      </div>
                    )}
                    {santri.nama_angkatan && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>Angkatan {santri.nama_angkatan}</span>
                      </div>
                    )}
                    {santri.tgl_masuk_santri && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>Masuk {formatDate(santri.tgl_masuk_santri)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          {stats && (
            <section className="py-8 sm:py-10 bg-white border-b border-gray-200">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-100">
                    <Briefcase className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">{stats.total_portofolio}</div>
                    <div className="text-sm text-blue-600">Portfolio</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 text-center border border-emerald-100">
                    <FileText className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-emerald-700">{stats.total_tulisan}</div>
                    <div className="text-sm text-emerald-600">Tulisan</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-100">
                    <BookOpen className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-700">{stats.total_review}</div>
                    <div className="text-sm text-purple-600">Review</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center border border-amber-100">
                    <Book className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-amber-700">{tahfidzSummary?.total_juz || 0}</div>
                    <div className="text-sm text-amber-600">Juz Tahfidz</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Portfolio Section */}
          {portfolio.length > 0 && (
            <section className="py-10 sm:py-12 bg-gray-50">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Portfolio
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {portfolio.map((p) => (
                    <div key={p.id_portofolio} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">{p.nama_portofolio}</h3>
                      <div 
                        className="text-gray-600 text-sm mb-3 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: p.deskripsi }}
                      />
                      {p.techstack && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {p.techstack.split(',').slice(0, 4).map((tech, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{tech.trim()}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{formatDate(p.created_at)}</span>
                        {p.demo_link && (
                          <a href={p.demo_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                            <ExternalLink className="w-3 h-3" />
                            Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Tulisan Section */}
          {tulisan.length > 0 && (
            <section className="py-10 sm:py-12 bg-white">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Tulisan
                </h2>
                <div className="space-y-4">
                  {tulisan.map((t) => (
                    <Link 
                      key={t.id} 
                      to={`/tulisan/${t.slug}`}
                      className="block bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      <div className="flex items-start gap-4">
                        {t.image_url && (
                          <img src={t.image_url} alt={t.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-emerald-600 font-medium">{t.kategori}</span>
                          <h3 className="font-semibold text-gray-900 mt-1 line-clamp-1">{t.title}</h3>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{t.excerpt}</p>
                          <span className="text-xs text-gray-400 mt-2 block">{formatDate(t.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <section className="py-10 sm:py-12 bg-gray-50">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Review
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {reviews.map((r) => (
                    <div key={r.id_review} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      {r.thumbnail && (
                        <div className="relative aspect-video">
                          <img src={r.thumbnail} alt={r.judul_review} className="w-full h-full object-cover" />
                          {r.video_link && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                <Play className="w-5 h-5 text-gray-900 ml-1" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-4">
                        <span className="text-xs text-purple-600 font-medium">{r.jenis_review}</span>
                        <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2">{r.judul_review}</h3>
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{r.deskripsi}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
                          {r.video_link && (
                            <a href={r.video_link} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline">
                              Tonton
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Empty State if no content */}
          {portfolio.length === 0 && tulisan.length === 0 && reviews.length === 0 && (
            <section className="py-16 bg-gray-50">
              <div className="max-w-4xl mx-auto px-4 text-center">
                <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada karya yang dipublikasikan</p>
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
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
