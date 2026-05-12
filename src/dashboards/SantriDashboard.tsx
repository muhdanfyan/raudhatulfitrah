import { useState, useEffect, useRef } from 'react';
import { Map, Marker } from 'pigeon-maps';
import {
  BookOpen,
  ClipboardList,
  FileText,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  User,
  Lock,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  Eye,
  EyeOff,
  Download,
  Camera,
  GraduationCap,
  Briefcase,
  PenTool,
  Wallet,
  Clock,
  MapPin,
  Save,
  ChevronRight,
  Heart,
  Sparkles,
  Shield
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api, API_URL, getHeaders } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getStudentPhotoUrl } from '../utils/imageUtils';
import QuranMushafModal from '../components/QuranMushafModal';

export default function SantriDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [akademikData, setAkademikData] = useState<any>(null);
  const [currentActivity, setCurrentActivity] = useState<any>(null);
  
  // Modal states
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMushafModal, setShowMushafModal] = useState(false);
  
  // Foto upload
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [santriPhoto, setSantriPhoto] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    new_password: '',
    new_password_confirmation: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Lokasi Masjid
  const [lokasiMasjid, setLokasiMasjid] = useState('');
  const [masjidLat, setMasjidLat] = useState<number | null>(null);
  const [masjidLng, setMasjidLng] = useState<number | null>(null);
  const [showLokasiModal, setShowLokasiModal] = useState(false);
  const [lokasiInput, setLokasiInput] = useState('');
  const [tempLat, setTempLat] = useState<number>(-6.2088);
  const [tempLng, setTempLng] = useState<number>(106.8456);
  const [lokasiLoading, setLokasiLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lokasiMethod, setLokasiMethod] = useState('');
  
  // Quran Last Read
  const [lastRead, setLastRead] = useState<{surah_number: number; ayat_number: number; surah_name?: string} | null>(null);

  // Get location from GPS
  const getLocationGPS = () => {
    if (!('geolocation' in navigator)) {
      alert('Browser tidak mendukung GPS');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setTempLat(position.coords.latitude);
        setTempLng(position.coords.longitude);
        setLokasiMethod('GPS');
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) alert('Izin lokasi ditolak. Gunakan metode lain.');
        else if (err.code === 2) alert('GPS tidak tersedia.');
        else alert('Timeout. Coba lagi.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Search address
  const searchAddress = async () => {
    if (!searchQuery.trim()) {
      alert('Masukkan alamat untuk dicari');
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        setTempLat(parseFloat(data[0].lat));
        setTempLng(parseFloat(data[0].lon));
        setLokasiMethod('Pencarian');
        if (!lokasiInput) setLokasiInput(data[0].display_name.split(',')[0]);
      } else {
        alert('Alamat tidak ditemukan');
      }
    } catch {
      alert('Gagal mencari alamat');
    }
    setSearchLoading(false);
  };

  useEffect(() => {
    // Tunggu sampai auth selesai loading
    if (authLoading) return;
    
    const fetchData = async () => {
      if (!user?.santri_id) {
        setError('Data santri tidak ditemukan');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const [dashboardRes, akademikRes, lokasiRes, activityRes] = await Promise.all([
          api.getDashboardSantri(user.santri_id),
          fetch(`${API_URL}/santri-feature/akademik/${user.santri_id}`, {
            headers: getHeaders()
          }).then(r => r.json()),
          fetch(`${API_URL}/santri-feature/lokasi-masjid/${user.santri_id}`, {
            headers: getHeaders()
          }).then(r => r.json()),
          fetch(`${API_URL}/sop/current-activity`, {
            headers: getHeaders()
          }).then(r => r.json())
        ]);
        
        setData(dashboardRes);
        if (lokasiRes?.data) {
          if (lokasiRes.data.lokasi_masjid) setLokasiMasjid(lokasiRes.data.lokasi_masjid);
          if (lokasiRes.data.lat) setMasjidLat(lokasiRes.data.lat);
          if (lokasiRes.data.lng) setMasjidLng(lokasiRes.data.lng);
        }
        if (akademikRes?.success) setAkademikData(akademikRes.data);
        if (activityRes?.success) setCurrentActivity(activityRes.data?.aktivitas_sekarang);
        setSantriPhoto(dashboardRes?.santri?.foto_santri);
        
        // Fetch Quran Last Read
        try {
          const quranRes = await api.getQuranBookmarks();
          if (quranRes?.last_read) {
            setLastRead(quranRes.last_read);
          }
        } catch (e) { /* silent fail for optional feature */ }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading]);

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }
    
    setUploadingFoto(true);
    try {
      const formData = new FormData();
      formData.append('foto', file);
      
      const res = await fetch(`${API_URL}/santri-feature/foto/${user?.santri_id}`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData
      });
      
      const json = await res.json();
      if (res.ok) {
        setSantriPhoto(json.data.foto);
      } else {
        alert(json.message || 'Gagal upload foto');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat upload foto');
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setPasswordError('Konfirmasi password tidak cocok');
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordError('Password minimal 6 karakter');
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(passwordForm)
      });
      const json = await res.json();
      
      if (res.ok) {
        setPasswordSuccess('Password berhasil diubah');
        setPasswordForm({ new_password: '', new_password_confirmation: '' });
        setTimeout(() => setShowPasswordModal(false), 1500);
      } else {
        setPasswordError(json.message || 'Gagal mengubah password');
      }
    } catch (err) {
      setPasswordError('Terjadi kesalahan');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveLokasiMasjid = async () => {
    if (!lokasiInput.trim()) {
      alert('Nama masjid tidak boleh kosong');
      return;
    }
    setLokasiLoading(true);
    try {
      const res = await fetch(`${API_URL}/santri-feature/lokasi-masjid/${user?.santri_id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ 
          lokasi_masjid: lokasiInput,
          lat: tempLat,
          lng: tempLng
        })
      });
      const json = await res.json();
      if (res.ok) {
        setLokasiMasjid(lokasiInput);
        setMasjidLat(tempLat);
        setMasjidLng(tempLng);
        setShowLokasiModal(false);
      } else {
        alert(json.message || 'Gagal menyimpan lokasi masjid');
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setLokasiLoading(false);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('santri-qrcode');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qrcode-santri-${user?.santri_id}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  const santri = data?.santri;
  const requirement = data?.requirement_pekanan;
  const presensi = data?.presensi_hari_ini || [];
  const pekanIni = akademikData?.pekan_ini || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'bg-emerald-100 text-emerald-700';
      case 'telat': return 'bg-amber-100 text-amber-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'on-time' || status === 'telat' ? (
      <CheckCircle className="w-6 h-6" />
    ) : (
      <XCircle className="w-6 h-6" />
    );
  };

  const menuActions = [
    { icon: BookOpen, label: 'Setoran Hafalan', color: 'blue', href: '/santri/tahfidz' },
    { icon: ClipboardList, label: 'Target Harian', color: 'blue', href: '/santri/daily' },
    { icon: FileText, label: 'Review', color: 'violet', href: '/santri/review' },
    { icon: ClipboardList, label: 'Portfolio', color: 'cyan', href: '/santri/portfolio' },
    { icon: PenTool, label: 'Tulisan', color: 'purple', href: '/santri/tulisan' },
    { icon: GraduationCap, label: 'LMS', color: 'teal', href: '/santri/lms' },
    { icon: TrendingUp, label: 'Roadmap', color: 'cyan', href: '/roadmap' },
    { icon: MessageSquare, label: 'Izin', color: 'amber', href: '/santri/izin' },
    { icon: Sparkles, label: 'Tanya AI', color: 'indigo', href: '/chat' },
    { icon: AlertTriangle, label: 'Sanksi', color: 'red', href: '/santri/sanksi' },
    { icon: Shield, label: 'Tata Tertib', color: 'indigo', href: '/santri/tatib' },
    { icon: MessageSquare, label: 'Masukan', color: 'orange', href: '/santri/masukan' },
    { icon: TrendingUp, label: 'Statistik', color: 'teal', href: '/santri/statistik' },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-primary-light hover:bg-primary',
      violet: 'bg-violet-500 hover:bg-violet-600',
      cyan: 'bg-cyan-500 hover:bg-cyan-600',
      amber: 'bg-amber-500 hover:bg-amber-600',
      red: 'bg-red-500 hover:bg-red-600',
      orange: 'bg-orange-500 hover:bg-orange-600',
      teal: 'bg-teal-500 hover:bg-teal-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
      indigo: 'bg-indigo-600 hover:bg-indigo-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Premium Welcome Header with Pattern */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-xl">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-6 left-6 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-6 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative px-6 py-10 sm:px-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Profile Photo with Gradient Ring */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative">
                <img
                  src={getStudentPhotoUrl(santriPhoto)}
                  alt={santri?.nama_lengkap_santri}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                />
                <button
                  onClick={() => fotoInputRef.current?.click()}
                  disabled={uploadingFoto}
                  className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
                >
                  {uploadingFoto ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-blue-600" />
                  )}
                </button>
                <input
                  ref={fotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                />
              </div>
            </div>
            
            {/* Welcome Text & Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online {currentActivity && ` - ${currentActivity.nama_aktivitas}`}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Assalamu'alaikum! 👋
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 font-medium mb-1">
                {santri?.nama_lengkap_santri || user?.name}
              </p>
              <p className="text-blue-200 text-sm mb-4">
                {santri?.nama_konsentrasi || 'Santri'} • Angkatan {santri?.nama_angkatan || '-'}
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-lg">
                  <Wallet className="w-4 h-4 text-emerald-300" />
                  <span className="text-white text-sm font-medium">
                    Rp {Number(data?.saldo_dompet || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-lg">
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span className="text-white text-sm font-medium">
                    {data?.total_hafalan || 0} Juz
                  </span>
                </div>
              </div>
              
              {/* Quick Actions in Bio */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-all"
                >
                  <Lock className="w-3 h-3" />
                  Ganti Password
                </button>
                <Link 
                  to="/santri/profil"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-all"
                >
                  <User className="w-3 h-3" />
                  Edit Profil
                </Link>
              </div>
            </div>
            
            {/* Header Icons */}
            <div className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 flex items-center gap-3">
              {/* Al-Quran Button */}
              <button 
                onClick={() => setShowMushafModal(true)}
                className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30 hover:bg-white/30 transition-all cursor-pointer group flex flex-col items-center justify-center min-w-[56px]"
                title="Buka Mushaf Al-Quran"
              >
                <BookOpen className="w-6 h-6 text-white" />
                <span className="text-[8px] font-bold text-white/70 uppercase mt-1">Mushaf</span>
              </button>
              
              {/* Chat AI Button */}
              <Link 
                to="/chat"
                className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30 hover:bg-white/30 transition-all cursor-pointer group flex flex-col items-center justify-center min-w-[56px]"
                title="Tanya AI Pisantri"
              >
                <Sparkles className="w-6 h-6 text-white" />
                <span className="text-[8px] font-bold text-white/70 uppercase mt-1">AI Chat</span>
              </Link>

              {/* QR Code Button */}
              <button 
                onClick={() => setShowQRModal(true)}
                className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30 hover:bg-white/30 transition-all cursor-pointer group"
                title="Tampilkan QR Code"
              >
                <QRCodeSVG value={String(user?.santri_id || '')} size={32} level="M" bgColor="transparent" fgColor="white" />
                <div className="text-[8px] font-bold text-white/70 uppercase mt-1 text-center">ID Card</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid - 2x2 on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Bacaan Terakhir */}
        <button
          onClick={() => setShowMushafModal(true)}
          className="bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:shadow-lg hover:border-amber-300 transition-all group text-center min-h-[120px]"
        >
          <div className="p-3 bg-amber-200/50 rounded-xl group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide">Bacaan Terakhir</p>
            {lastRead ? (
              <p className="text-sm font-bold text-gray-900 truncate">
                Surah {lastRead.surah_number}:{lastRead.ayat_number}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic">Belum ada</p>
            )}
          </div>
        </button>

        {/* Ibadah Hari Ini */}
        <Link
          to="/santri/ibadah"
          className="bg-gradient-to-br from-rose-50 to-pink-100 border border-rose-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:shadow-lg hover:border-rose-300 transition-all group text-center min-h-[120px]"
        >
          <div className="p-3 bg-rose-200/50 rounded-xl group-hover:scale-110 transition-transform">
            <Heart className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <p className="text-[10px] text-rose-600 font-semibold uppercase tracking-wide">Ibadah Hari Ini</p>
            <p className="text-sm font-bold text-gray-900">{data?.ibadah_hari_ini || 0} Catatan</p>
          </div>
        </Link>

        {/* Daily Tracking */}
        <Link
          to="/santri/daily"
          className="bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:shadow-lg hover:border-emerald-300 transition-all group text-center min-h-[120px]"
        >
          <div className="p-3 bg-emerald-200/50 rounded-xl group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide">Daily Tracking</p>
            <p className="text-sm font-bold text-gray-900">Mulai Kerja</p>
          </div>
        </Link>

        {/* Lokasi Masjid */}
        <button
          onClick={() => { 
            setLokasiInput(lokasiMasjid); 
            setTempLat(masjidLat || -6.2088);
            setTempLng(masjidLng || 106.8456);
            setSearchQuery('');
            setLokasiMethod('');
            setShowLokasiModal(true); 
          }}
          className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:shadow-lg hover:border-blue-300 transition-all group text-center min-h-[120px]"
        >
          <div className="p-3 bg-blue-200/50 rounded-xl group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wide">Lokasi Masjid</p>
            {lokasiMasjid ? (
              <p className="text-xs font-bold text-gray-900 truncate max-w-[100px]">{lokasiMasjid}</p>
            ) : (
              <p className="text-xs text-gray-400 italic">Atur Lokasi</p>
            )}
          </div>
        </button>
      </div>


      {/* Pencapaian Akademik Pekan Ini */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Pencapaian Akademik Pekan Ini
          </h3>
          <Link 
            to="/santri/akademik" 
            className="text-sm text-primary hover:underline"
          >
            Lihat Detail
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/santri/review" className="block p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white text-center hover:shadow-lg transition-shadow">
            <FileText className="w-8 h-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">{pekanIni.review || 0}</div>
            <div className="text-sm text-blue-100">Review</div>
          </Link>
          <Link to="/santri/portfolio" className="block p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white text-center hover:shadow-lg transition-shadow">
            <Briefcase className="w-8 h-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">{pekanIni.portfolio || 0}</div>
            <div className="text-sm text-emerald-100">Portfolio</div>
          </Link>
          <Link to="/santri/tahfidz" className="block p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white text-center hover:shadow-lg transition-shadow">
            <BookOpen className="w-8 h-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">{pekanIni.hafalan || 0}</div>
            <div className="text-sm text-amber-100">Hafalan Baru</div>
          </Link>
          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white text-center">
            <PenTool className="w-8 h-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">{pekanIni.tulisan || 0}</div>
            <div className="text-sm text-purple-100">Tulisan</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Periode: {akademikData?.periode_pekan?.start} s/d {akademikData?.periode_pekan?.end}
        </p>
      </div>

      {/* Presensi & Skoring */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Presensi Hari Ini</h3>
            <Link to="/santri/presensi" className="text-sm text-primary hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {['Shubuh', 'Produktif', 'Dzuhur', 'Ashar', 'Maghrib'].map((waktu, index) => {
              const p = presensi.find((x: any) => x.nama_agenda?.toLowerCase().includes(waktu.toLowerCase()));
              const status = p ? p.status : 'absen';
              return (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-600 mb-2">{waktu}</div>
                  <div className={`w-full h-12 rounded-lg flex items-center justify-center ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Skoring Pekanan</h3>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Poin</div>
              <div className={`text-2xl font-bold ${(requirement?.skoring?.poin || 0) >= 330 ? 'text-emerald-600' : 'text-red-600'}`}>
                {requirement?.skoring?.poin || 0} / 330
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${(requirement?.skoring?.poin || 0) >= 330 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(((requirement?.skoring?.poin || 0) / 330) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Periode: {data?.periode_pekan?.start} s/d {data?.periode_pekan?.end}
          </p>
        </div>
      </div>

      {/* Requirement Pekanan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Requirement Pekanan</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {requirement && Object.entries(requirement).filter(([key]) => key !== 'overall').map(([key, value]: [string, any]) => (
            <div key={key} className={`p-4 rounded-lg ${value.status === 'Terpenuhi' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${value.status === 'Terpenuhi' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {value.count !== undefined ? value.count : value.poin}
                </div>
                <div className="text-xs text-gray-600 mt-1">Target: {value.target}</div>
                <div className="text-xs font-medium mt-2 capitalize">{key.replace('_', ' ')}</div>
                {value.status === 'Terpenuhi' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mt-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mx-auto mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>
        {requirement?.overall && (
          <div className={`mt-4 p-4 rounded-lg text-center font-bold ${requirement.overall === 'Terpenuhi' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            Status Keseluruhan: {requirement.overall}
          </div>
        )}
      </div>

      {/* Alerts */}
      {data?.sanksi_aktif > 0 && (
        <Link to="/santri/sanksi" className="block bg-red-50 border border-red-200 rounded-xl p-6 hover:bg-red-100 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="font-bold text-red-700">Sanksi Aktif: {data.sanksi_aktif}</h3>
              <p className="text-sm text-red-600">Anda memiliki sanksi yang belum diselesaikan</p>
            </div>
          </div>
        </Link>
      )}

      {data?.izin_aktif?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-bold text-amber-700 mb-2">Izin Aktif</h3>
          {data.izin_aktif.map((izin: any, index: number) => (
            <div key={index} className="text-sm text-amber-600">
              {izin.jenis_izin} - {izin.alasan}
            </div>
          ))}
        </div>
      )}

      {/* Menu Aksi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Menu Aksi</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {menuActions.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={`${getColorClasses(item.color)} text-white rounded-xl p-4 flex flex-col items-center gap-3 transition-all transform hover:scale-105`}
            >
              <item.icon className="w-8 h-8" />
              <span className="text-sm font-medium text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Tombol Rapor */}
      <Link 
        to="/santri/rapor"
        className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Rapor PRIDE</h3>
              <p className="text-white/80 text-sm">Lihat rapor aktivitas bulanan kamu</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/80 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* Floating Chat AI Button */}
      <Link
        to="/chat"
        className="fixed bottom-20 right-6 z-40 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group lg:bottom-10"
        title="Tanya AI Pisantri"
      >
        <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Tanya AI Pisantri
        </span>
      </Link>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">QR Code Santri</h3>
              <button onClick={() => setShowQRModal(false)} className="text-white hover:bg-white/20 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="bg-white p-4 rounded-xl inline-block border-2 border-gray-200 mb-4">
                <QRCodeSVG id="santri-qrcode" value={String(user?.santri_id || '')} size={200} level="H" includeMargin={true} />
              </div>
              <p className="text-gray-600 mb-2">{santri?.nama_lengkap_santri}</p>
              <p className="text-sm text-gray-500 mb-4">ID: {user?.santri_id}</p>
              <button onClick={downloadQRCode} className="flex items-center gap-2 mx-auto px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium">
                <Download className="w-4 h-4" /> Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Ganti Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-white hover:bg-white/20 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {passwordError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{passwordError}</div>}
              {passwordSuccess && <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg">{passwordSuccess}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <div className="relative">
                  <input type={showNewPassword ? 'text' : 'password'} value={passwordForm.new_password} onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 pr-10" required minLength={6} placeholder="Minimal 6 karakter" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                <input type="password" value={passwordForm.new_password_confirmation} onChange={(e) => setPasswordForm({...passwordForm, new_password_confirmation: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3" required minLength={6} placeholder="Ulangi password baru" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={passwordLoading} className="flex-1 py-2 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-2">
                  {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lokasi Masjid Modal */}
      {showLokasiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Lokasi Masjid
              </h3>
              <button onClick={() => setShowLokasiModal(false)} className="text-white hover:bg-white/20 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Masjid</label>
                <input
                  type="text"
                  value={lokasiInput}
                  onChange={(e) => setLokasiInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="Contoh: Masjid Al-Ikhlas"
                />
              </div>

              {/* GPS Button */}
              <button
                type="button"
                onClick={getLocationGPS}
                disabled={gpsLoading}
                className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-sm">Ambil Lokasi GPS</span>
                </div>
                <p className="text-xs text-gray-500">{gpsLoading ? 'Mengambil...' : 'Gunakan GPS perangkat (paling akurat)'}</p>
              </button>

              {/* Search Address */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
                  placeholder="Cari alamat: Masjid Agung Surabaya"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={searchAddress}
                  disabled={searchLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {searchLoading ? '...' : 'Cari'}
                </button>
              </div>

              {/* Map */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Pilih Lokasi di Peta</label>
                  {lokasiMethod && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">{lokasiMethod}</span>}
                </div>
                <div className="h-64 rounded-xl overflow-hidden border border-gray-300">
                  <Map
                    center={[tempLat, tempLng]}
                    zoom={15}
                    onClick={({ latLng }) => {
                      setTempLat(latLng[0]);
                      setTempLng(latLng[1]);
                      setLokasiMethod('Klik Peta');
                    }}
                  >
                    <Marker width={40} anchor={[tempLat, tempLng]} color="#10b981" />
                  </Map>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Klik pada peta atau gunakan tombol di atas. Koordinat: {tempLat.toFixed(6)}, {tempLng.toFixed(6)}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLokasiModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveLokasiMasjid}
                  disabled={lokasiLoading}
                  className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {lokasiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Al-Quran Mushaf Modal */}
      <QuranMushafModal 
        isOpen={showMushafModal} 
        onClose={() => setShowMushafModal(false)} 
      />
    </div>
  );
}
