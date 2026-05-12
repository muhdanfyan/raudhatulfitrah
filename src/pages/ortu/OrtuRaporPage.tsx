import { useState, useEffect } from 'react';
import { 
  FileText, ChevronLeft, Loader2, Calendar,
  Clock, BookOpen, Target, CheckCircle, Star, Flame, Brain, 
  Heart, Shield, TrendingUp, Award, Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { API_URL, api } from '../../services/api';
import MonthPicker from '../../components/common/MonthPicker';

interface Santri {
  id_santri: number;
  nama_lengkap_santri: string;
  foto_santri?: string;
  program_santri?: string;
  angkatan_santri?: string;
}

interface Kuantitas {
  productive: {
    jam_produktif: number;
    hari_tracking: number;
    review: number;
    review_avg_nilai: number;
    portfolio: number;
  };
  rabbani: {
    hari_ibadah: number;
    witir: number;
    dhuha: number;
    rawatib: number;
    puasa_sunnah: number;
    dzikir: number;
    hafalan_baru: number;
    murojaah: number;
    tahfidz_avg_nilai: number;
    tahfidz_total_baris: number;
  };
  intelligent: {
    quiz: number;
    quiz_avg_score: number;
    course_progress: number;
    course_avg_progress: number;
    skill_progress: number;
    skill_avg_level: number;
  };
  discipline: {
    presensi_total: number;
    presensi_hadir: number;
    presensi_sakit: number;
    presensi_izin: number;
    presensi_alpha: number;
    sanksi: number;
    sanksi_total_poin: number;
  };
  ethic: {
    piket: number;
    piket_avg_nilai: number;
  };
}

export default function OrtuRaporPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [kuantitas, setKuantitas] = useState<Kuantitas | null>(null);
  const [periode, setPeriode] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchSantriList();
  }, [user]);

  useEffect(() => {
    if (selectedSantri) fetchRapor();
  }, [selectedSantri, periode]);

  const fetchSantriList = async () => {
    try {
      const res = await api.get('/ortu/anak');
      if (res.success && res.data?.length > 0) {
        setSantriList(res.data);
        setSelectedSantri(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRapor = async () => {
    if (!selectedSantri) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/rapor-management/realtime/${selectedSantri.id_santri}?periode=${periode}`);
      if (res.success) {
        setKuantitas(res.kuantitas);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading && !selectedSantri) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  const k = kuantitas;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/ortu" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ChevronLeft className="w-6 h-6 text-white" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white">Rapor Anak</h1>
              <p className="text-white/60 text-sm">Monitoring PRIDE</p>
            </div>
          </div>
        </div>

        {/* Santri Selector (if more than 1 anak) */}
        {santriList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {santriList.map((s: Santri) => (
              <button
                key={s.id_santri}
                onClick={() => setSelectedSantri(s)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedSantri?.id_santri === s.id_santri 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {s.foto_santri ? (
                  <img src={s.foto_santri} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                    {getInitials(s.nama_lengkap_santri)}
                  </div>
                )}
                <span className="text-sm font-medium">{s.nama_lengkap_santri.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        )}

        {/* Period Selector */}
        <div className="flex justify-center">
          <MonthPicker periode={periode} onChange={setPeriode} dark />
        </div>

        {/* Profile Card */}
        {selectedSantri && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5">
              <div className="flex items-center gap-4">
                {selectedSantri.foto_santri ? (
                  <img src={selectedSantri.foto_santri} className="w-20 h-20 rounded-xl object-cover ring-2 ring-white/20" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white/20">
                    <span className="text-2xl font-bold text-white">{getInitials(selectedSantri.nama_lengkap_santri)}</span>
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedSantri.nama_lengkap_santri}</h2>
                  <p className="text-white/60 text-sm">{selectedSantri.program_santri}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-medium">
                    {selectedSantri.angkatan_santri}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : !k ? (
          <div className="text-center py-10">
            <FileText className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <p className="text-white/40">Belum ada data untuk periode ini</p>
          </div>
        ) : (
          <>
            {/* PRODUCTIVE */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-0.5 rounded-2xl">
              <div className="bg-slate-900/95 backdrop-blur rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white">PRODUCTIVE</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard icon={<Clock className="w-4 h-4" />} label="Jam Produktif" value={k.productive.jam_produktif} unit="jam" color="orange" />
                  <MetricCard icon={<TrendingUp className="w-4 h-4" />} label="Hari Tracking" value={k.productive.hari_tracking} unit="hari" color="orange" />
                  <MetricCard icon={<FileText className="w-4 h-4" />} label="Review" value={k.productive.review} avg={k.productive.review_avg_nilai} color="orange" />
                  <MetricCard icon={<Award className="w-4 h-4" />} label="Portfolio" value={k.productive.portfolio} unit="karya" color="orange" />
                </div>
              </div>
            </div>

            {/* RABBANI */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-0.5 rounded-2xl">
              <div className="bg-slate-900/95 backdrop-blur rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white">RABBANI</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard icon={<Calendar className="w-4 h-4" />} label="Hari Ibadah" value={k.rabbani.hari_ibadah} unit="hari" color="emerald" />
                  <MetricCard icon={<Star className="w-4 h-4" />} label="Witir" value={k.rabbani.witir} color="emerald" />
                  <MetricCard icon={<Star className="w-4 h-4" />} label="Dhuha" value={k.rabbani.dhuha} color="emerald" />
                  <MetricCard icon={<Star className="w-4 h-4" />} label="Rawatib" value={k.rabbani.rawatib} color="emerald" />
                  <MetricCard icon={<Star className="w-4 h-4" />} label="Puasa Sunnah" value={k.rabbani.puasa_sunnah} color="emerald" />
                  <MetricCard icon={<Star className="w-4 h-4" />} label="Dzikir" value={k.rabbani.dzikir} color="emerald" />
                  <MetricCard icon={<BookOpen className="w-4 h-4" />} label="Hafalan Baru" value={k.rabbani.hafalan_baru} avg={k.rabbani.tahfidz_avg_nilai} color="emerald" highlight />
                  <MetricCard icon={<BookOpen className="w-4 h-4" />} label="Murojaah" value={k.rabbani.murojaah} color="emerald" />
                </div>
                {k.rabbani.tahfidz_total_baris > 0 && (
                  <div className="mt-3 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-emerald-400 text-sm text-center">Total <span className="font-bold">{k.rabbani.tahfidz_total_baris}</span> baris tahfidz</p>
                  </div>
                )}
              </div>
            </div>

            {/* INTELLIGENT */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-0.5 rounded-2xl">
              <div className="bg-slate-900/95 backdrop-blur rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white">INTELLIGENT</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard icon={<Target className="w-4 h-4" />} label="Quiz Selesai" value={k.intelligent.quiz} avg={k.intelligent.quiz_avg_score} avgLabel="skor" color="blue" />
                  <MetricCard icon={<TrendingUp className="w-4 h-4" />} label="Course Progress" value={k.intelligent.course_progress} avg={k.intelligent.course_avg_progress} avgLabel="%" color="blue" />
                  <MetricCard icon={<Zap className="w-4 h-4" />} label="Skill Progress" value={k.intelligent.skill_progress} avg={k.intelligent.skill_avg_level} avgLabel="level" color="blue" />
                </div>
              </div>
            </div>

            {/* DISCIPLINE */}
            <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-0.5 rounded-2xl">
              <div className="bg-slate-900/95 backdrop-blur rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white">DISCIPLINE</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard icon={<CheckCircle className="w-4 h-4" />} label="Hadir" value={k.discipline.presensi_hadir} unit={`/ ${k.discipline.presensi_total}`} color="purple" highlight />
                  <MetricCard icon={<CheckCircle className="w-4 h-4" />} label="Sakit" value={k.discipline.presensi_sakit} color="yellow" />
                  <MetricCard icon={<CheckCircle className="w-4 h-4" />} label="Izin" value={k.discipline.presensi_izin} color="yellow" />
                  <MetricCard icon={<CheckCircle className="w-4 h-4" />} label="Alpha" value={k.discipline.presensi_alpha} color={k.discipline.presensi_alpha > 0 ? 'red' : 'purple'} />
                </div>
                {(k.discipline.sanksi > 0 || k.discipline.sanksi_total_poin > 0) && (
                  <div className="mt-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm text-center">
                      <span className="font-bold">{k.discipline.sanksi}</span> sanksi • <span className="font-bold">{k.discipline.sanksi_total_poin}</span> poin
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ETHIC */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-0.5 rounded-2xl">
              <div className="bg-slate-900/95 backdrop-blur rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white">ETHIC</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard icon={<CheckCircle className="w-4 h-4" />} label="Piket Khidmat" value={k.ethic.piket} avg={k.ethic.piket_avg_nilai} avgLabel="nilai" color="yellow" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, unit, avg, avgLabel = 'avg', color, highlight }: { 
  icon: React.ReactNode;
  label: string; 
  value: number | string; 
  unit?: string; 
  avg?: number;
  avgLabel?: string;
  color: 'orange' | 'emerald' | 'blue' | 'purple' | 'yellow' | 'red';
  highlight?: boolean;
}) {
  const colors = {
    orange: 'from-orange-500 to-amber-500',
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-violet-500',
    yellow: 'from-yellow-500 to-orange-500',
    red: 'from-red-500 to-pink-500',
  };
  
  const bgColors = {
    orange: 'bg-orange-500/10 border-orange-500/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
    yellow: 'bg-yellow-500/10 border-yellow-500/20',
    red: 'bg-red-500/10 border-red-500/20',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl p-3 border ${bgColors[color]} ${highlight ? 'ring-1 ring-white/20' : ''}`}>
      <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br ${colors[color]} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
      <div className="relative">
        <div className="flex items-center gap-1.5 text-white/50 mb-1">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <p className="text-xl font-black text-white">
          {value}
          {unit && <span className="text-xs font-normal text-white/40 ml-1">{unit}</span>}
        </p>
        {avg !== undefined && avg > 0 && (
          <p className={`text-xs mt-0.5 bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent font-medium`}>
            {avgLabel}: {avg}
          </p>
        )}
      </div>
    </div>
  );
}
