import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHeaders, API_URL } from '../../services/api';

// Helper to get Cloudinary optimized URL
const getCloudinaryUrl = (url: string | null, width = 400, height = 300) => {
  if (!url) return null;
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
  }
  return url;
};

interface Campaign {
  id_programdonasi: number;
  nama_programdonasi: string;
  slug: string;
  anggaran_programdonasi: number;
  tanggal_mulai: string;
  tanggal_akhir: string;
  status_program: string;
  is_featured: boolean;
  total_donasi: number;
  jumlah_donatur: number;
  progress_persen: number;
  gambar_url: string | null;
}

interface Donation {
  id_donasi: number;
  nama_donatur: string;
  email_donatur: string;
  hp_donatur: string;
  nominal_donasi: number;
  tgl_donasi: string;
  status_donasi: string;
  is_anonymous: boolean;
  message: string;
  bukti_url: string | null;
  campaign: { nama_programdonasi: string };
}

interface Stats {
  total_campaigns: number;
  active_campaigns: number;
  total_collected: number;
  total_donors: number;
  pending_donations: number;
}

const API_BASE = API_URL;

const CrowdfundAdminPage: React.FC = () => {
  const [tab, setTab] = useState<'campaigns' | 'donations'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', search: '' });

  useEffect(() => {
    fetchData();
  }, [tab, filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = getHeaders();

      const statsRes = await fetch(`${API_BASE}/crowdfund-admin/stats`, { headers });
      const statsData = await statsRes.json();
      setStats(statsData.data);

      if (tab === 'campaigns') {
        const params = new URLSearchParams();
        if (filter.status) params.append('status', filter.status);
        if (filter.search) params.append('search', filter.search);
        const res = await fetch(`${API_BASE}/crowdfund-admin/campaigns?${params}`, { headers });
        const data = await res.json();
        setCampaigns(data.data?.data || data.data || []);
      } else {
        const params = new URLSearchParams();
        if (filter.status) params.append('status', filter.status);
        const res = await fetch(`${API_BASE}/crowdfund-admin/donations?${params}`, { headers });
        const data = await res.json();
        setDonations(data.data?.data || data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDonation = async (id: number, status: string) => {
    try {
      await fetch(`${API_BASE}/crowdfund-admin/donations/${id}/verify`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Gagal update status');
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    if (!confirm('Yakin hapus program ini?')) return;
    try {
      await fetch(`${API_BASE}/crowdfund-admin/campaigns/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-primary/10 text-primary-dark',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      transfered: 'bg-primary/10 text-primary-dark'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Crowdfunding - Donasi Program</h1>
        <Link
          to="/crowdfund/campaigns/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Program
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-800">{stats.total_campaigns}</div>
            <div className="text-sm text-gray-500">Total Program</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.active_campaigns}</div>
            <div className="text-sm text-gray-500">Aktif</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.total_collected)}</div>
            <div className="text-sm text-gray-500">Terkumpul</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-primary">{stats.total_donors}</div>
            <div className="text-sm text-gray-500">Donatur</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_donations}</div>
            <div className="text-sm text-gray-500">Perlu Verifikasi</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('campaigns')}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'campaigns' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Program Donasi
        </button>
        <button
          onClick={() => setTab('donations')}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'donations' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Daftar Donasi {stats?.pending_donations ? <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.pending_donations}</span> : null}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4 flex-wrap">
        {tab === 'campaigns' && (
          <>
            <input
              type="text"
              placeholder="Cari nama program..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="border rounded-lg px-3 py-2 w-64"
            />
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="active">Aktif</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </>
        )}
        {tab === 'donations' && (
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="transfered">Transferred</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : tab === 'campaigns' ? (
        /* Campaigns Table */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Program</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Target</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Terkumpul</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Progress</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((c) => (
                <tr key={c.id_programdonasi} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {c.gambar_url ? (
                          <img src={getCloudinaryUrl(c.gambar_url, 48, 48) || ''} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{c.nama_programdonasi}</div>
                        <div className="text-sm text-gray-500">{c.jumlah_donatur} donatur</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatCurrency(c.anggaran_programdonasi)}</td>
                  <td className="px-4 py-3 text-emerald-600 font-medium">{formatCurrency(c.total_donasi)}</td>
                  <td className="px-4 py-3">
                    <div className="w-24">
                      <div className="text-sm text-gray-600 mb-1">{c.progress_persen}%</div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(c.progress_persen, 100)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(c.status_program)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/crowdfund/campaigns/${c.id_programdonasi}/edit`}
                        className="p-2 text-primary hover:bg-primary/5 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <Link
                        to={`/crowdfund/campaigns/${c.id_programdonasi}/donations`}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDeleteCampaign(c.id_programdonasi)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {campaigns.length === 0 && (
            <div className="text-center py-12 text-gray-500">Belum ada program donasi</div>
          )}
        </div>
      ) : (
        /* Donations Table */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Donatur</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Program</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nominal</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tanggal</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {donations.map((d) => (
                <tr key={d.id_donasi} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{d.is_anonymous ? 'Hamba Allah' : d.nama_donatur}</div>
                    <div className="text-sm text-gray-500">{d.email_donatur}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.campaign?.nama_programdonasi || '-'}</td>
                  <td className="px-4 py-3 text-emerald-600 font-medium">{formatCurrency(d.nominal_donasi)}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(d.tgl_donasi).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3">{getStatusBadge(d.status_donasi)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {d.bukti_url && (
                        <a href={d.bukti_url} target="_blank" rel="noopener" className="p-2 text-primary hover:bg-primary/5 rounded" title="Lihat Bukti">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                      )}
                      {d.status_donasi === 'pending' && (
                        <>
                          <button onClick={() => handleVerifyDonation(d.id_donasi, 'verified')} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Verifikasi">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button onClick={() => handleVerifyDonation(d.id_donasi, 'cancelled')} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Tolak">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {donations.length === 0 && (
            <div className="text-center py-12 text-gray-500">Belum ada donasi</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CrowdfundAdminPage;
