import { useState, useEffect } from 'react';
import { FileText, Plus, Loader2, ExternalLink, Video, ChevronLeft, Book, Play, Headphones, Newspaper, Edit2, Trash2, GraduationCap, Clock, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { API_URL, getHeaders } from '../../services/api';


const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link'
];

const jenisIcons: Record<string, any> = {
  buku: Book,
  video: Play,
  artikel: Newspaper,
  podcast: Headphones
};

const jenisColors: Record<string, { bg: string; text: string }> = {
  buku: { bg: 'bg-primary/10', text: 'text-primary-dark' },
  video: { bg: 'bg-red-100', text: 'text-red-700' },
  artikel: { bg: 'bg-green-100', text: 'text-green-700' },
  podcast: { bg: 'bg-purple-100', text: 'text-purple-700' }
};

const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getInstagramId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:p|reel)\/([^/?]+)/);
  return match ? match[1] : null;
};

const getThumbnail = (url: string): { type: 'youtube' | 'instagram' | null; thumbnail: string | null; id: string | null } => {
  if (!url) return { type: null, thumbnail: null, id: null };
  const ytId = getYouTubeId(url);
  if (ytId) return { type: 'youtube', thumbnail: `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`, id: ytId };
  const igId = getInstagramId(url);
  if (igId) return { type: 'instagram', thumbnail: null, id: igId };
  return { type: null, thumbnail: null, id: null };
};

interface Evaluasi {
  id_quiz: number;
  judul: string;
  deskripsi: string;
  tugas_deskripsi: string;
  nama_course: string;
  can_submit: boolean;
  submissions_count: number;
  max_attempts: number;
}

interface Review {
  id_review: number;
  jenis_review: string;
  judul_review: string;
  deskripsi: string;
  video_link: string;
  source_link: string;
  created_at: string;
  // Mentor feedback fields
  score?: number;
  score_label?: string;
  feedback_good?: string;
  feedback_improve?: string;
  feedback_todo?: string;
  assessed_at?: string;
}

