import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';
import { 
  ArrowLeft, Plus, Edit2, Trash2, FileQuestion, Clock, 
  Target, RefreshCw, ChevronRight, Award, Video, Briefcase,
  ClipboardList, CheckCircle, BookOpen
} from 'lucide-react';

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
  soal_count: number;
}

interface Course {
  id_course: number;
  judul: string;
  deskripsi: string;
  status: string;
  durasi_menit: number;
  materi_count: number;
  quiz_count: number;
}

const TIPE_EVALUASI = [
  { value: 'quiz', label: 'Quiz', icon: FileQuestion, color: 'purple', desc: 'Soal pilihan ganda/benar-salah' },
  { value: 'review', label: 'Review', icon: Video, color: 'blue', desc: 'Tugas video YouTube' },
  { value: 'portofolio', label: 'Portofolio', icon: Briefcase, color: 'emerald', desc: 'Tugas studi kasus' }
];

const LmsCourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [evaluasiList, setEvaluasiList] = useState<Evaluasi[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingEvaluasi, setEditingEvaluasi] = useState<Evaluasi | null>(null);
  const [form, setForm] = useState({
    judul: '',
    tipe_evaluasi: 'quiz' as 'quiz' | 'review' | 'portofolio',
    deskripsi: '',
    tugas_deskripsi: '',
    tugas_kriteria: '',
    durasi_menit: 30,
    passing_score: 70,
    max_attempts: 3
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/lms/courses/${id}`);
      const course = res.data || res;
      setCourse(course);
      setEvaluasiList(course.quiz || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (evaluasi?: Evaluasi) => {
    if (evaluasi) {
      setEditingEvaluasi(evaluasi);
      setForm({
        judul: evaluasi.judul,
        tipe_evaluasi: evaluasi.tipe_evaluasi || 'quiz',
        deskripsi: evaluasi.deskripsi || '',
        tugas_deskripsi: evaluasi.tugas_deskripsi || '',
        tugas_kriteria: evaluasi.tugas_kriteria || '',
        durasi_menit: evaluasi.durasi_menit,
        passing_score: evaluasi.passing_score,
        max_attempts: evaluasi.max_attempts
      });
    } else {
      setEditingEvaluasi(null);
      setForm({
        judul: '',
        tipe_evaluasi: 'quiz',
        deskripsi: '',
        tugas_deskripsi: '',
        tugas_kriteria: '',
        durasi_menit: 30,
        passing_score: 70,
        max_attempts: 3
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvaluasi) {
        await api.put(`/lms/courses/${id}/quiz/${editingEvaluasi.id_quiz}`, form);
      } else {
        await api.post(`/lms/courses/${id}/quiz`, form);
      }
      setShowModal(false);
      fetchCourse();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan evaluasi');
    }
  };

  const handleDelete = async (evaluasiId: number) => {
    if (!confirm('Yakin hapus evaluasi ini?')) return;
    try {
      await api.delete(`/lms/courses/${id}/quiz/${evaluasiId}`);
      fetchCourse();
    } catch (err) {
      console.error(err);
    }
  };

  const getTipeConfig = (tipe: string) => {
    return TIPE_EVALUASI.find(t => t.value === tipe) || TIPE_EVALUASI[0];
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; gradient: string }> = {
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', gradient: 'from-purple-500 to-indigo-500' },
      blue: { bg: 'bg-primary/10', text: 'text-primary', gradient: 'from-blue-500 to-cyan-500' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-500' }
    };
    return colors[color] || colors.purple;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="p-6 text-center text-gray-500">Course tidak ditemukan</div>;
  }

  const quizCount = evaluasiList.filter(e => e.tipe_evaluasi === 'quiz').length;
  const reviewCount = evaluasiList.filter(e => e.tipe_evaluasi === 'review').length;
  const portofolioCount = evaluasiList.filter(e => e.tipe_evaluasi === 'portofolio').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/lms/courses" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Courses
        </Link>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.judul}</h1>
            <p className="text-gray-500 mt-1 text-sm">Draft/Published status, materi, dan evaluasi course ini</p>
          </div>
          <Link 
            to={`/lms/courses/${id}/edit`}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-dark transition shadow-md"
          >
            <Edit2 className="w-4 h-4" />
            Edit Course
          </Link>
        </div>
      </div>
        
      {/* Course Detail / Article Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Main Content (Article) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-10">
            <div className="p-10 lg:p-14">
              <div className="flex items-center gap-3 text-primary mb-8 border-b border-gray-50 pb-6">
                < BookOpen className="w-6 h-6" />
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Materi Kursus Utama</span>
              </div>
              <article className="prose prose-slate prose-lg max-w-none 
                prose-headings:text-black prose-headings:font-black
                prose-p:text-black prose-p:leading-relaxed
                prose-li:text-black prose-strong:text-black
                prose-a:text-primary hover:prose-a:text-primary-dark">
                <div dangerouslySetInnerHTML={{ __html: course.deskripsi }} />
              </article>
            </div>
          </div>
        </div>

        {/* Sidebar Mini Info */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-lg">📊</span>
              Informasi Course
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Durasi</span>
                <span className="font-medium text-gray-800">{course.durasi_menit} menit</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Materi</span>
                <span className="font-medium text-gray-800">{course.materi_count} materi</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2"><Award className="w-4 h-4" /> Evaluasi</span>
                <span className="font-medium text-gray-800">{evaluasiList.length} total</span>
              </div>
              <div className="pt-4 border-t">
                <span className="text-xs text-gray-400 block mb-2 uppercase tracking-tight">Status Pengelolaan</span>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${course.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  <span className="text-sm font-medium text-gray-700 capitalize">{course.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileQuestion className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{quizCount}</p>
              <p className="text-sm text-purple-600">Quiz</p>
            </div>
          </div>
        </div>
        <div className="bg-primary/5 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-dark">{reviewCount}</p>
              <p className="text-sm text-primary">Review</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{portofolioCount}</p>
              <p className="text-sm text-emerald-600">Portofolio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluasi Section */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Kelola Evaluasi
          </h2>
          <button 
            onClick={() => openModal()} 
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Evaluasi
          </button>
        </div>
        
        <div className="divide-y">
          {evaluasiList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Belum Ada Evaluasi</h3>
              <p className="text-gray-500 mb-4">Buat evaluasi untuk menguji pemahaman santri</p>
              <button 
                onClick={() => openModal()} 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
              >
                Buat Evaluasi Pertama
              </button>
            </div>
          ) : (
            evaluasiList.map(evaluasi => {
              const tipeConfig = getTipeConfig(evaluasi.tipe_evaluasi);
              const colors = getColorClasses(tipeConfig.color);
              const Icon = tipeConfig.icon;
              
              return (
                <div key={evaluasi.id_quiz} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{evaluasi.judul}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                          {tipeConfig.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {evaluasi.tipe_evaluasi === 'quiz' && (
                          <>
                            <span className="flex items-center gap-1">
                              <FileQuestion className="w-4 h-4" />
                              {evaluasi.soal_count} soal
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {evaluasi.durasi_menit} menit
                            </span>
                          </>
                        )}
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Min. {evaluasi.passing_score}%
                        </span>
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-4 h-4" />
                          Max {evaluasi.max_attempts}x
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {evaluasi.tipe_evaluasi === 'quiz' && (
                        <Link 
                          to={`/lms/quiz/${evaluasi.id_quiz}/soal`} 
                          className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
                        >
                          Kelola Soal
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                      <button 
                        onClick={() => openModal(evaluasi)} 
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(evaluasi.id_quiz)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingEvaluasi ? 'Edit Evaluasi' : 'Tambah Evaluasi Baru'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Tipe Evaluasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Evaluasi *</label>
                <div className="grid grid-cols-3 gap-3">
                  {TIPE_EVALUASI.map(tipe => {
                    const Icon = tipe.icon;
                    const colors = getColorClasses(tipe.color);
                    const isSelected = form.tipe_evaluasi === tipe.value;
                    
                    return (
                      <button
                        key={tipe.value}
                        type="button"
                        onClick={() => setForm({ ...form, tipe_evaluasi: tipe.value as any })}
                        className={`p-4 rounded-xl border-2 text-left transition ${
                          isSelected 
                            ? `border-${tipe.color}-500 bg-${tipe.color}-50` 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                          isSelected ? `bg-gradient-to-br ${colors.gradient} text-white` : colors.bg
                        }`}>
                          <Icon className={`w-5 h-5 ${isSelected ? '' : colors.text}`} />
                        </div>
                        <p className="font-medium text-gray-800">{tipe.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{tipe.desc}</p>
                        {isSelected && (
                          <CheckCircle className={`w-5 h-5 ${colors.text} absolute top-2 right-2`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Judul */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
                <input 
                  type="text" 
                  value={form.judul} 
                  onChange={(e) => setForm({ ...form, judul: e.target.value })} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  placeholder={
                    form.tipe_evaluasi === 'quiz' ? 'Contoh: Quiz Akhir Modul 1' :
                    form.tipe_evaluasi === 'review' ? 'Contoh: Review Video - Penjelasan Konsep OOP' :
                    'Contoh: Portofolio - Membuat Website Company Profile'
                  }
                  required 
                />
              </div>
              
              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea 
                  value={form.deskripsi} 
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  rows={2}
                  placeholder="Deskripsi singkat tentang evaluasi ini"
                />
              </div>

              {/* Tugas Deskripsi - untuk Review & Portofolio */}
              {(form.tipe_evaluasi === 'review' || form.tipe_evaluasi === 'portofolio') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {form.tipe_evaluasi === 'review' ? 'Deskripsi Tugas Video' : 'Deskripsi Studi Kasus'} *
                    </label>
                    <RichTextEditor
                      value={form.tugas_deskripsi}
                      onChange={(v) => setForm({ ...form, tugas_deskripsi: v })}
                      placeholder={
                        form.tipe_evaluasi === 'review' 
                          ? 'Jelaskan apa yang harus dijelaskan santri dalam video...'
                          : 'Jelaskan studi kasus yang harus dikerjakan santri...'
                      }
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kriteria Penilaian</label>
                    <RichTextEditor
                      value={form.tugas_kriteria}
                      onChange={(v) => setForm({ ...form, tugas_kriteria: v })}
                      placeholder="Jelaskan kriteria penilaian untuk tugas ini..."
                    />
                  </div>
                </>
              )}
              
              {/* Settings */}
              <div className="grid grid-cols-3 gap-4">
                {form.tipe_evaluasi === 'quiz' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (menit)</label>
                    <input 
                      type="number" 
                      min="1"
                      value={form.durasi_menit} 
                      onChange={(e) => setForm({ ...form, durasi_menit: parseInt(e.target.value) || 30 })} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {form.tipe_evaluasi === 'quiz' ? 'Passing Score (%)' : 'Nilai Minimum (%)'}
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={form.passing_score} 
                    onChange={(e) => setForm({ ...form, passing_score: parseInt(e.target.value) || 70 })} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Submit</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={form.max_attempts} 
                    onChange={(e) => setForm({ ...form, max_attempts: parseInt(e.target.value) || 3 })} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 font-medium hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2.5 font-medium transition"
                >
                  {editingEvaluasi ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LmsCourseDetailPage;
