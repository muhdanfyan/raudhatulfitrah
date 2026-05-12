import { useState, useEffect } from 'react';
import { API_URL, getPublicHeaders } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Phone, MapPin, Mail, ChevronLeft, GraduationCap, Users, BookOpen, 
  Code, Palette, TrendingUp, CheckCircle, Clock, FileText, CreditCard,
  Shield, Star, Award, Heart, Zap, ArrowRight, ChevronDown, BarChart3,
  Monitor, Building, Coffee, Briefcase, Target, Lightbulb, MessageCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getStaticAsset } from '../../utils/imageUtils';
import { useSettings } from '../../contexts/SettingsContext';

interface Gelombang {
  id_gelombang: number;
  nama_gelombang: string;
  tahun_ajaran: string;
  tanggal_buka: string;
  tanggal_tutup: string;
  biaya_pendaftaran: string;
  biaya_daftar_ulang: string;
  kuota: number;
  keterangan: string;
}

interface Konsentrasi {
  id_konsentrasi: number;
  nama_konsentrasi: string;
  deskripsi: string;
}

interface PpdbInfo {
  gelombang: Gelombang;
  sisa_kuota: number;
  pendaftar: number;
  konsentrasi: Konsentrasi[];
}

interface Settings {
  namaPesantren: string;
  namaSingkat: string;
  tagline: string;
  logo: string;
  warnaUtama: string;
  telepon: string;
  email: string;
  alamat: string;
}




const programIcons: Record<string, any> = {
  'Programming': Code,
  'Desain Grafis': Palette,
  'Digital Marketing': TrendingUp,
  'Data Scientist': BarChart3,
  'default': GraduationCap
};

const programColors: Record<string, string> = {
  'Programming': 'from-blue-500 to-indigo-600',
  'Desain Grafis': 'from-pink-500 to-rose-600',
  'Digital Marketing': 'from-emerald-500 to-teal-600',
  'Data Scientist': 'from-cyan-500 to-blue-600',
  'default': 'from-gray-500 to-gray-600'
};

