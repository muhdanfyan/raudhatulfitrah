import { useState, useEffect, useCallback } from 'react';
import { FileText, PlayCircle, ExternalLink, Loader2, Search, Filter, X, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { getStudentPhotoUrl } from '../../utils/imageUtils';

interface Review {
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

// Extract YouTube video ID from URL
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Get YouTube thumbnail
function getYouTubeThumbnail(url: string): string | null {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

// Score color helper - nilai standar dianggap 70
function getScoreColor(score: number | undefined): string {
  if (!score) return 'bg-gray-100 text-gray-600';
  if (score >= 80) return 'bg-green-100 text-green-700';
  if (score >= 70) return 'bg-blue-100 text-blue-700';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

export default function AkademikReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const json: any = await api.get("/api/crud/review?per_page=50&order_by=created_at&order=desc");
      if (json.success) {
        const filtered = (json.data?.items || []).filter((r: Review) => 
          r.jenis_review === 'roadmap' || r.jenis_review === 'bulanan'
        );
        setReviews(filtered);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filteredReviews = reviews.filter(review => {
    const matchSearch = review.judul_review?.toLowerCase().includes(search.toLowerCase()) ||
                       review.santri_review_nama?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || review.jenis_review === filter;
    return matchSearch && matchFilter;
  });

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Santri</h1>
        <p className="text-gray-600">Daftar review roadmap dan bulanan dari semua santri</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul atau nama santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="all">Semua Jenis</option>
            <option value="roadmap">Roadmap</option>
            <option value="bulanan">Bulanan</option>
          </select>
        </div>
      </div>

      {/* Review Grid with Thumbnails */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReviews.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada review</p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const thumbnail = getYouTubeThumbnail(review.video_link);
            const isHighScore = review.score && review.score >= 70;
            return (
              <div 
                key={review.id_review} 
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition cursor-pointer group ${isHighScore ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-200'}`}
                onClick={() => setSelectedReview(review)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-100">
                  {thumbnail ? (
                    <>
                      <img
                        src={thumbnail}
                        alt={review.judul_review}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <PlayCircle className="w-12 h-12 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 text-xs bg-violet-600 text-white px-2 py-1 rounded-full">
                    {review.jenis_review}
                  </span>
                  {/* Score Badge */}
                  {review.score !== undefined && review.score !== null && (
                    <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(review.score)}`}>
                      {isHighScore && <CheckCircle className="w-3 h-3" />}
                      {review.score}
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{review.judul_review}</h3>
                  <div className="flex items-center gap-2">
                    <img
                      src={getStudentPhotoUrl(review.santri_review_foto_santri)}
                      alt={review.santri_review_nama}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-600 truncate">{review.santri_review_nama || 'Unknown'}</span>
                    <span className="text-xs text-gray-400 ml-auto">{new Date(review.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedReview(null)}>
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{selectedReview.judul_review}</h2>
              <button 
                onClick={() => setSelectedReview(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Video Embed */}
            {getYouTubeId(selectedReview.video_link) && (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(selectedReview.video_link)}`}
                  className="w-full h-full"
                  allowFullScreen
                  title={selectedReview.judul_review}
                />
              </div>
            )}
            
            {/* Content */}
            <div className="p-6">
              {/* Score Display */}
              {selectedReview.score !== undefined && selectedReview.score !== null && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${getScoreColor(selectedReview.score)}`}>
                  {selectedReview.score >= 70 && <CheckCircle className="w-5 h-5" />}
                  <span className="font-bold text-lg">{selectedReview.score}</span>
                  <span className="text-sm">/ 100</span>
                </div>
              )}
              
              {/* Author & Meta */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <img
                  src={getStudentPhotoUrl(selectedReview.santri_review_foto_santri)}
                  alt={selectedReview.santri_review_nama}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{selectedReview.santri_review_nama || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{new Date(selectedReview.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <span className="ml-auto text-sm bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
                  {selectedReview.jenis_review}
                </span>
              </div>
              
              {/* Deskripsi - WYSIWYG */}
              {selectedReview.deskripsi && (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedReview.deskripsi }}
                />
              )}
              
              {/* Links */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                {selectedReview.video_link && (
                  <a 
                    href={selectedReview.video_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <PlayCircle className="w-4 h-4" /> Buka Video
                  </a>
                )}
                {selectedReview.source_link && (
                  <a 
                    href={selectedReview.source_link} 
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
