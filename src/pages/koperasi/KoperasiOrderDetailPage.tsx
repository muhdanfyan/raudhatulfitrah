import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, Check, X, Loader2 } from 'lucide-react';



interface OrderItem {
  id: number;
  produk_id: number;
  produk?: {
    id: number;
    nama_produk: string;
    gambar?: string;
  };
  jumlah: number;
  harga_saat_order: number | string;
  subtotal: number | string;
}

interface Order {
  id: number;
  santri_id: number;
  santri?: {
    id_santri: number;
    nama_lengkap_santri: string;
    foto_santri?: string;
  };
  total_harga: number | string;
  tanggal_order: string;
  status_order: 'diproses' | 'selesai' | 'dibatalkan';
  catatan?: string;
  items?: OrderItem[];
}

export default function KoperasiOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);



  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      try {
        const json: any = await api.get(`/api/koperasi/orders/${id}`);
        if (json.success) {
          setOrder(json.data);
        } else {
          alert(json.message || 'Pesanan tidak ditemukan');
          navigate('/koperasi/orders');
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
        navigate('/koperasi/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus: 'selesai' | 'dibatalkan') => {
    if (!order) return;
    if (!confirm(`Apakah Anda yakin ingin mengubah status pesanan ini menjadi ${newStatus}?`)) return;
    
    setUpdating(true);
    try {
      const json: any = await api.put(`/api/koperasi/orders/${order.id}/status`, { status: newStatus });
      if (json.success) {
        setOrder({ ...order, status_order: newStatus });
        alert(`Status berhasil diubah menjadi ${newStatus}`);
      } else {
        alert(json.message || 'Gagal mengubah status');
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setUpdating(false);
    }
  };

  const formatRupiah = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numValue);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
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

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pesanan tidak ditemukan</p>
        <Link to="/koperasi/orders" className="text-primary hover:underline mt-2 inline-block">
          Kembali ke daftar pesanan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/koperasi/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan #{order.id}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Nama Santri</p>
              <p className="font-semibold text-gray-900 text-lg">
                {order.santri?.nama_lengkap_santri || `Santri #${order.santri_id}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Tanggal Order</p>
              <p className="font-medium text-gray-900">{formatDate(order.tanggal_order)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full 
                ${order.status_order === 'selesai' ? 'bg-green-100 text-green-800' : 
                  order.status_order === 'dibatalkan' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'}`}>
                {order.status_order.charAt(0).toUpperCase() + order.status_order.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Pesanan</p>
              <p className="font-bold text-green-600 text-xl">{formatRupiah(order.total_harga)}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Item Pesanan</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.produk?.nama_produk || `Produk #${item.produk_id}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">
                        {formatRupiah(item.harga_saat_order)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.jumlah}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatRupiah(item.subtotal)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      Tidak ada item
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">Total</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                    {formatRupiah(order.total_harga)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {order.catatan && (
            <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-800 mb-1">Catatan:</h4>
              <p className="text-sm text-yellow-700">{order.catatan}</p>
            </div>
          )}
        </div>

        {order.status_order === 'diproses' && (
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={() => handleStatusChange('selesai')}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Selesaikan Pesanan
            </button>
            <button
              onClick={() => handleStatusChange('dibatalkan')}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              Batalkan Pesanan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