export default function SantriReviewPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Review[]>([]);
  const [evaluasiList, setEvaluasiList] = useState<Evaluasi[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    jenis_review: 'buku',
    judul_review: '',
    deskripsi: '',
    video_link: '',
    source_link: '',
    evaluasi_id: '' as string | number,
    catatan_santri: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (user?.santri_id) {
      fetchData();
      fetchEvaluasi();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/santri-feature/review/${user?.santri_id}`, {
        headers: getHeaders()
      });
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluasi = async () => {
    try {
      const res = await fetch(`${API_URL}/santri-feature/evaluasi/available/${user?.santri_id}?tipe=review`, {
        headers: getHeaders()
      });
      const json = await res.json();
      setEvaluasiList(json.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ jenis_review: 'buku', judul_review: '', deskripsi: '', video_link: '', source_link: '', evaluasi_id: '', catatan_santri: '' });
    setEditingReview(null);
    setShowForm(false);
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      jenis_review: review.jenis_review,
      judul_review: review.judul_review,
      deskripsi: review.deskripsi,
      video_link: review.video_link,
      source_link: review.source_link,
      evaluasi_id: '',
      catatan_santri: ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus review ini?')) return;
    setDeleting(id);
    try {
      await fetch(`${API_URL}/santri-feature/review/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingReview 
        ? `${API_URL}/santri-feature/review/${editingReview.id_review}`
        : `${API_URL}/santri-feature/review`;
      
      await fetch(url, {
        method: editingReview ? 'PUT' : 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          ...formData,
          santri_review: user?.santri_id,
          evaluasi_id: formData.evaluasi_id || null
        })
      });
      fetchData();
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto" />
          <p className="mt-3 text-gray-500">Memuat data review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Review Saya</h1>
              <p className="text-violet-100 text-sm">Ringkasan buku, video, artikel yang dipelajari</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {['buku', 'video', 'artikel', 'podcast'].map((jenis) => {
            const Icon = jenisIcons[jenis];
            const count = data.filter(d => d.jenis_review === jenis).length;
            return (
              <div key={jenis} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xl font-bold">{count}</div>
                <div className="text-xs text-violet-100 capitalize">{jenis}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">
              {editingReview ? 'Edit Review' : 'Tambah Review Baru'}
            </h2>
            <button onClick={resetForm} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Evaluasi Dropdown */}
            {!editingReview && evaluasiList.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <label className="block text-sm font-semibold text-primary-dark mb-2">
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  Hubungkan dengan Tugas Course (Opsional)
                </label>
                <select
                  value={formData.evaluasi_id}
                  onChange={(e) => setFormData({...formData, evaluasi_id: e.target.value})}
                  className="w-full border border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">-- Tidak ada tugas --</option>
                  {evaluasiList.filter(e => e.can_submit).map((evaluasi) => (
                    <option key={evaluasi.id_quiz} value={evaluasi.id_quiz}>
                      [{evaluasi.nama_course}] {evaluasi.judul} ({evaluasi.submissions_count}/{evaluasi.max_attempts} submit)
                    </option>
                  ))}
                </select>
                {formData.evaluasi_id && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-primary-dark mb-1">Catatan untuk Mentor</label>
                    <textarea
                      value={formData.catatan_santri}
                      onChange={(e) => setFormData({...formData, catatan_santri: e.target.value})}
                      className="w-full border border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 text-sm"
                      rows={2}
                      placeholder="Catatan tambahan untuk mentor..."
                    />
                  </div>
                )}
              </div>
            )}

            {/* Jenis Review */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Review</label>
              <div className="grid grid-cols-4 gap-2">
                {['buku', 'video', 'artikel', 'podcast'].map((jenis) => {
                  const Icon = jenisIcons[jenis];
                  const colors = jenisColors[jenis];
                  const isSelected = formData.jenis_review === jenis;
                  return (
                    <button
                      key={jenis}
                      type="button"
                      onClick={() => setFormData({...formData, jenis_review: jenis})}
                      className={`p-3 rounded-xl text-sm font-medium transition-all border-2 flex flex-col items-center gap-1 ${
                        isSelected 
                          ? `${colors.bg} ${colors.text} border-current` 
                          : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="capitalize">{jenis}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Judul */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.judul_review}
                onChange={(e) => setFormData({...formData, judul_review: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Judul buku/video/artikel yang di-review"
                required
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ringkasan / Deskripsi</label>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={formData.deskripsi}
                  onChange={(value) => setFormData({...formData, deskripsi: value})}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Tuliskan ringkasan atau hal-hal yang dipelajari..."
                  className="bg-white"
                />
              </div>
            </div>

            {/* Links */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Video className="w-4 h-4 inline mr-1" />
                  Link Video Review
                </label>
                <input
                  type="url"
                  value={formData.video_link}
                  onChange={(e) => setFormData({...formData, video_link: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-violet-500"
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <ExternalLink className="w-4 h-4 inline mr-1" />
                  Link Sumber
                </label>
                <input
                  type="url"
                  value={formData.source_link}
                  onChange={(e) => setFormData({...formData, source_link: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-violet-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {submitting ? 'Menyimpan...' : (editingReview ? 'Update Review' : 'Simpan Review')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((item: Review) => {
          const Icon = jenisIcons[item.jenis_review] || FileText;
          const colors = jenisColors[item.jenis_review] || jenisColors.buku;
          const media = getThumbnail(item.video_link);
          
          return (
            <div 
              key={item.id_review} 
              className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Thumbnail */}
              {media.type === 'youtube' && media.thumbnail && (
                <a href={item.video_link} target="_blank" rel="noopener noreferrer" className="block relative group/thumb">
                  <img src={media.thumbnail} alt={item.judul_review} className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                    <div className="bg-red-600 rounded-full p-3">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Play className="w-3 h-3 fill-white" /> YouTube
                  </div>
                </a>
              )}
              
              <div className={`${colors.bg} px-4 py-2 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${colors.text}`} />
                  <span className={`text-xs font-semibold uppercase ${colors.text}`}>{item.jenis_review}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{formatDate(item.created_at)}</span>
                  {/* Edit/Delete buttons */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                      className="p-1 hover:bg-white/50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id_review); }}
                      className="p-1 hover:bg-white/50 rounded"
                      title="Hapus"
                      disabled={deleting === item.id_review}
                    >
                      {deleting === item.id_review 
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                        : <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      }
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 cursor-pointer" onClick={() => setSelectedReview(item)}>
                <h3 className="font-bold text-lg text-gray-900">{item.judul_review}</h3>
                {item.deskripsi && (
                  <div className="prose prose-sm max-w-none text-gray-600 mt-2 line-clamp-4" dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {data.length === 0 && !showForm && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">Belum ada review</h3>
          <p className="text-gray-400 mt-1">Klik "Tambah" untuk membuat review pertama Anda</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setSelectedReview(null)}>
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {(() => {
                const Icon = jenisIcons[selectedReview.jenis_review] || FileText;
                const media = getThumbnail(selectedReview.video_link);
                const gradients: Record<string, string> = {
                  buku: 'from-blue-600 to-indigo-700',
                  video: 'from-red-500 to-pink-600',
                  artikel: 'from-emerald-500 to-teal-600',
                  podcast: 'from-purple-600 to-violet-700'
                };
                const gradient = gradients[selectedReview.jenis_review] || gradients.buku;
                
                return (
                  <>
                    {media.type === 'youtube' && media.thumbnail ? (
                      <a href={selectedReview.video_link} target="_blank" rel="noopener noreferrer" className="block relative group">
                        <img src={media.thumbnail.replace('mqdefault', 'maxresdefault')} alt={selectedReview.judul_review} className="w-full h-56 object-cover" onError={(e) => { e.currentTarget.src = media.thumbnail!; }} />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                          <div className="bg-red-600 rounded-full p-4 shadow-lg transform group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 text-white fill-white" />
                          </div>
                        </div>
                      </a>
                    ) : (
                      <div className={`bg-gradient-to-r ${gradient} p-8 text-white`}>
                        <div className="flex items-center gap-4">
                          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                            <Icon className="w-10 h-10" />
                          </div>
                          <div>
                            <span className="text-white/80 text-sm font-medium uppercase tracking-wider">Review {selectedReview.jenis_review}</span>
                            <h2 className="text-2xl font-bold mt-1">{selectedReview.judul_review}</h2>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              <button onClick={() => setSelectedReview(null)} className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 overflow-y-auto max-h-[50vh]">
                {getThumbnail(selectedReview.video_link).type && (
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase px-2.5 py-1 rounded-full ${jenisColors[selectedReview.jenis_review]?.bg} ${jenisColors[selectedReview.jenis_review]?.text}`}>
                      {(() => { const Icon = jenisIcons[selectedReview.jenis_review]; return Icon ? <Icon className="w-3.5 h-3.5" /> : null; })()}
                      {selectedReview.jenis_review}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 mt-2">{selectedReview.judul_review}</h2>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4" />
                  {formatDate(selectedReview.created_at)}
                </div>
                {selectedReview.deskripsi && (
                  <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: selectedReview.deskripsi }} />
                )}
                {(selectedReview.video_link || selectedReview.source_link) && (
                  <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
                    {selectedReview.video_link && !getThumbnail(selectedReview.video_link).type && (
                      <a href={selectedReview.video_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl font-medium hover:bg-red-200 transition-colors">
                        <Video className="w-4 h-4" /> Tonton Video
                      </a>
                    )}
                    {selectedReview.source_link && (
                      <a href={selectedReview.source_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-primary/10 text-primary-dark px-4 py-2 rounded-xl font-medium hover:bg-blue-200 transition-colors">
                        <ExternalLink className="w-4 h-4" /> Lihat Sumber
                      </a>
                    )}
                  </div>
                )}

                {/* Mentor Feedback Section */}
                {selectedReview.score && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="p-1.5 bg-green-100 rounded-lg"><svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                      Feedback dari Mentor
                    </h3>
                    <div className="mb-3">
                      <span className="text-sm text-gray-500">Nilai:</span>
                      <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                        {selectedReview.score_label || `Bobot ${selectedReview.score}`}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {selectedReview.feedback_good && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">✅ Yang Sudah Baik</div>
                          <p className="text-sm text-green-800">{selectedReview.feedback_good}</p>
                        </div>
                      )}
                      {selectedReview.feedback_improve && (
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <div className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">⚠️ Yang Perlu Ditingkatkan</div>
                          <p className="text-sm text-amber-800">{selectedReview.feedback_improve}</p>
                        </div>
                      )}
                      {selectedReview.feedback_todo && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">📋 Yang Harus Dilakukan</div>
                          <p className="text-sm text-blue-800">{selectedReview.feedback_todo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ql-container { font-family: inherit; font-size: 14px; min-height: 150px; }
        .ql-editor { min-height: 150px; }
        .ql-toolbar { border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; background: #f9fafb; border-color: #e5e7eb; }
        .ql-container { border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; border-color: #e5e7eb; }
        .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; }
      `}</style>
    </div>
  );
}
