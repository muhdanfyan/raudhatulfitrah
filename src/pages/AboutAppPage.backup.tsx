import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getStaticAsset } from '../utils/imageUtils';
import { 
  BookOpen, Users, Briefcase, Shield, BarChart3, 
  Smartphone, Zap, CheckCircle, ArrowRight, ChevronLeft,
  GraduationCap, Heart, CreditCard, Bell, Calendar, FileText,
  QrCode, Cloud, Lock, Globe, Play, Star, TrendingUp, Clock,
  Target, Award, Layers, Monitor, Building2, ShoppingBag, Wallet,
  ClipboardList, Map, ScrollText, MessageSquare, DoorOpen,
  Package, Contact, Megaphone, UserPlus, Eye,
  AlertTriangle, TrendingDown, Timer, Users2, ShieldCheck, Calculator
} from 'lucide-react';

export default function AboutAppPage() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const mainFeatures = [
    {
      icon: BookOpen,
      title: 'Tahfidz Digital',
      desc: 'Sistem pencatatan hafalan Al-Quran dengan tracking progress per juz, murojaah, dan evaluasi dari musyrif secara real-time.',
      color: 'from-green-500 to-emerald-600',
      image: getStaticAsset('feature-tahfidz.png', 'features', { width: 600, quality: 85 })
    },
    {
      icon: GraduationCap,
      title: 'LMS (E-Learning)',
      desc: 'Platform pembelajaran online lengkap dengan materi video, quiz interaktif, roadmap belajar, dan sertifikat kelulusan.',
      color: 'from-blue-500 to-indigo-600',
      image: getStaticAsset('feature-lms.png', 'features', { width: 600, quality: 85 })
    },
    {
      icon: Users,
      title: 'Portal Wali Santri',
      desc: 'Dashboard khusus orang tua untuk memantau perkembangan anak: hafalan, presensi, keuangan, dan prestasi secara real-time.',
      color: 'from-purple-500 to-pink-600',
      image: getStaticAsset('feature-wali-santri.png', 'features', { width: 600, quality: 85 })
    },
    {
      icon: Briefcase,
      title: 'Portfolio Digital',
      desc: 'Showcase karya dan project santri untuk membangun personal branding dan persiapan karir di era digital.',
      color: 'from-cyan-500 to-blue-600',
      image: getStaticAsset('feature-portfolio.png', 'features', { width: 600, quality: 85 })
    },
    {
      icon: QrCode,
      title: 'Presensi QR Code',
      desc: 'Sistem presensi modern dengan scan QR code untuk kehadiran harian, scoring otomatis, dan laporan real-time.',
      color: 'from-orange-500 to-red-600',
      image: getStaticAsset('feature-presensi.png', 'features', { width: 600, quality: 85 })
    },
    {
      icon: CreditCard,
      title: 'Koperasi & Dompet Digital',
      desc: 'Sistem pembayaran dan transaksi koperasi dengan dompet digital terintegrasi, transparan dan mudah dipantau.',
      color: 'from-yellow-500 to-orange-600',
      image: getStaticAsset('feature-koperasi.png', 'features', { width: 600, quality: 85 })
    },
  ];

  const additionalFeatures = [
    { icon: Calendar, title: 'Jadwal & Agenda', desc: 'Kalender kegiatan terintegrasi' },
    { icon: Heart, title: 'Ibadah Harian', desc: 'Tracking amal yaumiyah santri' },
    { icon: FileText, title: 'Daily Report', desc: 'Laporan harian santri otomatis' },
    { icon: Bell, title: 'Push Notification', desc: 'Notifikasi real-time ke HP' },
    { icon: Shield, title: 'Pembinaan & Tata Tertib', desc: 'Sistem monitoring kedisiplinan' },
    { icon: BarChart3, title: 'Dashboard Analytics', desc: 'Statistik dan laporan lengkap' },
    { icon: Target, title: 'Requirement Pekanan', desc: 'Target mingguan terukur' },
    { icon: Award, title: 'Crowdfunding', desc: 'Donasi online terintegrasi' },
  ];

  const stats = [
    { value: '150+', label: 'Fitur Lengkap', icon: Layers },
    { value: '7', label: 'Dashboard Role', icon: Monitor },
    { value: '99.9%', label: 'Uptime Server', icon: TrendingUp },
    { value: '24/7', label: 'Akses Real-time', icon: Clock },
  ];

  const beforeAfter = [
    { before: 'Pencatatan hafalan manual di buku', after: 'Tracking digital dengan progress visual' },
    { before: 'Presensi absen kertas', after: 'Scan QR Code otomatis tersimpan' },
    { before: 'Laporan manual ke wali santri', after: 'Dashboard real-time untuk orang tua' },
    { before: 'Keuangan tercatat di buku kas', after: 'Sistem keuangan digital transparan' },
    { before: 'Mencari data santri di tumpukan berkas', after: 'Search instan dengan filter lengkap' },
    { before: 'Rapat koordinasi untuk update data', after: 'Data tersinkron otomatis real-time' },
  ];

  const featureGroups = [
    {
      title: 'Akademik & Tahfidz',
      color: 'blue',
      features: [
        { icon: GraduationCap, title: 'LMS', desc: 'Learning Management System' },
        { icon: BookOpen, title: 'Tahfidz', desc: 'Pencatatan hafalan Al-Quran' },
        { icon: ClipboardList, title: 'Presensi', desc: 'Absensi harian QR Code' },
        { icon: Target, title: 'Requirement', desc: 'Target pekanan santri' },
        { icon: Map, title: 'Roadmap', desc: 'Jalur pembelajaran' },
      ]
    },
    {
      title: 'Pembinaan & Tata Tertib',
      color: 'emerald',
      features: [
        { icon: Heart, title: 'Ibadah', desc: 'Tracking ibadah harian' },
        { icon: ScrollText, title: 'Tata Tertib', desc: 'Manajemen aturan' },
        { icon: Shield, title: 'Sanksi', desc: 'Pencatatan pelanggaran' },
        { icon: MessageSquare, title: 'Masukan', desc: 'Saran & kritik santri' },
        { icon: DoorOpen, title: 'Perizinan', desc: 'Pengajuan izin' },
      ]
    },
    {
      title: 'Asrama & Operasional',
      color: 'purple',
      features: [
        { icon: Package, title: 'Inventaris', desc: 'Manajemen aset' },
        { icon: Calendar, title: 'Jadwal Piket', desc: 'Penjadwalan piket' },
        { icon: FileText, title: 'Daily Report', desc: 'Laporan harian' },
      ]
    },
    {
      title: 'Keuangan & Donasi',
      color: 'yellow',
      features: [
        { icon: Building2, title: 'Keuangan', desc: 'Pemasukan & pengeluaran' },
        { icon: Users, title: 'Donatur', desc: 'Data donatur tetap' },
        { icon: Heart, title: 'Crowdfunding', desc: 'Penggalangan dana' },
      ]
    },
    {
      title: 'Koperasi',
      color: 'orange',
      features: [
        { icon: ShoppingBag, title: 'Koperasi', desc: 'Toko & POS' },
        { icon: Wallet, title: 'Dompet Digital', desc: 'Saldo santri' },
      ]
    },
    {
      title: 'Fitur Lainnya',
      color: 'slate',
      features: [
        { icon: UserPlus, title: 'PPDB Online', desc: 'Penerimaan santri' },
        { icon: Briefcase, title: 'Portfolio', desc: 'Karya santri' },
        { icon: Eye, title: 'Review', desc: 'Review presentasi' },
        { icon: Megaphone, title: 'Berita', desc: 'Artikel pesantren' },
        { icon: Clock, title: 'Time Tracking', desc: 'Tracking waktu' },
        { icon: Contact, title: 'ID Card', desc: 'Kartu identitas' },
        { icon: Bell, title: 'Notifikasi', desc: 'Push notification' },
        { icon: Users, title: 'Portal Ortu', desc: 'Dashboard wali' },
        { icon: Calendar, title: 'Agenda', desc: 'Kalender kegiatan' },
        { icon: BarChart3, title: 'Analytics', desc: 'Statistik laporan' },
      ]
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
      blue: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-blue-200', gradient: 'from-blue-500 to-blue-600' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-500 to-purple-600' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200', gradient: 'from-yellow-500 to-yellow-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', gradient: 'from-orange-500 to-orange-600' },
      slate: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', gradient: 'from-slate-500 to-slate-600' },
    };
    return colors[color] || colors.slate;
  };

  const ecosystemIssues = [
    {
      role: 'Isu Nasional',
      icon: AlertTriangle,
      problem: 'Maraknya bullying, kekerasan, dan penyimpangan di lingkungan pendidikan yang sering terlambat terdeteksi.',
      solution: 'Whistleblower System & Kotak Masukan Digital dengan privasi terjaga untuk deteksi dini dan mitigasi resiko.',
      color: 'red'
    },
    {
      role: 'Pengajaran & Akademik',
      icon: BookOpen,
      problem: 'Kualitas pengajaran tidak terstandar, kesulitan memantau progress perorangan, dan administrasi guru yang membebani.',
      solution: 'LMS Terpadu & Digital Classroom untuk standarisasi materi, otomatisasi nilai, dan monitoring grafik prestasi santri.',
      color: 'orange'
    },
    {
      role: 'Wali Santri',
      icon: Heart,
      problem: 'Kecemasan orang tua terhadap kesejahteraan anak (makan, sakit, aktivitas) dan minimnya transparansi informasi dari pondok.',
      solution: 'Real-time Notification & Portal Wali untuk akses 24/7 pantauan hafalan, kesehatan, laundry, hingga keuangan.',
      color: 'purple'
    },
    {
      role: 'Kemandirian Santri',
      icon: Wallet,
      problem: 'Resiko uang saku hilang, pemalakan, serta pola jajan santri yang tidak terkontrol dan kurang sehat.',
      solution: 'Smart Card & Cashless Ecosystem dengan limitasi belanja harian dan monitoring nutrisi santri.',
      color: 'blue'
    },
    {
      role: 'Manajemen Pondok',
      icon: BarChart3,
      problem: 'Kebocoran anggaran belanja, data ganda antar divisi, dan kesulitan pengambilan keputusan berbasis data akurat.',
      solution: 'Integrated Dashboard & Audit System untuk transparansi total, efisiensi beaya, dan akurasi data pengambil keputusan.',
      color: 'emerald'
    }
  ];

  const efficiencyStats = [
    {
      title: 'Efisiensi Dana',
      subtitle: 'Studi Kasus 100 Santri',
      icon: TrendingDown,
      items: [
        { label: 'Cetak Laporan & Fotokopi', value: 'Hemat 100%' },
        { label: 'Efisiensi Grup WA & Chat', value: '1 Laporan Realtime' },
        { label: 'Buku Izin & Kartu Fisik', value: 'Paperless' },
      ],
      desc: 'Pangkas total biaya operasional fisik hingga jutaan rupiah. Komunikasi wali santri kini gratis via Internet/WhatsApp.',
      color: 'bg-green-50 text-green-700'
    },
    {
      title: 'Efisiensi Waktu',
      subtitle: 'Perbandingan Proses',
      icon: Timer,
      items: [
        { label: 'Rekap Presensi & Jurnal', value: 'Auto by System' },
        { label: 'Pencarian Data Santri', value: 'Instant Search' },
        { label: 'Laporan Hafalan & Nilai', value: 'Real-time' },
      ],
      desc: 'Tidak ada lagi lembur rekap data manual akhir bulan. Semua laporan tersedia otomatis detik itu juga.',
      color: 'bg-primary/5 text-primary-dark'
    },
    {
      title: 'Efisiensi Tenaga',
      subtitle: 'Optimalisasi SDM',
      icon: Users2,
      items: [
        { label: 'Beban Administrasi Admin', value: 'Turun 80%' },
        { label: 'Antrian Wali Santri', value: 'Dihilangkan' },
        { label: 'Fokus Utama Musyrif', value: '100% Mendidik' },
      ],
      desc: 'SDM Pondok tidak lagi sibuk menjadi tukang ketik/admin, tapi kembali ke fungsi utama: Mendidik Santri.',
      color: 'bg-purple-50 text-purple-700'
    }
  ];



  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={getStaticAsset('hero-main.png', 'features', { width: 1920, quality: 80 })} 
            alt="Islamic Education"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Beranda
          </Link>

          <div className="max-w-4xl" data-aos="fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light/20 border border-blue-400/30 rounded-full text-blue-300 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Solusi Digitalisasi Pesantren #1 di Indonesia
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Transformasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Digital</span> untuk Pesantren Modern
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl">
              PISANTRI mengubah cara pesantren beroperasi — dari pencatatan hafalan, presensi, keuangan, hingga pembelajaran online — semua terintegrasi dalam <span className="text-white font-semibold">satu platform powerful</span>.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/ppdb" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/25">
                Mulai Sekarang
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
                <Play className="w-5 h-5" />
                Login Demo
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-gray-900"></div>
                  ))}
                </div>
                <span>500+ Santri Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>100% Aman</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats Cards */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-32 pb-8 hidden lg:block">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 text-center" data-aos="fade-up" data-aos-delay={i * 100}>
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Stats for Mobile */}
      <section className="py-8 bg-white lg:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-500 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">MASALAH YANG KAMI SELESAIKAN</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Dari <span className="text-red-500">Manual</span> ke <span className="text-green-500">Digital</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Lihat bagaimana PISANTRI mengubah proses yang memakan waktu menjadi otomatis dan efisien
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beforeAfter.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg" data-aos="fade-up" data-aos-delay={i * 50}>
                <div className="p-5 bg-red-50 border-b border-red-100">
                  <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    SEBELUM
                  </div>
                  <p className="text-gray-700">{item.before}</p>
                </div>
                <div className="p-5 bg-green-50">
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-2">
                    <CheckCircle className="w-4 h-4" />
                    SESUDAH
                  </div>
                  <p className="text-gray-700 font-medium">{item.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Issues & Solutions Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">SOLUSI NYATA</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Menjawab Tantangan Pendidikan Modern</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              PISANTRI hadir bukan sekadar aplikasi, tapi solusi untuk isu-isu krusial di ekosistem pesantren
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {ecosystemIssues.map((issue, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-blue-200 transition-all" data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="flex gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-${issue.color}-100`}>
                    <issue.icon className={`w-6 h-6 text-${issue.color}-600`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{issue.role}: {issue.problem}</h3>
                    <div className="flex items-start gap-2 mt-4 text-gray-600 bg-gray-50 p-4 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed"><span className="font-semibold text-gray-900">Solusi PISANTRI:</span> {issue.solution}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Efficiency Analysis Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">ANALISIS EFISIENSI</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Dampak Langsung Digitalisasi</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {efficiencyStats.map((stat, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300" data-aos="fade-up" data-aos-delay={i * 100}>
                <div className={`absolute top-0 right-0 p-4 rounded-bl-3xl ${stat.color}`}>
                  <stat.icon className="w-8 h-8 opacity-50" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.title}</h3>
                <span className="text-sm text-gray-500 font-medium mb-6 block uppercase tracking-wide">{stat.subtitle}</span>
                
                <div className="space-y-4 mb-8">
                  {stat.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-gray-600 font-medium">{item.label}</span>
                      <span className="text-primary font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 italic">
                  "{stat.desc}"
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features with Images */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary-dark rounded-full text-sm font-medium mb-4">FITUR UNGGULAN</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Semua yang Pesantren Butuhkan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Platform lengkap dengan fitur-fitur powerful untuk mengelola pesantren modern
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <div key={index} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className={`absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">DAN MASIH BANYAK LAGI</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Fitur Pendukung Lengkap</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all text-center" data-aos="fade-up" data-aos-delay={index * 50}>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Feature List - 30 Features */}
      <section className="py-20" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-2 rounded-full text-sm font-semibold mb-4">
              <Layers className="w-4 h-4" />
              Ekosistem Digital Terlengkap
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">30+ Modul Terintegrasi untuk Transformasi Total</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dari manajemen akademik, keuangan, hingga dakwah digital. Satu platform yang menghubungkan Kiai, Asatidz, Santri, dan Wali Santri dalam harmoni teknologi.
            </p>
          </div>

          <div className="space-y-4">
            {featureGroups.map((group, groupIndex) => {
              const colorClasses = getColorClasses(group.color);
              return (
                <div key={groupIndex} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${colorClasses.border} hover:shadow-md transition-all`} data-aos="fade-up" data-aos-delay={groupIndex * 50}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${colorClasses.text} flex items-center gap-2`}>
                      <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorClasses.gradient}`}></span>
                      {group.title}
                    </h3>
                    <span className="text-sm text-gray-400">{group.features.length} fitur</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {group.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`w-8 h-8 ${colorClasses.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <feature.icon className={`w-4 h-4 ${colorClasses.text}`} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-gray-900 text-sm block truncate">{feature.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={getStaticAsset('tech-bg.png', 'features', { width: 1920, quality: 70 })} 
            alt="Technology"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right">
              <span className="inline-block px-4 py-1 bg-primary-light/20 border border-blue-400/30 rounded-full text-blue-300 text-sm font-medium mb-6">TEKNOLOGI MODERN</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Dibangun dengan Teknologi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Terdepan</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                PISANTRI menggunakan stack teknologi modern yang menjamin performa tinggi, keamanan maksimal, dan skalabilitas untuk pertumbuhan pesantren Anda.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Globe, title: 'Web Based', desc: 'Akses dari browser manapun' },
                  { icon: Smartphone, title: 'Mobile Ready', desc: 'Responsive di semua device' },
                  { icon: Cloud, title: 'Cloud Server', desc: 'Data aman di cloud' },
                  { icon: Lock, title: 'Enkripsi SSL', desc: 'Keamanan standar bank' },
                ].map((tech, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <tech.icon className="w-8 h-8 text-primary-light mb-2" />
                    <h4 className="font-bold text-white">{tech.title}</h4>
                    <p className="text-gray-400 text-sm">{tech.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative" data-aos="fade-left">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-6">
                <img 
                  src={getStaticAsset('dashboard-coding.png', 'features', { width: 800, quality: 85 })} 
                  alt="Dashboard Preview"
                  className="w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent"></div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-2">Karya Santri untuk Negeri</h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      Aplikasi ini dikembangkan langsung oleh santri <span className="text-white font-semibold">Pondok Informatika</span>. 
                      Dengan menggunakan PISANTRI, Anda turut berkontribusi menyediakan <span className="text-yellow-400 font-semibold">beasiswa pendidikan gratis</span> bagi santri yatim dan dhuafa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center" data-aos="zoom-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Siap Membawa Pesantren Anda ke Era Digital?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Bergabunglah dengan ratusan pesantren yang telah bertransformasi digital bersama PISANTRI. 
            Mulai perjalanan digitalisasi pesantren Anda hari ini!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/ppdb" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-primary/5 transition-all shadow-lg">
              Daftar Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              Coba Demo Gratis
            </Link>
          </div>
        </div>
      </section>



      {/* Closing Impact Tagline */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>
          <img src={getStaticAsset('tech-bg.png', 'features', { width: 1920, quality: 70 })} className="w-full h-full object-cover opacity-10" alt="Background" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-tight" data-aos="zoom-in">
              "Semua Masalah Pesantren,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400">
                Selesai Dalam Satu Platform
              </span>"
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Tidak perlu lagi menggunakan banyak aplikasi terpisah. PISANTRI mengintegrasikan akademik, keuangan, dan kepengasuhan dalam satu ekosistem.
            </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">PISANTRI</span>
            </div>
            <p>&copy; {new Date().getFullYear()} PISANTRI - Sistem Informasi Pesantren Terintegrasi</p>
            <div className="flex gap-4">
              <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
              <Link to="/ppdb" className="hover:text-white transition-colors">PPDB</Link>
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
