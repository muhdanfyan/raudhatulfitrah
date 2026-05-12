import { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { API_URL, getHeaders } from '../../services/api';
import { Link } from 'react-router-dom';



interface TransaksiItem {
  id_dompet: number;
  tanggal_transaksi: string;
  jenis_transaksi: 'kredit' | 'debit';
  jumlah: number;
  deskripsi: string;
  keterangan: string;
}

export default function OrtuKeuanganPage() {
  const [transaksi, setTransaksi] = useState<TransaksiItem[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [totalKredit, setTotalKredit] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/ortu/keuangan`, {
        headers: getHeaders()
      });
      const json = await res.json();
      if (json.success) {
        setTransaksi(json.data.transaksi || []);
        setSaldo(json.data.saldo || 0);
        setTotalKredit(json.data.total_kredit || 0);
        setTotalDebit(json.data.total_debit || 0);
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
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
      <div className="flex items-center gap-3">
        <Link to="/ortu" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Keuangan</h1>
          <p className="text-sm text-gray-500">Saldo & transaksi dompet</p>
        </div>
      </div>

      {/* Saldo Card */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
        <p className="text-sm opacity-90">Saldo Dompet</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(saldo)}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <ArrowDownCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Total Masuk</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalKredit)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <ArrowUpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Total Keluar</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalDebit)}</p>
        </div>
      </div>

      {/* Transaksi List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Riwayat Transaksi</h3>
        </div>
        {transaksi.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Wallet className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Belum ada transaksi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transaksi.map((item) => (
              <div key={item.id_dompet} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    item.jenis_transaksi === 'kredit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {item.jenis_transaksi === 'kredit' 
                      ? <ArrowDownCircle className="w-5 h-5 text-green-600" />
                      : <ArrowUpCircle className="w-5 h-5 text-red-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.deskripsi || item.keterangan || (item.jenis_transaksi === 'kredit' ? 'Top Up' : 'Pembayaran')}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(item.tanggal_transaksi)}</p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  item.jenis_transaksi === 'kredit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.jenis_transaksi === 'kredit' ? '+' : '-'}{formatCurrency(item.jumlah)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
