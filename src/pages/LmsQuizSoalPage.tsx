import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';
import { 
  Plus, Edit2, Trash2, GripVertical, CheckCircle, XCircle, 
  HelpCircle, Award, Clock, Target, ChevronDown, ChevronUp,
  Copy, Eye, EyeOff, Save, AlertCircle
} from 'lucide-react';

interface Soal {
  id_soal: number;
  pertanyaan: string;
  tipe_soal: 'pilihan_ganda' | 'benar_salah';
  opsi_a: string;
  opsi_b: string;
  opsi_c: string | null;
  opsi_d: string | null;
  opsi_e: string | null;
  jawaban_benar: 'a' | 'b' | 'c' | 'd' | 'e';
  penjelasan: string | null;
  poin: number;
  urutan: number;
}

interface Quiz {
  id_quiz: number;
  judul: string;
  deskripsi: string;
  course_id: number;
  durasi_menit: number;
  passing_score: number;
  max_attempts: number;
  course_judul?: string;
}

const LmsQuizSoalPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSoal, setEditingSoal] = useState<Soal | null>(null);
  const [expandedSoal, setExpandedSoal] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const [form, setForm] = useState({
    pertanyaan: '',
    tipe_soal: 'pilihan_ganda' as 'pilihan_ganda' | 'benar_salah',
    opsi_a: '',
    opsi_b: '',
    opsi_c: '',
    opsi_d: '',
    opsi_e: '',
    jawaban_benar: 'a' as 'a' | 'b' | 'c' | 'd' | 'e',
    penjelasan: '',
    poin: 10
  });

  useEffect(() => {
    fetchData();
  }, [quizId]);

  const fetchData = async () => {
    try {
      // Fetch soal
      const soalRes = await api.get(`/lms/quiz/${quizId}/soal`);
      const soalData = soalRes.data || soalRes;
      setSoalList(Array.isArray(soalData) ? soalData : (soalData.data || []));
      
      // Fetch quiz info
      const quizRes = await api.get(`/lms/quiz/${quizId}`);
      const quizData = quizRes.data || quizRes;
      setQuiz(quizData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      pertanyaan: '',
      tipe_soal: 'pilihan_ganda',
      opsi_a: '',
      opsi_b: '',
      opsi_c: '',
      opsi_d: '',
      opsi_e: '',
      jawaban_benar: 'a',
      penjelasan: '',
      poin: 10
    });
  };

  const openModal = (soal?: Soal) => {
    if (soal) {
      setEditingSoal(soal);
      setForm({
        pertanyaan: soal.pertanyaan,
        tipe_soal: soal.tipe_soal || 'pilihan_ganda',
        opsi_a: soal.opsi_a,
        opsi_b: soal.opsi_b,
        opsi_c: soal.opsi_c || '',
        opsi_d: soal.opsi_d || '',
        opsi_e: soal.opsi_e || '',
        jawaban_benar: soal.jawaban_benar,
        penjelasan: soal.penjelasan || '',
        poin: soal.poin
      });
    } else {
      setEditingSoal(null);
      resetForm();
    }
    setShowModal(true);
  };

  const handleTipeSoalChange = (tipe: 'pilihan_ganda' | 'benar_salah') => {
    if (tipe === 'benar_salah') {
      setForm({
        ...form,
        tipe_soal: tipe,
        opsi_a: 'Benar',
        opsi_b: 'Salah',
        opsi_c: '',
        opsi_d: '',
        opsi_e: '',
        jawaban_benar: 'a'
      });
    } else {
      setForm({
        ...form,
        tipe_soal: tipe,
        opsi_a: '',
        opsi_b: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      ...form,
      opsi_c: form.opsi_c || null,
      opsi_d: form.opsi_d || null,
      opsi_e: form.opsi_e || null,
      penjelasan: form.penjelasan || null,
    };

    try {
      if (editingSoal) {
        await api.put(`/lms/quiz/${quizId}/soal/${editingSoal.id_soal}`, payload);
      } else {
        await api.post(`/lms/quiz/${quizId}/soal`, payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan soal: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (soalId: number) => {
    if (!confirm('Yakin hapus soal ini?')) return;
    try {
      await api.delete(`/lms/quiz/${quizId}/soal/${soalId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (soal: Soal) => {
    try {
      await api.post(`/lms/quiz/${quizId}/soal`, {
        pertanyaan: soal.pertanyaan + ' (copy)',
        tipe_soal: soal.tipe_soal || 'pilihan_ganda',
        opsi_a: soal.opsi_a,
        opsi_b: soal.opsi_b,
        opsi_c: soal.opsi_c,
        opsi_d: soal.opsi_d,
        opsi_e: soal.opsi_e,
        jawaban_benar: soal.jawaban_benar,
        penjelasan: soal.penjelasan,
        poin: soal.poin
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    
    const newList = [...soalList];
    const draggedSoal = newList[draggedItem];
    newList.splice(draggedItem, 1);
    newList.splice(index, 0, draggedSoal);
    setSoalList(newList);
    setDraggedItem(index);
  };

  const handleDragEnd = async () => {
    if (draggedItem === null) return;
    setDraggedItem(null);
    
    // Save new order to backend
    try {
      const orderData = soalList.map((soal, idx) => ({
        id_soal: soal.id_soal,
        urutan: idx + 1
      }));
      await api.put(`/lms/quiz/${quizId}/soal/reorder`, { soal: orderData });
    } catch (err) {
      console.error('Failed to save order:', err);
      fetchData(); // Refresh to get original order
    }
  };

  const totalPoin = soalList.reduce((sum, s) => sum + s.poin, 0);
  const getJawabanLabel = (jawaban: string) => jawaban.toUpperCase();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to={quiz?.course_id ? `/lms/courses/${quiz.course_id}` : '/lms/courses'} className="text-purple-600 hover:underline mb-2 inline-flex items-center gap-1">
          ← Kembali ke Course
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <HelpCircle className="w-7 h-7 text-purple-600" />
              {quiz?.judul || 'Kelola Soal Quiz'}
            </h1>
            {quiz?.deskripsi && <p className="text-gray-600 mt-1">{quiz.deskripsi}</p>}
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${showPreview ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Sembunyikan Preview' : 'Preview Mode'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-80">Total Soal</span>
          </div>
          <p className="text-3xl font-bold">{soalList.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-80">Total Poin</span>
          </div>
          <p className="text-3xl font-bold">{totalPoin}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-80">Durasi</span>
          </div>
          <p className="text-3xl font-bold">{quiz?.durasi_menit || 0}<span className="text-lg ml-1">mnt</span></p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-80">Passing Score</span>
          </div>
          <p className="text-3xl font-bold">{quiz?.passing_score || 70}<span className="text-lg ml-1">%</span></p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="text-sm text-gray-500">
          {soalList.length > 0 && (
            <span>Drag & drop untuk mengubah urutan soal</span>
          )}
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 flex items-center gap-2 shadow-lg shadow-purple-200 transition"
        >
          <Plus className="w-5 h-5" />
          Tambah Soal
        </button>
      </div>

      {/* Soal List */}
      <div className="space-y-4">
        {soalList.map((soal, idx) => (
          <div
            key={soal.id_soal}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
              draggedItem === idx ? 'border-purple-400 shadow-lg scale-[1.02]' : 'border-transparent hover:border-gray-200'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Number Badge */}
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0 shadow">
                  {idx + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Question */}
                      <div 
                        className="text-gray-800 font-medium mb-3 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: soal.pertanyaan }}
                      />
                      
                      {/* Options */}
                      <div className={`grid gap-2 ${showPreview ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {['a', 'b', 'c', 'd', 'e'].map((opt) => {
                          const opsiKey = `opsi_${opt}` as keyof Soal;
                          const opsiValue = soal[opsiKey] as string | null;
                          if (!opsiValue) return null;
                          
                          const isCorrect = soal.jawaban_benar === opt;
                          return (
                            <div
                              key={opt}
                              className={`flex items-center gap-2 p-2.5 rounded-lg text-sm transition ${
                                isCorrect 
                                  ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                                  : 'bg-gray-50 text-gray-700 border border-gray-200'
                              }`}
                            >
                              {isCorrect ? (
                                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
                              )}
                              <span className="font-medium">{opt.toUpperCase()}.</span>
                              <span className="truncate">{opsiValue}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Expandable Explanation */}
                      {soal.penjelasan && (
                        <button
                          onClick={() => setExpandedSoal(expandedSoal === soal.id_soal ? null : soal.id_soal)}
                          className="mt-3 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                          {expandedSoal === soal.id_soal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          Lihat Penjelasan
                        </button>
                      )}
                      {expandedSoal === soal.id_soal && soal.penjelasan && (
                        <div className="mt-2 p-3 bg-primary/5 rounded-lg text-sm text-primary-dark border border-blue-200">
                          <div className="font-medium mb-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Penjelasan:
                          </div>
                          <div dangerouslySetInnerHTML={{ __html: soal.penjelasan }} />
                        </div>
                      )}
                    </div>

                    {/* Actions & Meta */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDuplicate(soal)}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition"
                          title="Duplikat"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal(soal)}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(soal.id_soal)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        {soal.poin} poin
                      </div>
                      {soal.tipe_soal === 'benar_salah' && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                          Benar/Salah
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {soalList.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Belum ada soal</h3>
            <p className="text-gray-500 mb-4">Mulai buat soal untuk quiz ini</p>
            <button
              onClick={() => openModal()}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tambah Soal Pertama
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {editingSoal ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingSoal ? 'Edit Soal' : 'Tambah Soal Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white text-2xl leading-none">
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Tipe Soal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Soal</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleTipeSoalChange('pilihan_ganda')}
                    className={`flex-1 p-3 rounded-xl border-2 transition ${
                      form.tipe_soal === 'pilihan_ganda' 
                        ? 'border-purple-500 bg-purple-50 text-purple-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Pilihan Ganda</div>
                    <div className="text-xs text-gray-500 mt-1">2-5 pilihan jawaban</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTipeSoalChange('benar_salah')}
                    className={`flex-1 p-3 rounded-xl border-2 transition ${
                      form.tipe_soal === 'benar_salah' 
                        ? 'border-purple-500 bg-purple-50 text-purple-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Benar / Salah</div>
                    <div className="text-xs text-gray-500 mt-1">2 pilihan: Benar atau Salah</div>
                  </button>
                </div>
              </div>

              {/* Pertanyaan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pertanyaan <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={form.pertanyaan}
                  onChange={(v) => setForm({ ...form, pertanyaan: v })}
                  placeholder="Tulis pertanyaan di sini..."
                />
              </div>

              {/* Opsi Jawaban */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opsi Jawaban <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {['a', 'b', 'c', 'd', 'e'].map((opt) => {
                    const key = `opsi_${opt}` as keyof typeof form;
                    const isRequired = opt === 'a' || opt === 'b';
                    const isDisabled = form.tipe_soal === 'benar_salah' && (opt === 'c' || opt === 'd' || opt === 'e');
                    
                    if (isDisabled) return null;
                    
                    return (
                      <div key={opt} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, jawaban_benar: opt as any })}
                          className={`w-10 h-10 rounded-xl font-bold transition shrink-0 ${
                            form.jawaban_benar === opt
                              ? 'bg-green-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={form.jawaban_benar === opt ? 'Jawaban benar' : 'Klik untuk jadikan jawaban benar'}
                        >
                          {opt.toUpperCase()}
                        </button>
                        <input
                          type="text"
                          value={form[key] as string}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          placeholder={`Opsi ${opt.toUpperCase()}${isRequired ? ' (wajib)' : ' (opsional)'}`}
                          className={`flex-1 border rounded-xl px-4 py-2.5 transition ${
                            form.jawaban_benar === opt ? 'border-green-300 bg-green-50' : 'border-gray-300'
                          }`}
                          required={isRequired}
                          disabled={form.tipe_soal === 'benar_salah'}
                        />
                        {form.jawaban_benar === opt && (
                          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Klik huruf untuk menandai jawaban yang benar (hijau = jawaban benar)
                </p>
              </div>

              {/* Poin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poin</label>
                <div className="flex items-center gap-3">
                  {[5, 10, 15, 20, 25].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, poin: p })}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        form.poin === p 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    value={form.poin}
                    onChange={(e) => setForm({ ...form, poin: parseInt(e.target.value) || 10 })}
                    className="w-20 border rounded-lg px-3 py-2 text-center"
                    placeholder="Custom"
                  />
                </div>
              </div>

              {/* Penjelasan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penjelasan Jawaban <span className="text-gray-400">(opsional)</span>
                </label>
                <RichTextEditor
                  value={form.penjelasan}
                  onChange={(v) => setForm({ ...form, penjelasan: v })}
                  placeholder="Tulis penjelasan mengapa jawaban tersebut benar..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Penjelasan akan ditampilkan setelah santri menjawab
                </p>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-5 border-t bg-gray-50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 rounded-xl py-2.5 font-medium hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !form.pertanyaan || !form.opsi_a || !form.opsi_b}
                className="flex-1 bg-purple-600 text-white rounded-xl py-2.5 font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Soal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LmsQuizSoalPage;
