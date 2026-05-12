import { useState, useEffect, useCallback } from 'react';
import { Briefcase, PlayCircle, ExternalLink, Loader2, Search, X, FileCode, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { getStudentPhotoUrl } from '../../utils/imageUtils';

interface Portfolio {
  id_review: number;
  judul_review: string;
  jenis_review: string;
  deskripsi: string;
  video_link: string;
  source_link: string;
  created_at: string;
  score?: number;
  santri_review?: number;
  santri_review_nama?: string;
  santri_review_foto_santri?: string;
}

// Score color helper - nilai standar dianggap 70
function getScoreColor(score: number | undefined): string {
  if (!score) return 'bg-gray-100 text-gray-600';
  if (score >= 80) return 'bg-green-100 text-green-700';
  if (score >= 70) return 'bg-blue-100 text-blue-700';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

export default function AkademikPortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  const fetchPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      const json: any = await api.get("/api/crud/review?per_page=50&order_by=created_at&order=desc");
      if (json.success) {
        const filtered = (json.data?.items || []).filter((r: Portfolio) => 
          r.jenis_review === 'portfolio'
        );
        setPortfolios(filtered);
      }
    } catch (err) {
      console.error('Error fetching portfolios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const filteredPortfolios = portfolios.filter(p => 
    p.judul_review?.toLowerCase().includes(search.toLowerCase()) ||
    p.santri_review_nama?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Santri</h1>
        <p className="text-gray-600">Daftar portfolio dari semua santri</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari judul atau nama santri..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Portfolio Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPortfolios.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada portfolio</p>
          </div>
        ) : (
          filteredPortfolios.map((portfolio) => {
            const isHighScore = portfolio.score && portfolio.score >= 70;
            return (
              <div 
                key={portfolio.id_review} 
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition cursor-pointer group ${isHighScore ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-200'}`}
                onClick={() => setSelectedPortfolio(portfolio)}
              >
                {/* File Icon Header */}
                <div className="bg-gradient-to-br from-cyan-500 to-teal-600 p-6 flex items-center justify-center relative">
                  <FileCode className="w-16 h-16 text-white opacity-80 group-hover:scale-110 transition" />
                  {/* Score Badge */}
                  {portfolio.score !== undefined && portfolio.score !== null && (
                    <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(portfolio.score)}`}>
                      {isHighScore && <CheckCircle className="w-3 h-3" />}
                      {portfolio.score}
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{portfolio.judul_review}</h3>
                  <div className="flex items-center gap-2">
                    <img
                      src={getStudentPhotoUrl(portfolio.santri_review_foto_santri)}
                      alt={portfolio.santri_review_nama}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-600 truncate">{portfolio.santri_review_nama || 'Unknown'}</span>
                    <span className="text-xs text-gray-400 ml-auto">{new Date(portfolio.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedPortfolio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPortfolio(null)}>
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with File Icon */}
            <div className="bg-gradient-to-br from-cyan-500 to-teal-600 p-8 flex flex-col items-center relative">
              <FileCode className="w-20 h-20 text-white mb-4" />
              <h2 className="text-xl font-bold text-white text-center">{selectedPortfolio.judul_review}</h2>
              {/* Close Button */}
              <button 
                onClick={() => setSelectedPortfolio(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Score Display */}
              {selectedPortfolio.score !== undefined && selectedPortfolio.score !== null && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${getScoreColor(selectedPortfolio.score)}`}>
                  {selectedPortfolio.score >= 70 && <CheckCircle className="w-5 h-5" />}
                  <span className="font-bold text-lg">{selectedPortfolio.score}</span>
                  <span className="text-sm">/ 100</span>
                </div>
              )}
              
              {/* Author & Meta */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <img
                  src={getStudentPhotoUrl(selectedPortfolio.santri_review_foto_santri)}
                  alt={selectedPortfolio.santri_review_nama}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{selectedPortfolio.santri_review_nama || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{new Date(selectedPortfolio.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <span className="ml-auto text-sm bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full">
                  Portfolio
                </span>
              </div>
              
              {/* Deskripsi - WYSIWYG */}
              {selectedPortfolio.deskripsi && (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedPortfolio.deskripsi }}
                />
              )}
              
              {/* Links */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                {selectedPortfolio.video_link && (
                  <a 
                    href={selectedPortfolio.video_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <PlayCircle className="w-4 h-4" /> Demo Video
                  </a>
                )}
                {selectedPortfolio.source_link && (
                  <a 
                    href={selectedPortfolio.source_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <ExternalLink className="w-4 h-4" /> Lihat Source
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