export default function PpdbLandingPage() {
  const navigate = useNavigate();
  const [info, setInfo] = useState<PpdbInfo | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showMorePrograms, setShowMorePrograms] = useState(false);

  useEffect(() => {
    fetchData();
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }, []);

  const fetchData = async () => {
    try {
      const [infoRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/ppdb/info`, { headers: getPublicHeaders() }),
        fetch(`${API_URL}/public/settings`, { headers: getPublicHeaders() })
      ]);
      
      const infoData = await infoRes.json();
      const settingsData = await settingsRes.json();
      
      if (infoData.success) {
        setInfo(infoData.data);
      } else {
        setError(infoData.message || 'Pendaftaran belum dibuka');
      }
      
      if (settingsData.success) {
        setSettings(settingsData.data);
      }
    } catch {
      setError('Gagal memuat informasi PPDB');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(value));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Content dari pesantrenteknologi.id/daftar
  const keunggulan = [
    { icon: BookOpen, title: 'Kurikulum Islami + Digital', desc: 'Hafalan Al-Qur\'an, Coding, Digital Marketing, & Creative Design.' },
    { icon: Monitor, title: 'Media Modern', desc: 'Pembelajaran berbasis LMS untuk pantauan real-time.' },
    { icon: Briefcase, title: 'Magang Digital', desc: 'Internship langsung di perusahaan start-up.' },
    { icon: Coffee, title: 'Fasilitas Nyaman', desc: 'Asrama & ruang kelas ber-AC.' },
  ];

  const { settings: globalSettings } = useSettings();
  const mengapaKami: { icon: any, title: string, desc: string }[] = [
    { icon: Zap, title: 'Skill Double Impact', desc: 'Lulusan menguasai teknologi terkini sekaligus memiliki fondasi agama yang kokoh.' },
    { icon: Target, title: 'Jaminan Praktik Langsung', desc: 'Metode learning by doing melalui proyek riil seperti e-commerce dan pengembangan aplikasi UMKM.' },
    { icon: Lightbulb, title: 'Investasi Terukur', desc: 'Biaya sangat terjangkau dengan fasilitas premium: Lab IT ber-AC, LMS Digital, dan perangkat modern.' },
  ];

  const syaratPendaftaran = [
    'Usia minimal 15 tahun & Mengisi formulir pendaftaran.',
    'Sehat jasmani & rohani.',
    'Mengikuti tes & wawancara.',
    'Membayar biaya administrasi.',
  ];

  const biayaPendidikan = [
    { title: 'Formulir', amount: 'Rp 150rb', desc: 'Biaya pendaftaran awal.', icon: FileText },
    { title: 'Uang Pangkal', amount: 'Rp 7 Juta', desc: 'Seragam, Perlengkapan Asrama, Mushaf Al-Qur\'an', icon: CreditCard },
    { title: 'Biaya Mondok (SPP)', amount: formatCurrency(globalSettings.ppdbBoardingFee || 1400000), desc: 'SPP Pendidikan, Makan 3x, Laundry, Asrama AC', icon: Clock },
  ];

  const lokasiInfo = [
    { 
      title: 'Lokasi Pendaftaran', 
      address: globalSettings.ppdbRegistrationAddress,
      icon: Building
    },
    { 
      title: 'Lokasi Pesantren', 
      address: globalSettings.ppdbPesantrenAddress,
      icon: MapPin
    },
  ];

  const manfaat = [
    { icon: Star, text: 'Masa Depan Terjamin' },
    { icon: Award, text: 'Karakter Pemimpin Rabbani' },
    { icon: Shield, text: 'Investasi Anti Rugi' },
    { icon: Heart, text: 'Perlindungan Penuh dari Negatif' },
  ];

  const faqs = [
    { q: 'Apakah pendidikan di Pesantren Teknologi benar-benar berkualitas?', a: 'Ya, Pesantren Teknologi menggabungkan kurikulum IT terkini dengan pendidikan agama Islam. Santri akan belajar programming, digital marketing, dan desain grafis sambil menghafal Al-Qur\'an.' },
    { q: 'Berapa lama masa pendidikan di pondok?', a: 'Masa pendidikan adalah 2 tahun untuk program reguler. Setelah lulus, santri bisa melanjutkan program pengabdian atau langsung bekerja di industri IT.' },
    { q: 'Apa saja yang dipelajari di Pesantren Teknologi?', a: 'Santri akan mempelajari: (1) Ilmu IT sesuai konsentrasi (Programming, Desain, atau Digital Marketing), (2) Tahfidz Al-Quran dan kajian Islam, (3) Soft skill dan entrepreneurship.' },
    { q: 'Apakah ada tes seleksi untuk masuk?', a: 'Seleksi dilakukan berdasarkan kelengkapan dokumen, motivasi, dan wawancara. Tidak ada tes akademik khusus, yang utama adalah komitmen dan semangat belajar.' },
    { q: 'Fasilitas apa saja yang disediakan?', a: 'Pondok menyediakan asrama ber-AC, makan 3x sehari, akses internet, komputer/laptop untuk belajar, dan berbagai fasilitas penunjang lainnya.' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white mt-4">Memuat informasi PPDB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>PPDB {settings?.namaPesantren || 'Pesantren Teknologi'} - {settings?.namaSingkat || 'Pondok Informatika'}</title>
        <meta name="description" content={`Daftar PPDB ${settings?.namaPesantren || 'Pesantren Teknologi'}. Pendidikan IT berkualitas dengan kurikulum Islami.`} />
        <meta property="og:title" content={`PPDB ${settings?.namaPesantren || 'Pesantren Teknologi'} - ${settings?.namaSingkat || 'Pondok Informatika'}`} />
        <meta property="og:description" content={`Daftar PPDB ${settings?.namaPesantren || 'Pesantren Teknologi'}. Pendidikan IT berkualitas dengan kurikulum Islami.`} />
        <meta property="og:image" content={`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dbthxcpdz'}/image/upload/f_auto,q_auto/${import.meta.env.VITE_TENANT_ID || 'pondok_informatika'}/branding/og-image.png`} />
        <meta property="og:url" content="https://pondokinformatika.id/ppdb" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'duntlhjil'}/image/upload/f_auto,q_auto/${import.meta.env.VITE_TENANT_ID || 'pondok_informatika'}/branding/og-image.png`} />
      </Helmet>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src={settings?.logo || getStaticAsset('logo.png', 'branding')} alt="Logo" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <p className="font-bold text-gray-900 leading-tight">{settings?.namaSingkat || 'Pesantren Teknologi'}</p>
                <p className="text-[10px] text-gray-500 leading-tight">{settings?.namaPesantren || 'Wahdah Islamiyah'}</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#keunggulan" className="text-gray-600 hover:text-green-600 font-medium transition">Keunggulan</a>
              <a href="#biaya" className="text-gray-600 hover:text-green-600 font-medium transition">Biaya</a>
              <a href="#lokasi" className="text-gray-600 hover:text-green-600 font-medium transition">Lokasi</a>
              <a href="#faq" className="text-gray-600 hover:text-green-600 font-medium transition">FAQ</a>
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/" className="hidden sm:flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 transition">
                <ChevronLeft className="w-4 h-4" />
                Beranda
              </Link>
              <button onClick={() => navigate('/ppdb/login')} className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg font-medium transition">
                Login
              </button>
              <button onClick={() => navigate('/ppdb/register')} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-lg shadow-green-600/25">
                Daftar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image Section */}
      <section className="pt-16 bg-gradient-to-b from-teal-900 to-teal-800 text-center">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <Link to="/ppdb/register" className="inline-block hover:opacity-95 transition-opacity">
            <img 
              src={globalSettings.ppdbHeroImage || "/images/ppdb.png"} 
              alt={`Pendaftaran ${settings?.namaPesantren || 'Pesantren Teknologi'} 2026-2027`} 
              className="max-w-full h-auto mx-auto rounded-lg shadow-2xl shadow-black/30"
            />
          </Link>
        </div>
      </section>

      {/* Hero Text Section - Below Image */}
      <section className="bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-800 py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Pendaftaran Dibuka
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Penerimaan Peserta Didik Baru <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300">2026-2027</span>
            </h1>
            <p className="text-lg text-teal-100 mb-1">{settings?.namaPesantren || 'Pesantren Teknologi Wahdah Islamiyah Makassar'}</p>
            <p className="text-base text-teal-200 mb-8 max-w-2xl mx-auto">{settings?.tagline || 'Mencetak Generasi Hafizh Al-Qur\'an yang Melek Digital, Mandiri, dan Berwawasan Global.'}</p>

            {error ? (
              <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 text-yellow-100 px-6 py-4 rounded-2xl max-w-md mx-auto" data-aos="fade-up" data-aos-delay="100">
                <p className="font-medium">{error}</p>
                <p className="text-sm mt-1 text-yellow-200">Silakan cek kembali nanti</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto mb-8" data-aos="fade-up" data-aos-delay="100">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:bg-white/15 transition">
                    <p className="text-3xl sm:text-4xl font-bold text-white">{info?.sisa_kuota || 50}</p>
                    <p className="text-teal-200 text-sm mt-1">Sisa Kuota</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:bg-white/15 transition">
                    <p className="text-3xl sm:text-4xl font-bold text-white">{info?.pendaftar || 0}</p>
                    <p className="text-teal-200 text-sm mt-1">Pendaftar</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:bg-white/15 transition">
                    <p className="text-lg sm:text-xl font-bold text-white">30 Juni</p>
                    <p className="text-teal-200 text-sm mt-1">Batas Daftar</p>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center" data-aos="fade-up" data-aos-delay="200">
                  <button
                    onClick={() => navigate('/ppdb/register')}
                    className="group px-8 py-4 bg-white text-teal-700 font-bold text-lg rounded-2xl hover:bg-teal-50 transition shadow-2xl shadow-black/20 flex items-center justify-center gap-2"
                  >
                    <GraduationCap className="w-5 h-5" />
                    Daftar Santri
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <a 
                    href={`https://wa.me/${globalSettings.contactWhatsapp}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-2xl hover:bg-white/20 transition border border-white/20 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Kontak WA Admin
                  </a>
                </div>
                <p className="text-teal-200 text-sm mt-4" data-aos="fade-up" data-aos-delay="300">
                  Promo khusus menanti <span className="font-bold text-white">50 pendaftar pertama!</span>
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Keunggulan */}
      <section id="keunggulan" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">KEUNGGULAN</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Keunggulan Kami</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {keunggulan.map((item, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mengapa Memilih Kami */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">ALASAN</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Mengapa Memilih Kami?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {mengapaKami.map((item, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">"{item.title}"</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Syarat Pendaftaran */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">PERSYARATAN</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Syarat Pendaftaran</h2>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 border border-purple-100" data-aos="fade-up" data-aos-delay="100">
            <ul className="space-y-4">
              {syaratPendaftaran.map((syarat, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">{syarat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Biaya Pendidikan */}
      <section id="biaya" className="py-16 sm:py-20 bg-gradient-to-br from-slate-50 to-green-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">BIAYA</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Biaya Pendidikan Untuk Mondok/Boarding</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6" data-aos="fade-up" data-aos-delay="100">
            {biayaPendidikan.map((item, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-xl shadow-green-100/50 border border-green-100 hover:shadow-2xl transition-shadow text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-green-600" />
                </div>
                <p className="text-gray-500 text-sm mb-2">{item.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{item.amount}</p>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Konsentrasi */}
      {info && info.konsentrasi.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12" data-aos="fade-up">
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary-dark rounded-full text-sm font-medium mb-4">PROGRAM</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Program Konsentrasi</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Pilih bidang keahlian sesuai minat dan bakat untuk mengembangkan potensi terbaik</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {info.konsentrasi.slice(0, 6).map((k, index) => {
                const IconComp = programIcons[k.nama_konsentrasi] || programIcons.default;
                const colorClass = programColors[k.nama_konsentrasi] || programColors.default;
                return (
                  <div key={k.id_konsentrasi} className="group bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300" data-aos="fade-up" data-aos-delay={index * 100}>
                    <div className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <IconComp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{k.nama_konsentrasi}</h3>
                    <div 
                      className="text-gray-600 prose prose-sm max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4"
                      dangerouslySetInnerHTML={{ 
                        __html: k.deskripsi || 'Program pembelajaran intensif dengan kurikulum yang disesuaikan dengan kebutuhan industri.' 
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {info.konsentrasi.length > 6 && (
              <div className="text-center mt-12" data-aos="fade-up">
                <button 
                  onClick={() => setShowMorePrograms(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-xl shadow-primary/25 hover:-translate-y-1"
                >
                  Lihat Semua Program ({info.konsentrasi.length})
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Lokasi */}
      <section id="lokasi" className="py-16 sm:py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">LOKASI</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Lokasi</h2>
          </div>
          
          {/* Location Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8" data-aos="fade-up" data-aos-delay="100">
            {lokasiInfo.map((loc, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg border-0 h-full">
                <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <loc.icon className={`w-5 h-5 ${idx === 0 ? 'text-red-500' : 'text-blue-500'}`} />
                  {loc.title}
                </h5>
                <p className="text-gray-600">
                  {loc.address}
                </p>
              </div>
            ))}
          </div>
          
          {/* Google Maps Embed */}
          <div className="rounded-2xl overflow-hidden shadow-lg" data-aos="fade-up" data-aos-delay="200">
            <iframe 
              src={globalSettings.contactMapUrl} 
              width="100%" 
              height="400" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Pesantren Teknologi"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Manfaat */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">MANFAAT</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Manfaat Nyata Untuk Anda</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-aos="fade-up" data-aos-delay="100">
            {manfaat.map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-800">{item.text}</span>
              </div>
            ))}
          </div>
          {/* Testimonial */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 text-white text-center" data-aos="fade-up" data-aos-delay="200">
            <p className="text-xl italic mb-4">"Magang di startup sejak kelas XI, kini saya full-time developer dengan gaji Rp 7 juta/bulan — tanpa kuliah!"</p>
            <p className="text-green-200">— Alumni Pesantren Teknologi</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-20 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="inline-block px-4 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Pertanyaan Umum</h2>
            <p className="text-gray-600">Temukan jawaban untuk pertanyaan yang sering diajukan</p>
          </div>
          <div className="space-y-4" data-aos="fade-up" data-aos-delay="100">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!error && (
        <section className="py-20 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Amankan Tempat Anda Sekarang!</h2>
            <p className="text-xl text-green-100 mb-2">Batas Akhir Pendaftaran: 30 Juni 2025</p>
            <p className="text-green-200 mb-8">Promo khusus menanti <span className="font-bold text-white">50 pendaftar pertama!</span></p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/ppdb/register')}
                className="group px-10 py-5 bg-white text-green-700 font-bold text-lg rounded-2xl hover:bg-green-50 transition shadow-2xl shadow-black/20 inline-flex items-center justify-center gap-3"
              >
                <GraduationCap className="w-6 h-6" />
                Daftar Santri
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href={`https://wa.me/${globalSettings.contactWhatsapp}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-5 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-2xl hover:bg-white/20 transition border border-white/20 inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Kontak WA Admin
              </a>
              <a 
                href="https://bit.ly/ppdbpt2025" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-5 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-2xl hover:bg-white/20 transition border border-white/20 inline-flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Gabung Grup PPDB
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={settings?.logo || '/logo.png'} alt="Logo" className="h-10 w-auto" />
                <div>
                  <p className="font-bold text-white">{settings?.namaSingkat || 'Pesantren Teknologi'}</p>
                  <p className="text-sm">{settings?.namaPesantren || 'Wahdah Islamiyah'}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-2">{settings?.tagline || 'Sekolah Islam Berbasis IT Pertama di Makassar'}</p>
              <p className="text-sm italic text-green-400">"Mencetak Generasi IT yang Menjaga Sunnah, Menguasai Zaman"</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Kontak</h4>
              <div className="space-y-3">
                <a href="https://wa.me/6285191555884" className="flex items-center gap-2 hover:text-green-400 transition">
                  <Phone className="w-4 h-4" />
                  <span>0831-3408-6899</span>
                </a>
                {settings?.email && (
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-green-400 transition">
                    <Mail className="w-4 h-4" />
                    <span>{settings.email}</span>
                  </a>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Lokasi Pesantren</h4>
              <p className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{globalSettings.ppdbPesantrenAddress}</span>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} {settings?.namaPesantren || 'Pesantren Teknologi Wahdah Islamiyah'}. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* Search/Filter Modal for All Programs */}
      <AnimatePresence>
        {showMorePrograms && info && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMorePrograms(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Program Konsentrasi</h3>
                  <p className="text-sm text-gray-500">Daftar lengkap program keahlian yang tersedia</p>
                </div>
                <button 
                  onClick={() => setShowMorePrograms(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {info.konsentrasi.map((k) => {
                    const IconComp = programIcons[k.nama_konsentrasi] || programIcons.default;
                    const colorClass = programColors[k.nama_konsentrasi] || programColors.default;
                    return (
                      <div key={k.id_konsentrasi} className="bg-slate-50 rounded-2xl p-6 border border-gray-100 hover:border-primary/30 transition-colors">
                        <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center mb-4`}>
                          <IconComp className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">{k.nama_konsentrasi}</h4>
                        <div 
                          className="text-sm text-gray-600 prose prose-xs max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: k.deskripsi || 'Program pembelajaran intensif.' 
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-6 border-t bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setShowMorePrograms(false)}
                  className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
