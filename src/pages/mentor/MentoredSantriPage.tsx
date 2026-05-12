import { useState, useEffect, useCallback } from 'react';
import { Users, FileText, Briefcase, ChevronRight, Loader2, ExternalLink, Play, ArrowLeft, Trash2, X, Save, CheckCircle, AlertTriangle, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL, getHeaders } from '../../services/api';
import { getStudentPhotoUrl } from '../../utils/imageUtils';

interface Santri {
  id_santri: number;
  nama_santri: string;
  foto_santri: string | null;
  konsentrasi: number;
  konsentrasi_nama: string;
  angkatan: string;
  review_count: number;
  portofolio_count: number;
}

interface Review {
  id_review: number;
  judul_review: string;
  jenis_review: string;
  deskripsi: string;
  video_link: string;
  source_link: string;
  created_at: string;
  score?: number;
  feedback_good?: string;
  feedback_improve?: string;
  feedback_todo?: string;
  assessed_at?: string;
}

interface Portofolio {
  id_portofolio: number;
  nama_portofolio: string;
  image_portofolio: string;
  deskripsi: string;
  demo_link: string;
  techstack: string;
  klien: string;
  nama_konsentrasi: string;
  created_at: string;
  score?: number;
  feedback_good?: string;
  feedback_improve?: string;
  feedback_todo?: string;
  assessed_at?: string;
}

interface SantriDetail {
  santri: Santri;
  reviews: Review[];
  portofolios: Portofolio[];
}

interface NilaiOption {
  id_nilaitahfidz: number;
  nilaitahfidz: string;
  ket: string;
  bobot: number;
}

