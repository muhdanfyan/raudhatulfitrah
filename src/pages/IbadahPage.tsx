import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { 
  Loader2, Moon, Sun, BookOpen, Heart, Utensils, TrendingUp, 
  Users, Calendar, Award, ChevronLeft, ChevronRight, Search,
  BarChart3, Target, Flame, Star, ThumbsUp, AlertTriangle, Lightbulb, Check
} from 'lucide-react';

interface SantriIbadah {
  id_santri: number;
  nama_lengkap_santri: string;
  foto_santri: string | null;
  total_ibadah: number;
  persentase: number;
  streak: number;
}

interface IbadahStats {
  total_santri: number;
  santri_aktif: number;
  rata_rata_persentase: number;
  total_ibadah_bulan_ini: number;
}

interface DailyIbadah {
  tanggal: string;
  witir: number;
  dhuha: number;
  rawatib: number;
  dzikir_pagipetang: number;
  murojaah: number;
  puasa_sunnah: number;
  amalan_tidur: number;
  ngajar: number;
}

interface TodaySantriIbadah {
  id_santri: number;
  nama_lengkap_santri: string;
  foto_santri: string | null;
  witir: number;
  dhuha: number;
  rawatib: number;
  dzikir_pagipetang: number;
  murojaah: number;
  puasa_sunnah: number;
  amalan_tidur: number;
  ngajar: number;
  total: number;
}

