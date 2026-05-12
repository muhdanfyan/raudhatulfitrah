import { useState, useEffect } from 'react';
import { GraduationCap, Loader2, CheckCircle, XCircle, Clock, Star, ExternalLink, Video, FileText, Briefcase, MessageSquare, Eye } from 'lucide-react';
import { api } from '../services/api';


interface Course {
  id_course: number;
  nama_course: string;
  evaluasi: { id_quiz: number; judul: string; tipe_evaluasi: string }[];
  pending_count: number;
}

interface Submission {
  id_submission: number;
  quiz_id: number;
  santri_id: number;
  tipe_evaluasi: 'review' | 'portofolio';
  review_id: number | null;
  portofolio_id: number | null;
  catatan_santri: string | null;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  nilai: number | null;
  catatan_mentor: string | null;
  created_at: string;
  evaluasi_judul: string;
  passing_score: number;
  id_course: number;
  nama_course: string;
  nama_lengkap_santri: string;
  foto_santri: string | null;
  judul_review: string | null;
  jenis_review: string | null;
  review_deskripsi: string | null;
  review_video_link: string | null;
  review_source_link: string | null;
  nama_portofolio: string | null;
  portofolio_deskripsi: string | null;
  portofolio_demo_link: string | null;
  portofolio_techstack: string | null;
  portofolio_gambar_urls: string[] | null;
}

const statusColors = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  reviewed: { bg: 'bg-primary/10', text: 'text-primary-dark', icon: Eye },
  approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

