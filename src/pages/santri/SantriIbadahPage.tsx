import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, Check, Calendar, Moon, Sun, BookOpen, Heart, Utensils, TrendingUp, Flame, Target, ThumbsUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { getLocalDateString } from '../../utils/date';
import { API_URL, getHeaders, getToken } from '../../services/api';


interface IbadahItem {
  id_ibadah: number;
  tgl_ibadah: string;
  witir: number;
  dhuha: number;
  rawatib: number;
  dzikir_pagipetang: number;
  murojaah: number;
  puasa_sunnah: number;
  amalan_tidur: number;
  ngajar: number;
  keterangan: string;
}

interface IbadahData {
  bulan: string;
  ibadah: IbadahItem[];
  statistik: Record<string, number>;
  total_hari: number;
}

const IBADAH_FIELDS = [
  { key: 'witir', label: 'Sholat Witir', icon: Moon },
  { key: 'dhuha', label: 'Sholat Dhuha', icon: Sun },
  { key: 'rawatib', label: 'Sholat Rawatib', icon: Heart },
  { key: 'dzikir_pagipetang', label: 'Dzikir Pagi/Petang', icon: BookOpen },
  { key: 'murojaah', label: 'Murojaah Quran', icon: BookOpen },
  { key: 'puasa_sunnah', label: 'Puasa Sunnah', icon: Utensils },
  { key: 'amalan_tidur', label: 'Amalan Tidur', icon: Moon },
  { key: 'ngajar', label: 'Ngajar/Mengajar', icon: BookOpen },
];

