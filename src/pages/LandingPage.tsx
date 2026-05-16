import { useState, useEffect, useRef } from 'react';
import { api, getPublicHeaders } from '../services/api';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  GraduationCap, Users, BookOpen, Briefcase, Code, Cpu,
  ChevronRight, Play, Star, CheckCircle, ArrowRight,
  Smartphone, Shield, Zap, BarChart3, Award,
  MapPin, Phone, Mail, PenTool, Palette, TrendingUp,
  Globe, Clock, Layout, MessageSquare, Heart, RefreshCw, Lightbulb,
  Home, Sun, Laptop, LogIn
} from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getStaticAsset, getStudentPhotoUrl } from '../utils/imageUtils';
import FloatingChatButton from '../components/FloatingChatButton';




interface Settings {
  namaPesantren: string;
  namaSingkat: string;
  tagline: string;
  logo: string;
  warnaUtama: string;
  alamat: string;
  telepon: string;
  email: string;
  heroImage: string;
  aboutImage: string;
  heroTitle: string;
  heroSubtitle: string;
  visi: string;
  misi: string;
  psb_biaya?: string;
  psb_jadwal?: string;
  psb_ekskul?: string;
  psb_beasiswa?: string;
  psb_kurikulum?: string;
  psb_keunggulan?: string;
  psb_tagline?: string;
  psb_kontak?: string;
}

interface Konsentrasi {
  id_konsentrasi: number;
  nama_konsentrasi: string;
  deskripsi_konsentrasi: string;
}

interface Tulisan {
  id: number;
  title: string;
  slug: string;
  kategori: string;
  image_url: string;
  excerpt: string;
  created_at: string;
  id_santri: number;
  nama_lengkap_santri: string;
}

interface Stats {
  total_santri: number;
  total_alumni: number;
  total_hafalan: number;
  total_portofolio: number;
  total_konsentrasi: number;
  total_course: number;
}

interface Pengurus {
  id_kepengelolaan: number;
  nama_jabatan: string;
  nama_lengkap_santri: string;
  foto_santri: string;
}

// Landing Page Dynamic Data Interfaces
interface LandingSection {
  id_section: number;
  section_key: string;
  section_title: string;
  section_subtitle: string | null;
  badge_text: string | null;
  is_visible: boolean;
  sort_order: number;
}

interface LandingLearningMode {
  id_learning_mode: number;
  title: string;
  tag: string;
  description: string;
  target: string;
  icon: string;
  color: string;
  is_featured: boolean;
  quota: string | null;
  sort_order: number;
}

interface LandingFeature {
  id_feature: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface LandingCharacteristic {
  id_characteristic: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface LandingProgram {
  id_program: number;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string | null;
  sort_order: number;
}

interface LandingGreeting {
  id_greeting: number;
  nama: string;
  jabatan: string;
  foto: string | null;
  greeting_text: string;
}

interface LandingData {
  sections?: LandingSection[];
  learning_modes?: LandingLearningMode[];
  features?: LandingFeature[];
  characteristics?: LandingCharacteristic[];
  programs?: LandingProgram[];
  greeting?: LandingGreeting;
  greetings?: LandingGreeting[];
}

// Icon mapping from database string names to Lucide components
const iconMap: Record<string, any> = {
  Home, Sun, Laptop, Zap, Award, Briefcase, Users, Shield,
  Clock, Cpu, Layout, MessageSquare, RefreshCw, Lightbulb, Heart,
  BookOpen, Star, Code, Palette, TrendingUp, BarChart3, GraduationCap,
  Globe, Smartphone, PenTool, MapPin, Phone, Mail, ChevronRight, CheckCircle, ArrowRight, Play
};

// Helper function to get icon component from string name
const getIconComponent = (iconName: string): any => {
  return iconMap[iconName] || GraduationCap;
};

// Helper to safely parse JSON strings from settings
const tryParseJson = (str: string, fallback: any = null): any => {
  try { return JSON.parse(str); } catch { return fallback; }
};

// Greeting Section Component with rotation
function GreetingSection({ greetings }: { greetings: LandingGreeting[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (greetings.length <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % greetings.length);
        setIsAnimating(false);
      }, 300);
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(interval);
  }, [greetings.length]);

  const current = greetings[currentIndex];
  if (!current) return null;

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8" data-aos="fade-up">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider mb-3">
            KATA SAMBUTAN
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Sambutan <span className="text-amber-600">Pimpinan</span>
          </h2>
        </div>

