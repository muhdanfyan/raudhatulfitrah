import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, 
  AlertTriangle, Trophy, Target, Zap, BookOpen, HelpCircle,
  ChevronLeft, ChevronRight, Send
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
  poin: number;
}

interface Quiz {
  id_quiz: number;
  judul: string;
  deskripsi: string;
  durasi_menit: number;
  passing_score: number;
  max_attempts: number;
  course_id: number;
}

interface QuizResult {
  skor: number;
  total_benar: number;
  total_soal: number;
  total_poin: number;
  max_poin: number;
  passed: boolean;
  passing_score: number;
  hasil: Record<number, { 
    user_answer: string; 
    correct_answer: string; 
    is_correct: boolean;
    poin: number;
    penjelasan?: string;
  }>;
}

const SantriQuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);

  useEffect(() => {
    if (user?.santri_id && quizId) {
      startQuiz();
    }
  }, [user?.santri_id, quizId]);

  useEffect(() => {
    if (timeLeft <= 0 || result) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const startQuiz = async () => {
    try {
      const res = await api.get(`/santri-feature/lms/${user?.santri_id}/quiz/${quizId}/start`);
      const data = res.data || res;
      setQuiz(data.quiz);
      setSoalList(data.soal || []);
      setTimeLeft(data.quiz.durasi_menit * 60);
      setAttemptNumber(data.attempt_number || 1);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Gagal memulai quiz';
      alert(message);
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (soalId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [soalId]: answer }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return;
    
    const unanswered = soalList.filter(s => !answers[s.id_soal]).length;
    if (unanswered > 0 && timeLeft > 0 && !autoSubmit) {
      setShowConfirm(true);
      return;
    }

    setSubmitting(true);
    setShowConfirm(false);
    try {
      const res = await api.post(`/santri-feature/lms/${user?.santri_id}/quiz/${quizId}/submit`, { answers });
      const data = res.data || res;
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Gagal submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = soalList.length - answeredCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/70">Mempersiapkan quiz...</p>
        </div>
      </div>
    );
  }

  // Result Screen
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Result Header */}
          <div className={`text-center py-10 lg:py-16 rounded-3xl mb-6 ${
            result.passed 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
              : 'bg-gradient-to-br from-red-500 to-rose-600'
          } text-white shadow-2xl`}>
            <div className="text-7xl mb-6">
              {result.passed ? '🎉' : '📚'}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">
              {result.passed ? 'Selamat, Kamu Lulus!' : 'Belum Lulus'}
            </h1>
            
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur rounded-2xl px-6 py-4 mb-4">
              <div className="text-center px-4 border-r border-white/30">
                <div className="text-4xl font-bold">{result.skor}%</div>
                <div className="text-sm opacity-80">Skor</div>
              </div>
              <div className="text-center px-4 border-r border-white/30">
                <div className="text-4xl font-bold">{result.total_benar}</div>
                <div className="text-sm opacity-80">Benar</div>
              </div>
              <div className="text-center px-4">
                <div className="text-4xl font-bold">{result.total_soal}</div>
                <div className="text-sm opacity-80">Total</div>
              </div>
            </div>
            
            <p className="opacity-80 flex items-center justify-center gap-2">
              <Target className="w-5 h-5" />
              Passing score: {result.passing_score}%
            </p>
          </div>

          {/* Review Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden mb-6">
            <div className="p-4 lg:p-6 border-b border-white/10">
              <h2 className="font-bold text-white text-xl flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-400" />
                Review Jawaban
              </h2>
            </div>
            <div className="divide-y divide-white/10">
              {soalList.map((soal, idx) => {
                const jawaban = result.hasil[soal.id_soal];
                const isCorrect = jawaban?.is_correct;
                
                return (
                  <div 
                    key={soal.id_soal} 
                    className={`p-4 lg:p-6 ${isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <XCircle className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white/60 text-sm">Soal {idx + 1}</span>
                          {soal.tipe_soal === 'benar_salah' && (
                            <span className="text-xs bg-orange-500/30 text-orange-300 px-2 py-0.5 rounded">
                              Benar/Salah
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            isCorrect ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
                          }`}>
                            {isCorrect ? `+${jawaban?.poin} poin` : '0 poin'}
                          </span>
                        </div>
                        
                        <div 
                          className="text-white font-medium mb-4 prose prose-invert prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: soal.pertanyaan }}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                          {['a', 'b', 'c', 'd', 'e'].map(opt => {
                            const opsiKey = `opsi_${opt}` as keyof Soal;
                            const opsiValue = soal[opsiKey] as string | null;
                            if (!opsiValue) return null;
                            
                            const isUserAnswer = jawaban?.user_answer === opt;
                            const isCorrectAnswer = jawaban?.correct_answer === opt;
                            
                            return (
                              <div
                                key={opt}
                                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                                  isCorrectAnswer
                                    ? 'bg-green-500/30 border border-green-500/50'
                                    : isUserAnswer && !isCorrect
                                      ? 'bg-red-500/30 border border-red-500/50'
                                      : 'bg-white/5 border border-white/10'
                                }`}
                              >
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isCorrectAnswer
                                    ? 'bg-green-500 text-white'
                                    : isUserAnswer && !isCorrect
                                      ? 'bg-red-500 text-white'
                                      : 'bg-white/20 text-white/70'
                                }`}>
                                  {opt.toUpperCase()}
                                </span>
                                <span className={`flex-1 ${
                                  isCorrectAnswer ? 'text-green-300' : isUserAnswer && !isCorrect ? 'text-red-300' : 'text-white/70'
                                }`}>
                                  {opsiValue}
                                </span>
                                {isCorrectAnswer && <CheckCircle className="w-4 h-4 text-green-400" />}
                                {isUserAnswer && !isCorrect && <XCircle className="w-4 h-4 text-red-400" />}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Penjelasan */}
                        {jawaban?.penjelasan && (
                          <div className="bg-primary-light/20 border border-primary/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-blue-300 font-medium mb-2">
                              <HelpCircle className="w-4 h-4" />
                              Penjelasan:
                            </div>
                            <div 
                              className="text-blue-100 text-sm prose prose-invert prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: jawaban.penjelasan }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <Link 
              to="/santri/lms" 
              className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-xl font-medium hover:bg-gray-100 transition shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Learning Center
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentSoal = soalList[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Bar */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-white text-lg">{quiz?.judul}</h1>
              <p className="text-white/60 text-sm">Percobaan ke-{attemptNumber}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${
              timeLeft <= 60 
                ? 'bg-red-500 text-white animate-pulse' 
                : timeLeft <= 300 
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/20 text-white'
            }`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-white/70 mb-2">
            <span>Soal {currentIndex + 1} dari {soalList.length}</span>
            <span>{answeredCount} terjawab</span>
          </div>
          <div className="flex gap-1">
            {soalList.map((s, idx) => (
              <button
                key={s.id_soal}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-1 h-2 rounded-full transition ${
                  answers[s.id_soal] 
                    ? 'bg-green-500' 
                    : idx === currentIndex 
                      ? 'bg-white' 
                      : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Numbers */}
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white/5 rounded-xl">
          {soalList.map((s, idx) => (
            <button
              key={s.id_soal}
              onClick={() => setCurrentIndex(idx)}
              className={`w-10 h-10 rounded-lg font-medium text-sm transition ${
                answers[s.id_soal]
                  ? 'bg-green-500 text-white'
                  : idx === currentIndex
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                Soal {currentIndex + 1}
              </span>
              {currentSoal?.tipe_soal === 'benar_salah' && (
                <span className="bg-orange-500/30 text-white text-sm px-3 py-1 rounded-full">
                  Benar/Salah
                </span>
              )}
              <span className="ml-auto bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                {currentSoal?.poin} poin
              </span>
            </div>
            <div 
              className="text-white text-lg lg:text-xl font-medium prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: currentSoal?.pertanyaan || '' }}
            />
          </div>
          
          <div className="p-4 lg:p-6 space-y-3">
            {['a', 'b', 'c', 'd', 'e'].map(option => {
              const opsiKey = `opsi_${option}` as keyof Soal;
              const opsiValue = currentSoal?.[opsiKey] as string | null;
              if (!opsiValue) return null;

              const isSelected = answers[currentSoal.id_soal] === option;
              
              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentSoal.id_soal, option)}
                  className={`w-full text-left p-4 lg:p-5 rounded-xl border-2 transition flex items-center gap-4 ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                    isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option.toUpperCase()}
                  </span>
                  <span className={`flex-1 ${isSelected ? 'text-purple-700 font-medium' : 'text-gray-700'}`}>
                    {opsiValue}
                  </span>
                  {isSelected && <CheckCircle className="w-6 h-6 text-purple-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl disabled:opacity-30 transition hover:bg-white/20"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>
          
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition"
          >
            <Send className="w-5 h-5" />
            Submit Quiz
          </button>
          
          <button
            onClick={() => setCurrentIndex(prev => Math.min(soalList.length - 1, prev + 1))}
            disabled={currentIndex === soalList.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl disabled:opacity-30 transition hover:bg-white/20"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Submit Quiz?</h3>
              {unansweredCount > 0 ? (
                <p className="text-gray-600">
                  Masih ada <span className="font-bold text-red-600">{unansweredCount} soal</span> yang belum dijawab.
                  Yakin ingin submit?
                </p>
              ) : (
                <p className="text-gray-600">
                  Semua soal sudah terjawab. Submit jawaban sekarang?
                </p>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Terjawab:</span>
                <span className="font-bold text-green-600">{answeredCount} soal</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Belum dijawab:</span>
                <span className={`font-bold ${unansweredCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {unansweredCount} soal
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Sisa waktu:</span>
                <span className="font-bold text-gray-800">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Kembali
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit
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

export default SantriQuizPage;
