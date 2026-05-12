import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ChevronLeft, Loader2, Calendar, User, Tag, Clock, 
  Share2, Facebook, Twitter, Copy, Check, BookOpen, ArrowRight
} from 'lucide-react';



interface Tulisan {
  id: number;
  title: string;
  slug: string;
  kategori: string;
  content: string;
  image_url: string;
  created_at: string;
  id_santri: number;
  nama_lengkap_santri: string;
  foto_santri: string;
  nama_konsentrasi: string;
}

export default function TulisanDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tulisan, setTulisan] = useState<Tulisan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    if (slug) fetchTulisan();
  }, [slug]);

  const fetchTulisan = async () => {
    try {
      const data = await api.get(`/public/tulisan/${slug}`);
      if (data.success) {
        setTulisan(data.data);
        // Calculate reading time (average 200 words per minute)
        const text = data.data.content.replace(/<[^>]*>/g, '');
        const words = text.split(/\s+/).length;
        setReadingTime(Math.ceil(words / 200));
      } else {
        setError('Tulisan tidak ditemukan');
      }
    } catch (err) {
      setError('Gagal memuat tulisan');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Memuat tulisan...</p>
        </div>
      </div>
    );
  }

  if (error || !tulisan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">{error || 'Tulisan tidak ditemukan'}</p>
          <Link to="/tulisan" className="text-primary hover:text-primary-dark font-medium">
            Kembali ke daftar tulisan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Helmet>
        <title>{tulisan.title} - Tulisan Santri Pondok Informatika</title>
        <meta name="description" content={tulisan.content.replace(/<[^>]*>/g, '').substring(0, 155)} />
        <meta property="og:title" content={tulisan.title} />
        <meta property="og:description" content={tulisan.content.replace(/<[^>]*>/g, '').substring(0, 155)} />
        <meta property="og:image" content={tulisan.image_url || 'https://pondokinformatika.id/images/og-preview.png'} />
        <meta property="og:url" content={`https://pondokinformatika.id/tulisan/${tulisan.slug}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={tulisan.image_url || 'https://pondokinformatika.id/images/og-preview.png'} />
      </Helmet>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/tulisan" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Kembali ke Tulisan</span>
            </Link>
            
            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Salin link"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-500" />}
              </button>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-primary/5 transition-colors"
                title="Bagikan ke Facebook"
              >
                <Facebook className="w-5 h-5 text-primary" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(tulisan.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-sky-50 transition-colors"
                title="Bagikan ke Twitter"
              >
                <Twitter className="w-5 h-5 text-sky-500" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Featured Image */}
      <div className="relative">
        {tulisan.image_url ? (
          <div className="h-[40vh] md:h-[50vh] relative overflow-hidden">
            <img 
              src={tulisan.image_url} 
              alt={tulisan.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />
        )}
      </div>

      {/* Content Container */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-10 lg:p-12">
            {/* Category & Reading Time */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-full">
                <Tag className="w-3.5 h-3.5" />
                {tulisan.kategori?.replace(/_/g, ' ')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full">
                <Clock className="w-3.5 h-3.5" />
                {readingTime} menit baca
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-8">
              {tulisan.title}
            </h1>

            {/* Author Card */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl mb-10">
              <Link to={`/penulis/${tulisan.id_santri}`} className="flex items-center gap-4 group">
                {tulisan.foto_santri ? (
                  <img 
                    src={tulisan.foto_santri} 
                    alt={tulisan.nama_lengkap_santri}
                    className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-lg group-hover:ring-blue-200 transition-all"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center ring-4 ring-white shadow-lg">
                    <User className="w-7 h-7 text-white" />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-lg">
                    {tulisan.nama_lengkap_santri}
                  </div>
                  {tulisan.nama_konsentrasi && (
                    <div className="text-sm text-gray-500">{tulisan.nama_konsentrasi}</div>
                  )}
                </div>
              </Link>
              <div className="sm:ml-auto flex items-center gap-2 text-gray-500 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{new Date(tulisan.created_at).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <BookOpen className="w-5 h-5 text-gray-300" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900
                prose-ul:my-6 prose-li:text-gray-600 prose-li:mb-2
                prose-ol:my-6
                prose-blockquote:border-l-4 prose-blockquote:border-primary 
                prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 
                prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                prose-blockquote:text-gray-700
                prose-img:rounded-xl prose-img:shadow-lg
                prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
                prose-pre:bg-gray-900 prose-pre:rounded-xl"
              dangerouslySetInnerHTML={{ __html: tulisan.content }}
            />

            {/* Tags & Share */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500 text-sm">Bagikan tulisan ini:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={handleCopyLink}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                    </button>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      <Facebook className="w-4 h-4 text-primary" />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(tulisan.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-sky-50 transition-colors"
                    >
                      <Twitter className="w-4 h-4 text-sky-500" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Author Bio Card */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link to={`/penulis/${tulisan.id_santri}`}>
                {tulisan.foto_santri ? (
                  <img 
                    src={tulisan.foto_santri} 
                    alt={tulisan.nama_lengkap_santri}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-white/20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-10 h-10 text-white/60" />
                  </div>
                )}
              </Link>
              <div className="text-center sm:text-left flex-1">
                <p className="text-blue-200 text-sm mb-1">Ditulis oleh</p>
                <Link to={`/penulis/${tulisan.id_santri}`} className="text-xl font-bold text-white hover:text-blue-200 transition-colors">
                  {tulisan.nama_lengkap_santri}
                </Link>
                {tulisan.nama_konsentrasi && (
                  <p className="text-blue-200 mt-1">Santri {tulisan.nama_konsentrasi}</p>
                )}
              </div>
              <Link 
                to={`/penulis/${tulisan.id_santri}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-900 rounded-xl font-semibold hover:bg-primary/5 transition-colors"
              >
                Lihat Profil
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link 
            to="/tulisan" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold hover:border-primary hover:text-primary transition-all shadow-lg hover:shadow-xl"
          >
            <ChevronLeft className="w-5 h-5" />
            Lihat Tulisan Lainnya
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-4">&copy; {new Date().getFullYear()} Pondok Informatika</p>
          <div className="flex justify-center gap-6">
            <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
            <Link to="/tulisan" className="hover:text-white transition-colors">Tulisan</Link>
            <Link to="/ppdb" className="hover:text-white transition-colors">PPDB</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
