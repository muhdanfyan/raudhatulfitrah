import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ChevronLeft, PenTool, Calendar, ArrowRight, 
  Search, ChevronRight, BookOpen, Clock, TrendingUp, Home
} from 'lucide-react';
import { getStudentPhotoUrl } from '../utils/imageUtils';



interface Tulisan {
  id: number;
  title: string;
  slug: string;
  kategori: string;
  image_url: string;
  excerpt: string;
  created_at: string;
  id_santri: number;
  nama_lengkap_santri: string;
  foto_santri: string;
}

interface Meta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

const kategoriColors: Record<string, string> = {
  'teknologi': 'from-blue-500 to-cyan-500',
  'programming': 'from-violet-500 to-purple-500',
  'islam': 'from-emerald-500 to-green-500',
  'pengalaman': 'from-orange-500 to-amber-500',
  'tutorial': 'from-pink-500 to-rose-500',
  'opini': 'from-indigo-500 to-blue-500',
  'default': 'from-gray-500 to-slate-500'
};

const getReadingTime = (text: string) => {
  const wordsPerMinute = 200;
  const words = text?.split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

export default function TulisanPage() {
  const [tulisan, setTulisan] = useState<Tulisan[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTulisan();
  }, [page, selectedKategori]);

  const fetchTulisan = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9',
      });
      if (selectedKategori !== 'semua') {
        params.append('kategori', selectedKategori);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const json: any = await api.get(`/api/public/tulisan?${params}`);
      setTulisan(json.data || []);
      setMeta(json.meta || null);
      if (json.categories) {
        setCategories(json.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTulisan();
  };

  const handleKategoriChange = (kategori: string) => {
    setSelectedKategori(kategori);
    setPage(1);
  };

  const featuredPost = tulisan[0];
  const regularPosts = tulisan.slice(1);

  return (
    <>
      <Helmet>
        <title>Tulisan Santri - Pondok Informatika</title>
        <meta name="description" content="Kumpulan tulisan, artikel, dan karya tulis santri Pondok Informatika tentang teknologi, programming, dan keislaman." />
        <meta property="og:title" content="Tulisan Santri - Pondok Informatika" />
        <meta property="og:description" content="Kumpulan tulisan, artikel, dan karya tulis santri Pondok Informatika tentang teknologi, programming, dan keislaman." />
        <meta property="og:image" content="https://pondokinformatika.id/images/og-preview.png" />
        <meta property="og:url" content="https://pondokinformatika.id/tulisan" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://pondokinformatika.id/images/og-preview.png" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium hidden sm:block">Beranda</span>
              </Link>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-bold text-gray-900">Tulisan Santri</span>
              </div>
              <Link to="/ppdb" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                Daftar PPDB
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="flex items-center gap-2 text-blue-300 mb-4">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Blog & Artikel</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Tulisan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Santri</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl leading-relaxed">
              Jelajahi ide, pengalaman, dan pengetahuan dari para santri Pondok Informatika
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-8 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari tulisan yang menarik..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary-light hover:bg-primary rounded-xl font-medium transition-colors">
                  Cari
                </button>
              </div>
            </form>
          </div>
        </header>

        {/* Category Pills */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => handleKategoriChange('semua')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  selectedKategori === 'semua'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                Semua Kategori
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleKategoriChange(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap capitalize transition-all duration-300 ${
                    selectedKategori === cat
                      ? `bg-gradient-to-r ${kategoriColors[cat] || kategoriColors.default} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="mt-4 text-gray-500">Memuat tulisan...</p>
            </div>
          ) : tulisan.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <PenTool className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada tulisan</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchQuery 
                  ? `Tidak ditemukan tulisan dengan kata kunci "${searchQuery}"`
                  : 'Tulisan santri akan muncul di sini'}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); fetchTulisan(); }}
                  className="mt-4 px-4 py-2 text-primary hover:text-primary-dark font-medium"
                >
                  Hapus pencarian
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && page === 1 && selectedKategori === 'semua' && !searchQuery && (
                <article className="mb-12 group">
                  <Link to={`/tulisan/${featuredPost.slug}`} className="block">
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl">
                      <div className="grid lg:grid-cols-2 gap-0">
                        <div className="relative h-64 lg:h-auto lg:min-h-[400px] overflow-hidden">
                          {featuredPost.image_url ? (
                            <img 
                              src={featuredPost.image_url} 
                              alt={featuredPost.title} 
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className={`absolute inset-0 bg-gradient-to-br ${kategoriColors[featuredPost.kategori] || kategoriColors.default} flex items-center justify-center`}>
                              <PenTool className="w-20 h-20 text-white/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent lg:bg-gradient-to-r"></div>
                        </div>
                        <div className="relative p-8 lg:p-12 flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${kategoriColors[featuredPost.kategori] || kategoriColors.default} capitalize`}>
                              {featuredPost.kategori?.replace(/_/g, ' ')}
                            </span>
                            <span className="text-blue-300 text-sm flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {getReadingTime(featuredPost.excerpt)} menit baca
                            </span>
                          </div>
                          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors leading-tight">
                            {featuredPost.title}
                          </h2>
                          <p className="text-gray-300 mb-6 line-clamp-3 leading-relaxed">
                            {featuredPost.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden border border-white/10 shadow-sm">
                                <img 
                                  src={getStudentPhotoUrl(featuredPost.foto_santri)} 
                                  alt="" 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(featuredPost.nama_lengkap_santri)}&background=random`;
                                  }}
                                />
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm">{featuredPost.nama_lengkap_santri}</p>
                                <p className="text-gray-400 text-xs">
                                  {new Date(featuredPost.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <span className="flex items-center gap-2 text-primary-light font-medium group-hover:gap-3 transition-all">
                              Baca <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              )}

              {/* Regular Posts Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(page === 1 && selectedKategori === 'semua' && !searchQuery ? regularPosts : tulisan).map((item, index) => (
                  <article 
                    key={item.id} 
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Link to={`/tulisan/${item.slug}`} className="block">
                      <div className="relative h-48 overflow-hidden">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${kategoriColors[item.kategori] || kategoriColors.default} flex items-center justify-center`}>
                            <PenTool className="w-12 h-12 text-white/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${kategoriColors[item.kategori] || kategoriColors.default} capitalize shadow-lg`}>
                            {item.kategori?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getReadingTime(item.excerpt)} min
                        </div>
                      </div>
                    </Link>

                    <div className="p-5">
                      <Link to={`/tulisan/${item.slug}`}>
                        <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                          {item.title}
                        </h2>
                      </Link>
                      
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{item.excerpt}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <Link 
                          to={`/penulis/${item.id_santri}`}
                          className="flex items-center gap-2 group/author"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden ring-2 ring-white shadow-sm">
                            <img 
                              src={getStudentPhotoUrl(item.foto_santri)} 
                              alt="" 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nama_lengkap_santri)}&background=random`;
                              }}
                            />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[100px] group-hover/author:text-primary transition-colors">
                              {item.nama_lengkap_santri}
                            </p>
                          </div>
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex flex-col items-center mt-16 gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === meta.last_page || (p >= page - 1 && p <= page + 1))
                        .map((p, idx, arr) => (
                          <div key={p} className="flex items-center">
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => setPage(p)}
                              className={`w-11 h-11 rounded-xl font-medium transition-all ${
                                page === p
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                                  : 'border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                              }`}
                            >
                              {p}
                            </button>
                          </div>
                        ))
                      }
                    </div>
                    
                    <button
                      onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                      disabled={page === meta.last_page}
                      className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Halaman {page} dari {meta.last_page} ({meta.total} tulisan)
                  </p>
                </div>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-gray-400 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white">Pondok Informatika</p>
                  <p className="text-sm">Mencetak Generasi IT Rabbani</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
                <Link to="/tulisan" className="hover:text-white transition-colors">Tulisan</Link>
                <Link to="/ppdb" className="hover:text-white transition-colors">PPDB</Link>
                <Link to="/login" className="hover:text-white transition-colors">Login</Link>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
              <p>&copy; {new Date().getFullYear()} Pondok Informatika. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
