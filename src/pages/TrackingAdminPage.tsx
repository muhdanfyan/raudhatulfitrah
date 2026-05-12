import { useState, useEffect } from 'react';
import { 
  Users, Clock, TrendingUp, AlertTriangle, Monitor, 
  RefreshCw, Loader2, CheckCircle, XCircle, Eye,
  ChevronLeft, ChevronRight, Search, Filter
} from 'lucide-react';
import { api, API_URL } from '../services/api';
import { getStudentPhotoUrl } from '../utils/imageUtils';

const getAvatarUrl = (foto: string | null, nama: string) => {
  if (foto) return getStudentPhotoUrl(foto, `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=random&size=100`);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=random&size=100`;
};

interface RealtimeSantri {
  id: number;
  nama: string;
  foto: string;
  tracking_status: string;
  total_durasi: number;
  productivity: number;
  is_online: boolean;
  device_name: string | null;
}

interface RealtimeStats {
  total_santri: number;
  online: number;
  tracking: number;
  idle: number;
  belum_mulai: number;
}

interface Report {
  id: number;
  santri: { id: number; nama: string; foto: string };
  tanggal: string;
  status: string;
  review_status: string;
  rencana_belajar: string;
  hasil_belajar: string;
  total_durasi: number;
  formatted_durasi: string;
  productivity_percentage: number;
}

interface ReportDetail {
  id: number;
  santri: { id: number; nama: string; foto: string };
  tanggal: string;
  status: string;
  review_status: string;
  review_note: string | null;
  reviewer: string | null;
  reviewed_at: string | null;
  rencana_belajar: string;
  kategori_rencana: string | null;
  target_durasi: number;
  link_referensi: string | null;
  hasil_belajar: string | null;
  link_hasil: string | null;
  kendala: string | null;
  total_durasi: number;
  total_produktif: number;
  total_idle: number;
  formatted_durasi: string;
  productivity_percentage: number;
  target_progress: number;
  started_at: string | null;
  ended_at: string | null;
  summaries: { nama_app: string; kategori: string; total_durasi: number; percentage: number }[];
  violations: { id: number; tipe: string; tipe_label: string; deskripsi: string; durasi: number; status: string }[];
}

export default function TrackingAdminPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'realtime' | 'reports' | 'devices'>('realtime');
  
  // Realtime
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
  const [realtimeSantri, setRealtimeSantri] = useState<RealtimeSantri[]>([]);
  
  // Reports
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsMeta, setReportsMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  
  // Detail Modal
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);
  
  // Review
  const [reviewNote, setReviewNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  
  // Devices
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'realtime') {
      fetchRealtime();
      const interval = setInterval(fetchRealtime, 30000);
      return () => clearInterval(interval);
    } else if (activeTab === 'reports') {
      fetchReports();
    } else if (activeTab === 'devices') {
      fetchDevices();
    }
  }, [activeTab, reportFilter]);

  const fetchRealtime = async () => {
    try {
      const res = await api.getTrackingRealtime();
      setRealtimeStats(res.data?.stats || null);
      setRealtimeSantri(res.data?.santri || []);
    } catch (err) {
      console.error('Error fetching realtime:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (reportFilter !== 'all') params.status = reportFilter;
      const res = await api.getTrackingReports(params);
      // res.data is paginated: { data: [...], current_page, last_page, total }
      setReports(res.data?.data || []);
      setReportsMeta({
        current_page: res.data?.current_page || 1,
        last_page: res.data?.last_page || 1,
        total: res.data?.total || 0
      });
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await api.getTrackingDevices();
      // res.data is paginated: { data: [...], ... }
      setDevices(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id: number) => {
    setDetailLoading(true);
    setShowDetail(true);
    try {
      const res = await api.getTrackingReportDetail(id);
      setReportDetail(res.data || null);
      setReviewNote(res.data?.review_note || '');
    } catch (err) {
      console.error('Error fetching detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReview = async (status: 'approved' | 'rejected' | 'need_clarification') => {
    if (!reportDetail) return;
    setReviewLoading(true);
    try {
      await api.reviewTracking(reportDetail.id, { status, note: reviewNote || undefined });
      setShowDetail(false);
      setReportDetail(null);
      fetchReports();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleRevokeDevice = async (id: number) => {
    if (!confirm('Yakin ingin menonaktifkan device ini?')) return;
    try {
      await api.revokeTrackingDevice(id);
      fetchDevices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-primary/10 text-primary-dark',
      submitted: 'bg-purple-100 text-purple-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      need_clarification: 'bg-orange-100 text-orange-800',
    };
    const labels: Record<string, string> = {
      active: 'Aktif',
      paused: 'Pause',
      completed: 'Selesai',
      submitted: 'Terkirim',
      pending: 'Pending',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      need_clarification: 'Perlu Klarifikasi',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoring Time Tracking</h1>
          <p className="text-gray-600">Pantau dan review aktivitas tracking santri</p>
        </div>
        <button
          onClick={() => activeTab === 'realtime' ? fetchRealtime() : activeTab === 'reports' ? fetchReports() : fetchDevices()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { key: 'realtime', label: 'Realtime', icon: Users },
          { key: 'reports', label: 'Laporan', icon: Clock },
          { key: 'devices', label: 'Devices', icon: Monitor },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Realtime Tab */}
      {activeTab === 'realtime' && (
        <div className="space-y-6">
          {/* Stats */}
          {realtimeStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <p className="text-sm text-gray-500">Total Santri</p>
                <p className="text-2xl font-bold text-gray-900">{realtimeStats.total_santri}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <p className="text-sm text-gray-500">Online</p>
                <p className="text-2xl font-bold text-green-600">{realtimeStats.online}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <p className="text-sm text-gray-500">Tracking</p>
                <p className="text-2xl font-bold text-primary">{realtimeStats.tracking}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <p className="text-sm text-gray-500">Idle/Pause</p>
                <p className="text-2xl font-bold text-yellow-600">{realtimeStats.idle}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <p className="text-sm text-gray-500">Belum Mulai</p>
                <p className="text-2xl font-bold text-gray-400">{realtimeStats.belum_mulai}</p>
              </div>
            </div>
          )}

          {/* Santri List */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Status Santri</h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {realtimeSantri.map((s) => (
                  <div key={s.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                    <div className="relative">
                      <img
                        src={getAvatarUrl(s.foto, s.nama)}
                        alt={s.nama}
                        className="w-10 h-10 rounded-full object-cover bg-gray-200"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.nama)}&background=random&size=100`; }}
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        s.is_online ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{s.nama}</p>
                      <p className="text-sm text-gray-500">
                        {s.device_name || 'No device'}
                      </p>
                    </div>
                    <div className="text-center">
                      {getStatusBadge(s.tracking_status)}
                    </div>
                    <div className="text-right w-24">
                      <p className="font-semibold text-gray-900">
                        {Math.floor(s.total_durasi / 60)}j {s.total_durasi % 60}m
                      </p>
                      <p className="text-sm text-green-600">{s.productivity}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            {[
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Disetujui' },
              { key: 'rejected', label: 'Ditolak' },
              { key: 'all', label: 'Semua' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setReportFilter(key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  reportFilter === key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Tidak ada laporan
              </div>
            ) : (
              <div className="divide-y">
                {reports.map((r) => (
                  <div key={r.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <img
                        src={getAvatarUrl(r.santri.foto, r.santri.nama)}
                        alt={r.santri.nama}
                        className="w-10 h-10 rounded-full object-cover bg-gray-200"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.santri.nama)}&background=random&size=100`; }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{r.santri.nama}</span>
                          {getStatusBadge(r.review_status)}
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{r.tanggal}</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{r.rencana_belajar}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{r.formatted_durasi}</p>
                        <p className="text-sm text-green-600">{r.productivity_percentage}%</p>
                        <button
                          onClick={() => openDetail(r.id)}
                          className="mt-2 flex items-center gap-1 text-sm text-primary hover:text-primary-dark"
                        >
                          <Eye className="w-4 h-4" />
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : devices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Tidak ada device terdaftar
            </div>
          ) : (
            <div className="divide-y">
              {devices.map((d: any) => (
                <div key={d.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                  <Monitor className={`w-8 h-8 ${d.is_online ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{d.santri?.nama}</p>
                    <p className="text-sm text-gray-500">
                      {d.device_name || 'Unknown'} - {d.os} - {d.agent_version || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Token: {d.token} | Last seen: {d.last_seen_at || 'Never'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      d.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {d.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {d.is_active && (
                      <button
                        onClick={() => handleRevokeDevice(d.id)}
                        className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {detailLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : reportDetail ? (
              <>
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrl(reportDetail.santri.foto, reportDetail.santri.nama)}
                        alt={reportDetail.santri.nama}
                        className="w-12 h-12 rounded-full object-cover bg-gray-200"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reportDetail.santri.nama)}&background=random&size=100`; }}
                      />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{reportDetail.santri.nama}</h2>
                        <p className="text-sm text-gray-500">{reportDetail.tanggal}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(reportDetail.status)}
                      {reportDetail.review_status && getStatusBadge(reportDetail.review_status)}
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm text-primary">Durasi</p>
                      <p className="font-bold text-blue-900">{reportDetail.formatted_durasi}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Produktif</p>
                      <p className="font-bold text-green-900">{reportDetail.productivity_percentage}%</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600">Target</p>
                      <p className="font-bold text-purple-900">{reportDetail.target_progress}%</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Idle</p>
                      <p className="font-bold text-gray-900">{reportDetail.total_idle}m</p>
                    </div>
                  </div>

                  {/* Rencana */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Rencana Belajar</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{reportDetail.rencana_belajar}</p>
                    {reportDetail.kategori_rencana && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary-dark text-xs rounded">
                        {reportDetail.kategori_rencana}
                      </span>
                    )}
                  </div>

                  {/* Hasil */}
                  {reportDetail.hasil_belajar && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Hasil Belajar</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{reportDetail.hasil_belajar}</p>
                      {reportDetail.link_hasil && (
                        <a href={reportDetail.link_hasil} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 inline-block">
                          {reportDetail.link_hasil}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Kendala */}
                  {reportDetail.kendala && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Kendala</h3>
                      <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{reportDetail.kendala}</p>
                    </div>
                  )}

                  {/* App Summary */}
                  {reportDetail.summaries && reportDetail.summaries.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Aplikasi Digunakan</h3>
                      <div className="space-y-2">
                        {reportDetail.summaries.map((s, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                s.kategori === 'productive' ? 'bg-green-500' :
                                s.kategori === 'unproductive' ? 'bg-red-500' : 'bg-gray-400'
                              }`} />
                              <span className="text-sm">{s.nama_app}</span>
                            </div>
                            <span className="text-sm text-gray-500">{s.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Violations */}
                  {reportDetail.violations && reportDetail.violations.length > 0 && (
                    <div>
                      <h3 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Pelanggaran
                      </h3>
                      <div className="space-y-2">
                        {reportDetail.violations.map((v) => (
                          <div key={v.id} className="p-3 bg-red-50 rounded-lg">
                            <p className="font-medium text-red-900">{v.tipe_label}</p>
                            <p className="text-sm text-red-700">{v.deskripsi}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Note */}
                  {reportDetail.review_status === 'pending' && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Catatan Review</h3>
                      <textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Tulis catatan untuk santri (opsional)..."
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Previous Review */}
                  {reportDetail.reviewer && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">
                        Direview oleh {reportDetail.reviewer} pada {reportDetail.reviewed_at}
                      </p>
                      {reportDetail.review_note && (
                        <p className="text-sm text-gray-700 mt-1">{reportDetail.review_note}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t bg-gray-50 flex justify-between">
                  <button
                    onClick={() => { setShowDetail(false); setReportDetail(null); }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
                  >
                    Tutup
                  </button>
                  {reportDetail.review_status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview('need_clarification')}
                        disabled={reviewLoading}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                      >
                        Perlu Klarifikasi
                      </button>
                      <button
                        onClick={() => handleReview('rejected')}
                        disabled={reviewLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Tolak
                      </button>
                      <button
                        onClick={() => handleReview('approved')}
                        disabled={reviewLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Setujui
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Data tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