export default function SantriIbadahPage() {
  const { user } = useAuth();
  const santriId = user?.santri_id;

  const [data, setData] = useState<IbadahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulan, setBulan] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [todayForm, setTodayForm] = useState<Record<string, boolean>>({
    witir: false,
    dhuha: false,
    rawatib: false,
    dzikir_pagipetang: false,
    murojaah: false,
    puasa_sunnah: false,
    amalan_tidur: false,
    ngajar: false,
  });
  const [keterangan, setKeterangan] = useState('');

  const today = getLocalDateString();

  const fetchData = async () => {
    if (!santriId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/santri-feature/ibadah/${santriId}?bulan=${bulan}`, {
        headers: getHeaders()
      });
      const json = await res.json();
      if (json.status === 'success') {
        setData(json.data);
        
        // Check if today's record exists
        const todayRecord = json.data.ibadah.find((i: IbadahItem) => i.tgl_ibadah === today);
        if (todayRecord) {
          setTodayForm({
            witir: !!todayRecord.witir,
            dhuha: !!todayRecord.dhuha,
            rawatib: !!todayRecord.rawatib,
            dzikir_pagipetang: !!todayRecord.dzikir_pagipetang,
            murojaah: !!todayRecord.murojaah,
            puasa_sunnah: !!todayRecord.puasa_sunnah,
            amalan_tidur: !!todayRecord.amalan_tidur,
            ngajar: !!todayRecord.ngajar,
          });
          setKeterangan(todayRecord.keterangan || '');
        }
      }
    } catch (err) {
      console.error('Failed to fetch ibadah:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [santriId, bulan]);

  const handleSave = async () => {
    if (!santriId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/santri-feature/ibadah`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          santri: santriId,
          tgl_ibadah: today,
          ...todayForm,
          keterangan,
        }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        alert('Ibadah berhasil disimpan');
        fetchData();
      } else {
        alert(json.message || 'Gagal menyimpan');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const toggleField = (key: string) => {
    setTodayForm(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Get today's ibadah record
  const todayRecord = useMemo(() => {
    if (!data) return null;
    return data.ibadah.find((i: IbadahItem) => i.tgl_ibadah === today) || null;
  }, [data, today]);

  // Calculate today's completion
  const todayStats = useMemo(() => {
    if (!todayRecord) return { completed: 0, total: IBADAH_FIELDS.length, percentage: 0 };
    const completed = IBADAH_FIELDS.filter(f => (todayRecord as any)[f.key]).length;
    return {
      completed,
      total: IBADAH_FIELDS.length,
      percentage: Math.round((completed / IBADAH_FIELDS.length) * 100)
    };
  }, [todayRecord]);

  // Calculate this week's data
  const weekStats = useMemo(() => {
    if (!data) return { days: 0, totalIbadah: 0, average: 0, completedDays: 0 };
    
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as start of week
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekData = data.ibadah.filter((i: IbadahItem) => {
      const date = new Date(i.tgl_ibadah);
      return date >= startOfWeek && date <= now;
    });
    
    let totalIbadah = 0;
    let completedDays = 0;
    
    weekData.forEach((item: IbadahItem) => {
      const dayTotal = IBADAH_FIELDS.reduce((sum, f) => sum + ((item as any)[f.key] ? 1 : 0), 0);
      totalIbadah += dayTotal;
      if (dayTotal >= 4) completedDays++; // Consider day "complete" if at least 4 ibadah done
    });
    
    const daysInWeek = diff + 1;
    const average = weekData.length > 0 ? Math.round(totalIbadah / weekData.length) : 0;
    
    return {
      days: weekData.length,
      daysInWeek,
      totalIbadah,
      average,
      completedDays,
      weekData
    };
  }, [data]);

  // Generate retrospective insights
  const retrospective = useMemo(() => {
    if (!data || weekStats.days === 0) {
      return {
        good: [],
        improve: [],
        actions: []
      };
    }

    const good: string[] = [];
    const improve: string[] = [];
    const actions: string[] = [];

    // Analyze each ibadah type for the week
    const weekData = weekStats.weekData as IbadahItem[];
    const ibadahCounts: Record<string, number> = {};
    
    IBADAH_FIELDS.forEach(f => {
      ibadahCounts[f.key] = weekData.reduce((sum, item) => sum + ((item as any)[f.key] ? 1 : 0), 0);
    });

    // Find best and worst performing ibadah
    const sortedIbadah = IBADAH_FIELDS.map(f => ({
      ...f,
      count: ibadahCounts[f.key],
      percentage: weekStats.days > 0 ? Math.round((ibadahCounts[f.key] / weekStats.days) * 100) : 0
    })).sort((a, b) => b.percentage - a.percentage);

    const bestIbadah = sortedIbadah.filter(i => i.percentage >= 70);
    const worstIbadah = sortedIbadah.filter(i => i.percentage < 50);

    // Good things
    if (bestIbadah.length > 0) {
      const names = bestIbadah.slice(0, 3).map(i => i.label).join(', ');
      good.push(`Konsisten melakukan ${names}`);
    }
    
    if (weekStats.completedDays >= Math.ceil(weekStats.days * 0.7)) {
      good.push(`${weekStats.completedDays} dari ${weekStats.days} hari dengan ibadah lengkap`);
    }
    
    if (weekStats.average >= 6) {
      good.push(`Rata-rata ${weekStats.average} ibadah per hari - sangat baik!`);
    } else if (weekStats.average >= 4) {
      good.push(`Rata-rata ${weekStats.average} ibadah per hari - sudah bagus`);
    }

    if (weekStats.days === weekStats.daysInWeek) {
      good.push('Tidak ada hari yang terlewat minggu ini');
    }

    // Things to improve
    if (worstIbadah.length > 0) {
      const names = worstIbadah.slice(0, 2).map(i => i.label).join(' dan ');
      improve.push(`${names} masih perlu ditingkatkan`);
    }

    if (weekStats.days < weekStats.daysInWeek) {
      const missed = weekStats.daysInWeek - weekStats.days;
      improve.push(`${missed} hari belum tercatat minggu ini`);
    }

    if (weekStats.average < 4 && weekStats.days > 0) {
      improve.push('Rata-rata ibadah harian masih di bawah 4');
    }

    const inconsistentDays = weekStats.days - weekStats.completedDays;
    if (inconsistentDays > 2) {
      improve.push(`${inconsistentDays} hari dengan ibadah kurang lengkap`);
    }

    // Action items
    if (worstIbadah.length > 0) {
      const target = worstIbadah[0];
      actions.push(`Fokus tingkatkan ${target.label} minggu depan`);
    }

    if (weekStats.days < weekStats.daysInWeek) {
      actions.push('Usahakan catat ibadah setiap hari');
    }

    if (weekStats.average < 6) {
      actions.push('Target minimal 6 ibadah per hari');
    }

    // Specific suggestions based on data
    if (ibadahCounts['witir'] < weekStats.days * 0.5) {
      actions.push('Biasakan sholat witir sebelum tidur');
    }
    
    if (ibadahCounts['dhuha'] < weekStats.days * 0.5) {
      actions.push('Jadwalkan waktu khusus untuk sholat dhuha');
    }

    if (ibadahCounts['dzikir_pagipetang'] < weekStats.days * 0.5) {
      actions.push('Pasang reminder untuk dzikir pagi/petang');
    }

    // Default messages if empty
    if (good.length === 0) {
      good.push('Terus semangat memulai kebiasaan baik!');
    }
    if (improve.length === 0) {
      improve.push('Pertahankan konsistensi yang sudah baik');
    }
    if (actions.length === 0) {
      actions.push('Pertahankan rutinitas ibadah saat ini');
    }

    return {
      good: good.slice(0, 4),
      improve: improve.slice(0, 4),
      actions: actions.slice(0, 4)
    };
  }, [data, weekStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ibadah Harian</h1>
        <p className="text-gray-600">Tracking ibadah sunnah harian</p>
      </div>

      {/* Today's Form */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">
            Hari Ini - {new Date(today).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {IBADAH_FIELDS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => toggleField(key)}
              className={`p-4 rounded-xl border-2 transition-all ${
                todayForm[key]
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${todayForm[key] ? 'text-green-600' : 'text-gray-400'}`} />
              <div className="text-sm font-medium">{label}</div>
              {todayForm[key] && <Check className="w-4 h-4 mx-auto mt-2 text-green-600" />}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan (opsional)</label>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
            rows={2}
            placeholder="Catatan tambahan..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          Simpan Ibadah Hari Ini
        </button>
      </div>

      {/* Laporan Hari Ini & Pekan Ini */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Laporan Hari Ini */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Laporan Hari Ini</h2>
          </div>
          
          {todayRecord ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Ibadah Tercatat</p>
                  <p className="text-3xl font-bold">{todayStats.completed}/{todayStats.total}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-2xl font-bold">{todayStats.percentage}%</span>
                </div>
              </div>
              
              <div className="bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all"
                  style={{ width: `${todayStats.percentage}%` }}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {IBADAH_FIELDS.map(({ key, label, icon: Icon }) => (
                  (todayRecord as any)[key] && (
                    <span key={key} className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs">
                      <Icon className="w-3 h-3" />
                      {label.split(' ')[0]}
                    </span>
                  )
                ))}
              </div>
              
              {todayStats.percentage === 100 && (
                <div className="flex items-center gap-2 bg-white/20 rounded-lg p-3">
                  <Flame className="w-5 h-5 text-yellow-300" />
                  <span className="font-medium">Semua ibadah tercapai!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-emerald-100">Belum ada catatan hari ini</p>
              <p className="text-sm text-emerald-200 mt-1">Isi form di atas untuk mencatat ibadahmu</p>
            </div>
          )}
        </div>

        {/* Laporan Pekan Ini */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Laporan Pekan Ini</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{weekStats.days}</p>
                <p className="text-xs text-blue-100">Hari Tercatat</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{weekStats.totalIbadah}</p>
                <p className="text-xs text-blue-100">Total Ibadah</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{weekStats.average}</p>
                <p className="text-xs text-blue-100">Rata-rata/Hari</p>
              </div>
            </div>
            
            {weekStats.days > 0 && (
              <>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Konsistensi Pekan Ini</span>
                    <span className="font-bold">{weekStats.completedDays}/{weekStats.days} hari</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all"
                      style={{ width: `${weekStats.days > 0 ? (weekStats.completedDays / weekStats.days) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                {weekStats.completedDays >= 5 && (
                  <div className="flex items-center gap-2 bg-white/20 rounded-lg p-3">
                    <Flame className="w-5 h-5 text-yellow-300" />
                    <span className="font-medium">Pekan yang produktif!</span>
                  </div>
                )}
              </>
            )}
            
            {weekStats.days === 0 && (
              <div className="text-center py-2">
                <p className="text-blue-100">Belum ada catatan pekan ini</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Retrospektif Pekan Ini */}
      {weekStats.days > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
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

      {/* Statistics */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Statistik Bulan Ini</h2>
          <input
            type="month"
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {data && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Total hari tercatat: <span className="font-semibold text-gray-900">{data.total_hari} hari</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {IBADAH_FIELDS.map(({ key, label, icon: Icon }) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <Icon className="w-5 h-5 text-primary mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{data.statistik[key] || 0}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* History */}
      {data && data.ibadah.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-left text-gray-600">Tanggal</th>
                  {IBADAH_FIELDS.map(({ key, label }) => (
                    <th key={key} className="px-2 py-2 text-center text-gray-600" title={label}>
                      {label.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.ibadah.map((item) => (
                  <tr key={item.id_ibadah} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900">
                      {new Date(item.tgl_ibadah).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </td>
                    {IBADAH_FIELDS.map(({ key }) => (
                      <td key={key} className="px-2 py-2 text-center">
                        {(item as any)[key] ? (
                          <Check className="w-4 h-4 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
