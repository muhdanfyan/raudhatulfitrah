import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getStaticAsset } from '../utils/imageUtils';
import {
  BookOpen, Users, Briefcase, Shield, BarChart3,
  Zap, CheckCircle, ArrowRight, ChevronLeft,
  GraduationCap, Heart, CreditCard, Bell, Calendar, FileText,
  QrCode, Play, Star, TrendingUp, Clock,
  Target, Award, Layers, Monitor, Building2, ShoppingBag, Wallet,
  ClipboardList, Map, ScrollText, MessageSquare, DoorOpen,
  Package, Contact, Megaphone, UserPlus, Eye,
  AlertTriangle, TrendingDown, Timer, Users2, ShieldCheck,
  ChevronRight,
  Sparkles, FileSpreadsheet, Video, UserCheck, LayoutDashboard, Bot, Presentation
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ModulSection from '../components/ModulSection';

// SEO metadata for digitalisasi-pesantren
const seoMeta = {
  title: 'PISANTRI - Digitalisasi Pesantren Modern | Sistem Informasi Pesantren Terintegrasi',
  description: 'Solusi digitalisasi pesantren terlengkap. Kelola tahfidz, presensi QR, keuangan, e-learning, dan kepengasuhan dalam satu platform. Coba demo gratis sekarang!',
  image: 'https://pondokinformatika.id/images/og-preview.png',
  url: 'https://pondokinformatika.id/digitalisasi-pesantren',
};

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
    {
      icon: FileSpreadsheet,
      title: 'Rapor Digital',
      desc: 'Generate rapor santri otomatis dari data tahfidz, presensi, dan akademik. Lengkap dengan grafik perkembangan.',
      color: 'from-teal-500 to-cyan-600',
      image: '/images/feature-rapor.png'
    },
    {
      icon: Bot,
      title: '🌟 Aiman PI - AI Assistant',
      desc: 'PERTAMA di Indonesia! Asisten AI 24/7 berbasis Google Gemini yang bisa menjawab semua pertanyaan tentang data pondok, hafalan, jadwal, hingga statistik - dengan bahasa Indonesia natural. Keunggulan eksklusif yang TIDAK ADA di pesantren manapun!',
      color: 'from-violet-500 to-purple-600',
      image: '/images/presentasi/aiman-ustadz.png'
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
    { icon: Video, title: 'Live Class', desc: 'Webinar & kelas online' },
    { icon: UserCheck, title: 'Mentor System', desc: 'Dashboard penilaian mentor' },
    { icon: Monitor, title: 'Agent Tracking', desc: 'Monitoring aktivitas coding' },
    { icon: LayoutDashboard, title: 'Kanban Board', desc: 'Task management pengelola' },
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
        { icon: FileSpreadsheet, title: 'Rapor', desc: 'Rapor digital otomatis' },
        { icon: Video, title: 'Live Class', desc: 'Webinar online' },
        { icon: UserCheck, title: 'Mentor', desc: 'Sistem mentoring' },
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
        { icon: Monitor, title: 'Agent Tracking', desc: 'Monitoring aktivitas santri' },
        { icon: LayoutDashboard, title: 'Kanban', desc: 'Task management' },
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

  // Membuat fungsi untuk komponen Hero Section
  const HeroSectionComp = () => (
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
            <a href="https://demopisantri.netlify.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              <Play className="w-5 h-5" />
              Coba Demo Gratis
            </a>
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
  );

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{seoMeta.title}</title>
        <meta name="description" content={seoMeta.description} />
        <link rel="canonical" href={seoMeta.url} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seoMeta.url} />
        <meta property="og:title" content={seoMeta.title} />
        <meta property="og:description" content={seoMeta.description} />
        <meta property="og:image" content={seoMeta.image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="PISANTRI" />
        <meta property="og:locale" content="id_ID" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={seoMeta.url} />
        <meta name="twitter:title" content={seoMeta.title} />
        <meta name="twitter:description" content={seoMeta.description} />
        <meta name="twitter:image" content={seoMeta.image} />
      </Helmet>

      {/* Hero Section */}
      <HeroSectionComp />

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

      {/* Modul Section */}
      <ModulSection
        featureGroups={featureGroups}
        getColorClasses={getColorClasses}
      />

      {/* Technology Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Platform Digital Terlengkap<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Untuk Transformasi Pesantren</span>
              </h2>
              <p className="text-xl text-blue-200 mb-8 max-w-3xl">
                Dengan teknologi terkini dan arsitektur yang scalable, PISANTRI mampu mengakomodasi ribuan santri dan jutaan interaksi harian secara stabil dan aman.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                    Keamanan Terjamin
                  </h3>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Data terenkripsi dan terbackup otomatis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Cloud infrastructure dengan SSL encryption</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                    Skalabilitas Tinggi
                  </h3>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Mendukung puluhan ribu pengguna simultan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Otomatis scaling berdasarkan traffic</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
                <div className="aspect-video bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl border border-gray-700/50 flex items-center justify-center overflow-hidden">
                  <img 
                    src={getStaticAsset('dashboard-coding.png', 'features', { width: 800, quality: 70 })} 
                    alt="Dashboard Preview" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bridging Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-orange-50 inline-flex items-center gap-2 px-6 py-2 rounded-full border border-orange-100 text-orange-600 text-sm font-black mb-10 tracking-widest uppercase" data-aos="zoom-in">
            <Zap className="w-4 h-4" />
            SOLUSI UNTUK SEMUA KERUMITAN
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-10 tracking-tight leading-tight" data-aos="fade-up">
            "Banyak Fitur, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
              Satu Solusi
            </span>"
          </h2>
          <div className="p-10 bg-slate-50 border-2 border-slate-100 rounded-[3rem] shadow-xl mb-12" data-aos="fade-up" data-aos-delay="200">
            <p className="text-xl md:text-3xl text-slate-600 leading-relaxed font-medium italic">
              "Wah, saking banyaknya fitur, bagaimana saya bisa hafal semuanya? Bukannya malah makin pusing? Daripada pusing, bagaimana kalau kita serahkan semuanya saja kepada asisten pintar kita?"
            </p>
          </div>
          <div className="flex flex-col items-center" data-aos="zoom-in" data-aos-delay="400">
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] mb-4">Kenalkan...</p>
            <div className="text-6xl md:text-8xl font-black text-primary tracking-tighter">AIMAN</div>
          </div>
        </div>
      </section>

      {/* Aimanuddin Pi - Dedicated Section */}
      <section className="py-20 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16" data-aos="fade-up">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-yellow-500/20 border-2 border-yellow-400 rounded-full mb-8">
              <Bot className="w-8 h-8 text-yellow-300 animate-bounce" />
              <span className="text-yellow-200 font-black text-lg uppercase tracking-wide">Keunggulan Eksklusif - Pertama di Indonesia</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight" data-aos="fade-up">
              🧞 Kenalkan: <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-300">Aiman</span>
            </h2>
            
            <p className="text-2xl md:text-3xl text-blue-200 font-bold mb-4" data-aos="fade-up" data-aos-delay="100">
              AI Manager - Pesantren Intelligence
            </p>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed" data-aos="fade-up" data-aos-delay="200">
              Sosok asisten digital Islami yang hadir sebagai asisten cerdas 24/7, 
              siap membantu digitalisasi pesantren di seluruh Indonesia dengan display data real-time
            </p>
          </div>

          {/* Main Image */}
          <div className="mb-8" data-aos="zoom-in">
            <div className="max-w-4xl mx-auto rounded-[3rem] shadow-2xl border-4 border-white/20">
              <img 
                src="/images/presentasi/aiman-ustadz.png" 
                alt="Aiman - Asisten Digital Islami" 
                className="w-full h-auto object-contain rounded-[2.8rem]"
              />
            </div>
          </div>


          {/* Three Roles Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Ustadz Role */}
            <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-sm rounded-3xl p-8 border-2 border-violet-400/50" data-aos="fade-up" data-aos-delay="0">
              <div className="w-16 h-16 rounded-2xl bg-violet-500 flex items-center justify-center mb-6 shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-black text-violet-200 mb-3">🟣 Untuk Ustadz</h4>
              <p className="text-blue-100 mb-4 font-medium">
                Asisten digital dengan display database santri dan statistik akademik
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                  <span className="text-blue-200">Query data santri instan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                  <span className="text-blue-200">Laporan otomatis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                  <span className="text-blue-200">Panduan sistem</span>
                </div>
              </div>
            </div>

            {/* Santri Role */}
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-3xl p-8 border-2 border-cyan-400/50" data-aos="fade-up" data-aos-delay="100">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500 flex items-center justify-center mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-black text-cyan-200 mb-3">🔵 Untuk Santri</h4>
              <p className="text-blue-100 mb-4 font-medium">
                Asisten digital dengan display progress belajar dan prestasi
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-blue-200">Cek hafalan & nilai</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-blue-200">Jadwal & tugas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-blue-200">Tracking progress</span>
                </div>
              </div>
            </div>

            {/* Wali Role */}
            <div className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 backdrop-blur-sm rounded-3xl p-8 border-2 border-rose-400/50" data-aos="fade-up" data-aos-delay="200">
              <div className="w-16 h-16 rounded-2xl bg-rose-500 flex items-center justify-center mb-6 shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-black text-rose-200 mb-3">🌸 Untuk Wali</h4>
              <p className="text-blue-100 mb-4 font-medium">
                Asisten digital dengan display monitoring anak dan keamanan
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                  <span className="text-blue-200">Pantau anak 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                  <span className="text-blue-200">Notifikasi real-time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                  <span className="text-blue-200">Info transparan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA & Chat */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-400 rounded-3xl p-8 md:p-12 text-center mb-20" data-aos="zoom-in">
            <h3 className="text-3xl md:text-5xl font-black text-white mb-4">
              💡 Inovasi PERTAMA di Indonesia
            </h3>
            <p className="text-xl text-yellow-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Tidak ada pesantren lain yang memiliki AI Assistant berbasis Google Gemini dengan konsep asisten digital Islami + display data real-time seperti Aiman!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://wa.me/6285191555884" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-5 bg-green-500 text-white rounded-2xl font-black hover:bg-green-600 transition-all shadow-[0_20px_50px_-10px_rgba(34,197,94,0.3)] text-xl group"
              >
                Tanya Aiman di WhatsApp
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Presentation Gallery Section */}
          <div className="pt-10 mb-20">
            <div className="text-center mb-12" data-aos="fade-up">
              <h3 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">
                Pusat <span className="text-yellow-400">Presentasi</span> & Kisah
              </h3>
              <p className="text-xl text-blue-200">Pilih materi pemaparan yang sesuai dengan kebutuhan Anda</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  title: 'Presentasi Digitalisasi', 
                  path: '/presentasi-digitalisasi', 
                  icon: ChevronRight, 
                  color: 'bg-white/10',
                  border: 'border-white/20',
                  desc: 'Konsep dasar transformasi digital pesantren.'
                },
                { 
                  title: 'Pemaparan Solusi Aiman', 
                  path: '/solusi-aiman', 
                  icon: Monitor, 
                  color: 'bg-purple-600/30',
                  border: 'border-purple-500/50',
                  desc: 'Detail teknis & kapabilitas sistem AI Manager.'
                },
                { 
                  title: 'Kisah Aiman (Comic)', 
                  path: '/kisah-aiman', 
                  icon: BookOpen, 
                  color: 'bg-yellow-500/30',
                  border: 'border-yellow-400/50',
                  desc: 'Narasi visual perjalanan asisten digital Aiman.'
                },
                { 
                  title: 'Kisah Ustadz Ahmad', 
                  path: '/kisah-ustadz', 
                  icon: Users, 
                  color: 'bg-blue-600/30',
                  border: 'border-blue-500/50',
                  desc: 'Perspektif pengurus dalam manajemen digital.'
                },
                { 
                  title: 'Kisah Santri Digital', 
                  path: '/kisah-santri', 
                  icon: GraduationCap, 
                  color: 'bg-green-600/30',
                  border: 'border-green-500/50',
                  desc: 'Pengalaman belajar santri di era teknologi.'
                },
                { 
                  title: 'Kisah Wali Santri', 
                  path: '/kisah-wali-santri', 
                  icon: Heart, 
                  color: 'bg-rose-600/30',
                  border: 'border-rose-500/50',
                  desc: 'Kemudahan monitoring anak dari rumah.'
                }
              ].map((item, idx) => (
                <Link 
                  key={idx}
                  to={item.path}
                  className={`group relative ${item.color} backdrop-blur-md border-2 ${item.border} p-8 rounded-3xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center`}
                  data-aos="fade-up"
                  data-aos-delay={idx * 100}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/20 group-hover:bg-white/20 transition-colors">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{item.title}</h4>
                  <p className="text-blue-100 text-sm leading-relaxed">{item.desc}</p>
                </Link>
              ))}
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
            <a href="https://demopisantri.netlify.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-primary/5 transition-all shadow-lg">
              Coba Demo Gratis
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="https://wa.me/6285191555884?text=Halo,%20saya%20tertarik%20dengan%20PISANTRI%20untuk%20digitalisasi%20pesantren" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all shadow-lg">
              <MessageSquare className="w-5 h-5" />
              Hubungi via WhatsApp
            </a>
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
              <a href="https://wa.me/6285191555884" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Hubungi Kami</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Presentation Button */}
      <Link 
        to="/presentasi-digitalisasi"
        className="fixed bottom-6 right-6 z-50 p-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full shadow-2xl hover:scale-110 transition-all group"
        aria-label="Buka Presentasi Digitalisasi"
      >
        <div className="absolute inset-0 bg-blue-400 rounded-full blur-lg opacity-20 group-hover:opacity-40 animate-pulse"></div>
        <div className="relative flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
          <Presentation className="w-4 h-4 md:w-5 md:h-5 text-white" />
          <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.15em] whitespace-nowrap">
            Presentasi
          </span>
        </div>
      </Link>
    </div>
  );
}