export default function EvaluasiGradingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedEvaluasi, setSelectedEvaluasi] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeForm, setGradeForm] = useState({ nilai: 0, status: 'reviewed' as 'reviewed' | 'approved' | 'rejected', catatan_mentor: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [selectedCourse, selectedEvaluasi, selectedStatus]);

  const fetchCourses = async () => {
    try {
      const json: any = await api.get('/lms/evaluasi/courses');
      setCourses(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const params = new URLSearchParams();
      if (selectedCourse) params.append('course_id', String(selectedCourse));
      if (selectedEvaluasi) params.append('evaluasi_id', String(selectedEvaluasi));
      if (selectedStatus) params.append('status', selectedStatus);
      
      const json: any = await api.get(`/lms/evaluasi/grading?${params}`);
      setSubmissions(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    setSubmitting(true);
    try {
      await api.post(`/lms/evaluasi/grade/${gradingSubmission.id_submission}`, gradeForm);
      fetchSubmissions();
      fetchCourses();
      setGradingSubmission(null);
      setGradeForm({ nilai: 0, status: 'reviewed', catatan_mentor: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const totalPending = courses.reduce((sum, c) => sum + c.pending_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Penilaian Evaluasi</h1>
            <p className="text-white/80">Review dan nilai submission review/portfolio santri</p>
          </div>
        </div>
        {totalPending > 0 && (
          <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 inline-flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{totalPending} submission menunggu penilaian</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Course Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              value={selectedCourse || ''}
              onChange={(e) => { setSelectedCourse(e.target.value ? Number(e.target.value) : null); setSelectedEvaluasi(null); }}
              className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Course</option>
              {courses.map((course) => (
                <option key={course.id_course} value={course.id_course}>
                  {course.nama_course} {course.pending_count > 0 && `(${course.pending_count} pending)`}
                </option>
              ))}
            </select>
          </div>

          {/* Evaluasi Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evaluasi</label>
            <select
              value={selectedEvaluasi || ''}
              onChange={(e) => setSelectedEvaluasi(e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
              disabled={!selectedCourse}
            >
              <option value="">Semua Evaluasi</option>
              {selectedCourse && courses.find(c => c.id_course === selectedCourse)?.evaluasi.map((ev) => (
                <option key={ev.id_quiz} value={ev.id_quiz}>
                  [{ev.tipe_evaluasi}] {ev.judul}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">Daftar Submission ({submissions.length})</h2>
        </div>
        
        {loadingSubmissions ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Tidak ada submission</p>
          </div>
        ) : (
          <div className="divide-y">
            {submissions.map((sub) => {
              const StatusIcon = statusColors[sub.status]?.icon || Clock;
              return (
                <div key={sub.id_submission} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    {/* Santri Avatar */}
                    <div className="flex-shrink-0">
                      {sub.foto_santri ? (
                        <img src={`${api.getBaseUrl()}/storage/fotosantri/${sub.foto_santri}`} alt={sub.nama_lengkap_santri} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {sub.nama_lengkap_santri.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{sub.nama_lengkap_santri}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[sub.status]?.bg} ${statusColors[sub.status]?.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {sub.status}
                        </span>
                        {sub.nilai !== null && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <Star className="w-3 h-3" /> {sub.nilai}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">{sub.nama_course}</span> - {sub.evaluasi_judul}
                      </div>

                      {/* Submission Content */}
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        {sub.tipe_evaluasi === 'review' ? (
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-violet-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-gray-900">{sub.judul_review}</div>
                              <div className="text-xs text-gray-500 capitalize">{sub.jenis_review}</div>
                              {sub.review_deskripsi && (
                                <div className="text-sm text-gray-600 mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: sub.review_deskripsi }} />
                              )}
                              <div className="flex gap-3 mt-2">
                                {sub.review_video_link && (
                                  <a href={sub.review_video_link} target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 flex items-center gap-1 hover:underline">
                                    <Video className="w-3 h-3" /> Video
                                  </a>
                                )}
                                {sub.review_source_link && (
                                  <a href={sub.review_source_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                                    <ExternalLink className="w-3 h-3" /> Sumber
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <Briefcase className="w-5 h-5 text-cyan-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-gray-900">{sub.nama_portofolio}</div>
                              {sub.portofolio_techstack && (
                                <div className="text-xs text-gray-500">{sub.portofolio_techstack}</div>
                              )}
                              {sub.portofolio_deskripsi && (
                                <div className="text-sm text-gray-600 mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: sub.portofolio_deskripsi }} />
                              )}
                              {sub.portofolio_demo_link && (
                                <a href={sub.portofolio_demo_link} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-600 flex items-center gap-1 hover:underline mt-2">
                                  <ExternalLink className="w-3 h-3" /> Demo
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {sub.catatan_santri && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> Catatan santri:
                            </div>
                            <div className="text-sm text-gray-600">{sub.catatan_santri}</div>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-400 mt-2">
                        Submitted: {formatDate(sub.created_at)}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => { setGradingSubmission(sub); setGradeForm({ nilai: sub.nilai || 0, status: sub.status === 'pending' ? 'reviewed' : sub.status as any, catatan_mentor: sub.catatan_mentor || '' }); }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        {sub.status === 'pending' ? 'Nilai' : 'Edit Nilai'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setGradingSubmission(null)}>
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 rounded-t-2xl">
                <h3 className="text-lg font-bold text-white">Nilai Submission</h3>
                <p className="text-white/80 text-sm">{gradingSubmission.nama_lengkap_santri} - {gradingSubmission.evaluasi_judul}</p>
              </div>
              
              <form onSubmit={handleGrade} className="p-6 space-y-4">
                {/* Nilai */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nilai (0-100) <span className="text-gray-400 text-xs">Passing score: {gradingSubmission.passing_score}</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeForm.nilai}
                    onChange={(e) => setGradeForm({ ...gradeForm, nilai: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg p-3 text-2xl font-bold text-center focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <div className="mt-2 flex justify-center gap-2">
                    {[50, 60, 70, 80, 90, 100].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setGradeForm({ ...gradeForm, nilai: n })}
                        className={`px-3 py-1 rounded text-sm font-medium ${gradeForm.nilai === n ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['reviewed', 'approved', 'rejected'] as const).map((s) => {
                      const config = statusColors[s];
                      const Icon = config.icon;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setGradeForm({ ...gradeForm, status: s })}
                          className={`p-3 rounded-lg text-sm font-medium flex flex-col items-center gap-1 border-2 transition-all ${
                            gradeForm.status === s
                              ? `${config.bg} ${config.text} border-current`
                              : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="capitalize">{s}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Catatan Mentor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catatan / Feedback</label>
                  <textarea
                    value={gradeForm.catatan_mentor}
                    onChange={(e) => setGradeForm({ ...gradeForm, catatan_mentor: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Berikan feedback untuk santri..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setGradingSubmission(null)}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {submitting ? 'Menyimpan...' : 'Simpan Nilai'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
