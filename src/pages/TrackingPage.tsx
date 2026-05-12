import { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, Send, Clock, Trophy, Monitor, 
  RefreshCw, Loader2, Copy, CheckCircle, Target, 
  TrendingUp, Calendar, AlertCircle, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

interface TrackingData {
  id: number;
  tanggal: string;
  status: 'active' | 'paused' | 'completed' | 'submitted';
  rencana_belajar: string;
  kategori_rencana: string;
  target_durasi: number;
  total_durasi: number;
  total_produktif: number;
  formatted_durasi: string;
  productivity_percentage: number;
  target_progress: number;
  started_at: string | null;
  started_at_full: string | null;
  ended_at: string | null;
  summaries: { nama_app: string; kategori: string; percentage: number; formatted_durasi: string }[];
}

interface LeaderboardItem {
  rank: number;
  santri_id: number;
  nama: string;
  foto: string;
  total_jam: number;
  avg_productivity: number;
  hari_tracking: number;
}

interface HistoryItem {
  id: number;
  tanggal: string;
  hari: string;
  status: string;
  review_status: string | null;
  total_durasi: number;
  formatted_durasi: string;
  productivity_percentage: number;
  rencana_belajar: string;
}

const KATEGORI_OPTIONS = [
  'Web Development',
  'Mobile Development', 
  'Backend Development',
  'UI/UX Design',
  'Data Science',
  'DevOps',
  'Tahfidz',
  'Lainnya',
];

export default function TrackingPage() {
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [hasDevice, setHasDevice] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{ device_name: string; last_seen: string } | null>(null);
  
  const [showStartForm, setShowStartForm] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  
  const [rencana, setRencana] = useState('');
  const [kategori, setKategori] = useState('');
  const [targetDurasi, setTargetDurasi] = useState(480);
  const [linkRef, setLinkRef] = useState('');
  
  const [hasil, setHasil] = useState('');
  const [linkHasil, setLinkHasil] = useState('');
  const [kendala, setKendala] = useState('');
  
  const [token, setToken] = useState('');
  const [tokenCopied, setTokenCopied] = useState(false);
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'leaderboard'>('today');
  const [liveDurasi, setLiveDurasi] = useState(0);

  // Calculate live duration from started_at
  useEffect(() => {
    if (!tracking?.started_at_full || tracking.status !== 'active') {
      setLiveDurasi(tracking?.total_durasi || 0);
      return;
    }

    const startTime = new Date(tracking.started_at_full).getTime();
    
    const updateDurasi = () => {
      const now = Date.now();
      const diffMinutes = Math.floor((now - startTime) / 60000);
      setLiveDurasi(diffMinutes);
    };

    updateDurasi();
    const interval = setInterval(updateDurasi, 1000);
    return () => clearInterval(interval);
  }, [tracking?.started_at_full, tracking?.status, tracking?.total_durasi]);

  // Fetch data on mount and periodically when tracking is active
  useEffect(() => {
    fetchData();
    
    // Refresh data every 30 seconds when tracking is active
    const interval = setInterval(() => {
      if (tracking?.status === 'active') {
        fetchData();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [todayRes, historyRes, leaderboardRes, statsRes] = await Promise.all([
        api.getTrackingToday(),
        api.getTrackingHistory(),
        api.getTrackingLeaderboard(),
        api.getTrackingStats(),
      ]);
      
      setTracking(todayRes.data?.tracking || null);
      setHasDevice(todayRes.data?.has_device || false);
      setDeviceInfo(todayRes.data?.device || null);
      setHistory(historyRes.data || []);
      setLeaderboard(leaderboardRes.data?.leaderboard || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Error fetching tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!rencana.trim()) return;
    setActionLoading(true);
    try {
      await api.startTracking({
        rencana_belajar: rencana,
        kategori_rencana: kategori || undefined,
        target_durasi: targetDurasi,
        link_referensi: linkRef || undefined,
      });
      setShowStartForm(false);
      setRencana('');
      setKategori('');
      setLinkRef('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal memulai tracking');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    setActionLoading(true);
    try {
      await api.pauseTracking();
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      await api.resumeTracking();
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!confirm('Yakin ingin mengakhiri sesi tracking hari ini?')) return;
    setActionLoading(true);
    try {
      await api.endTracking();
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!hasil.trim()) return;
    setActionLoading(true);
    try {
      await api.submitTracking({
        hasil_belajar: hasil,
        link_hasil: linkHasil || undefined,
        kendala: kendala || undefined,
      });
      setShowSubmitForm(false);
      setHasil('');
      setLinkHasil('');
      setKendala('');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateToken = async () => {
    setActionLoading(true);
    try {
      const res = await api.generateTrackingToken();
      setToken(res.data?.token || '');
      setShowTokenModal(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const formatDurasi = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}j ${m}m`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-primary/10 text-primary-dark',
      submitted: 'bg-purple-100 text-purple-800',
    };
    const labels: Record<string, string> = {
      active: 'Aktif',
      paused: 'Pause',
      completed: 'Selesai',
      submitted: 'Terkirim',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600">Pantau produktivitas belajarmu</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['today', 'history', 'leaderboard'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'today' ? 'Hari Ini' : tab === 'history' ? 'Riwayat' : 'Leaderboard'}
          </button>
        ))}
      </div>

      {/* Today Tab */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Device Status */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className={`w-5 h-5 ${hasDevice ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className="font-medium text-gray-900">
                    {hasDevice ? 'Desktop Agent Terhubung' : 'Desktop Agent Belum Terhubung'}
                  </p>
                  {deviceInfo && (
                    <p className="text-sm text-gray-500">
                      {deviceInfo.device_name} - Terakhir aktif {deviceInfo.last_seen}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleGenerateToken}
                disabled={actionLoading}
                className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {hasDevice ? 'Lihat Token' : 'Generate Token'}
              </button>
            </div>
          </div>

          {/* Today's Tracking */}
          {tracking ? (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-semibold text-gray-900">Sesi Hari Ini</h2>
                      {getStatusBadge(tracking.status)}
                    </div>
                    <p className="text-gray-600">{tracking.rencana_belajar}</p>
                    {tracking.kategori_rencana && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {tracking.kategori_rencana}
                      </span>
                    )}
                  </div>
                  {tracking.started_at && (
                    <p className="text-sm text-gray-500">
                      Mulai: {tracking.started_at}
                      {tracking.ended_at && ` - Selesai: ${tracking.ended_at}`}
                    </p>
                  )}
                </div>

                {/* Progress */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-primary/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Total Durasi</span>
                    </div>
                    <p className="text-xl font-bold text-blue-900">{formatDurasi(liveDurasi)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Produktivitas</span>
                    </div>
                    <p className="text-xl font-bold text-green-900">{tracking.productivity_percentage}%</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-purple-600 mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">Target</span>
                    </div>
                    <p className="text-xl font-bold text-purple-900">{tracking.target_durasi > 0 ? Math.round((liveDurasi / tracking.target_durasi) * 100) : 0}%</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Target Durasi</span>
                    </div>
                    <p className="text-xl font-bold text-orange-900">{Math.floor(tracking.target_durasi / 60)}j {tracking.target_durasi % 60}m</p>
                  </div>
                </div>

                {/* App Summary */}
                {tracking.summaries && tracking.summaries.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">Aplikasi Digunakan</h3>
                    <div className="space-y-2">
                      {tracking.summaries.slice(0, 5).map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{s.nama_app}</span>
                              <span className="text-xs text-gray-500">{s.formatted_durasi}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  s.kategori === 'productive' ? 'bg-green-500' :
                                  s.kategori === 'unproductive' ? 'bg-red-500' : 'bg-gray-400'
                                }`}
                                style={{ width: `${s.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  {tracking.status === 'active' && (
                    <>
                      <button
                        onClick={handlePause}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </button>
                      <button
                        onClick={handleEnd}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        <Square className="w-4 h-4" />
                        Selesai
                      </button>
                    </>
                  )}
                  {tracking.status === 'paused' && (
                    <>
                      <button
                        onClick={handleResume}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <Play className="w-4 h-4" />
                        Lanjutkan
                      </button>
                      <button
                        onClick={handleEnd}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        <Square className="w-4 h-4" />
                        Selesai
                      </button>
                    </>
                  )}
                  {tracking.status === 'completed' && (
                    <button
                      onClick={() => setShowSubmitForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                    >
                      <Send className="w-4 h-4" />
                      Kirim Laporan
                    </button>
                  )}
                  {tracking.status === 'submitted' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Laporan sudah dikirim</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Sesi Hari Ini</h2>
              <p className="text-gray-600 mb-6">Mulai tracking untuk memantau produktivitas belajarmu</p>
              <button
                onClick={() => setShowStartForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                <Play className="w-5 h-5" />
                Mulai Tracking
              </button>
            </div>
          )}

          {/* Weekly Stats */}
          {stats && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistik Minggu Ini</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Hari</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.weekly?.total_hari || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Jam</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.weekly?.total_jam || 0}j</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jam Produktif</p>
                  <p className="text-2xl font-bold text-green-600">{stats.weekly?.total_produktif_jam || 0}j</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rata-rata Produktivitas</p>
                  <p className="text-2xl font-bold text-primary">{stats.weekly?.avg_productivity || 0}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="divide-y">
            {history.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Belum ada riwayat tracking
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{item.hari}, {item.tanggal}</span>
                        {getStatusBadge(item.status)}
                        {item.review_status && (
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            item.review_status === 'approved' ? 'bg-green-100 text-green-800' :
                            item.review_status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.review_status === 'approved' ? 'Disetujui' :
                             item.review_status === 'rejected' ? 'Ditolak' : 'Pending'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">{item.rencana_belajar}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{item.formatted_durasi}</p>
                      <p className="text-sm text-gray-500">{item.productivity_percentage}% produktif</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gradient-to-r from-yellow-50 to-orange-50">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <h2 className="font-semibold text-gray-900">Leaderboard Minggu Ini</h2>
            </div>
          </div>
          <div className="divide-y">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Belum ada data leaderboard
              </div>
            ) : (
              leaderboard.map((item) => (
                <div key={item.santri_id} className={`p-4 flex items-center gap-4 ${
                  item.rank <= 3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    item.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                    item.rank === 2 ? 'bg-gray-300 text-gray-700' :
                    item.rank === 3 ? 'bg-orange-300 text-orange-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.rank}
                  </div>
                  <img
                    src={item.foto || '/default-avatar.png'}
                    alt={item.nama}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.nama}</p>
                    <p className="text-sm text-gray-500">{item.hari_tracking} hari tracking</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.total_jam}j</p>
                    <p className="text-sm text-green-600">{item.avg_productivity}% produktif</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Start Form Modal */}
      {showStartForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mulai Tracking</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rencana Belajar <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rencana}
                  onChange={(e) => setRencana(e.target.value)}
                  placeholder="Apa yang akan kamu pelajari hari ini?"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Kategori</option>
                  {KATEGORI_OPTIONS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Durasi (menit)
                </label>
                <input
                  type="number"
                  value={targetDurasi}
                  onChange={(e) => setTargetDurasi(Number(e.target.value))}
                  min={30}
                  max={720}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {Math.floor(targetDurasi / 60)} jam {targetDurasi % 60} menit
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Referensi (opsional)
                </label>
                <input
                  type="url"
                  value={linkRef}
                  onChange={(e) => setLinkRef(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowStartForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleStart}
                disabled={!rencana.trim() || actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Mulai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Form Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Kirim Laporan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasil Belajar <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={hasil}
                  onChange={(e) => setHasil(e.target.value)}
                  placeholder="Apa yang sudah kamu pelajari/kerjakan hari ini?"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Hasil (opsional)
                </label>
                <input
                  type="url"
                  value={linkHasil}
                  onChange={(e) => setLinkHasil(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kendala (opsional)
                </label>
                <textarea
                  value={kendala}
                  onChange={(e) => setKendala(e.target.value)}
                  placeholder="Kendala yang dihadapi..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSubmitForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!hasil.trim() || actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Token Desktop Agent</h2>
            <p className="text-gray-600 mb-4">
              Gunakan token ini untuk mengaktifkan Desktop Agent di komputer kamu.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm break-all mb-4">
              {token}
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyToken}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                {tokenCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {tokenCopied ? 'Tersalin!' : 'Salin Token'}
              </button>
              <button
                onClick={() => setShowTokenModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Tutup
              </button>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  Jangan bagikan token ini ke orang lain. Token ini hanya untuk komputer kamu.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
