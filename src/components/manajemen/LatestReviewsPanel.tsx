import { FileText, PlayCircle, ExternalLink, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStudentPhotoUrl } from '../../utils/imageUtils';

interface Review {
  id_review: number;
  judul_review: string;
  jenis_review: string;
  deskripsi: string;
  video_link: string;
  source_link: string;
  created_at: string;
  santri?: { nama_lengkap_santri: string; foto_santri?: string };
}

interface LatestReviewsPanelProps {
  reviews: Review[];
  title?: string;
}

export default function LatestReviewsPanel({ 
  reviews = [], 
  title = 'Review Terbaru' 
}: LatestReviewsPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Update Roadmap & Bulanan</p>
          </div>
        </div>
        <Link to="/akademik/review" className="text-xs text-violet-600 font-bold hover:underline">Lihat Semua</Link>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto max-h-[400px]">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 text-gray-200">
              <MessageCircle className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-gray-400">Belum ada review terbaru</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id_review} className="p-4 rounded-xl bg-gradient-to-br from-violet-50/50 to-white border border-violet-100/50 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-violet-700 transition-colors truncate">
                    {review.judul_review}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-5 rounded-lg overflow-hidden flex-shrink-0 border border-violet-100 shadow-sm">
                      <img
                        src={getStudentPhotoUrl(review.santri?.foto_santri)}
                        alt={review.santri?.nama_lengkap_santri}
                        className="w-full h-full object-cover"
                        onError={(e) => { 
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.santri?.nama_lengkap_santri || 'S')}&background=F5F3FF&color=7C3AED`;
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {review.santri?.nama_lengkap_santri || 'Santri'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {review.video_link && (
                    <a href={review.video_link} target="_blank" rel="noopener noreferrer" 
                       className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                       title="Lihat Video">
                      <PlayCircle className="w-4 h-4" />
                    </a>
                  )}
                  {review.source_link && (
                    <a href={review.source_link} target="_blank" rel="noopener noreferrer"
                       className="p-1.5 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors"
                       title="Buka Link">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-tight">
                    {review.jenis_review}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">
                  {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