        <div className={`bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-lg border border-amber-100 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  {current.foto ? (
                    <img src={current.foto} alt={current.nama} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <span className="text-4xl sm:text-5xl text-white font-bold">{(current.nama || '').charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="absolute -inset-2 border-2 border-amber-200 rounded-full -z-10"></div>
                <div className="absolute -inset-4 border border-amber-100 rounded-full -z-10"></div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="hidden lg:block text-amber-300 mb-4">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>

              <div className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6 prose prose-amber max-w-none"
                dangerouslySetInnerHTML={{ __html: current.greeting_text || '' }} />

              <div className="border-t border-amber-200 pt-4">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{current.nama}</p>
                <p className="text-amber-600 font-medium">{current.jabatan}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dots indicator */}
        {greetings.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {greetings.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setIsAnimating(true); setTimeout(() => { setCurrentIndex(idx); setIsAnimating(false); }, 300); }}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-amber-500 w-6' : 'bg-amber-200 hover:bg-amber-300'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const konsentrasiConfig: Record<string, { icon: any; color: string; desc: string }> = {
  'Programming': { icon: Code, color: 'from-blue-500 to-indigo-600', desc: 'Belajar pengembangan web, mobile apps, dan database dengan kurikulum yang disesuaikan dengan kebutuhan industri.' },
  'Desain Grafis': { icon: Palette, color: 'from-pink-500 to-rose-600', desc: 'Menguasai desain UI/UX, branding, dan multimedia dengan alat desain profesional.' },
  'Digital Marketing': { icon: TrendingUp, color: 'from-green-500 to-emerald-600', desc: 'Mempelajari strategi pemasaran digital, SEO, media sosial, dan analitik untuk bisnis online.' },
  'Data Scientist': { icon: BarChart3, color: 'from-cyan-500 to-blue-600', desc: 'Mempelajari ilmu data, khususnya data kuantitatif, baik yang terstruktur maupun tidak terstruktur untuk menghasilkan insight bisnis.' },
  'default': { icon: GraduationCap, color: 'from-gray-500 to-gray-600', desc: 'Program pembelajaran intensif dengan kurikulum terupdate.' }
};

export default function LandingPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [konsentrasi, setKonsentrasi] = useState<Konsentrasi[]>([]);
  const [tulisan, setTulisan] = useState<Tulisan[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pengurus, setPengurus] = useState<Pengurus[]>([]);
  const [landingData, setLandingData] = useState<LandingData>({});
  const [loading, setLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (isHovering || konsentrasi.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % konsentrasi.length;

        // Scroll logic (without page jump)
        if (scrollRef.current) {
           const container = scrollRef.current;
           const firstCard = container.children[0] as HTMLElement;
           if (firstCard) {
             const cardWidth = firstCard.offsetWidth + 24; // Width + gap
             container.scrollTo({
               left: next * cardWidth,
               behavior: 'smooth'
             });
           }
        }
        return next;
      });
    }, 3000); // 3 seconds interval

    return () => clearInterval(interval);
  }, [isHovering, konsentrasi.length]);

  const fetchData = async () => {
    try {
      const [settingsData, konsentrasiData, tulisanData, statsData, pengurusData, landingResData] = await Promise.all([
        api.get('/public/settings', { headers: getPublicHeaders() }),
        api.get('/public/konsentrasi', { headers: getPublicHeaders() }),
        api.get('/public/tulisan?limit=3', { headers: getPublicHeaders() }),
        api.get('/public/stats', { headers: getPublicHeaders() }),
        api.get('/public/pengurus', { headers: getPublicHeaders() }),
        api.get('/public/landing-data', { headers: getPublicHeaders() })
      ]);

      setSettings(settingsData.data || settingsData);
      setKonsentrasi(konsentrasiData || []);
      setTulisan(tulisanData.data || []);
      setStats(statsData.data || null);
      setPengurus(pengurusData.data || []);
      setLandingData(landingResData.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = settings?.warnaUtama || '#2563EB';
  const hasPsbData = !!settings?.psb_biaya;
  const tenantId = import.meta.env.VITE_TENANT_ID || 'pondok_informatika';
  const isPestek = tenantId === 'pestek';
  const isTahfizbaubau = tenantId === 'tahfizbaubau';

  // Parse PSB settings (JSON strings)
  const psbBiaya = settings?.psb_biaya ? tryParseJson(settings.psb_biaya) : null;
  const psbJadwal = settings?.psb_jadwal ? tryParseJson(settings.psb_jadwal) : null;
  const psbEkskul = settings?.psb_ekskul ? tryParseJson(settings.psb_ekskul, []) : [];
  const psbBeasiswa = settings?.psb_beasiswa ? tryParseJson(settings.psb_beasiswa) : null;
  const psbKurikulum = settings?.psb_kurikulum ? tryParseJson(settings.psb_kurikulum) : null;
  const psbKeunggulan = settings?.psb_keunggulan ? tryParseJson(settings.psb_keunggulan, []) : [];

  // Default fallback data when API empty
  const defaultPrograms = [
    { title: 'Tahfidz Quran', desc: 'Program menghafal Al-Quran dengan metode yang efektif dan pendampingan intensif.', icon: BookOpen, category: 'Keagamaan' },
    { title: 'Kajian Kitab', desc: 'Memperdalam ilmu agama melalui kajian kitab-kitab klasik dan kontemporer.', icon: Star, category: 'Keagamaan' },
    { title: 'Entrepreneurship', desc: 'Mengembangkan jiwa wirausaha dan keterampilan bisnis untuk kemandirian santri.', icon: Briefcase, category: 'Kemandirian' },
  ];

  const defaultLearningModes = [
    { title: "Boarding (Mondok)", tag: "Intensif", desc: "Pengalaman belajar dan hidup 24 jam penuh di lingkungan pondok yang Islami dan terstruktur.", target: "Mereka yang ingin fokus 100%, siap hidup mandiri, dan mencari lingkungan Islami.", icon: Home, color: "from-blue-500 to-indigo-600", featured: true, quota: "40 orang" },
    { title: "Non-Boarding (Harian)", tag: "Fleksibel", desc: "Datang ke lokasi pondok pada jam belajar reguler, namun kembali ke rumah setelah selesai.", target: "Mereka yang tinggal dekat dan ingin tetap tinggal bersama keluarga.", icon: Sun, color: "from-amber-400 to-orange-500", featured: false, quota: null },
    { title: "From Home (Jarak Jauh)", tag: "Mandiri", desc: "Pembelajaran penuh secara online (daring) dengan pendampingan mentor virtual.", target: "Mereka yang berada di luar kota atau memiliki keterbatasan mobilitas.", icon: Laptop, color: "from-emerald-400 to-teal-500", featured: false, quota: null },
    { title: "After School (Sore)", tag: "Tambahan", desc: "Program tambahan di luar jam sekolah formal untuk mengasah keahlian spesifik.", target: "Pelajar aktif yang ingin menambah skill IT tanpa mengganggu jadwal sekolah.", icon: Zap, color: "from-purple-500 to-pink-500", featured: false, quota: null }
  ];

  const defaultFeatures = [
    { icon: Award, title: 'Full Beasiswa', desc: 'Akses pendidikan IT berkualitas tanpa biaya untuk yatim dan dhuafa berprestasi.' },
    { icon: Briefcase, title: 'Kurikulum Industri', desc: 'Materi pembelajaran yang disusun sesuai kebutuhan dunia kerja dan teknologi terkini.' },
    { icon: Users, title: 'Mentor Praktisi', desc: 'Belajar langsung dari para ahli yang berpengalaman di industri teknologi.' },
    { icon: Shield, title: 'Lingkungan Islami', desc: 'Pembiasaan adab dan ibadah harian untuk membentuk karakter mulia.' },
  ];

  const defaultCharacteristics = [
    { title: "Fleksibilitas Waktu dan Tempat", subtitle: "Diverse Time and Place", desc: "Akses materi kapan saja dan di mana saja, didukung oleh platform daring dan MOOC.", icon: Clock, color: "from-blue-500 to-cyan-500" },
    { title: "Berpusat pada Siswa", subtitle: "Student-Centered", desc: "Fokus pada pembelajaran aktif dimana siswa bertanya, bereksplorasi, dan berlatih.", icon: Users, color: "from-purple-500 to-pink-500" },
    { title: "Berbasis Kompetensi", subtitle: "Competency-Based", desc: "Penilaian berdasarkan penguasaan keterampilan, bukan sekadar hafalan.", icon: Award, color: "from-amber-500 to-orange-500" },
    { title: "Integrasi Teknologi", subtitle: "Technology Integration", desc: "Pemanfaatan IoT, VR, AR, dan AI untuk pengalaman belajar yang mendalam.", icon: Cpu, color: "from-emerald-500 to-teal-500" },
    { title: "Personalisasi", subtitle: "Flexible Tasks", desc: "Tugas yang fleksibel mengakomodasi berbagai gaya dan minat belajar.", icon: Layout, color: "from-indigo-500 to-blue-600" },
    { title: "Kolaborasi", subtitle: "Collaboration", desc: "Menekankan kerja tim dan komunikasi efektif via jaringan digital.", icon: MessageSquare, color: "from-rose-500 to-red-600" },
    { title: "Belajar Seumur Hidup", subtitle: "Lifelong Learning", desc: "Mendorong kesadaran untuk terus mengembangkan diri (learning how to learn).", icon: RefreshCw, color: "from-cyan-500 to-blue-500" },
    { title: "Masalah Dunia Nyata", subtitle: "Problem-Based Learning", desc: "Melatih kemampuan analitis melalui pemecahan masalah autentik.", icon: Lightbulb, color: "from-violet-500 to-purple-600" },
    { title: "Karakter & Etika", subtitle: "Character & Ethics", desc: "Membentuk manusia bijak, berintegritas, dan menjunjung moral digital.", icon: Heart, color: "from-green-500 to-emerald-600" }
  ];

  // Use API data if available, otherwise fallback to defaults
  const programs = landingData.programs && landingData.programs.length > 0
    ? landingData.programs.map(p => ({
        title: p.title,
        desc: p.description,
        icon: getIconComponent(p.icon),
        category: p.category
      }))
    : defaultPrograms;

  const learningModes = landingData.learning_modes && landingData.learning_modes.length > 0
    ? landingData.learning_modes.map(lm => ({
        title: lm.title,
        tag: lm.tag,
        desc: lm.description,
        target: lm.target,
        icon: getIconComponent(lm.icon),
        color: lm.color,
        featured: Boolean(lm.is_featured),
        quota: lm.quota
      }))
    : defaultLearningModes;

  const features = landingData.features && landingData.features.length > 0
    ? landingData.features.map(f => ({
        icon: getIconComponent(f.icon),
        title: f.title,
        desc: f.description
      }))
    : defaultFeatures;

  const characteristics = landingData.characteristics && landingData.characteristics.length > 0
    ? landingData.characteristics.map(c => ({
        title: c.title,
        subtitle: c.subtitle,
        desc: c.description,
        icon: getIconComponent(c.icon),
        color: c.color
      }))
    : defaultCharacteristics;

  const seoTitle = settings?.psb_tagline
    ? `${settings?.namaPesantren || 'PPTQ Al-Madinah Baubau'} - Penerimaan Santri Baru 2026/2027`
    : `${settings?.namaPesantren || 'Pondok Informatika'} - Pesantren IT Gratis Indonesia Timur`;
  const seoDescription = settings?.psb_tagline
    ? `${settings?.namaPesantren || 'PPTQ Al-Madinah Baubau'} menerima santri baru SD-SMP-SMA tahun ajaran 2026/2027. Program boarding dan full day dengan kurikulum nasional dan kaderisasi ulama.`
    : `${settings?.namaPesantren || 'Pondok Informatika'} adalah pesantren IT gratis yang mengintegrasikan programming, desain grafis, dan agama Islam untuk pemuda Indonesia Timur.`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  const ogImage = settings?.heroImage
    ? `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'duntlhjil'}/image/upload/f_auto,q_auto/${import.meta.env.VITE_TENANT_ID || 'pondok_informatika'}/branding/og-image.png`
    : 'https://pondokinformatika.id/images/og-preview.png';

  const siteUrl = isPestek ? 'https://pesantrenteknologi.id' : 'https://pondokinformatika.id';

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'duntlhjil'}/image/upload/f_auto,q_auto/${import.meta.env.VITE_TENANT_ID || 'pondok_informatika'}/branding/og-image.png`} />
        <meta property="og:url" content="https://pondokinformatika.id" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'duntlhjil'}/image/upload,f_auto,q_auto/${import.meta.env.VITE_TENANT_ID || 'pondok_informatika'}/branding/og-image.png`} />
      </Helmet>

      <FloatingChatButton />

    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src={settings?.logo || getStaticAsset('logo.png', 'branding')} alt="Logo Pondok Informatika Pesantren IT Modern" className="h-10 w-auto" />
              <span className="font-bold text-gray-900 hidden sm:block">{settings?.namaSingkat || 'PISANTRI'}</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/tulisan" className="text-gray-600 hover:text-primary font-medium">Tulisan</Link>
              <Link to="/santri" className="text-gray-600 hover:text-primary font-medium">Santri</Link>
              <Link to="/digitalisasi-pesantren" className="text-gray-600 hover:text-primary font-medium">Digitalisasi</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/ppdb" className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                <span className="hidden sm:inline">Daftar</span> PPDB
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-white rounded-lg font-medium transition-colors" style={{ backgroundColor: primaryColor }}>
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Masuk</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="beranda" className="pt-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden min-h-[calc(100vh-64px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative">
          <div className="text-center mb-2" data-aos="fade-down">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary-dark rounded-full text-sm font-medium mb-1 sm:mb-2">{settings?.psb_tagline || (isTahfizbaubau ? 'MELAHIRKAN KADER ULAMA' : 'FOR A BETTER FUTURE')}</span>
          </div>

          {/* Mobile Hero Image - Show at top on mobile */}
          <div className="block lg:hidden mb-8" data-aos="zoom-in" data-aos-delay="100">
            <div className="relative mx-auto max-w-md">
              <picture>
                <img
                  src={settings?.heroImage || getStaticAsset('hero-image.png', 'pages')}
                  alt={`${settings?.namaPesantren || 'Pesantren IT'} - Welcome`}
                  className="w-full object-contain drop-shadow-xl"
                  loading="eager"
                />
              </picture>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              {/* Animated Title */}
              <div className="overflow-hidden mb-2 sm:mb-3">
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  <span className="block text-gray-900 mb-2" style={{ animation: 'slideInUp 0.8s ease-out' }}>
                    {(settings?.heroTitle || 'Pondok Informatika: Pesantren IT Modern Indonesia Timur').split(':')[0]}
                  </span>
                  <span
                    className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse"
                    style={{
                      backgroundSize: '200% 200%',
                      animation: 'gradientShift 3s ease infinite, slideInUp 0.8s ease-out 0.2s both'
                    }}
                  >
                    {(settings?.heroTitle || 'Pondok Informatika: Pesantren IT Modern Indonesia Timur').includes(':')
                      ? (settings?.heroTitle || 'Pondok Informatika: Pesantren IT Modern Indonesia Timur').split(':')[1]
                      : 'Pesantren IT Modern'}
                  </span>
                </h1>
              </div>

              {/* Animated Subtitle with typing effect style */}
              <div className="relative mb-3 sm:mb-4" data-aos="fade-up" data-aos-delay="200">
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  <span className="inline-block" style={{ animation: 'fadeInWord 0.5s ease-out 0.3s both' }}>
                    {settings?.heroSubtitle || (settings?.psb_tagline
                      ? 'Melahirkan Kader Ulama dan Pemimpin Masa Depan yang berpegang teguh pada Al-Qur\'an dan As-Sunnah, menguasai ilmu syar\'i, dan memiliki keterampilan hidup yang mandiri.'
                      : 'Lembaga pendidikan yang mengintegrasikan teknologi informasi (IT) dan pendidikan agama (Pesantren), bertujuan untuk mencetak generasi IT yang Rabbani. Berbasis di Indonesia Timur, pondok ini menawarkan pendidikan GRATIS bagi pemuda tidak mampu.')}
                  </span>
                </p>
                {/* Decorative line */}
                <div
                  className="hidden lg:block absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-indigo-500 rounded-full"
                  style={{ animation: 'scaleY 0.8s ease-out 0.5s both', transformOrigin: 'top' }}
                ></div>
              </div>

              {/* Animated Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start" data-aos="fade-up" data-aos-delay="300">
                <Link
                  to="/ppdb"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 transition-all duration-300"
                >
                  <GraduationCap className="w-5 h-5 group-hover:animate-bounce" />
                  <span>Daftar Sekarang</span>

                </Link>
                <a
                  href="#tentang"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/80 backdrop-blur-sm text-gray-800 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300"
                >
                  <span>Pelajari Lebih Lanjut</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Floating badges */}
              <div className="hidden lg:flex items-center gap-3 mt-4" data-aos="fade-up" data-aos-delay="400">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Full Beasiswa
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  IT + Pesantren
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                  Indonesia Timur
                </div>
              </div>
            </div>
            {/* Desktop Hero Image */}
            <div className="hidden lg:block" data-aos="zoom-in-up" data-aos-duration="1000" data-aos-delay="200">
              <div className="relative group cursor-pointer">
                {/* Main Image Container with Float Animation */}
                <div className="relative animate-float">
                  <picture>
                    <img
                      src={settings?.heroImage || getStaticAsset('hero-image.png', 'pages')}
                      alt={`${settings?.namaPesantren || 'Pesantren IT'} - Welcome`}
                      className="relative w-full object-contain transition-all duration-700 ease-out group-hover:scale-105 drop-shadow-2xl"
                      loading="eager"
                    />
                  </picture>
                </div>

                {/* Floating Data Ornaments with Icons */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl px-4 py-3 shadow-lg shadow-blue-500/30 animate-bounce-slow flex items-center gap-2 border border-white/20" data-aos="zoom-in" data-aos-delay="500">
                  <Users className="w-5 h-5 text-white/90" />
                  <div className="text-white text-center">
                    <div className="text-xl font-bold leading-none">{stats?.total_santri || 50}+</div>
                    <div className="text-[10px] text-blue-100 uppercase tracking-wide">Santri</div>
                  </div>
                </div>

                <div className="absolute -bottom-3 -left-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl px-4 py-3 shadow-lg shadow-emerald-500/30 animate-float-delayed flex items-center gap-2 border border-white/20" data-aos="zoom-in" data-aos-delay="600">
                  <Briefcase className="w-5 h-5 text-white/90" />
                  <div className="text-white text-center">
                    <div className="text-xl font-bold leading-none">{stats?.total_portofolio || 100}+</div>
                    <div className="text-[10px] text-emerald-100 uppercase tracking-wide">Karya</div>
                  </div>
                </div>

                <div className="absolute top-1/4 -right-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl w-16 h-16 flex flex-col items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse border border-white/20" data-aos="zoom-in" data-aos-delay="700">
                  <BookOpen className="w-5 h-5 text-white/90" />
                  <div className="text-white text-center">
                    <div className="text-lg font-bold leading-none">{stats?.total_course || 15}</div>
                    <div className="text-[8px] text-purple-100">Kelas</div>
                  </div>
                </div>

                <div className="absolute bottom-1/4 -left-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl w-16 h-16 flex flex-col items-center justify-center shadow-lg shadow-amber-500/30 animate-float border border-white/20" data-aos="zoom-in" data-aos-delay="800">
                  <GraduationCap className="w-5 h-5 text-white/90" />
                  <div className="text-white text-center">
                    <div className="text-lg font-bold leading-none">{stats?.total_alumni || 100}</div>
                    <div className="text-[8px] text-amber-100">Alumni</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kata Sambutan / Greeting Section */}
      {landingData.greetings && landingData.greetings.length > 0 && (
        <GreetingSection greetings={landingData.greetings} />
      )}

      {/* Learning Modes / Pilihan Program Belajar */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10" data-aos="fade-up">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold tracking-wider mb-3">
              METODE BELAJAR
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Pilihan Program <span className="text-blue-600">Belajar</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base">
              Sesuaikan metode belajar dengan kebutuhan dan kondisimu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {learningModes.map((mode, index) => (
              <div
                key={index}
                className={`group relative rounded-2xl transition-all duration-300 overflow-hidden ${
                  mode.featured
                    ? 'bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 text-white shadow-2xl ring-2 ring-amber-400/50 hover:-translate-y-1'
                    : 'bg-white text-gray-900 border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                }`}
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                {/* Golden Glow for Featured */}
                {mode.featured && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                )}

                <div className={`relative p-5 sm:p-6 ${mode.featured ? 'z-10' : ''}`}>
                  {/* Badges for Featured Item */}
                  {mode.featured && (
                    <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
                      <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-900 text-[10px] font-black rounded-full shadow-lg">
                        ⭐ UNGGULAN
                      </span>
                      {mode.quota && (
                        <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                          Kuota: {mode.quota} orang
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      mode.featured
                        ? 'bg-white/15 text-amber-300'
                        : `bg-gradient-to-br ${mode.color} text-white shadow-sm`
                    }`}>
                      <mode.icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          mode.featured
                            ? 'bg-blue-800/60 text-blue-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {mode.tag}
                        </span>
                      </div>
                      <h3 className={`text-lg sm:text-xl font-bold mb-1 ${mode.featured ? 'text-white' : 'text-gray-900'}`}>
                        {mode.title}
                      </h3>
                      <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${mode.featured ? 'text-blue-100/80' : 'text-gray-500'}`}>
                        {mode.desc}
                      </p>

                      <div className={`flex items-center gap-2 pt-3 border-t ${mode.featured ? 'border-white/10' : 'border-gray-100'}`}>
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 ${mode.featured ? 'text-emerald-400' : 'text-green-500'}`} />
                        <p className={`text-xs italic ${mode.featured ? 'text-white/90' : 'text-gray-600'}`}>
                          {mode.target}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Why Choose Us */}
      <section className="py-16 sm:py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="inline-block px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs sm:text-sm font-bold tracking-wide mb-4 border border-green-100">KEYakinan KAMI</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Mengapa Memilih Kami?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 h-full" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pengurus Section */}
      {pengurus.length > 0 && (
        <section className="py-12 sm:py-20 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12" data-aos="fade-up">
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary-dark rounded-full text-sm font-medium mb-4">KEPENGURUSAN</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Susunan <span className="text-primary">Pengurus</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Para pengurus yang bertanggung jawab mengelola kegiatan {settings?.namaSingkat || 'Pondok'}
              </p>
            </div>
          </div>

          {/* Scrolling Container - Draggable */}
          <div
            className="relative overflow-x-auto cursor-grab active:cursor-grabbing scrollbar-hide"
            onMouseDown={(e) => {
              const el = e.currentTarget;
              el.dataset.dragging = 'true';
              el.dataset.startX = String(e.pageX - el.offsetLeft);
              el.dataset.scrollLeft = String(el.scrollLeft);
            }}
            onMouseUp={(e) => { e.currentTarget.dataset.dragging = 'false'; }}
            onMouseLeave={(e) => { e.currentTarget.dataset.dragging = 'false'; }}
            onMouseMove={(e) => {
              const el = e.currentTarget;
              if (el.dataset.dragging !== 'true') return;
              e.preventDefault();
              const x = e.pageX - el.offsetLeft;
              const walk = (x - Number(el.dataset.startX)) * 2;
              el.scrollLeft = Number(el.dataset.scrollLeft) - walk;
            }}
          >
            <div className="flex gap-4 sm:gap-6 px-4 py-2 w-max">
              {[...pengurus, ...pengurus, ...pengurus].map((p, index) => (
                <div
                  key={`${p.id_kepengelolaan}-${index}`}
                  className="flex-shrink-0 w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden relative group cursor-pointer"
                >
                  {/* Photo */}
                  {p.foto_santri ? (
                    <img
                      src={getStudentPhotoUrl(p.foto_santri)}
                      alt={p.nama_lengkap_santri}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-5xl sm:text-6xl font-bold text-white/80">
                        {p.nama_lengkap_santri?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 sm:p-5">
                    <h3 className="font-bold text-white text-base sm:text-lg mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {p.nama_lengkap_santri}
                    </h3>
                    <span className="inline-block w-fit px-3 py-1 bg-primary-light text-white rounded-full text-xs sm:text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {p.nama_jabatan}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CSS for hiding scrollbar */}
          <style>{`
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </section>
      )}


      {/* 9 Karakteristik Section */}
      <section className="py-16 sm:py-24 bg-zinc-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-100 rounded-bl-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-purple-100 rounded-tr-full opacity-50 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-16" data-aos="fade-up">
            <span className="inline-block px-4 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-xs sm:text-sm font-bold tracking-wide mb-4 shadow-sm">
              METODE PEMBELAJARAN
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              9 Karakteristik <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{settings?.namaSingkat || 'PISANTRI'}</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Mewujudkan pendidikan yang relevan dengan perkembangan zaman melalui pendekatan modern dan Islami.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {characteristics.map((item, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100/50 overflow-hidden hover:-translate-y-2 h-full flex flex-col"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                {/* Background Gradient on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <item.icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <span className="inline-block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    {item.subtitle}
                  </span>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {item.desc}
                  </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 text-gray-100 font-black text-6xl opacity-20 select-none group-hover:opacity-10 transition-opacity">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program IT Section / Tahfizbaubau PSB Section */}
      <section id="program" className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {hasPsbData ? (
            <>
              {/* PSB Info */}
              <div className="text-center mb-10 sm:mb-16">
                <span className="inline-block text-primary font-bold tracking-wider text-sm mb-2">PENERIMAAN SANTRI BARU</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">Tahun Ajaran <span className="text-primary">2026/2027</span></h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  SD - SMP - SMA | Boarding &amp; Full Day
                </p>
              </div>
              {/* Program Cards */}
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-6 shadow-lg border-2 border-emerald-400 relative overflow-hidden transform hover:scale-[1.02] transition-all">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">UNGGULAN</div>
                  <div className="text-3xl mb-2">📖</div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">Tahfidz (Mondok)</h3>
                  <p className="text-emerald-600 font-medium text-sm mb-2">Program Unggulan</p>
                  <p className="text-sm text-gray-600">Target hafalan {psbKurikulum?.tahfidz_target || 'Al-Quran 30 Juz'} dengan metode tahfidz intensif dan murojaah harian.</p>
                  <div className="mt-3 pt-3 border-t border-emerald-200">
                    <p className="text-xs text-gray-500">Seluruh jenjang</p>
                  </div>
                </div>
                {['SD', 'SMP', 'SMA'].map((jenjang, i) => {
                  const colors = [
                    { border: 'border-blue-100', text: 'text-blue-600', check: 'text-blue-500' },
                    { border: 'border-purple-100', text: 'text-purple-600', check: 'text-purple-500' },
                    { border: 'border-amber-100', text: 'text-amber-600', check: 'text-amber-500' },
                  ];
                  const emojis = ['🎒', '📚', '🎯'];
                  return (
                    <div key={jenjang} className={`bg-white rounded-xl p-6 shadow-md border ${colors[i].border} transform hover:scale-[1.02] transition-all`}>
                      <div className="text-3xl mb-2">{emojis[i]}</div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{jenjang}</h3>
                      <p className={`${colors[i].text} font-medium text-sm mb-2`}>{jenjang} {settings?.namaPesantren?.replace('Pondok Pesantren ', '') || 'Tahfidz Al-Madinah'}</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-1.5"><span className={colors[i].check}>✓</span> {jenjang === 'SD' ? (psbKurikulum?.sd?.split('(')[0]?.trim() || 'Kurikulum Nasional') : (psbKurikulum?.smp_sma?.split('(')[0]?.trim() || 'Kaderisasi Ulama')}</li>
                        <li className="flex items-center gap-1.5"><span className={colors[i].check}>✓</span> Tahfidz Al-Qur'an</li>
                        <li className="flex items-center gap-1.5"><span className={colors[i].check}>✓</span> Boarding &amp; Full Day</li>
                      </ul>
                    </div>
                  );
                })}
              </div>
              {/* Kurikulum & Biaya */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">📚 Kurikulum</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✅</span>
                      <span><strong>{psbKurikulum?.sd?.split('(')[0]?.trim() || 'Kurikulum Nasional'}</strong> — Untuk jenjang SD</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✅</span>
                      <span><strong>{psbKurikulum?.smp_sma?.split('(')[0]?.trim() || 'Kaderisasi Ulama'}</strong> — Untuk jenjang SMP-SMA</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 bg-white/60 rounded-lg">
                    <p className="font-semibold text-gray-700">Target Tahfidz:</p>
                    <p className="text-xl font-bold text-emerald-600">{psbKurikulum?.tahfidz_target || 'Al-Quran 30 Juz'}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">💰 Biaya &amp; Beasiswa</h3>
                  {psbBiaya && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                        <span className="text-sm text-gray-700">Pendaftaran</span>
                        <span className="font-semibold text-gray-900">Rp{Number(psbBiaya.pendaftaran).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                        <span className="text-sm text-gray-700">Boarding (Asrama)</span>
                        <span className="font-semibold text-gray-900">Rp{Number(psbBiaya.boarding_total || psbBiaya.boarding_spp + psbBiaya.boarding_makan).toLocaleString('id-ID')}/bln</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                        <span className="text-sm text-gray-700">Full Day (Non-Boarding)</span>
                        <span className="font-semibold text-gray-900">Rp{Number(psbBiaya.fullday).toLocaleString('id-ID')}/bln</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                        <span className="text-sm text-gray-700">Uang Masuk Boarding</span>
                        <span className="font-semibold text-gray-900">Rp{Number(psbBiaya.uang_masuk_boarding).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                        <span className="text-sm text-gray-700">Uang Masuk Full Day</span>
                        <span className="font-semibold text-gray-900">Rp{Number(psbBiaya.uang_masuk_fullday).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  )}
                  {psbBeasiswa && (
                    <div className="mt-3 p-2 bg-purple-100/60 rounded-lg">
                      <p className="text-xs text-purple-700">🎓 {psbBeasiswa.yatim_dhuafa} — {psbBeasiswa.kurang_mampu}</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Ekstrakurikuler */}
              {psbEkskul.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">🏅 Ekstrakurikuler</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {psbEkskul.map((item: string) => (
                      <div key={item} className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                        <span className="text-blue-500">◆</span>
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Jadwal */}
              {psbJadwal && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">📅 Jadwal Pendaftaran</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-white/60 rounded-lg">
                      <p className="text-xs text-gray-500">Pendaftaran</p>
                      <p className="font-semibold text-gray-800">{psbJadwal.pendaftaran_mulai} – {psbJadwal.pendaftaran_selesai}</p>
                    </div>
                    <div className="p-3 bg-white/60 rounded-lg">
                      <p className="text-xs text-gray-500">Seleksi</p>
                      <p className="font-semibold text-gray-800">{psbJadwal.seleksi}</p>
                    </div>
                    <div className="p-3 bg-white/60 rounded-lg">
                      <p className="text-xs text-gray-500">Pengumuman</p>
                      <p className="font-semibold text-gray-800">{psbJadwal.pengumuman}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-center mb-10 sm:mb-16">
                <span className="inline-block text-primary font-bold tracking-wider text-sm mb-2">PILIH DIVISI</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">Program <span className="text-primary">{settings?.namaSingkat || 'Pondok'}</span></h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Temukan passion teknologimu dan kembangkan potensi terbaik bersama mentor berpengalaman.
                </p>
              </div>
              <div className="relative group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div
                  ref={scrollRef}
                  className="flex overflow-x-auto pb-8 gap-6 mb-8 px-4 sm:px-0 snap-x snap-mandatory scrollbar-hide scroll-smooth"
                  style={{ scrollBehavior: 'smooth' }}
                  onScroll={() => {
                    if (scrollRef.current) {
                      const scrollLeft = scrollRef.current.scrollLeft;
                      const firstCard = scrollRef.current.children[0] as HTMLElement;
                      const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 350;
                      const index = Math.round(scrollLeft / cardWidth);
                      if (activeIndex !== index) {
                        setActiveIndex(index);
                      }
                    }
                  }}
                >
                  {[...konsentrasi, ...konsentrasi].map((item, index) => {
                    const config = konsentrasiConfig[item.nama_konsentrasi] || konsentrasiConfig.default;
                    const IconComponent = config.icon;
                    return (
                      <div key={`${item.id_konsentrasi}-${index}`} className="flex-shrink-0 w-80 sm:w-96 bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group/card border border-gray-100 snap-center relative">
                        <div className={`h-2 sm:h-3 bg-gradient-to-r ${config.color}`}></div>
                        <div className="p-5 sm:p-8 h-full flex flex-col">
                          <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${config.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover/card:scale-110 transition-transform`}>
                            <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm text-primary font-medium">Program IT</span>
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 mb-2 sm:mb-3">{item.nama_konsentrasi}</h3>
                          <p className="text-sm sm:text-base text-gray-600 flex-grow">{item.deskripsi_konsentrasi || config.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center items-center gap-2 mb-10 sm:mb-16">
                  {konsentrasi.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                         if (scrollRef.current) {
                           const container = scrollRef.current;
                           const cards = container.children;
                           if (cards[index]) {
                             (cards[index] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                           }
                           setActiveIndex(index);
                         }
                      }}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        activeIndex === index
                          ? 'w-8 bg-primary'
                          : 'w-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Program Keunggulan Cards */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {programs.map((program, index) => (
              <div key={index} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-amber-200/60">
                <span className="text-xs sm:text-sm text-amber-600 font-medium">{program.category}</span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-1 mb-2 sm:mb-3">{program.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{program.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Impact Section */}
      <section id="tentang" className="py-12 sm:py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-30"></div>
                <img
                  src={settings?.aboutImage?.startsWith('http')
                    ? settings.aboutImage
                    : getStaticAsset('about.webp', 'pages', { width: 800, quality: 85 })}
                  alt="Sekolah Modern IT - Pondok Informatika Pesantren IT Indonesia Timur"
                  className="relative rounded-xl sm:rounded-2xl shadow-xl w-full object-cover aspect-[4/3] lg:aspect-auto"
                  loading="lazy"
                  width="598"
                  height="485"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Dampak <span className="text-primary-light">{settings?.namaSingkat || 'Pondok'}</span></h2>
              <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base max-w-lg mx-auto lg:mx-0">
                Sejak berdiri, {settings?.namaSingkat || 'Pondok'} telah memberikan dampak nyata bagi santri dan masyarakat.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-white/10 rounded-xl p-3 sm:p-4 border border-white/5">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mb-1 sm:mb-2 mx-auto lg:mx-0" />
                  <div className="text-xl sm:text-2xl font-bold">{stats?.total_santri || 50}</div>
                  <div className="text-gray-300 text-xs sm:text-sm">Santri Aktif</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 sm:p-4 border border-white/5">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mb-1 sm:mb-2 mx-auto lg:mx-0" />
                  <div className="text-xl sm:text-2xl font-bold">{stats?.total_alumni || 120}</div>
                  <div className="text-gray-300 text-xs sm:text-sm">Alumni</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 sm:p-4 border border-white/5">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mb-1 sm:mb-2 mx-auto lg:mx-0" />
                  <div className="text-xl sm:text-2xl font-bold">{stats?.total_course || 15}</div>
                  <div className="text-gray-300 text-xs sm:text-sm">Program</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 sm:p-4 border border-white/5">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mb-1 sm:mb-2 mx-auto lg:mx-0" />
                  <div className="text-xl sm:text-2xl font-bold">25+</div>
                  <div className="text-gray-300 text-xs sm:text-sm">Mitra</div>
                </div>
              </div>
              <a href="#visi" className="inline-flex items-center gap-2 text-primary-light hover:text-blue-300 font-medium text-sm sm:text-base">
                Pelajari Lebih Lanjut <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Visi Misi */}
      <section id="visi" className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Visi & Misi <span className="text-primary">{settings?.namaSingkat || 'Pondok'}</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl p-5 sm:p-8 text-white">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Star className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Visi</h3>
              <div
                className="text-blue-100 leading-relaxed text-sm sm:text-base prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: settings?.visi || 'Menjadi penghasil SDM IT No. 1 di Indonesia Timur yang terdidik menjadi Generasi IT Rabbani dengan semata-mata mengharap ridho Allah Subhanahu Wa Ta\'ala.'
                }}
              />
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl sm:rounded-2xl p-5 sm:p-8 text-white">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Award className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Misi</h3>
              <div
                className="text-amber-100 leading-relaxed text-sm sm:text-base prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: settings?.misi || 'Membina pribadi dengan karakteristik PRIDE (Productive, Rabbani, Intellectual, Discipline, Ethical). Menyejahterakan anggota, umat, dan bangsa. Mengembangkan komunitas IT yang islami.'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tulisan Santri Section */}
      <section id="tulisan" className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Tulisan Santri <span className="text-primary">{settings?.namaSingkat || 'Pondok'}</span></h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Kumpulan tulisan, artikel, dan karya tulis santri {settings?.namaSingkat || 'Pondok'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {tulisan.map((item) => (
              <article key={item.id} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group border border-gray-100">
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <PenTool className="w-10 h-10 sm:w-12 sm:h-12 text-white/50" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                    <span className="bg-primary text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full capitalize">{item.kategori?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{item.excerpt}</p>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                    <Link to={`/penulis/${item.id_santri}`} className="hover:text-primary transition-colors truncate max-w-[45%]">{item.nama_lengkap_santri}</Link>
                    <span className="text-[10px] sm:text-sm">{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <Link to={`/tulisan/${item.slug}`} className="inline-flex items-center gap-1 mt-2 sm:mt-3 text-xs sm:text-sm text-primary hover:text-primary-dark font-medium">
                    Baca Selengkapnya <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link to="/tulisan" className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-900 text-gray-900 rounded-xl font-semibold hover:bg-gray-900 hover:text-white transition-colors text-sm sm:text-base">
              Lihat Semua Tulisan
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Siap Bergabung dengan {settings?.namaSingkat || 'Pondok'}?</h2>
          <p className="text-base sm:text-xl text-green-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Daftarkan diri Anda sekarang dan mulai perjalanan menjadi Generasi IT Rabbani
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link to="/ppdb" className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-green-600 rounded-xl font-bold text-base sm:text-lg hover:bg-green-50 transition-colors shadow-lg">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              Daftar PPDB Sekarang
            </Link>
            <a href={`https://wa.me/${(settings?.telepon || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold text-base sm:text-lg hover:bg-white/30 transition-colors">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <img src={settings?.logo || '/logo.png'} alt="Pondok Informatika Sekolah IT Modern Indonesia Timur" className="h-10 sm:h-12 w-auto" />
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-lg">{settings?.namaSingkat || 'Pondok Informatika'}</h3>
                  <p className="text-xs sm:text-sm text-gray-400">{settings?.tagline || 'Mencetak Generasi IT Rabbani'}</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 text-xs sm:text-sm max-w-md">
                Lembaga pendidikan yang mengintegrasikan teknologi informasi (IT) dan pendidikan agama (Pesantren).
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Link Cepat</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#beranda" className="hover:text-white transition-colors">Beranda</a></li>
                <li><a href="#tentang" className="hover:text-white transition-colors">Tentang</a></li>
                <li><a href="#program" className="hover:text-white transition-colors">Program</a></li>
                <li><Link to="/ppdb" className="hover:text-white transition-colors">PPDB Online</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Kontak</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li className="flex items-start gap-2 sm:gap-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400">{settings?.alamat || 'Indonesia Timur'}</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <a href={`https://wa.me/${(settings?.telepon || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white text-gray-400">{settings?.telepon || '-'}</a>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <a href={`mailto:${settings?.email}`} className="hover:text-white text-gray-400 truncate">{settings?.email || '-'}</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-500 text-xs sm:text-sm">
            <p>&copy; {new Date().getFullYear()} {settings?.namaPesantren || 'Pondok Informatika'}. All rights reserved.</p>
            <p className="mt-1 sm:mt-2">Powered by <span className="text-primary-light">PISANTRI</span></p>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}
