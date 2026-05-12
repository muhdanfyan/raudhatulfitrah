import { useState, useEffect } from 'react';
import { Search, Loader2, Plus, Wallet, X, History } from 'lucide-react';
import { api } from '../../services/api';
import { getStudentPhotoUrl } from '../../utils/imageUtils';

interface SantriWallet {
  id_santri: number;
  nama_lengkap_santri: string;
  foto_santri?: string;
  saldo: number | string;
}

interface Transaksi {
  id_dompet: number;
  jenis_transaksi: 'kredit' | 'debit';
  jumlah: number | string;
  deskripsi: string;
  tanggal_transaksi: string;
}

export default function KoperasiDompetPage() {
  const [wallets, setWallets] = useState<SantriWallet[]>([]);
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Topup modal
  const [showTopup, setShowTopup] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<SantriWallet | null>(null);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupDesc, setTopupDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // History modal
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<{ santri: any; saldo: number; transaksi: Transaksi[] } | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);



  const fetchWallets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: '200' });
      if (searchTerm) params.append('search', searchTerm);

      const json: any = await api.get(`/api/koperasi/dompet?${params}`);
      if (json.success) {
        setWallets(json.data.data || []);
        setTotalSaldo(json.total_saldo_semua || 0);
      }
    } catch (err) {
      console.error('Failed to fetch wallets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWallets();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleTopup = async () => {
    if (!selectedSantri || !topupAmount) return;
    
    const amount = parseInt(topupAmount);
    if (isNaN(amount) || amount < 1000) {
      alert('Jumlah minimal Rp 1.000');
      return;
    }
 
    setSubmitting(true);
    try {
      const json: any = await api.post(`/api/koperasi/dompet/topup`, {
        santri_id: selectedSantri.id_santri,
        jumlah: amount,
        deskripsi: topupDesc || 'Top up saldo',
      });
      if (json.success) {
        alert('Top up berhasil!');
        setShowTopup(false);
        setTopupAmount('');
        setTopupDesc('');
        setSelectedSantri(null);
        fetchWallets();
      } else {
        alert(json.message || 'Gagal top up');
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const openHistory = async (santri: SantriWallet) => {
    setSelectedSantri(santri);
    setShowHistory(true);
    setLoadingHistory(true);
    
    try {
      const json: any = await api.get(`/api/koperasi/dompet/${santri.id_santri}/transaksi`);
      if (json.success) {
        setHistoryData(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoadingHistory(false);
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
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dompet Santri</h1>

      {/* Total Saldo Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-6 h-6" />
          <span className="text-blue-100 font-medium">Total Saldo Semua Santri</span>
        </div>
        <p className="text-3xl font-bold">{formatRupiah(totalSaldo)}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari nama santri..."
          className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary w-full shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Wallets Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : wallets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Tidak ada santri yang ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wallets.map((wallet) => (
            <div 
              key={wallet.id_santri} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={getStudentPhotoUrl(wallet.foto_santri, `https://ui-avatars.com/api/?name=${encodeURIComponent(wallet.nama_lengkap_santri)}&background=e0e0e0&color=666&size=48`)}
                  alt={wallet.nama_lengkap_santri}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(wallet.nama_lengkap_santri)}&background=e0e0e0&color=666&size=48`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-gray-900 truncate">{wallet.nama_lengkap_santri}</h5>
                  <p className="text-green-600 font-bold">{formatRupiah(wallet.saldo)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setSelectedSantri(wallet); setShowTopup(true); }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                >
                  <Plus className="w-4 h-4" /> Top Up
                </button>
                <button
                  onClick={() => openHistory(wallet)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-primary/10 text-primary-dark rounded-lg hover:bg-blue-200 text-sm"
                >
                  <History className="w-4 h-4" /> Riwayat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Topup Modal */}
      {showTopup && selectedSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Top Up Saldo</h2>
              <button onClick={() => setShowTopup(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Santri</p>
                <p className="font-semibold text-gray-900">{selectedSantri.nama_lengkap_santri}</p>
                <p className="text-sm text-green-600">Saldo saat ini: {formatRupiah(selectedSantri.saldo)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Top Up</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="Minimal Rp 1.000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (opsional)</label>
                <input
                  type="text"
                  value={topupDesc}
                  onChange={(e) => setTopupDesc(e.target.value)}
                  placeholder="Contoh: Setoran dari orang tua"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowTopup(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleTopup}
                disabled={submitting || !topupAmount}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Top Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && selectedSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Riwayat Transaksi</h2>
                <p className="text-sm text-gray-500">{selectedSantri.nama_lengkap_santri}</p>
              </div>
              <button onClick={() => { setShowHistory(false); setHistoryData(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {historyData && (
              <div className="p-4 bg-green-50 border-b">
                <p className="text-sm text-green-700">Saldo Saat Ini</p>
                <p className="text-2xl font-bold text-green-600">{formatRupiah(historyData.saldo)}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : !historyData || historyData.transaksi.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Belum ada transaksi</p>
              ) : (
                <div className="space-y-3">
                  {historyData.transaksi.map((trx) => (
                    <div key={trx.id_dompet} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{trx.deskripsi}</p>
                        <p className="text-xs text-gray-500">{formatDate(trx.tanggal_transaksi)}</p>
                      </div>
                      <p className={`font-bold ${trx.jenis_transaksi === 'kredit' ? 'text-green-600' : 'text-red-600'}`}>
                        {trx.jenis_transaksi === 'kredit' ? '+' : '-'}{formatRupiah(trx.jumlah)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
