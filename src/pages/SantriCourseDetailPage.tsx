import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { parseVideoUrl } from '../utils/videoEmbed';
import { 
  ArrowLeft, BookOpen, Clock, CheckCircle, 
  Play, FileText, Music, Download, ExternalLink, Target,
  Award, Video, Briefcase,
  FileQuestion, Send, AlertCircle, CheckCircle2, Zap, Lock as LockIcon
} from 'lucide-react';

interface Materi {
  id_materi: number;
  judul: string;
  konten: string;
  video_url: string | null;
  full_audio_url: string | null;
  full_pdf_url: string | null;
  full_file_url: string | null;
  durasi_menit: number;
  urutan: number;
  section_id: number | null;
  completed: number;
}

interface Submission {
  id_submission: number;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  nilai: number | null;
  catatan_mentor: string | null;
  reviewed_at: string | null;
  review?: { judul_review: string; video_link: string };
  portofolio?: { nama_portofolio: string; demo_link: string };
}

interface Evaluasi {
  id_quiz: number;
  judul: string;
  tipe_evaluasi: 'quiz' | 'review' | 'portofolio';
  deskripsi: string;
  tugas_deskripsi: string | null;
  tugas_kriteria: string | null;
  durasi_menit: number;
  passing_score: number;
  max_attempts: number;
  soal_count?: number;
  attempts_count?: number;
  submissions_count?: number;
  best_score: number;
  passed: boolean;
  attempts?: any[];
  submissions?: Submission[];
}

interface Review {
  id_review: number;
  judul_review: string;
  video_link: string;
  deskripsi: string;
}

interface Portofolio {
  id_portofolio: number;
  nama_portofolio: string;
  demo_link: string;
  deskripsi: string;
}

interface Course {
  id_course: number;
  judul: string;
  deskripsi: string;
  thumbnail_url: string | null;
  durasi_menit: number;
  nama_konsentrasi?: string;
  roadmap_info?: {
    topic_id: number;
    topic_nama: string;
    section_nama: string;
    roadmap_id: number;
    roadmap_nama: string;
  };
}

interface Enrollment {
  status: string;
  progress_percent: number;
  enrolled_at: string;
}

const SantriCourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [evaluasiList, setEvaluasiList] = useState<Evaluasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMateri, setSelectedMateri] = useState<Materi | null>(null);
  const [completingMateri, setCompletingMateri] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  
  // Submit evaluasi state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedEvaluasi, setSelectedEvaluasi] = useState<Evaluasi | null>(null);
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [portofolioList, setPortofolioList] = useState<Portofolio[]>([]);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [selectedPortofolioId, setSelectedPortofolioId] = useState<number | null>(null);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.santri_id && courseId) {
      fetchCourse();
    }
  }, [user?.santri_id, courseId]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/santri-feature/lms/${user?.santri_id}/courses/${courseId}`);
      const data = res.data || res;
      setCourse(data.course);
      setEnrollment(data.enrollment);
      setMateriList(data.materi || []);
      setEvaluasiList(data.evaluasi || data.quiz || []);
      
      if (data.materi?.length > 0 && !selectedMateri) {
        setSelectedMateri(data.materi[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post(`/santri-feature/lms/${user?.santri_id}/courses/${courseId}/enroll`);
      await fetchCourse();
    } catch (err) {
      console.error(err);
      alert('Gagal enroll ke course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleCompleteMateri = async (materiId: number) => {
    setCompletingMateri(true);
    try {
      await api.post(`/santri-feature/lms/${user?.santri_id}/materi/${materiId}/complete`);
      await fetchCourse();
      
      const currentIndex = materiList.findIndex(m => m.id_materi === materiId);
      if (currentIndex < materiList.length - 1) {
        setSelectedMateri(materiList[currentIndex + 1]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCompletingMateri(false);
    }
  };

  const openSubmitModal = async (evaluasi: Evaluasi) => {
    setSelectedEvaluasi(evaluasi);
    setSelectedReviewId(null);
    setSelectedPortofolioId(null);
    setCatatan('');
    
    try {
      if (evaluasi.tipe_evaluasi === 'review') {
        const res = await api.get(`/santri-feature/lms/${user?.santri_id}/reviews`);
        setReviewList(res.data || []);
      } else if (evaluasi.tipe_evaluasi === 'portofolio') {
        const res = await api.get(`/santri-feature/lms/${user?.santri_id}/portofolios`);
        setPortofolioList(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
    
    setShowSubmitModal(true);
  };

  const handleSubmitEvaluasi = async () => {
    if (!selectedEvaluasi) return;
    
    setSubmitting(true);
    try {
      const payload: any = { catatan_santri: catatan };
      
      if (selectedEvaluasi.tipe_evaluasi === 'review') {
        if (!selectedReviewId) {
          alert('Pilih review yang akan disubmit');
          return;
        }
        payload.review_id = selectedReviewId;
      } else if (selectedEvaluasi.tipe_evaluasi === 'portofolio') {
        if (!selectedPortofolioId) {
          alert('Pilih portofolio yang akan disubmit');
          return;
        }
        payload.portofolio_id = selectedPortofolioId;
      }
      
      await api.post(`/santri-feature/lms/${user?.santri_id}/evaluasi/${selectedEvaluasi.id_quiz}/submit`, payload);
      alert('Evaluasi berhasil disubmit! Menunggu review dari mentor.');
      setShowSubmitModal(false);
      await fetchCourse();
    } catch (err: any) {
      alert(err.message || 'Gagal submit evaluasi');
    } finally {
      setSubmitting(false);
    }
  };

  const completedCount = materiList.filter(m => m.completed).length;
  const totalMateri = materiList.length;

  const getMateriIcon = (materi: Materi) => {
    if (materi.video_url) return <Play className="w-4 h-4" />;
    if (materi.full_pdf_url) return <FileText className="w-4 h-4" />;
    if (materi.full_audio_url) return <Music className="w-4 h-4" />;
    return <BookOpen className="w-4 h-4" />;
  };

  const getEvaluasiIcon = (tipe: string) => {
    switch (tipe) {
      case 'quiz': return <FileQuestion className="w-5 h-5" />;
      case 'review': return <Video className="w-5 h-5" />;
      case 'portofolio': return <Briefcase className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const getEvaluasiColor = (tipe: string) => {
    switch (tipe) {
      case 'quiz': return 'purple';
      case 'review': return 'blue';
      case 'portofolio': return 'emerald';
      default: return 'purple';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Menunggu Review</span>;
      case 'approved': return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Disetujui</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">Ditolak</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6 shadow-xl"></div>
          <p className="text-gray-500 font-bold text-lg animate-pulse">Menyiapkan materi terbaik...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-[2rem] p-12 max-w-md shadow-2xl border border-gray-100">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LockIcon className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Akses Dibatasi</h2>
          <p className="text-gray-500 mb-8 font-medium">Maaf, materi ini belum tersedia atau Anda tidak memiliki akses ke course ini.</p>
          <Link to="/santri/lms" className="inline-flex items-center gap-3 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold transition shadow-xl">
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link to="/santri/lms" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition font-bold uppercase tracking-widest text-xs">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Learning Center
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {course.nama_konsentrasi && (
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                    {course.nama_konsentrasi}
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-5xl font-black text-gray-900 mb-3 tracking-tighter">{course.judul}</h1>
              <p className="text-gray-600 font-semibold leading-relaxed max-w-2xl">Pelajari materi di bawah ini dengan seksama untuk menyelesaikan course dan meraih sertifikat.</p>
            </div>

            {/* Progress/Enroll Card */}
            <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-8 lg:w-96 shadow-xl shadow-gray-200/50">
              {enrollment ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 font-black text-xs uppercase tracking-widest">Your Progress</span>
                    <span className="text-4xl font-black text-primary tracking-tighter">{enrollment.progress_percent}%</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-8 p-1">
                    <div className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full transition-all duration-1000 shadow-lg shadow-primary/30" style={{ width: `${enrollment.progress_percent}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-50 p-3 rounded-2xl">
                      <div className="text-2xl font-black text-gray-900">{completedCount}</div>
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Done</div>
                    </div>
                    <div className="p-3">
                      <div className="text-2xl font-black text-gray-900">{totalMateri}</div>
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Materi</div>
                    </div>
                    <div className="p-3">
                      <div className="text-2xl font-black text-gray-900">{evaluasiList.length}</div>
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Quiz</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-gray-600 mb-6 font-bold">Tekan tombol di bawah untuk bergabung</p>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-5 rounded-2xl font-black text-lg transition disabled:opacity-50 shadow-2xl shadow-primary/40 active:scale-95"
                  >
                    {enrolling ? 'Enrolling...' : 'Mulai Belajar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Article Section (Course Description) */}
        {course.deskripsi && (
          <div className="bg-white rounded-[2.5rem] p-10 lg:p-16 mb-12 shadow-2xl overflow-hidden border border-gray-100">
            <div className="flex items-center gap-4 mb-10 border-b border-gray-50 pb-8">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner">
                <Zap className="w-8 h-8 fill-purple-600/20" />
              </div>
              <div>
                <span className="font-black text-2xl text-gray-900 block tracking-tight">Overview Modul</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Materi Utama Pelajaran</span>
              </div>
            </div>
            <article className="prose prose-slate prose-xl max-w-none 
              prose-headings:text-black prose-headings:font-black
              prose-p:text-gray-900 prose-p:leading-loose
              prose-li:text-gray-700 prose-strong:text-black 
              prose-a:text-purple-600 hover:prose-a:text-purple-700">
              <div dangerouslySetInnerHTML={{ __html: course.deskripsi }} />
            </article>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            {/* Materi List */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Daftar Materi
                  <span className="ml-auto text-xs bg-white px-2 py-1 rounded-full border border-gray-100 text-gray-500">{completedCount}/{totalMateri}</span>
                </h2>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {materiList.map((materi, idx) => (
                  <button
                    key={materi.id_materi}
                    onClick={() => setSelectedMateri(materi)}
                    className={`w-full text-left p-5 flex items-start gap-4 transition-all border-b border-gray-50 ${
                      selectedMateri?.id_materi === materi.id_materi 
                        ? 'bg-primary/5 border-l-4 border-l-primary' 
                        : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                      materi.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : selectedMateri?.id_materi === materi.id_materi
                          ? 'bg-white border-primary text-primary'
                          : 'bg-white border-gray-200 text-gray-400'
                    }`}>
                      {materi.completed ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-bold">{idx + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold leading-tight truncate ${
                        selectedMateri?.id_materi === materi.id_materi ? 'text-primary' : 'text-gray-800'
                      }`}>{materi.judul}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600 font-semibold">
                        {getMateriIcon(materi)}
                        <span>{materi.durasi_menit} menit</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Evaluasi List */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Evaluasi
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {evaluasiList.map(evaluasi => {
                  const color = getEvaluasiColor(evaluasi.tipe_evaluasi);
                  const canSubmit = evaluasi.tipe_evaluasi !== 'quiz' && 
                    (evaluasi.submissions_count || 0) < evaluasi.max_attempts && 
                    !evaluasi.passed;
                  
                  return (
                    <div key={evaluasi.id_quiz} className={`rounded-2xl p-4 border transition-all ${
                      evaluasi.passed 
                        ? 'bg-green-50 border-green-100' 
                        : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          evaluasi.passed ? 'bg-green-500 text-white shadow-lg' : `bg-${color}-100 text-${color}-600`
                        }`}>
                          {getEvaluasiIcon(evaluasi.tipe_evaluasi)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              evaluasi.tipe_evaluasi === 'quiz' ? 'bg-purple-100 text-purple-600' :
                              evaluasi.tipe_evaluasi === 'review' ? 'bg-blue-100 text-blue-600' :
                              'bg-emerald-100 text-emerald-600'
                            }`}>
                              {evaluasi.tipe_evaluasi}
                            </span>
                            {evaluasi.passed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          </div>
                          <h4 className={`font-bold mt-2 leading-tight ${evaluasi.passed ? 'text-green-900' : 'text-gray-900'}`}>
                            {evaluasi.judul}
                          </h4>
                          <div className="flex items-center gap-3 mt-2.5 text-[11px] font-bold text-gray-400">
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              Min. {evaluasi.passing_score}%
                            </span>
                            {evaluasi.best_score > 0 && (
                              <span className="text-yellow-600">Best: {evaluasi.best_score}%</span>
                            )}
                          </div>
                          
                          {/* Action Button */}
                          <div className="mt-4">
                            {evaluasi.tipe_evaluasi === 'quiz' ? (
                              <Link
                                to={`/santri/lms/quiz/${evaluasi.id_quiz}`}
                                className={`inline-flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl transition shadow-md w-full justify-center ${
                                  evaluasi.passed ? 'bg-white text-green-600 border border-green-200 shadow-none' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200'
                                }`}
                              >
                                <Play className="w-3.5 h-3.5" />
                                {evaluasi.passed ? 'Lihat Hasil' : 'Kerjakan Quiz'}
                              </Link>
                            ) : canSubmit ? (
                              <button
                                onClick={() => openSubmitModal(evaluasi)}
                                className={`inline-flex items-center gap-2 text-white text-xs font-black px-4 py-3 rounded-xl transition shadow-md w-full justify-center ${
                                  evaluasi.tipe_evaluasi === 'review' 
                                    ? 'bg-primary hover:bg-primary-dark shadow-primary/20' 
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                }`}
                              >
                                <Send className="w-3.5 h-3.5" />
                                Submit {evaluasi.tipe_evaluasi}
                              </button>
                            ) : evaluasi.passed ? (
                              <div className="text-green-600 text-xs font-black flex items-center gap-1 justify-center bg-white p-2 rounded-xl">
                                <Award className="w-4 h-4" /> SUDAH LULUS
                              </div>
                            ) : (
                              <span className="text-yellow-600 text-[10px] font-black uppercase text-center block bg-yellow-50 p-2 rounded-xl">
                                ⏳ Menunggu Penilaian
                              </span>
                            )}
                          </div>

                          {/* Submissions */}
                          {evaluasi.submissions && evaluasi.submissions.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {evaluasi.submissions.map(sub => (
                                <div key={sub.id_submission} className="bg-gray-50 rounded-xl p-3 text-[11px] border border-gray-100">
                                  <div className="flex items-center justify-between font-bold mb-1.5">
                                    {getStatusBadge(sub.status)}
                                    {sub.nilai !== null && (
                                      <span className="text-gray-900">Skor: {sub.nilai}</span>
                                    )}
                                  </div>
                                  {sub.catatan_mentor && (
                                    <p className="text-gray-500 leading-relaxed italic border-t border-gray-100 pt-1.5 mt-1.5">{sub.catatan_mentor}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {evaluasiList.length === 0 && (
                  <div className="p-10 text-center">
                    <Award className="w-14 h-14 mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400 font-bold text-sm leading-tight">Belum ada evaluasi untuk kursus ini.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 xl:col-span-9">
            {selectedMateri ? (
              <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 flex flex-col h-full">
                {/* Colored Header for Title Only */}
                <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-8 lg:p-12 text-white">
                  <h2 className="text-3xl lg:text-4xl font-black mb-4 leading-tight">{selectedMateri.judul}</h2>
                  <div className="flex items-center gap-4 text-sm font-semibold opacity-90">
                    <span className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
                      <Clock className="w-4 h-4" />
                      {selectedMateri.durasi_menit} menit
                    </span>
                    {selectedMateri.completed ? (
                      <span className="flex items-center gap-2 bg-green-400/30 text-green-100 px-4 py-1.5 rounded-full backdrop-blur-sm border border-green-400/20">
                        <CheckCircle className="w-4 h-4" />
                        Selesai dipelajari
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                        <Play className="w-4 h-4 text-purple-200" />
                        Sedang Berlangsung
                      </span>
                    )}
                  </div>
                </div>

                {/* Full White Body Content */}
                <div className="bg-white flex-1 p-8 lg:p-14 space-y-12">
                  {/* Video Section */}
                  {selectedMateri.video_url && (
                    <div className="mb-12">
                      {(() => {
                        const videoInfo = parseVideoUrl(selectedMateri.video_url || '');
                        if (videoInfo.embedUrl) {
                          return (
                            <div className="aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl ring-4 ring-gray-50">
                              <iframe src={videoInfo.embedUrl} className="w-full h-full" allowFullScreen />
                            </div>
                          );
                        }
                        return (
                          <a href={selectedMateri.video_url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold bg-purple-50 p-4 rounded-xl border border-purple-100 transition">
                            <ExternalLink className="w-5 h-5" />
                            Buka Video Pembelajaran
                          </a>
                        );
                      })()}
                    </div>
                  )}

                  {/* PDF */}
                  {selectedMateri.full_pdf_url && (
                    <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-lg">
                      <iframe src={selectedMateri.full_pdf_url} className="w-full h-[600px] bg-white" />
                    </div>
                  )}

                  {/* Audio */}
                  {selectedMateri.full_audio_url && (
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <audio controls className="w-full">
                        <source src={selectedMateri.full_audio_url} />
                      </audio>
                    </div>
                  )}

                  {/* Content */}
                  {selectedMateri.konten && (
                    <article className="prose prose-slate prose-lg max-w-none 
                      prose-headings:text-black prose-headings:font-black
                      prose-p:text-gray-900 prose-p:leading-loose
                      prose-li:text-gray-900 prose-strong:text-purple-700 
                      prose-a:text-purple-600 hover:prose-a:text-purple-700">
                      <div dangerouslySetInnerHTML={{ __html: selectedMateri.konten }} />
                    </article>
                  )}

                  {/* File Download */}
                  {selectedMateri.full_file_url && (
                    <div className="pt-6 border-t border-gray-50">
                      <a href={selectedMateri.full_file_url} download className="inline-flex items-center gap-3 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold transition shadow-xl hover:scale-[1.02]">
                        <Download className="w-5 h-5" />
                        Download Materi Tambahan
                      </a>
                    </div>
                  )}

                  {/* Complete Button */}
                  {enrollment && !selectedMateri.completed && (
                    <div className="pt-10">
                      <button
                        onClick={() => handleCompleteMateri(selectedMateri.id_materi)}
                        disabled={completingMateri}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-5 rounded-2xl font-black text-lg transition disabled:opacity-50 shadow-2xl hover:shadow-purple-500/20"
                      >
                        {completingMateri ? 'Menyimpan Progres...' : 'Selesai Pelajari & Lanjut'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-8">
                  <BookOpen className="w-12 h-12 text-gray-200" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Siap Belajar?</h3>
                <p className="text-gray-500 font-medium max-w-xs mx-auto">Klik salah satu daftar materi di sebelah kiri untuk mulai meningkatkan skill Anda.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && selectedEvaluasi && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">
                Submit {selectedEvaluasi.tipe_evaluasi === 'review' ? 'Review' : 'Portofolio'}
              </h2>
              <p className="text-white/60 text-sm mt-1">{selectedEvaluasi.judul}</p>
            </div>

            <div className="p-5 space-y-4">
              {/* Tugas Description */}
              {selectedEvaluasi.tugas_deskripsi && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Deskripsi Tugas:</h4>
                  <div className="text-white/70 text-sm prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: selectedEvaluasi.tugas_deskripsi }} />
                </div>
              )}

              {/* Select Review/Portofolio */}
              {selectedEvaluasi.tipe_evaluasi === 'review' ? (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Pilih Review</label>
                  {reviewList.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {reviewList.map(review => (
                        <label
                          key={review.id_review}
                          className={`block p-3 rounded-lg border cursor-pointer transition ${
                            selectedReviewId === review.id_review
                              ? 'border-primary bg-primary-light/20'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name="review"
                            value={review.id_review}
                            checked={selectedReviewId === review.id_review}
                            onChange={() => setSelectedReviewId(review.id_review)}
                            className="sr-only"
                          />
                          <p className="font-medium text-white">{review.judul_review}</p>
                          <p className="text-xs text-white/50 mt-1 truncate">{review.video_link}</p>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                      <p className="text-white/70">Belum ada review.</p>
                      <Link to="/santri/review" className="text-primary-light hover:underline text-sm">
                        Buat review dulu
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Pilih Portofolio</label>
                  {portofolioList.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {portofolioList.map(porto => (
                        <label
                          key={porto.id_portofolio}
                          className={`block p-3 rounded-lg border cursor-pointer transition ${
                            selectedPortofolioId === porto.id_portofolio
                              ? 'border-emerald-500 bg-emerald-500/20'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name="portofolio"
                            value={porto.id_portofolio}
                            checked={selectedPortofolioId === porto.id_portofolio}
                            onChange={() => setSelectedPortofolioId(porto.id_portofolio)}
                            className="sr-only"
                          />
                          <p className="font-medium text-white">{porto.nama_portofolio}</p>
                          <p className="text-xs text-white/50 mt-1 truncate">{porto.demo_link}</p>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                      <p className="text-white/70">Belum ada portofolio.</p>
                      <Link to="/santri/portfolio" className="text-emerald-400 hover:underline text-sm">
                        Buat portofolio dulu
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Catatan */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Catatan (opsional)</label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40"
                  rows={3}
                  placeholder="Tambahkan catatan untuk mentor..."
                />
              </div>
            </div>

            <div className="p-5 border-t border-white/10 flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 border border-white/20 text-white rounded-lg py-2.5 font-medium hover:bg-white/10 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitEvaluasi}
                disabled={submitting || (selectedEvaluasi.tipe_evaluasi === 'review' && !selectedReviewId) || (selectedEvaluasi.tipe_evaluasi === 'portofolio' && !selectedPortofolioId)}
                className={`flex-1 text-white rounded-lg py-2.5 font-medium transition disabled:opacity-50 ${
                  selectedEvaluasi.tipe_evaluasi === 'review'
                    ? 'bg-primary hover:bg-primary-dark'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SantriCourseDetailPage;