// Helper to detect video platform and get embed URL
const getVideoEmbed = (url: string): { type: 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'direct' | 'unknown'; embedUrl: string | null } => {
  if (!url) return { type: 'unknown', embedUrl: null };
  
  // YouTube
  const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  if (ytMatch && ytMatch[2].length === 11) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[2]}` };
  }
  
  // TikTok - needs video ID from URL like tiktok.com/@user/video/1234567890
  const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (tiktokMatch) {
    return { type: 'tiktok', embedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}` };
  }
  
  // Instagram Reels/Posts - needs post ID
  const igMatch = url.match(/instagram\.com\/(p|reel|reels)\/([A-Za-z0-9_-]+)/);
  if (igMatch) {
    return { type: 'instagram', embedUrl: `https://www.instagram.com/${igMatch[1]}/${igMatch[2]}/embed` };
  }
  
  // Facebook Video
  if (url.includes('facebook.com') && (url.includes('/videos/') || url.includes('/watch'))) {
    return { type: 'facebook', embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false` };
  }
  
  // Direct video file
  if (url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i)) {
    return { type: 'direct', embedUrl: url };
  }
  
  return { type: 'unknown', embedUrl: null };
};

export default function MentoredSantriPage() {
  const [loading, setLoading] = useState(true);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [selectedSantri, setSelectedSantri] = useState<SantriDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Nilai options
  const [nilaiOptions, setNilaiOptions] = useState<NilaiOption[]>([]);
  
  // Modal states
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedPorto, setSelectedPorto] = useState<Portofolio | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [formNilaiId, setFormNilaiId] = useState(0);
  const [formGood, setFormGood] = useState('');
  const [formImprove, setFormImprove] = useState('');
  const [formTodo, setFormTodo] = useState('');

  const fetchNilaiOptions = async () => {
    try {
      const res = await fetch(`${API_URL}/master/nilai-tahfidz`, { headers: getHeaders() });
      const data = await res.json();
      
      // Handle both response formats: { status: 'success', data: [...] } or { success: true, data: [...] } or direct array
      let options: NilaiOption[] = [];
      if (Array.isArray(data)) {
        options = data;
      } else if (data.data && Array.isArray(data.data)) {
        options = data.data;
      } else if (data.status === 'success' && Array.isArray(data.data)) {
        options = data.data;
      }

      setNilaiOptions(options);
    } catch (err) {
      console.error('Failed to fetch nilai options:', err);
    }
  };

  const fetchSantri = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/mentor/my-santri`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setSantriList(data.data || []);
      } else {
        setError(data.message || 'Gagal memuat data');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSantriDetail = async (santriId: number) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_URL}/mentor/santri/${santriId}`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setSelectedSantri(data.data);
      }
    } catch (err) {
      console.error('Gagal memuat detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openReviewModal = (review: Review) => {
    setSelectedReview(review);
    
    // Sanitize score: if not in options, default to 0
    const currentScore = review.score || 0;
    const isValidScore = nilaiOptions.some(n => n.id_nilaitahfidz === currentScore);
    setFormNilaiId(isValidScore ? currentScore : 0);
    
    setFormGood(review.feedback_good || '');
    setFormImprove(review.feedback_improve || '');
    setFormTodo(review.feedback_todo || '');
  };

  const openPortoModal = (porto: Portofolio) => {
    setSelectedPorto(porto);
    
    // Sanitize score: if not in options, default to 0
    const currentScore = porto.score || 0;
    const isValidScore = nilaiOptions.some(n => n.id_nilaitahfidz === currentScore);
    setFormNilaiId(isValidScore ? currentScore : 0);
    
    setFormGood(porto.feedback_good || '');
    setFormImprove(porto.feedback_improve || '');
    setFormTodo(porto.feedback_todo || '');
  };

  const closeModal = () => {
    setSelectedReview(null);
    setSelectedPorto(null);
    setFormNilaiId(0);
    setFormGood('');
    setFormImprove('');
    setFormTodo('');
  };

  const handleAssessReview = async () => {
    if (!selectedReview) return;
    if (formNilaiId < 1) {
      alert('Pilih nilai terlebih dahulu');
      return;
    }
    const payload = {
      nilai_id: formNilaiId,
      score: formNilaiId,
      feedback_good: formGood,
      feedback_improve: formImprove,
      feedback_todo: formTodo
    };
    console.log('Submitting review assessment:', payload);

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/mentor/review/${selectedReview.id_review}/assess`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        closeModal();
        if (selectedSantri) fetchSantriDetail(selectedSantri.santri.id_santri);
      } else {
        console.error('Validation error body:', data);
        const errorMsg = data.errors 
          ? Object.values(data.errors).flat().join(', ')
          : (data.message || 'Terjadi kesalahan');
        alert(errorMsg);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Gagal menyimpan penilaian');
    } finally {
      setSaving(false);
    }
  };

  const handleAssessPorto = async () => {
    if (!selectedPorto) return;
    if (formNilaiId < 1) {
      alert('Pilih nilai terlebih dahulu');
      return;
    }
    const payload = {
      nilai_id: formNilaiId,
      score: formNilaiId,
      feedback_good: formGood,
      feedback_improve: formImprove,
      feedback_todo: formTodo
    };
    console.log('Submitting porto assessment:', payload);

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/mentor/portofolio/${selectedPorto.id_portofolio}/assess`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        closeModal();
        if (selectedSantri) fetchSantriDetail(selectedSantri.santri.id_santri);
      } else {
        console.error('Validation error body:', data);
        const errorMsg = data.errors 
          ? Object.values(data.errors).flat().join(', ')
          : (data.message || 'Terjadi kesalahan');
        alert(errorMsg);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Gagal menyimpan penilaian');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Hapus review ini? Aksi ini tidak dapat dibatalkan.')) return;
    try {
      const res = await fetch(`${API_URL}/mentor/review/${reviewId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        closeModal();
        if (selectedSantri) fetchSantriDetail(selectedSantri.santri.id_santri);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Gagal menghapus review');
    }
  };

  const handleDeletePorto = async (portoId: number) => {
    if (!confirm('Hapus portofolio ini? Aksi ini tidak dapat dibatalkan.')) return;
    try {
      const res = await fetch(`${API_URL}/mentor/portofolio/${portoId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        closeModal();
        if (selectedSantri) fetchSantriDetail(selectedSantri.santri.id_santri);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Gagal menghapus portofolio');
    }
  };

  // Get nilai label from score (nilai_id)
  const getNilaiLabel = (score?: number) => {
    if (!score) return null;
    const nilai = nilaiOptions.find(n => n.id_nilaitahfidz === score);
    return nilai ? nilai.nilaitahfidz : null;
  };

  useEffect(() => {
    fetchSantri();
    fetchNilaiOptions();
  }, [fetchSantri]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  // Render video embed based on platform
  const renderVideoEmbed = (videoUrl: string) => {
    const video = getVideoEmbed(videoUrl);
    
    if (video.type === 'youtube' && video.embedUrl) {
      return (
        <div className="aspect-video rounded-lg overflow-hidden bg-black">
          <iframe src={video.embedUrl} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        </div>
      );
    }
    
    if (video.type === 'tiktok' && video.embedUrl) {
      return (
        <div className="rounded-lg overflow-hidden bg-black" style={{ maxWidth: '325px', margin: '0 auto' }}>
          <iframe src={video.embedUrl} className="w-full" style={{ height: '550px' }} allowFullScreen />
        </div>
      );
    }
    
    if (video.type === 'instagram' && video.embedUrl) {
      return (
        <div className="rounded-lg overflow-hidden bg-white" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <iframe src={video.embedUrl} className="w-full" style={{ height: '480px', border: 'none' }} allowFullScreen />
        </div>
      );
    }
    
    if (video.type === 'facebook' && video.embedUrl) {
      return (
        <div className="aspect-video rounded-lg overflow-hidden bg-black">
          <iframe src={video.embedUrl} className="w-full h-full" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" />
        </div>
      );
    }
    
    if (video.type === 'direct' && video.embedUrl) {
      return (
        <video src={video.embedUrl} controls className="w-full rounded-lg bg-black" />
      );
    }
    
    // Fallback: show link option
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center">
        <p className="text-sm text-gray-600 mb-2">Format video tidak dapat di-embed</p>
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <ExternalLink className="w-4 h-4" /> Buka di Tab Baru
        </a>
      </div>
    );
  };

  // Detail View
  if (selectedSantri) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedSantri(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        {/* Santri Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <img
              src={getStudentPhotoUrl(selectedSantri.santri.foto_santri)}
              alt={selectedSantri.santri.nama_santri}
              className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedSantri.santri.nama_santri}</h1>
              <p className="text-gray-500">{selectedSantri.santri.konsentrasi_nama} • Angkatan {selectedSantri.santri.angkatan}</p>
              <div className="flex gap-4 mt-2">
                <span className="text-sm text-blue-600 flex items-center gap-1">
                  <FileText className="w-4 h-4" /> {selectedSantri.reviews.length} Review
                </span>
                <span className="text-sm text-purple-600 flex items-center gap-1">
                  <Briefcase className="w-4 h-4" /> {selectedSantri.portofolios.length} Portofolio
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Review ({selectedSantri.reviews.length})
          </h2>
          {selectedSantri.reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada review</p>
          ) : (
            <div className="space-y-3">
              {selectedSantri.reviews.map((review) => (
                <div 
                  key={review.id_review} 
                  onClick={() => openReviewModal(review)}
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-gray-900">{review.judul_review}</h4>
                        {getNilaiLabel(review.score) && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            {getNilaiLabel(review.score)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{review.jenis_review}</span>
                        {review.created_at && (
                          <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        )}
                      </div>
                      <div 
                        className="text-sm text-gray-600 mt-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: review.deskripsi }}
                      />
                    </div>
                    <div className="flex gap-2 ml-4">
                      {review.video_link && (
                        <span className="p-2 bg-red-100 text-red-600 rounded-lg">
                          <Play className="w-4 h-4" />
                        </span>
                      )}
                      {review.source_link && (
                        <a href={review.source_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Portfolios Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" /> Portofolio ({selectedSantri.portofolios.length})
          </h2>
          {selectedSantri.portofolios.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada portofolio</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {selectedSantri.portofolios.map((porto) => (
                <div 
                  key={porto.id_portofolio}
                  onClick={() => openPortoModal(porto)}
                  className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{porto.nama_portofolio}</h4>
                    {getNilaiLabel(porto.score) && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        {getNilaiLabel(porto.score)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{porto.nama_konsentrasi}</p>
                    {porto.created_at && (
                      <span className="text-xs text-gray-400">• {new Date(porto.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    )}
                  </div>
                  <div 
                    className="text-sm text-gray-600 mt-2 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: porto.deskripsi }}
                  />
                  {porto.techstack && (
                    <p className="text-xs text-purple-600 mt-2">🛠 {porto.techstack}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {selectedReview && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Review: {selectedReview.judul_review}</h2>
                  <button onClick={closeModal} className="text-white/80 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Embedded Video with multi-platform support */}
                {selectedReview.video_link && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Play className="w-4 h-4 text-red-500" /> Video Review
                      </label>
                      <a href={selectedReview.video_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Buka di Tab Baru
                      </a>
                    </div>
                    {renderVideoEmbed(selectedReview.video_link)}
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                  <div 
                    className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border"
                    dangerouslySetInnerHTML={{ __html: selectedReview.deskripsi }}
                  />
                </div>

                {/* Source Link */}
                {selectedReview.source_link && (
                  <a href={selectedReview.source_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <ExternalLink className="w-4 h-4" /> Lihat Source Code
                  </a>
                )}

                <hr />

                {/* Assessment Form with Nilai Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nilai</label>
                  <select
                    value={formNilaiId}
                    onChange={(e) => setFormNilaiId(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={0}>-- Pilih Nilai --</option>
                    {nilaiOptions.map((n) => (
                      <option key={n.id_nilaitahfidz} value={n.id_nilaitahfidz}>
                        {n.nilaitahfidz} (Bobot: {n.bobot})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Apa yang sudah berjalan dengan baik
                  </label>
                  <textarea
                    value={formGood}
                    onChange={(e) => setFormGood(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Tulis feedback positif..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Apa yang harus ditingkatkan
                  </label>
                  <textarea
                    value={formImprove}
                    onChange={(e) => setFormImprove(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Tulis area yang perlu ditingkatkan..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-blue-500" /> Apa yang harus dilakukan
                  </label>
                  <textarea
                    value={formTodo}
                    onChange={(e) => setFormTodo(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Tulis aksi yang harus dilakukan..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleDeleteReview(selectedReview.id_review)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                  <div className="flex-1" />
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Batal
                  </button>
                  <button
                    onClick={handleAssessReview}
                    disabled={saving || formNilaiId < 1}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan Penilaian
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Modal */}
        {selectedPorto && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Portofolio: {selectedPorto.nama_portofolio}</h2>
                  <button onClick={closeModal} className="text-white/80 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Info */}
                <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
                  <span>📂 {selectedPorto.nama_konsentrasi}</span>
                  {selectedPorto.klien && <span>👤 {selectedPorto.klien}</span>}
                  {selectedPorto.techstack && <span>🛠 {selectedPorto.techstack}</span>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                  <div 
                    className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border"
                    dangerouslySetInnerHTML={{ __html: selectedPorto.deskripsi }}
                  />
                </div>

                {/* Demo Link */}
                {selectedPorto.demo_link && (
                  <a href={selectedPorto.demo_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                    <ExternalLink className="w-4 h-4" /> Lihat Demo
                  </a>
                )}

                <hr />

                {/* Assessment Form with Nilai Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nilai</label>
                  <select
                    value={formNilaiId}
                    onChange={(e) => setFormNilaiId(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value={0}>-- Pilih Nilai --</option>
                    {nilaiOptions.map((n) => (
                      <option key={n.id_nilaitahfidz} value={n.id_nilaitahfidz}>
                        {n.nilaitahfidz} (Bobot: {n.bobot})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Apa yang sudah berjalan dengan baik
                  </label>
                  <textarea
                    value={formGood}
                    onChange={(e) => setFormGood(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Tulis feedback positif..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Apa yang harus ditingkatkan
                  </label>
                  <textarea
                    value={formImprove}
                    onChange={(e) => setFormImprove(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Tulis area yang perlu ditingkatkan..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-blue-500" /> Apa yang harus dilakukan
                  </label>
                  <textarea
                    value={formTodo}
                    onChange={(e) => setFormTodo(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Tulis aksi yang harus dilakukan..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleDeletePorto(selectedPorto.id_portofolio)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                  <div className="flex-1" />
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Batal
                  </button>
                  <button
                    onClick={handleAssessPorto}
                    disabled={saving || formNilaiId < 1}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan Penilaian
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Santri Saya</h1>
          <p className="text-gray-600">Santri yang Anda mentoring berdasarkan konsentrasi</p>
        </div>
        <Link to="/" className="text-sm text-blue-600 hover:underline">← Dashboard</Link>
      </div>

      {santriList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Santri</h3>
          <p className="text-gray-500">Pastikan konsentrasi sudah di-assign di menu Mentor Management</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Santri</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Konsentrasi</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">Review</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">Portofolio</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {santriList.map((santri) => (
                <tr key={santri.id_santri} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={getStudentPhotoUrl(santri.foto_santri)} 
                        alt={santri.nama_santri}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{santri.nama_santri}</div>
                        <div className="text-xs text-gray-500">Angkatan {santri.angkatan}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {santri.konsentrasi_nama}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                      santri.review_count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <FileText className="w-3 h-3" /> {santri.review_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                      santri.portofolio_count > 0 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Briefcase className="w-3 h-3" /> {santri.portofolio_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => fetchSantriDetail(santri.id_santri)}
                      disabled={loadingDetail}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loadingDetail ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
