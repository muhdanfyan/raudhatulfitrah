import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, BookOpen, Calendar, AlertTriangle, Wallet, 
  GraduationCap, Clock, Loader2, Award
} from 'lucide-react';
import { API_URL, getHeaders } from '../../services/api';

interface SantriData {
  id_santri: number;
  nama: string;
  panggilan: string;
  foto: string;
  foto_url?: string;
  status: string;
  email: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  angkatan_nama: string;
  konsentrasi_nama: string;
}

interface Stats {
  total_setoran: number;
  total_surah: number;
  presensi_bulan_ini: number;
  skoring_pekanan: {
    poin: number;
    target: number;
    persentase: number;
  };
  sanksi_aktif: number;
  saldo_dompet: number;
  izin_aktif: number;
}

interface DashboardData {
  santri: SantriData;
  stats: Stats;
}

export default function OrtuDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/ortu/dashboard`, {
        headers: getHeaders()
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Gagal memuat data');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'Data tidak tersedia'}
        </div>
      </div>
    );
  }

  const { santri, stats } = data;

  const menuItems = [
    { icon: BookOpen, label: 'Tahfidz', href: '/ortu/tahfidz', color: 'bg-green-500', desc: 'Riwayat hafalan Al-Quran' },
    { icon: Calendar, label: 'Presensi', href: '/ortu/presensi', color: 'bg-primary-light', desc: 'Kehadiran per bulan' },
    { icon: AlertTriangle, label: 'Sanksi', href: '/ortu/sanksi', color: 'bg-red-500', desc: 'Pelanggaran & sanksi' },
    { icon: Wallet, label: 'Keuangan', href: '/ortu/keuangan', color: 'bg-yellow-500', desc: 'Saldo & transaksi' },
    { icon: GraduationCap, label: 'Akademik', href: '/ortu/akademik', color: 'bg-purple-500', desc: 'Review & portfolio' },
    { icon: Clock, label: 'Izin', href: '/ortu/izin', color: 'bg-orange-500', desc: 'Riwayat perizinan' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-xl font-semibold mb-1">Portal Orang Tua</h1>
        <p className="text-blue-100 text-sm">Pantau perkembangan putra/putri Anda</p>
      </div>

      {/* Profil Anak */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {santri.foto_url ? (
              <img src={santri.foto_url} alt={santri.nama} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{santri.nama}</h2>
            <p className="text-gray-500">{santri.panggilan}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {santri.status}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary-dark">
                Angkatan {santri.angkatan_nama}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {santri.konsentrasi_nama}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total_setoran}</p>
              <p className="text-xs text-gray-500">Total Setoran ({stats.total_surah} Surah)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.presensi_bulan_ini}</p>
              <p className="text-xs text-gray-500">Hadir Bulan Ini</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Wallet className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.saldo_dompet)}</p>
              <p className="text-xs text-gray-500">Saldo Dompet</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stats.sanksi_aktif > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <AlertTriangle className={`w-5 h-5 ${stats.sanksi_aktif > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.sanksi_aktif}</p>
              <p className="text-xs text-gray-500">Sanksi Aktif</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skoring Pekanan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Skoring Pekanan</h3>
          </div>
          <span className="text-sm text-gray-500">{stats.skoring_pekanan.poin} / {stats.skoring_pekanan.target} poin</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(stats.skoring_pekanan.persentase, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {stats.skoring_pekanan.persentase >= 100 
            ? 'Target pekanan tercapai!' 
            : `${stats.skoring_pekanan.persentase.toFixed(1)}% dari target`}
        </p>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mb-3`}>
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">{item.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
