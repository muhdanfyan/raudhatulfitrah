import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { ChevronLeft, Play, Loader2, Calendar, User } from 'lucide-react';



interface Berita {
  id_review: number;
  judul_review: string;
  jenis_review: string;
  deskripsi: string;
  video_link: string;
  source_link: string;
  thumbnail: string;
  created_at: string;
  nama_lengkap_santri: string;
  foto_santri: string;
}

export default function NewsPage() {
  const [berita, setBerita] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBerita();
  }, []);

  const fetchBerita = async () => {
    try {
      const json: any = await api.get(`/api/public/berita?limit=50`);
      setBerita(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-4xl font-bold mb-4">Berita & Aktivitas Santri</h1>
          <p className="text-xl text-blue-100">
            Lihat karya, review, dan aktivitas terbaru dari para santri kami
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {berita.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Belum ada berita</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {berita.map((item) => (
                <article key={item.id_review} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group">
                  {/* Thumbnail */}
                  <div className="relative h-52 overflow-hidden">
                    {item.thumbnail ? (
                      <img 
                        src={item.thumbnail} 
                        alt={item.judul_review} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Play className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-white text-xs px-3 py-1 rounded-full capitalize font-medium">
                        {item.jenis_review}
                      </span>
                    </div>
                    {item.video_link && (
                      <a 
                        href={item.video_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-primary ml-1" />
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {item.judul_review}
                    </h2>
                    
                    {item.deskripsi && (
                      <div 
                        className="text-gray-600 text-sm mb-4 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                      />
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="truncate max-w-[120px]">{item.nama_lengkap_santri}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                      {item.video_link && (
                        <a 
                          href={item.video_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          <Play className="w-4 h-4" /> Video
                        </a>
                      )}
                      {item.source_link && (
                        <a 
                          href={item.source_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                        >
                          Sumber
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} PISANTRI - Sistem Informasi Pesantren</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">Beranda</Link>
            <Link to="/ppdb" className="text-gray-400 hover:text-white transition-colors">PPDB</Link>
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
