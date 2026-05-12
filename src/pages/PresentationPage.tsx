import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  ChevronLeft, ChevronRight, BookOpen, GraduationCap, Users, 
  QrCode, CreditCard, FileSpreadsheet, AlertTriangle,
  CheckCircle, TrendingDown, Timer, Users2, ShieldCheck, TrendingUp,
  Monitor, Zap, X, Maximize, Minimize, Wallet, LayoutDashboard,
  BarChart3, Map, Video, UserCheck, Heart, ScrollText, Shield,
  MessageSquare, DoorOpen, Package, Calendar, FileText, UserPlus,
  Briefcase, Megaphone, Contact, Bell, Clock, Eye, Target,
  Building2, ShoppingBag, Bot, Database, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStaticAsset } from '../utils/imageUtils';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const slides = [
    // 1. Title Slide
    {
      type: 'hero',
      content: (
        <div className="flex flex-col items-center justify-center text-center h-full max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-sm font-bold mb-8" data-aos="zoom-in">
            <Zap className="w-4 h-4" />
            Transformasi Digital Pesantren Modern
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-tight tracking-tight" data-aos="fade-up">
            Presentasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Digitalisasi</span> Pesantren
          </h1>
          <p className="text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl font-medium" data-aos="fade-up" data-aos-delay="200">
            Satu ekosistem terpadu untuk mengelola seluruh aspek pesantren: Akademik, Kepengasuhan, hingga Keuangan.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl" data-aos="fade-up" data-aos-delay="400">
            {[
              { label: '150+ Fitur', icon: Zap },
              { label: '7 Role Dashboard', icon: Monitor },
              { label: '99.9% Uptime', icon: TrendingUp },
              { label: '24/7 Akses', icon: ShieldCheck }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
                <item.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-sm font-black text-slate-800 uppercase tracking-tighter">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // 2. The Problems (Why Digital?)
    {
      type: 'content',
      title: 'Tantangan Riil Pesantren',
      content: (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          {[
            {
              role: 'Isu Nasional',
              problem: 'Bullying & kekerasan yang sering terlambat terdeteksi.',
              solution: 'Whistleblower System Digital.',
              icon: AlertTriangle, color: 'text-red-600'
            },
            {
              role: 'Akademik',
              problem: 'Kualitas pengajaran tidak standar & beban admin guru.',
              solution: 'LMS & Digital Classroom.',
              icon: BookOpen, color: 'text-orange-600'
            },
            {
              role: 'Wali Santri',
              problem: 'Kecemasan orang tua & minimnya transparansi info.',
              solution: 'Real-time Portal Wali 24/7.',
              icon: Users, color: 'text-purple-600'
            },
            {
              role: 'Kemandirian',
              problem: 'Resiko uang saku hilang & pola jajan tak terkontrol.',
              solution: 'Cashless Smart Card.',
              icon: Wallet, color: 'text-blue-600'
            },
            {
              role: 'Manajemen',
              problem: 'Kebocoran anggaran & data ganda antar divisi.',
              solution: 'Integrated Audit System.',
              icon: BarChart3, color: 'text-emerald-600'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between shadow-xl shadow-slate-200/50 hover:border-blue-200 transition-all duration-300" data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
                        <item.icon className={`w-7 h-7 ${item.color}`} />
                    </div>
                    <h4 className="font-black text-blue-600 mb-3 uppercase text-xs tracking-[0.2em]">{item.role}</h4>
                    <p className="text-slate-900 text-xl md:text-2xl font-black leading-tight tracking-tight">{item.problem}</p>
                </div>
                <div className="bg-blue-50 p-5 rounded-2xl flex items-center gap-3 border border-blue-100">
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <p className="text-sm md:text-base text-blue-900 font-bold">Solusi: {item.solution}</p>
                </div>
            </div>
          ))}
        </div>
      )
    },
    // 3. Efficiency Phase: Dana, Waktu, Tenaga
    {
        type: 'content',
        title: 'Efisiensi Operasional',
        content: (
            <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 w-full">
                {/* Efisiensi Dana */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 flex flex-col justify-between shadow-2xl shadow-slate-200/40" data-aos="fade-up" data-aos-delay="0">
                    <div>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                                <TrendingDown className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">Efisiensi<br/>Dana</h3>
                        </div>
                        <ul className="space-y-5">
                            <li className="flex justify-between items-center border-b border-slate-50 pb-4">
                                <span className="text-slate-600 text-lg font-bold">Cetak Rapor & Form</span>
                                <span className="text-emerald-600 font-black text-lg">Hemat 100%</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-slate-50 pb-4">
                                <span className="text-slate-600 text-lg font-bold">Buku Izin & Kartu</span>
                                <span className="text-emerald-600 font-black text-lg">Paperless</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-slate-50 pb-4">
                                <span className="text-slate-600 text-lg font-bold">WhatsApp Broadcast</span>
                                <span className="text-emerald-600 font-black text-lg">Gratis/Auto</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Efisiensi Waktu */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 flex flex-col justify-between shadow-2xl shadow-slate-200/40" data-aos="fade-up" data-aos-delay="100">
                    <div>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                                <Timer className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">Efisiensi<br/>Waktu</h3>
                        </div>
                        <ul className="space-y-5">
                            <li className="flex justify-between items-center border-b border-slate-50 pb-4">
                                <span className="text-slate-600 text-lg font-bold">Rekap Presensi</span>
                                <span className="text-blue-600 font-black text-lg">Otomatis</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-slate-50 pb-4">
                                <span className="text-slate-600 text-lg font-bold">Pencarian Data</span>
                                <span className="text-blue-600 font-black text-lg">Instan</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-slate-50 pb-4">
                                <span className="text-slate-600 text-lg font-bold">Update Hafalan</span>
                                <span className="text-blue-600 font-black text-lg">Real-time</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Efisiensi Tenaga */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 flex flex-col justify-between shadow-2xl shadow-slate-200/40" data-aos="fade-up" data-aos-delay="200">
                    <div>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
                                <Users2 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">Efisiensi<br/>Tenaga</h3>
                        </div>
                        <ul className="space-y-5">
                            <li className="flex justify-between items-center border-b border-slate-50 pb-4">
                                <span className="text-slate-600 text-lg font-bold">Beban Admin Staf</span>
                                <span className="text-purple-600 font-black text-lg">Turun 80%</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-slate-50 pb-4">
                                <span className="text-slate-600 text-lg font-bold">Antrian Wali</span>
                                <span className="text-purple-600 font-black text-lg">Terurai</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-slate-50 pb-4">
                                <span className="text-slate-600 text-lg font-bold">Fokus Pengasuh</span>
                                <span className="text-purple-600 font-black text-lg">Mendidik</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    // 4. Detailed Module: Akademik & Tahfidz (Big Text)
    {
        type: 'content',
        title: 'Ekosistem Akademik & Tahfidz',
        titleSize: 'text-xl md:text-2xl',
        content: (
            <div className="relative max-w-7xl mx-auto px-4 w-full h-[65vh] flex items-center justify-center">
                {/* Central Image - Compact */}
                <div className="relative z-10 w-48 h-48 md:w-60 md:h-60 rounded-full border-8 border-white p-1 bg-white shadow-2xl overflow-hidden" data-aos="zoom-in">
                    <img 
                        src={getStaticAsset('feature-tahfidz.png', 'features')} 
                        className="w-full h-full object-cover rounded-full" 
                        alt="Academic Core" 
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-600/20 to-transparent"></div>
                </div>

                {/* Features - Arranged Around (Tighter) */}
                <div className="absolute inset-0 grid grid-cols-2 gap-x-[22vw] md:gap-x-[26vw] items-center">
                    {/* Left Column */}
                    <div className="space-y-10 text-right pr-2">
                        {[
                            { title: 'LMS Center', desc: 'Belajar Terpadu.', icon: GraduationCap, color: 'text-blue-600' },
                            { title: 'Tahfidz Digital', desc: 'Progress Hafalan.', icon: BookOpen, color: 'text-indigo-600' },
                            { title: 'Presensi QR', desc: 'Absensi Cerdas.', icon: QrCode, color: 'text-cyan-600' },
                            { title: 'Rapor Digital', desc: 'Nilai Kumulatif.', icon: FileSpreadsheet, color: 'text-blue-800' }
                        ].map((f, i) => (
                            <div key={i} className="flex flex-row-reverse items-center gap-6 group" data-aos="fade-right" data-aos-delay={i * 100}>
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 shadow-sm transition-all duration-300">
                                    <f.icon className={`w-9 h-9 ${f.color} group-hover:text-white`} />
                                </div>
                                <div className="max-w-[220px]">
                                    <h5 className="text-slate-900 text-2xl md:text-3xl font-black leading-none mb-1">{f.title}</h5>
                                    <p className="text-slate-500 text-sm hidden md:block font-bold uppercase tracking-wider">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-10 text-left pl-2">
                        {[
                            { title: 'Roadmap Belajar', desc: 'Jalur Pendidikan.', icon: Map, color: 'text-emerald-600' },
                            { title: 'Live Class', desc: 'Kelas Online.', icon: Video, color: 'text-blue-500' },
                            { title: 'Mentor System', desc: 'Pendampingan.', icon: UserCheck, color: 'text-purple-600' },
                            { title: 'Target Pekan', desc: 'Evaluasi Terukur.', icon: Target, color: 'text-rose-600' }
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-6 group" data-aos="fade-left" data-aos-delay={i * 100}>
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 shadow-sm transition-all duration-300">
                                    <f.icon className={`w-9 h-9 ${f.color} group-hover:text-white`} />
                                </div>
                                <div className="max-w-[220px]">
                                    <h5 className="text-slate-900 text-2xl md:text-3xl font-black leading-none mb-1">{f.title}</h5>
                                    <p className="text-slate-500 text-sm hidden md:block font-bold uppercase tracking-wider">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    },
    // 5. Detailed Module: Pembinaan & Tata Tertib (Big Text)
    {
        type: 'content',
        title: 'Pembinaan & Tata Tertib',
        titleSize: 'text-xl md:text-2xl',
        content: (
            <div className="relative max-w-7xl mx-auto px-4 w-full h-[65vh] flex items-center justify-center">
                {/* Central Image - Compact */}
                <div className="relative z-10 w-48 h-48 md:w-60 md:h-60 rounded-full border-8 border-white p-1 bg-white shadow-2xl overflow-hidden" data-aos="zoom-in">
                    <img 
                        src={getStaticAsset('feature-presensi.png', 'features')} 
                        className="w-full h-full object-cover rounded-full" 
                        alt="Pembinaan Core" 
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-emerald-600/20 to-transparent"></div>
                    <div className="absolute -top-2 -left-2 bg-emerald-600 text-white p-4 rounded-2xl shadow-xl z-20">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                </div>

                {/* Features - Arranged Around (Tighter) */}
                <div className="absolute inset-0 grid grid-cols-2 gap-x-[22vw] md:gap-x-[26vw] items-center">
                    {/* Left Column */}
                    <div className="space-y-12 text-right pr-2">
                        {[
                            { title: 'Ibadah Harian', desc: 'Amal Yaumiyah.', icon: Heart, color: 'text-rose-600' },
                            { title: 'Tata Tertib', desc: 'Aturan & Sanksi.', icon: ScrollText, color: 'text-emerald-700' },
                            { title: 'Poin Kedisiplinan', desc: 'Otomatisasi Skor.', icon: Shield, color: 'text-blue-700' }
                        ].map((f, i) => (
                            <div key={i} className="flex flex-row-reverse items-center gap-6 group" data-aos="fade-right" data-aos-delay={i * 100}>
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 shadow-sm transition-all duration-300">
                                    <f.icon className={`w-10 h-10 ${f.color} group-hover:text-white`} />
                                </div>
                                <div className="max-w-[240px]">
                                    <h5 className="text-slate-900 text-2xl md:text-3xl font-black leading-none mb-1">{f.title}</h5>
                                    <p className="text-slate-500 text-sm hidden md:block font-bold uppercase tracking-wider">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-12 text-left pl-2">
                        {[
                            { title: 'Layanan Santri', desc: 'Wadah Aspirasi.', icon: MessageSquare, color: 'text-blue-600' },
                            { title: 'Smart Permission', desc: 'Izin Digital.', icon: DoorOpen, color: 'text-orange-600' },
                            { title: 'Monitoring Mentor', desc: 'Evaluasi Pembimbing.', icon: ShieldCheck, color: 'text-emerald-600' }
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-6 group" data-aos="fade-left" data-aos-delay={i * 100}>
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 shadow-sm transition-all duration-300">
                                    <f.icon className={`w-10 h-10 ${f.color} group-hover:text-white`} />
                                </div>
                                <div className="max-w-[240px]">
                                    <h5 className="text-slate-900 text-2xl md:text-3xl font-black leading-none mb-1">{f.title}</h5>
                                    <p className="text-slate-500 text-sm hidden md:block font-bold uppercase tracking-wider">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    },
    // 6. Manual vs Digital comparison (Refined)
    {
        type: 'content',
        title: 'Manual vs Digital',
        titleSize: 'text-xl md:text-2xl',
        content: (
            <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto px-4 w-full">
                <div className="space-y-6" data-aos="fade-right">
                    <h4 className="text-rose-600 text-2xl font-black flex items-center gap-3 mb-8">
                        <AlertTriangle className="w-8 h-8" />
                        Era Manual (Boros & Lambat)
                    </h4>
                    {[
                        'Pencatatan buku fisik rawan hilang/rusak.',
                        'Rekap presensi manual memakan waktu berjam-jam.',
                        'Orang tua minim transparansi info santri.',
                        'Administrasi keuangan rawan error & tidak update.'
                    ].map((txt, i) => (
                        <div key={i} className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100 text-slate-600 text-lg font-bold shadow-sm">
                            {txt}
                        </div>
                    ))}
                </div>
                <div className="space-y-6" data-aos="fade-left">
                     <h4 className="text-emerald-600 text-2xl font-black flex items-center gap-3 mb-8">
                        <CheckCircle className="w-8 h-8" />
                        Era Digital (Cepat & Akurat)
                    </h4>
                    {[
                        'Data tersimpan aman di Cloud & Backup otomatis.',
                        'Presensi QR: Rekap otomatis detik itu juga.',
                        'Portal Wali: Pantau anak kapanpun, dimanapun.',
                        'Audit Keuangan instan & Transparan.'
                    ].map((txt, i) => (
                        <div key={i} className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 text-slate-900 text-lg font-black shadow-md shadow-emerald-500/5">
                            {txt}
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    // 7. Keuangan & Koperasi (Big Text)
    {
        type: 'content',
        title: 'Ekosistem Keuangan & Koperasi',
        titleSize: 'text-xl md:text-2xl',
        content: (
            <div className="relative max-w-7xl mx-auto px-4 w-full h-[65vh] flex items-center justify-center">
                {/* Central Icon - Compact */}
                <div className="relative z-10 w-48 h-48 md:w-60 md:h-60 rounded-full border-8 border-white p-8 bg-white shadow-2xl flex items-center justify-center" data-aos="zoom-in">
                    <CreditCard className="w-24 h-24 text-yellow-500" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-yellow-500/10 to-transparent"></div>
                </div>

                {/* Features - Arranged Around (Tighter) */}
                <div className="absolute inset-0 grid grid-cols-2 gap-x-[22vw] md:gap-x-[26vw] items-center">
                    {/* Left Column */}
                    <div className="space-y-12 text-right pr-2">
                        {[
                            { title: 'Dompet Digital', desc: 'Saldo Jajan Cashless.', icon: Wallet, color: 'text-yellow-600' },
                            { title: 'POS Koperasi', desc: 'Sistem Kasir Terpadu.', icon: ShoppingBag, color: 'text-amber-600' },
                            { title: 'Crowdfunding', desc: 'Galang Dana Program.', icon: Heart, color: 'text-rose-500' }
                        ].map((f, i) => (
                            <div key={i} className="flex flex-row-reverse items-center gap-6 group" data-aos="fade-right" data-aos-delay={i * 100}>
                                <div className="w-16 h-16 rounded-2xl bg-yellow-50 border border-yellow-100 flex items-center justify-center group-hover:bg-yellow-500 shadow-sm transition-all duration-300">
                                    <f.icon className={`w-10 h-10 ${f.color} group-hover:text-white`} />
                                </div>
                                <div className="max-w-[240px]">
                                    <h5 className="text-slate-900 text-2xl md:text-3xl font-black leading-none mb-1">{f.title}</h5>
                                    <p className="text-slate-500 text-sm hidden md:block font-bold uppercase tracking-wider">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-12 text-left pl-2">
                        {[
                            { title: 'Keuangan Pondok', desc: 'Arus Kas Masuk/Keluar.', icon: Building2, color: 'text-blue-600' },
                            { title: 'Data Donatur', desc: 'Manajemen Pendonor.', icon: Users, color: 'text-slate-700' },
                            { title: 'Audit Keuangan', desc: 'Laporan Transparan.', icon: FileSpreadsheet, color: 'text-amber-700' }
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-6 group" data-aos="fade-left" data-aos-delay={i * 100}>
                                <div className="w-16 h-16 rounded-2xl bg-yellow-50 border border-yellow-100 flex items-center justify-center group-hover:bg-yellow-500 shadow-sm transition-all duration-300">
                                    <f.icon className={`w-10 h-10 ${f.color} group-hover:text-white`} />
                                </div>
                                <div className="max-w-[240px]">
                                    <h5 className="text-slate-900 text-2xl md:text-3xl font-black leading-none mb-1">{f.title}</h5>
                                    <p className="text-slate-500 text-sm hidden md:block font-bold uppercase tracking-wider">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    },
     // 8. Asrama & Lainnya (Premium Grid - Big Text)
     {
        type: 'content',
        title: 'Asrama & Fitur Pendukung',
        titleSize: 'text-xl md:text-2xl',
        content: (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto px-4">
                {[
                    { title: 'Inventaris Asrama', icon: Package, color: 'text-orange-600' },
                    { title: 'Kalender Piket', icon: Calendar, color: 'text-blue-600' },
                    { title: 'Daily Report', icon: FileText, color: 'text-emerald-600' },
                    { title: 'PPDB Online', icon: UserPlus, color: 'text-purple-600' },
                    { title: 'Portfolio Santri', icon: Briefcase, color: 'text-cyan-600' },
                    { title: 'Warta Pesantren', icon: Megaphone, color: 'text-amber-600' },
                    { title: 'ID Card Digital', icon: Contact, color: 'text-pink-600' },
                    { title: 'Notifikasi WA', icon: Bell, color: 'text-green-600' },
                    { title: 'Time Tracking', icon: Clock, color: 'text-blue-500' },
                    { title: 'Kanban Board', icon: LayoutDashboard, color: 'text-slate-600' },
                    { title: 'Review Karya', icon: Eye, color: 'text-indigo-600' },
                    { title: 'Data Analytics', icon: BarChart3, color: 'text-rose-600' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 group hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all text-center flex flex-col items-center justify-center min-h-[160px] shadow-sm shadow-slate-200/50" data-aos="zoom-in" data-aos-delay={idx * 30}>
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300 shadow-sm border border-slate-100 group-hover:border-blue-600">
                            <item.icon className={`w-10 h-10 ${item.color} group-hover:text-white transition-colors`} />
                        </div>
                        <h4 className="text-slate-900 font-black text-xl md:text-2xl leading-tight px-2">{item.title}</h4>
                    </div>
                ))}
            </div>
        )
    },
    // 9. Statistics & Capacity
    {
        type: 'content',
        title: 'Kapasitas & Performa',
        titleSize: 'text-xl md:text-2xl',
        content: (
            <div className="flex flex-col items-center justify-center max-w-7xl mx-auto px-4 text-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12 w-full">
                    {[
                        { val: '150+', label: 'Dashboard Module' },
                        { val: '7', label: 'Dashboard Role' },
                        { val: '99.9%', label: 'Uptime SLA' },
                        { val: '24/7', label: 'Cloud Access' }
                    ].map((s, i) => (
                        <div key={i} data-aos="fade-up" data-aos-delay={i * 100}>
                            <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-2">{s.val}</div>
                            <div className="text-slate-500 text-lg font-black uppercase tracking-widest">{s.label}</div>
                        </div>
                    ))}
                </div>
                <div className="bg-white border border-slate-100 p-12 rounded-[3rem] max-w-4xl shadow-2xl shadow-slate-200/50" data-aos="zoom-in">
                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-8 border border-blue-100 shadow-sm">
                        <Zap className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Scalable Infrastructure</h3>
                    <p className="text-slate-600 text-lg md:text-2xl leading-relaxed font-bold">
                        Arsitektur Cloud Hybrid memastikan PISANTRI tetap stabil melayani ribuan santri & wali santri secara simultan tanpa jeda.
                    </p>
                </div>
            </div>
        )
    },
    // 10. Technology Stack & Security
    {
        type: 'content',
        title: 'Teknologi & Keamanan',
        titleSize: 'text-xl md:text-2xl',
        content: (
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 max-w-7xl mx-auto px-4 items-center">
                 <div className="relative group" data-aos="fade-right">
                    <div className="absolute inset-0 bg-blue-500/5 blur-[80px] rounded-full scale-75 group-hover:scale-100 transition-transform"></div>
                    <div className="relative z-10 grid grid-cols-2 gap-4 md:gap-6 p-10 bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                        {[
                            { label: 'SSL ENCRYPTION', icon: Shield },
                            { label: 'AUTO BACKUP', icon: Clock },
                            { label: 'CLOUD SCALABLE', icon: Zap },
                            { label: 'RBAC SECURITY', icon: UserCheck }
                        ].map((t, i) => (
                            <div key={i} className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 p-6 rounded-[2rem] group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:shadow-blue-500/20">
                                <t.icon className="w-12 h-12 text-blue-600 mb-3 group-hover:text-white transition-colors" />
                                <span className="text-slate-600 text-xs md:text-sm font-black whitespace-nowrap group-hover:text-white transition-colors">{t.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-12" data-aos="fade-left">
                    <div className="flex gap-8 items-start">
                        <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-xl shadow-emerald-500/5">
                            <ShieldCheck className="w-12 h-12 text-emerald-600" />
                        </div>
                        <div>
                            <h4 className="text-slate-900 text-2xl md:text-4xl font-black mb-3 tracking-tight">Data Terenkripsi & Aman</h4>
                            <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-bold">Sistem PISANTRI diproteksi dengan enkripsi industri & Role-Based Access Control (RBAC) super ketat untuk privasi santri.</p>
                        </div>
                    </div>
                    <div className="flex gap-8 items-start">
                        <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 shadow-xl shadow-blue-500/5">
                            <TrendingUp className="w-12 h-12 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-slate-900 text-2xl md:text-4xl font-black mb-3 tracking-tight">High Availability Cloud</h4>
                            <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-bold">Arsitektur Hybrid-Cloud menjamin akses 24 jam nonstop. Cepat, stabil, dan siap melayani ribuan santri simultan.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    // 11. The Advantage: Created by Santri
    {
        type: 'content',
        title: 'Keunggulan: Karya Santri',
        titleSize: 'text-xl md:text-2xl',
        content: (
            <div className="grid md:grid-cols-2 gap-12 max-w-7xl mx-auto px-4 items-center">
                 <div className="relative group" data-aos="fade-right">
                    <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full scale-75"></div>
                    <div className="relative z-10 p-1 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-[3rem]">
                        <div className="bg-white rounded-[2.8rem] p-10 border border-slate-100 shadow-2xl">
                            <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-sm">
                                <Users2 className="w-12 h-12 text-emerald-600 animate-pulse" />
                            </div>
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 text-center leading-tight mb-4 tracking-tight">
                                Dibuat Oleh <br/><span className="text-emerald-600 text-2xl md:text-3xl lg:text-4xl">Santri Pondok Informatika</span>
                            </h3>
                            <div className="w-20 h-1.5 bg-emerald-500 mx-auto rounded-full mb-8"></div>
                            <p className="text-slate-600 text-center text-lg md:text-xl font-bold italic leading-relaxed">
                                "Terus belajar & mengembangkan aplikasi ini agar semakin sesuai dengan kebutuhan riil pesantren."
                            </p>
                        </div>
                    </div>
                </div>
                <div className="space-y-12" data-aos="fade-left">
                    <div className="flex gap-8 items-start">
                        <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 shadow-xl shadow-blue-500/5">
                            <Zap className="w-12 h-12 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-slate-900 text-2xl md:text-4xl font-black mb-3 tracking-tight">Continuous Update</h4>
                            <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-bold">
                                Terus dikembangkan karena menjadi tugas roadmap belajar santri. Fitur baru lahir setiap bulan!
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-8 items-start">
                        <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-xl shadow-emerald-500/5">
                            <TrendingUp className="w-12 h-12 text-emerald-600" />
                        </div>
                        <div>
                            <h4 className="text-slate-900 text-2xl md:text-4xl font-black mb-3 tracking-tight">Ekosistem Belajar</h4>
                            <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-bold">
                                Didukung oleh komunitas pengembang santri yang solid, menjamin sistem terus relevan dengan zaman.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    // 11.5 Solusi untuk Semua Kerumitan (Bridging)
    {
        type: 'hero',
        content: (
            <div className="flex flex-col items-center justify-center text-center h-full max-w-4xl mx-auto px-4">
                <div className="bg-orange-50 px-6 py-2 rounded-full border border-orange-100 text-orange-600 text-sm font-black mb-10 tracking-widest shadow-sm" data-aos="zoom-in">
                    SOLUSI UNTUK SEMUA KERUMITAN
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-tight" data-aos="fade-up">
                    "Banyak Fitur, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Satu Solusi</span>"
                </h2>
                <div className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 mb-12" data-aos="fade-up" data-aos-delay="200">
                    <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-bold">
                        "Wah, saking banyaknya, bagaimana saya bisa hafal semuanya? Bukannya malah makin pusing? Daripada pusing, bagaimana kalau kita serahkan semuanya saja kepada asisten pintar kita?"
                    </p>
                </div>
                <div className="flex flex-col items-center" data-aos="zoom-in" data-aos-delay="400">
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] mb-4">Kenalkan...</p>
                    <div className="text-5xl md:text-7xl font-black text-blue-600 tracking-tighter">AIMAN</div>
                </div>
            </div>
        )
    },
    // 12. AIMAN - REVOLUSI AI & KEMAMPUAN TAK TERDUGA
    {
        type: 'content',
        title: 'Revolusi AI Assistant (AIMAN)',
        titleSize: 'text-xl md:text-2xl',
        content: (
            <div className="max-w-7xl mx-auto px-4 w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div data-aos="fade-right">
                        <div className="bg-blue-50 border border-blue-100 p-8 rounded-[3rem] mb-8">
                            <h4 className="text-2xl font-black text-blue-900 mb-4 flex items-center gap-3">
                                <Bot className="w-8 h-8" />
                                Pendamping Cerdas 24/7
                            </h4>
                            <p className="text-slate-600 text-lg font-bold leading-relaxed mb-6">
                                AIMAN (Aimanudin PI) bukan sekadar chatbot. Ia adalah asisten pintar yang memahami konteks pesantren dengan bahasa yang sopan dan hangat.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { t: 'Respon Instan', i: Zap },
                                    { t: 'Konteks Role', i: ShieldCheck },
                                    { t: 'Voice Integrated', i: Monitor },
                                    { t: 'Automatisasi', i: Database }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-2xl border border-blue-50 flex items-center gap-3 shadow-sm">
                                        <item.i className="w-5 h-5 text-blue-600" />
                                        <span className="text-xs font-black text-slate-800 uppercase">{item.t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div data-aos="fade-left">
                        <h4 className="text-xl font-black text-indigo-600 mb-6 uppercase tracking-widest flex items-center gap-2">
                             <Sparkles className="w-6 h-6" /> Kemampuan Tak Terduga
                        </h4>
                        <div className="space-y-4">
                            {[
                                { t: 'Kontrol Belajar', d: 'Memantau roadmap & jalur pendidikan santri.', i: TrendingUp, c: 'bg-blue-500' },
                                { t: 'Remind & Motivate', d: 'Mengingatkan target & memberi motivasi hangat.', i: Bell, c: 'bg-orange-500' },
                                { t: 'Whistleblower Chat', d: 'Wadah aman lapor keluhan tanpa rasa takut.', i: Shield, c: 'bg-red-500' },
                                { t: 'Teman Curhat', d: 'Pendengar setia santri mengadu beban pikiran.', i: Heart, c: 'bg-rose-500' },
                                { t: 'Partner Diskusi', d: 'Rekan brainstorming bagi pengelola pondok.', i: MessageSquare, c: 'bg-indigo-500' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all">
                                    <div className={`w-12 h-12 rounded-xl ${item.c} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                        <item.i className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h5 className="font-black text-slate-900 leading-none mb-1">{item.t}</h5>
                                        <p className="text-slate-500 text-xs font-bold">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    // 13. AIMAN - The Comic Story (Hero's Journey)
    {
        type: 'content',
        title: 'Kisah Dibalik AIMAN (Karya Santri)',
        titleSize: 'text-xl md:text-2xl',
        content: (
            <div className="max-w-6xl mx-auto px-4 w-full font-sans overflow-y-auto max-h-[80vh] pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Panel 1: Epic Transformation */}
                    <div className="md:col-span-2 relative group border-8 border-slate-900 bg-white shadow-[15px_15px_0px_0px_rgba(15,23,42,1)]" data-aos="zoom-in">
                        <div className="absolute -top-6 -left-4 bg-yellow-400 border-4 border-slate-900 px-6 py-2 font-black text-xl uppercase italic skew-x-[-12deg] shadow-xl z-10">
                            THE TRANSFORMATION
                        </div>
                        <div className="aspect-[16/9] overflow-hidden">
                             <img src="/images/presentasi/aiman_comic_forge.png" alt="Aiman Creation" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-8 bg-slate-900 text-white border-t-8 border-slate-900">
                             <p className="text-xl md:text-2xl font-black italic mb-4">"Bukan sekadar asisten, ia adalah perpanjangan tangan santri untuk menjaga ustadz."</p>
                             <div className="flex gap-4">
                                <span className="bg-indigo-600 px-3 py-1 text-xs font-black uppercase">BUATAN SANTRI</span>
                                <span className="bg-indigo-600 px-3 py-1 text-xs font-black uppercase">GEMINI AI</span>
                             </div>
                        </div>
                    </div>

                    {/* Panel 2: The Mechanic Mindset */}
                    <div className="relative group border-4 border-slate-900 bg-cyan-50 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]" data-aos="zoom-in" data-aos-delay="200">
                        <div className="absolute -top-4 -right-2 bg-slate-900 border-2 border-white px-4 py-1 font-black text-xs text-white uppercase italic skew-x-[12deg] shadow-md z-10">
                            SANTRI MECHANICS
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mb-4 mt-2 tracking-tighter uppercase italic">BENGKEL ALGORITMA</h4>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed mb-6 italic">
                           "Aiman tidak lahir di pabrik Silicon Valley, ia lahir di asrama kami. Kami yang mengenalkannya pada adab, kami yang menyetel perasaannya."
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                             {[
                                { l: 'TUNING', c: 'bg-blue-400' },
                                { l: 'SHIELD', c: 'bg-red-400' },
                                { l: 'ADAB+', c: 'bg-green-400' }
                             ].map((m, i) => (
                                <div key={i} className="flex border-2 border-slate-900">
                                   <div className={`w-3 ${m.c}`}></div>
                                   <div className="flex-1 p-2 bg-white font-black text-xs uppercase tracking-widest">{m.l} PROCESS</div>
                                </div>
                             ))}
                        </div>
                    </div>
                    {/* Panel 3: The Vision */}
                    <div className="relative group border-4 border-slate-900 bg-slate-900 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] text-white" data-aos="zoom-in" data-aos-delay="500">
                        <div className="absolute -top-4 -left-2 bg-indigo-500 border-2 border-white px-4 py-1 font-black text-xs uppercase italic skew-x-[-12deg] shadow-md z-10">
                            Our Mission
                        </div>
                        <h4 className="text-xl font-black text-blue-400 mb-4 mt-2 italic uppercase">Mengajar & Belajar</h4>
                        <p className="text-sm font-medium mb-6 leading-relaxed">
                            "Kini Aiman berkeliling pesantren se-Indonesia. Mengajar efisiensi, sambil terus belajar tentang adab dan kasih sayang."
                        </p>
                        <div className="bg-white/10 p-4 border border-blue-500 rounded text-center">
                            <p className="text-xs font-black text-blue-300 mb-2">JOIN THE JOURNEY</p>
                            <p className="text-xs italic text-blue-100">"Mari buat Aiman lebih cerdas untuk masa depan kita bersama!"</p>
                        </div>
                    </div>

                </div>

                {/* Comic Strip Caption */}
                <div className="mt-12 text-center" data-aos="fade-up">
                    <p className="text-slate-400 font-bold italic tracking-widest text-xs uppercase">
                        — TO BE CONTINUED —
                    </p>
                </div>
            </div>
        )
    },
    // 12. Call to Action / Impact
    {
      type: 'hero',
      content: (
        <div className="flex flex-col items-center justify-center text-center h-full max-w-4xl mx-auto px-4">
           <div className="bg-blue-50 px-6 py-2 rounded-full border border-blue-100 text-blue-600 text-sm font-black mb-10 tracking-widest shadow-sm" data-aos="zoom-in">
             KESIMPULAN: TOTAL DIGITALISASI
           </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-tight" data-aos="fade-up">
            "Sempurnakan <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600">Pengelolaan</span> Anda"
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl leading-relaxed font-bold" data-aos="fade-up" data-aos-delay="200">
             Hilangkan keruwetan administrasi manual & fokus kembali pada visi utama pesantren: Mencetak santri berkualitas berakhlak mulia.
          </p>
          <div className="flex flex-wrap justify-center gap-6" data-aos="fade-up" data-aos-delay="400">
            <Link to="/digitalisasi-pesantren" className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/40 hover:-translate-y-1">
               Lihat Detail Demo
            </Link>
            <a href="https://wa.me/6285191555884" target="_blank" className="px-12 py-6 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] font-black text-lg hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/50 hover:-translate-y-1">
               Konsultasi Gratis
            </a>
          </div>
        </div>
      )
    },
    // 13. Final Closing
    {
        type: 'hero',
        content: (
          <div className="flex flex-col items-center justify-center text-center h-full max-w-4xl mx-auto px-4">
            <div className="relative mb-16" data-aos="zoom-out">
                <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full"></div>
                <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 bg-white rounded-[3rem] flex items-center justify-center shadow-2xl border border-slate-100 overflow-hidden px-10">
                    <img 
                        src="https://res.cloudinary.com/duntlhjil/image/upload/v1766114459/pisantri/settings/jy29duitnxhqbjw3bzwl.png" 
                        className="w-full h-full object-contain" 
                        alt="Pondok Informatika Logo" 
                    />
                </div>
            </div>
            <h3 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight" data-aos="fade-up">Terima Kasih</h3>
            <div className="w-24 h-1.5 bg-blue-600 rounded-full mx-auto mb-8" data-aos="fade-up" data-aos-delay="100"></div>
            <p className="text-slate-500 text-xl md:text-2xl font-black tracking-widest uppercase mb-12" data-aos="fade-up" data-aos-delay="200">PISANTRI - Digital Ecosystem</p>
            <div className="flex flex-col md:flex-row gap-8 text-sm font-black text-blue-600 bg-slate-50 px-10 py-4 rounded-full border border-slate-100 shadow-sm" data-aos="fade-up" data-aos-delay="400">
                <span className="tracking-[0.2em]">WWW.PONDOKINFORMATIKA.ID</span>
                <span className="hidden md:block opacity-20">|</span>
                <span className="tracking-[0.2em]">@PISANTRI.ID</span>
            </div>
          </div>
        )
    }
  ];

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden flex flex-col relative font-sans">
      <Helmet>
        <title>Presentasi Digitalisasi Pesantren | PISANTRI</title>
      </Helmet>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Header Controls */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 leading-none">PISANTRI</h3>
                <span className="text-xs text-blue-600 font-medium tracking-widest uppercase">Presentation</span>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                {currentSlide + 1} / {slides.length}
            </span>
            <button 
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600"
                title="Toggle Fullscreen (F)"
            >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <Link 
                to="/digitalisasi-pesantren"
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:border-red-100 group transition-colors"
                title="Tutup Presentasi"
            >
                <X className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
            </Link>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-50 blur-[150px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Slide Content */}
      <main className="flex-grow flex items-center justify-center relative z-10 pt-10 pb-12">
        <div className="w-full h-full flex flex-col justify-center">
            {currentSlideData.type === 'content' && (
                <div className="text-center mb-4 md:mb-6" data-aos="fade-down">
                    <h2 className={`font-black text-slate-900 tracking-tight uppercase ${currentSlideData.titleSize || 'text-2xl md:text-3xl lg:text-4xl'}`}>
                        {currentSlideData.title}
                    </h2>
                    <div className="w-16 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto mt-2 rounded-full shadow-sm"></div>
                </div>
            )}
            
            <div className="flex-grow flex items-center overflow-y-auto max-h-[70vh] no-scrollbar">
                {currentSlideData.content}
            </div>
        </div>
      </main>

      {/* Navigation Buttons */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center z-50">
        <div className="flex gap-4">
            <button 
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                    currentSlide === 0 ? 'bg-slate-50 text-slate-300' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 shadow-lg shadow-slate-200/50'
                }`}
            >
                <ChevronLeft className="w-10 h-10" />
            </button>
            <button 
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                    currentSlide === slides.length - 1 ? 'bg-slate-50 text-slate-300' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/30 active:scale-95'
                }`}
            >
                <ChevronRight className="w-10 h-10" />
            </button>
        </div>
        
        <div className="hidden md:flex flex-col items-end opacity-60">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Navigasi</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Panah Keyboard (← →) atau Tombol</p>
        </div>
      </div>
    </div>
  );
}