const IBADAH_FIELDS = [
  { key: 'witir', label: 'Witir', icon: Moon, color: 'from-indigo-500 to-purple-600' },
  { key: 'dhuha', label: 'Dhuha', icon: Sun, color: 'from-amber-500 to-orange-600' },
  { key: 'rawatib', label: 'Rawatib', icon: Heart, color: 'from-pink-500 to-rose-600' },
  { key: 'dzikir_pagipetang', label: 'Dzikir', icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
  { key: 'murojaah', label: 'Murojaah', icon: BookOpen, color: 'from-blue-500 to-cyan-600' },
  { key: 'puasa_sunnah', label: 'Puasa', icon: Utensils, color: 'from-violet-500 to-purple-600' },
  { key: 'amalan_tidur', label: 'Amalan Tidur', icon: Moon, color: 'from-slate-500 to-gray-600' },
  { key: 'ngajar', label: 'Ngajar', icon: Users, color: 'from-green-500 to-emerald-600' },
];

export default function IbadahPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<IbadahStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<SantriIbadah[]>([]);
  const [dailyData, setDailyData] = useState<DailyIbadah[]>([]);
  const [todaySantriList, setTodaySantriList] = useState<TodaySantriIbadah[]>([]);
  const [search, setSearch] = useState('');
  const [bulan, setBulan] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchData();
  }, [bulan]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const json: any = await api.get(`/api/santri-feature/ibadah/stats?bulan=${bulan}`);
      if (json.success) {
        setStats(json.data.stats);
        setLeaderboard(json.data.leaderboard || []);
        setDailyData(json.data.daily || []);
      }
      
      // Fetch today's individual santri data
      const todayDate = new Date().toISOString().split('T')[0];
      const todayJson: any = await api.get(`/api/santri-feature/ibadah/today?tanggal=${todayDate}`);
      if (todayJson.success) {
        setTodaySantriList(todayJson.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch ibadah stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta: number) => {
    const [year, month] = bulan.split('-').map(Number);
    const newDate = new Date(year, month - 1 + delta, 1);
    setBulan(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const getMonthName = () => {
    const [year, month] = bulan.split('-').map(Number);
    return new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const filteredLeaderboard = leaderboard.filter(s => 
    s.nama_lengkap_santri.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate max value for progress bars
  const maxIbadah = Math.max(...dailyData.map(d => 
    d.witir + d.dhuha + d.rawatib + d.dzikir_pagipetang + d.murojaah + d.puasa_sunnah + d.amalan_tidur + d.ngajar
  ), 1);

  // Get today's date string
  const today = new Date().toISOString().split('T')[0];

  // Calculate today's stats
  const todayStats = useMemo(() => {
    const todayData = dailyData.find(d => d.tanggal === today);
    if (!todayData) return { total: 0, santriAktif: 0, percentage: 0 };
    
    const total = IBADAH_FIELDS.reduce((sum, f) => sum + (todayData[f.key as keyof DailyIbadah] as number || 0), 0);
    const maxPossible = (stats?.santri_aktif || 1) * IBADAH_FIELDS.length;
    
    return {
      total,
      data: todayData,
      santriAktif: stats?.santri_aktif || 0,
      percentage: maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0
    };
  }, [dailyData, today, stats]);

  // Calculate this week's stats
  const weekStats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekData = dailyData.filter(d => {
      const date = new Date(d.tanggal);
      return date >= startOfWeek && date <= now;
    });
    
    let totalIbadah = 0;
    const ibadahCounts: Record<string, number> = {};
    IBADAH_FIELDS.forEach(f => ibadahCounts[f.key] = 0);
    
    weekData.forEach(day => {
      IBADAH_FIELDS.forEach(f => {
        const val = day[f.key as keyof DailyIbadah] as number || 0;
        totalIbadah += val;
        ibadahCounts[f.key] += val;
      });
    });
    
    const daysInWeek = diff + 1;
    const average = weekData.length > 0 ? Math.round(totalIbadah / weekData.length) : 0;
    
    return {
      days: weekData.length,
      daysInWeek,
      totalIbadah,
      average,
      weekData,
      ibadahCounts
    };
  }, [dailyData]);

  // Generate retrospective insights
  const retrospective = useMemo(() => {
    if (weekStats.days === 0) {
      return { good: [], improve: [], actions: [] };
    }

    const good: string[] = [];
    const improve: string[] = [];
    const actions: string[] = [];

    const sortedIbadah = IBADAH_FIELDS.map(f => ({
      ...f,
      count: weekStats.ibadahCounts[f.key],
      avgPerDay: weekStats.days > 0 ? Math.round(weekStats.ibadahCounts[f.key] / weekStats.days) : 0
    })).sort((a, b) => b.count - a.count);

    const bestIbadah = sortedIbadah.slice(0, 3);
    const worstIbadah = sortedIbadah.slice(-3).reverse();

    // Good things
    if (bestIbadah.length > 0 && bestIbadah[0].count > 0) {
      good.push(`${bestIbadah[0].label} paling konsisten (${bestIbadah[0].count} total)`);
    }
    
    if (stats?.santri_aktif && stats.santri_aktif > 0) {
      const activeRate = Math.round((stats.santri_aktif / (stats.total_santri || 1)) * 100);
      if (activeRate >= 70) {
        good.push(`${activeRate}% santri aktif mencatat ibadah`);
      }
    }
    
    if (stats?.rata_rata_persentase && stats.rata_rata_persentase >= 60) {
      good.push(`Rata-rata pencapaian ${stats.rata_rata_persentase}%`);
    }

    if (weekStats.days === weekStats.daysInWeek) {
      good.push('Data tercatat lengkap setiap hari');
    }

    // Things to improve
    if (worstIbadah.length > 0 && worstIbadah[0].count < weekStats.average) {
      improve.push(`${worstIbadah[0].label} perlu ditingkatkan`);
    }

    if (stats?.santri_aktif && stats.total_santri) {
      const inactiveCount = stats.total_santri - stats.santri_aktif;
      if (inactiveCount > 0) {
        improve.push(`${inactiveCount} santri belum aktif mencatat`);
      }
    }

    if (stats?.rata_rata_persentase && stats.rata_rata_persentase < 50) {
      improve.push('Rata-rata pencapaian masih di bawah 50%');
    }

    if (weekStats.days < weekStats.daysInWeek) {
      improve.push(`${weekStats.daysInWeek - weekStats.days} hari belum ada data`);
    }

    // Action items
    if (worstIbadah.length > 0) {
      actions.push(`Motivasi santri untuk ${worstIbadah[0].label}`);
    }

    if (stats?.santri_aktif && stats.total_santri && stats.santri_aktif < stats.total_santri) {
      actions.push('Ingatkan santri yang belum mencatat');
    }

    if (stats?.rata_rata_persentase && stats.rata_rata_persentase < 70) {
      actions.push('Adakan evaluasi ibadah mingguan');
    }

    actions.push('Review progress di halaqoh/mentoring');

    // Defaults
    if (good.length === 0) good.push('Mulai pantau ibadah santri secara rutin');
    if (improve.length === 0) improve.push('Tingkatkan partisipasi santri');
    if (actions.length === 0) actions.push('Buat target ibadah mingguan');

    return {
      good: good.slice(0, 4),
      improve: improve.slice(0, 4),
      actions: actions.slice(0, 4)
    };
  }, [weekStats, stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🕌 Ibadah Harian
          </h1>
          <p className="text-gray-600">Monitoring dan retrospektif ibadah santri</p>
        </div>
        
        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-white rounded-lg border px-2 py-1">
          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-medium text-gray-800 min-w-[140px] text-center">{getMonthName()}</span>
          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Santri</p>
              <p className="text-3xl font-bold mt-1">{stats?.total_santri || 0}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Santri Aktif</p>
              <p className="text-3xl font-bold mt-1">{stats?.santri_aktif || 0}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Rata-rata Progres</p>
              <p className="text-3xl font-bold mt-1">{stats?.rata_rata_persentase || 0}%</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Ibadah</p>
              <p className="text-3xl font-bold mt-1">{stats?.total_ibadah_bulan_ini || 0}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Flame className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Laporan Hari Ini - Per Santri */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-gray-900">Laporan Hari Ini</h2>
          </div>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        
        {todaySantriList.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {todaySantriList.map((santri) => {
              const totalIbadah = IBADAH_FIELDS.reduce((sum, f) => sum + ((santri as any)[f.key] || 0), 0);
              const percentage = Math.round((totalIbadah / IBADAH_FIELDS.length) * 100);
              
              return (
                <div key={santri.id_santri} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {santri.nama_lengkap_santri.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{santri.nama_lengkap_santri}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {IBADAH_FIELDS.map(({ key, label, color }) => {
                        const done = (santri as any)[key] === 1;
                        return done ? (
                          <span key={key} className={`inline-flex items-center gap-1 bg-gradient-to-r ${color} text-white px-2 py-0.5 rounded-full text-xs`}>
                            <Check className="w-3 h-3" />
                            {label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">{totalIbadah}/{IBADAH_FIELDS.length}</p>
                    <p className="text-xs text-gray-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Belum ada santri yang mencatat ibadah hari ini</p>
          </div>
        )}
        
        {todaySantriList.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
            <span className="text-gray-600">
              <span className="font-semibold text-emerald-600">{todaySantriList.length}</span> santri sudah mencatat
            </span>
            <span className="text-gray-600">
              Total: <span className="font-semibold text-emerald-600">{todayStats.total}</span> ibadah
            </span>
          </div>
        )}
      </div>

      {/* Laporan Pekan Ini */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-sm p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Laporan Pekan Ini</h2>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{weekStats.days}</p>
            <p className="text-sm text-blue-100">Hari Tercatat</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{weekStats.totalIbadah}</p>
            <p className="text-sm text-blue-100">Total Ibadah</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{weekStats.average}</p>
            <p className="text-sm text-blue-100">Rata-rata/Hari</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Progress</span>
              <span className="font-bold">{weekStats.days}/{weekStats.daysInWeek}</span>
            </div>
            <div className="bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all"
                style={{ width: `${(weekStats.days / weekStats.daysInWeek) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Retrospektif Pekan Ini */}
      {weekStats.days > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Retrospektif Pekan Ini</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Berjalan Baik */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <ThumbsUp className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-green-800">Berjalan Baik</h3>
              </div>
              <ul className="space-y-2">
                {retrospective.good.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Perlu Ditingkatkan */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-amber-800">Perlu Ditingkatkan</h3>
              </div>
              <ul className="space-y-2">
                {retrospective.improve.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-amber-700">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Perlu Dilakukan */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-blue-800">Perlu Dilakukan</h3>
              </div>
              <ul className="space-y-2">
                {retrospective.actions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-blue-700">
                    <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Top Santri
            </h2>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari santri..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredLeaderboard.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Belum ada data</p>
            ) : (
              filteredLeaderboard.slice(0, 10).map((santri, idx) => (
                <div key={santri.id_santri} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-amber-100 text-amber-700' :
                    idx === 1 ? 'bg-gray-200 text-gray-700' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">{santri.nama_lengkap_santri}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${santri.persentase}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{santri.persentase}%</span>
                    </div>
                  </div>
                  {santri.streak > 0 && (
                    <div className="flex items-center gap-1 text-orange-500">
                      <Flame className="w-4 h-4" />
                      <span className="text-xs font-bold">{santri.streak}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Charts & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ibadah Type Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Breakdown Ibadah Bulan Ini
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {IBADAH_FIELDS.map((field) => {
                const Icon = field.icon;
                const total = dailyData.reduce((sum, d) => sum + (d[field.key as keyof DailyIbadah] as number || 0), 0);
                const maxPossible = dailyData.length * (stats?.santri_aktif || 1);
                const percentage = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0;
                
                return (
                  <div key={field.key} className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${field.color} flex items-center justify-center mb-2`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{total}</p>
                    <p className="text-xs text-gray-500 mt-1">{field.label}</p>
                    <div className="mt-2 bg-gray-200 rounded-full h-1">
                      <div className={`bg-gradient-to-r ${field.color} h-1 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Progress Chart */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Retrospektif Harian
            </h2>
            
            {dailyData.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Belum ada data ibadah bulan ini</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {dailyData.slice().reverse().map((day) => {
                  const total = day.witir + day.dhuha + day.rawatib + day.dzikir_pagipetang + 
                               day.murojaah + day.puasa_sunnah + day.amalan_tidur + day.ngajar;
                  const date = new Date(day.tanggal);
                  const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
                  const dayNum = date.getDate();
                  
                  return (
                    <div key={day.tanggal} className="flex items-center gap-3">
                      <div className="w-12 text-center">
                        <p className="text-xs text-gray-500">{dayName}</p>
                        <p className="font-bold text-gray-900">{dayNum}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex gap-0.5 h-6">
                          {IBADAH_FIELDS.map((field) => {
                            const value = day[field.key as keyof DailyIbadah] as number || 0;
                            const width = stats?.santri_aktif ? (value / stats.santri_aktif) * 100 : 0;
                            return (
                              <div
                                key={field.key}
                                className={`bg-gradient-to-t ${field.color} rounded-sm transition-all hover:opacity-80`}
                                style={{ width: `${width}%`, minWidth: value > 0 ? '4px' : '0' }}
                                title={`${field.label}: ${value}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div className="w-12 text-right">
                        <span className="text-sm font-medium text-gray-700">{total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
              {IBADAH_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded bg-gradient-to-r ${field.color}`} />
                  <span className="text-xs text-gray-600">{field.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
