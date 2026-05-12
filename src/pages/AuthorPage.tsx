import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, PenTool, Loader2, Calendar, ArrowRight, User, BookOpen, ChevronRight } from 'lucide-react';



interface Author {
  id_santri: number;
  nama_lengkap_santri: string;
  foto_santri: string;
  nama_konsentrasi: string;
  nama_angkatan: string;
}

interface Tulisan {
  id: number;
  title: string;
  slug: string;
  kategori: string;
  image_url: string;
  excerpt: string;
  created_at: string;
}

interface Meta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export default function AuthorPage() {
  const { santriId } = useParams<{ santriId: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [tulisan, setTulisan] = useState<Tulisan[]>([]);
  const [totalTulisan, setTotalTulisan] = useState(0);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (santriId) fetchAuthor();
  }, [santriId, page]);

  const fetchAuthor = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/public/author/${santriId}?page=${page}&limit=6`);
      if (data.success) {
        setAuthor(data.author);
        setTulisan(data.data || []);
        setTotalTulisan(data.total_tulisan || 0);
        setMeta(data.meta || null);
      } else {
        setError(data.message || 'Penulis tidak ditemukan');
      }
    } catch (err) {
      setError('Gagal memuat data penulis');
    } finally {
      setLoading(false);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">{error || 'Penulis tidak ditemukan'}</p>
          <Link to="/tulisan" className="text-primary hover:text-primary-dark font-medium">
            Kembali ke daftar tulisan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{author.nama_lengkap_santri} - Penulis Santri Pondok Informatika</title>
        <meta name="description" content={`Tulisan dan karya dari ${author.nama_lengkap_santri}, santri ${author.nama_konsentrasi || ''} Pondok Informatika`} />
        <meta property="og:title" content={`${author.nama_lengkap_santri} - Penulis Santri`} />
        <meta property="og:description" content={`Tulisan dan karya dari ${author.nama_lengkap_santri}, santri Pondok Informatika`} />
        <meta property="og:image" content={author.foto_santri || 'https://pondokinformatika.id/images/og-preview.png'} />
        <meta property="og:url" content={`https://pondokinformatika.id/penulis/${santriId}`} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={author.foto_santri || 'https://pondokinformatika.id/images/og-preview.png'} />
      </Helmet>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/tulisan" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Tulisan
          </Link>
          
          {/* Author Profile */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {author.foto_santri ? (
              <img 
                src={author.foto_santri}
                alt={author.nama_lengkap_santri}
                className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/20">
                <User className="w-16 h-16 text-white/60" />
              </div>
            )}
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{author.nama_lengkap_santri}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-blue-100 mb-4">
                {author.nama_konsentrasi && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {author.nama_konsentrasi}
                  </span>
                )}
                {author.nama_angkatan && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {author.nama_angkatan}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">{totalTulisan} Tulisan</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tulisan */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Tulisan oleh {author.nama_lengkap_santri}</h2>
          
          {loading && page > 1 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tulisan.length === 0 ? (
            <div className="text-center py-20">
              <PenTool className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Belum ada tulisan dari penulis ini</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tulisan.map((item) => (
                  <article key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group">
                    <div className="relative h-48 overflow-hidden">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <PenTool className="w-12 h-12 text-white/50" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="bg-primary text-white text-xs px-3 py-1 rounded-full capitalize font-medium">
                          {item.kategori?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <Link 
                        to={`/tulisan/${item.slug}`}
                        className="inline-flex items-center gap-2 mt-3 text-primary hover:text-primary-dark font-medium text-sm"
                      >
                        Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        page === p
                          ? 'bg-primary text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                    disabled={page === meta.last_page}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} PISANTRI - Sistem Informasi Pesantren</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">Beranda</Link>
            <Link to="/tulisan" className="text-gray-400 hover:text-white transition-colors">Tulisan</Link>
            <Link to="/ppdb" className="text-gray-400 hover:text-white transition-colors">PPDB</Link>
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
