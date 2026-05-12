import { useState, useEffect } from 'react';
import { Eye, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';



interface Order {
  id: number;
  santri_id: number;
  santri?: {
    id_santri: number;
    nama_lengkap_santri: string;
    foto_santri?: string;
  };
  total_harga: number;
  tanggal_order: string;
  status_order: 'diproses' | 'selesai' | 'dibatalkan';
  catatan?: string;
}

interface DashboardStats {
  total_pendapatan: number;
  pesanan_hari_ini: number;
  pesanan_diproses: number;
  produk_tersedia: number;
}

export default function KoperasiOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('');



  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const ordersParams = new URLSearchParams({ per_page: '50' });
      if (filter) ordersParams.append('status', filter);
      const ordersJson: any = await api.get(`/api/koperasi/orders?${ordersParams}`);
      if (ordersJson.success) {
        setOrders(ordersJson.data.data || []);
      }

      // Fetch stats
      const statsJson: any = await api.get('/api/dashboard/koperasi');
      if (statsJson.success) {
        setStats(statsJson.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleStatusChange = async (id: number, newStatus: 'selesai' | 'dibatalkan') => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status pesanan ini menjadi ${newStatus}?`)) return;
    
    setUpdating(id);
    try {
      const json: any = await api.put(`/api/koperasi/orders/${id}/status`, { status: newStatus });
      if (json.success) {
        setOrders(prev => prev.map(order => 
          order.id === id ? { ...order, status_order: newStatus } : order
        ));
        fetchData(); // Refresh stats
      } else {
        alert(json.message || 'Gagal mengubah status');
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setUpdating(null);
    }
  };

  const pendingOrders = orders.filter(o => o.status_order === 'diproses');

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Koperasi</h1>
        <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-lg">
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-500 p-5">
          <h4 className="text-gray-500 font-medium text-sm mb-1">Total Pendapatan</h4>
          <p className="text-2xl font-bold text-gray-900">{formatRupiah(stats?.total_pendapatan || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-primary p-5">
          <h4 className="text-gray-500 font-medium text-sm mb-1">Pesanan Hari Ini</h4>
          <p className="text-2xl font-bold text-gray-900">{stats?.pesanan_hari_ini || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-yellow-500 p-5">
          <h4 className="text-gray-500 font-medium text-sm mb-1">Pesanan Diproses</h4>
          <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-purple-500 p-5">
          <h4 className="text-gray-500 font-medium text-sm mb-1">Produk Tersedia</h4>
          <p className="text-2xl font-bold text-gray-900">{stats?.produk_tersedia || 0}</p>
        </div>
      </div>

      {/* Pending Orders Table */}
      {pendingOrders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-yellow-50">
            <h2 className="text-lg font-bold text-yellow-800">Pesanan Perlu Diproses ({pendingOrders.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Santri</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.santri?.nama_lengkap_santri || '-'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatRupiah(Number(order.total_harga))}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.tanggal_order)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link to={`/koperasi/detail_pesanan/${order.id}`} className="p-1.5 bg-primary/10 text-primary rounded hover:bg-blue-200" title="Detail">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleStatusChange(order.id, 'selesai')} 
                          disabled={updating === order.id}
                          className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 disabled:opacity-50" 
                          title="Selesaikan"
                        >
                          {updating === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleStatusChange(order.id, 'dibatalkan')} 
                          disabled={updating === order.id}
                          className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50" 
                          title="Batalkan"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Riwayat Pesanan</h2>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">Semua Status</option>
            <option value="diproses">Diproses</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Santri</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Belum ada pesanan
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.santri?.nama_lengkap_santri || '-'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatRupiah(Number(order.total_harga))}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.tanggal_order)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full 
                        ${order.status_order === 'selesai' ? 'bg-green-100 text-green-800' : 
                          order.status_order === 'dibatalkan' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {order.status_order.charAt(0).toUpperCase() + order.status_order.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/koperasi/detail_pesanan/${order.id}`} className="text-primary hover:text-primary-dark text-sm flex items-center gap-1">
                        <Eye className="w-4 h-4" /> Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
