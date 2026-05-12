import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Bot, 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Database, 
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  PieChart,
  Settings,
  Globe,
  Monitor,
  Cpu,
  Lock,
  EyeOff,
  Link2,
  BookOpen,
  GraduationCap,
  Hammer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

const slides = [
  {
    id: 1,
    type: 'vision',
    title: 'Transformasi Beradab di Era Digital',
    subtitle: 'Membawa Pesantren ke Masa Depan Tanpa Kehilangan Nilai Luhur.',
    visual: <img src="/images/presentasi/santri-tablet.png" alt="Digital Pesantren Vision" className="w-full h-full object-cover rounded-[2rem]" />,
    points: ['Modernisasi Syari', 'Efisiensi Tanpa Batas', 'Teknologi yang Mengasuh']
  },
  {
    id: 2,
    type: 'problems',
    title: 'Kesenjangan Manajemen Digital',
    subtitle: 'Mengapa laporan manual dan aplikasi statis mulai menghambat pondok?',
    items: [
      { icon: MessageSquare, title: 'Kelelahan Komunikasi', desc: 'Ribuan pertanyaan berulang dari wali santri yang menyita waktu produktif pengasuh.' },
      { icon: Database, title: 'Data yang Terkunci', desc: 'Informasi tersimpan di database namun sulit diakses dengan cepat oleh pimpinan.' },
      { icon: TrendingUp, title: 'Analisis Manual', desc: 'Sangat sulit melihat track record santri secara instan untuk kebutuhan pembinaan.' }
    ],
    visual: <img src="/images/presentasi/ustadz-tired.png" alt="Management Gaps" className="w-full h-full object-cover rounded-[2rem]" />,
  },
  {
    id: 3,
    type: 'reveal',
    title: 'Solusi Cerdas: Aiman PI',
    subtitle: 'AI Manager system untuk digitalisasi pesantren - Partner Digital 24/7.',
    description: 'Bukan sekadar robot, Aiman adalah asisten digital dengan persona Islami yang didesain untuk memudahkan setiap interaksi data di pondok.',
    visual: <img src="/images/presentasi/aiman-spirit-hero.png" alt="Aiman Reveal" className="w-full h-full object-cover rounded-[2rem]" />,
  },
  {
    id: 4,
    type: 'origin',
    title: 'Kebanggaan Santri Untuk Negeri',
    subtitle: 'Dikembangkan Langsung oleh Santri Pondok Informatika.',
    description: 'Aiman adalah buah karya tulus dari para santri programmer. Kami membangunnya dengan pemahaman mendalam tentang kebutuhan riil di dalam pondok.',
    items: [
      { icon: Hammer, title: 'Hand-Crafted by Santri', desc: 'Setiap baris kode ditulis dengan semangat pengabdian santri untuk kemajuan umat.' },
      { icon: Users, title: 'Built with Love', desc: 'Memahami adab dan budaya pesantren karena dibuat oleh mereka yang tinggal di dalamnya.' }
    ],
    visual: <img src="/images/presentasi/aiman-spirit-origin.png" alt="Aiman Origin" className="w-full h-full object-cover rounded-[2rem]" />,
  },
  {
    id: 5,
    type: 'learning',
    title: 'Asisten yang Masih Terus Belajar',
    subtitle: 'Aiman adalah "Santri Baru" di jajaran pengurus digital Anda.',
    description: 'Aiman masih berada di tahap pemula dalam mengelola pondok. Ia tidak kaku, ia fleksibel, dan ia selalu terbuka untuk bimbingan agar semakin relate dengan kebutuhan harian.',
    points: ['Persona Tidak Kaku', 'Ramah & Sopan', 'Terus Berkembang'],
    visual: <img src="/images/presentasi/aiman-spirit-learning.png" alt="Aiman Learning" className="w-full h-full object-cover rounded-[2rem]" />,
  },
  {
    id: 6,
    type: 'training',
    title: 'Mentoring AI: Sinergi Santri & Teknologi',
    subtitle: 'Proses Training Berkelanjutan untuk Hasil yang Maksimal.',
    description: 'Menggunakan teknologi LLM & RAG terbaru, Aiman terus dibimbing oleh santri mentor melalui feedback harian dan uji coba skema chatbot yang mendalam.',
    items: [
      { icon: Cpu, title: 'LLM & RAG Refinement', desc: 'Penyempurnaan model bahasa dengan data valid pesantren agar jawaban selalu akurat.' },
      { icon: MessageSquare, title: 'Continuous Feedback', desc: 'Menerima masukan langsung dari pengguna untuk melatih "rasa" dan adab interaksi.' }
    ],
    visual: <img src="/images/presentasi/aiman-spirit-learning.png" alt="Aiman Mentoring" className="w-full h-full object-cover rounded-[2rem]" />,
  },
  {
    id: 7,
    type: 'capabilities',
    title: 'Apa yang Aiman Bisa Lakukan?',
    subtitle: 'Kemampuan yang membantu setiap lini manajemen pesantren.',
    can: [
      'Menampilkan Progres Tahfidz Real-Time',
      'Mengecek Saldo & Riwayat Keuangan Santri',
      'Input Presensi via Natural Language Chat',
      'Laporan Absensi Historis 12 Bulan',
      'Dashboard Pencapaian Skill & Portofolio',
      'Informasi Agenda & SOP Kepengasuhan'
    ],
    visual: <img src="/images/presentasi/aiman-spirit-capabilities.png" alt="Aiman Capabilities" className="w-full h-full object-cover rounded-[2rem]" />,
  },
  {
    id: 8,
    type: 'guardrails',
    title: 'Keamanan & Batasan Etika',
    subtitle: 'Memberikan rasa aman bagi Institusi dan Data Pesantren.',
    items: [
      { icon: Lock, title: 'Privasi Terjamin', desc: 'Aiman tidak bisa mengakses data privat santri lain di luar izin resmi.' },
      { icon: EyeOff, title: 'Sistem Terkunci', desc: 'Dilarang melakukan modifikasi tabel sistem (vulnerability protection).' },
      { icon: Shield, title: 'Asisten Bukan Pemutus', desc: 'Kebijakan utama tetap di tangan Ustadz; Aiman hanya pemberi saran data.' }
    ],
    visual: <img src="/images/presentasi/aiman-spirit-safety.png" alt="Aiman Guardrails" className="w-full h-full object-cover rounded-[2rem]" />,
  },
  {
    id: 9,
    type: 'cta',
    title: 'Mulai Langkah Digital Anda',
    subtitle: 'Jadilah pesantren model dengan bantuan mitra digital terbaik.',
    description: 'PISANTRI + Aiman bukan hanya aplikasi, tapi mitra strategis untuk mencetak generasi santri masa depan yang kompeten.',
    buttonText: 'Konsultasi Sekarang',
    visual: <img src="/images/presentasi/aiman-spirit-hero.png" alt="Aiman Spirit Digital Vision" className="w-full h-full object-cover rounded-[2rem]" />,
  }
];

const AimanPitchPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true
    });
  }, []);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      <Helmet>
        <title>Paparan Solusi AI Pesantren | PISANTRI</title>
        <meta name="description" content="Pemaparan solusi kecerdasan buatan untuk digitalisasi pesantren modern dengan Aiman PI." />
      </Helmet>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .spirit-glow {
          box-shadow: 0 20px 50px -10px rgba(59, 130, 246, 0.2);
        }
        .neo-card {
          background: #ffffff;
          border-radius: 2.5rem;
          box-shadow: 20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff;
          border: 1px solid rgba(255,255,255,0.8);
        }
        .inner-shadow {
          box-shadow: inset 2px 2px 5px rgba(0,0,0,0.05);
        }
        .ornament-dots span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
      ` }} />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-black tracking-tighter text-base md:text-xl uppercase">PISANTRI <span className="text-blue-600">SOLUTION</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-2 w-20 md:w-32 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold text-slate-600">{currentSlide + 1} / {slides.length}</span>
        </div>
      </nav>

      {/* Main Slide Content */}
      <main className="pt-24 pb-48 md:pb-32 px-4 md:px-8 flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-[#f8f9fc]">
        
        {/* Infographic Style Background Ornaments - Desktop Only */}
        <div className="hidden lg:flex absolute top-10 left-10 ornament-dots gap-2">
            <span className="bg-red-400"></span>
            <span className="bg-yellow-400"></span>
            <span className="bg-green-400"></span>
        </div>
        
        <div className="hidden lg:flex absolute top-10 right-10 w-20 h-20 rounded-full neo-card items-center justify-center font-black text-2xl text-slate-800 border-4 border-slate-50">
            {currentSlide + 1}
        </div>

        <div className="max-w-7xl w-full neo-card p-5 md:p-12 lg:p-16 relative overflow-hidden">
            {/* Background Circle Accessory */}
            <div className="absolute -top-24 -right-24 w-64 h-64 border-[30px] border-slate-50 rounded-full -z-0 opacity-50 lg:opacity-100"></div>

            <div className="grid lg:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-center relative z-10">
          
          {/* Text Content */}
          <div data-aos="fade-right" key={currentSlide} className="z-10 order-2 lg:order-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">Langkah {currentSlide + 1}</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 leading-[1.1] tracking-tight text-slate-900 drop-shadow-sm">
              {slide.title}
            </h1>
            
            <p className="text-sm md:text-lg lg:text-xl text-slate-500 font-semibold mb-6 md:mb-10 leading-relaxed max-w-xl">
              {slide.subtitle}
            </p>

            {slide.description && (
                <div className="relative mb-8">
                    <div className="absolute -top-6 -left-8 text-blue-500/10 select-none">
                        <MessageSquare className="w-16 h-16 fill-current" />
                    </div>
                    <p className="text-sm md:text-lg text-slate-600 font-bold leading-relaxed border-l-4 border-blue-600 pl-8 relative z-10 italic">
                        {slide.description}
                    </p>
                </div>
            )}

            {(slide.type === 'vision' || slide.type === 'learning') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {slide.points?.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 font-black text-slate-700 text-sm md:text-base p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Target className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            )}

            {(slide.type === 'problems' || slide.type === 'origin' || slide.type === 'training' || slide.type === 'guardrails') && (
              <div className="space-y-4 md:space-y-5">
                {slide.items?.map((item, i) => (
                  <div key={i} className="flex gap-5 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex-shrink-0 mt-1">
                        <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-red-400' : i === 1 ? 'bg-blue-400' : 'bg-yellow-400'}`}></div>
                    </div>
                    <div>
                      <h3 className="font-black text-lg md:text-xl mb-1 text-slate-800">
                        {item.title} <span className="text-blue-500 opacity-0 group-hover:opacity-100">.</span>
                      </h3>
                      <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {slide.type === 'capabilities' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {slide.can?.map((f, i) => (
                  <div key={i} className="flex flex-col gap-2 p-5 bg-white border-l-4 border-blue-500 rounded-2xl shadow-sm hover:translate-x-1 transition-all group">
                    <div className="flex justify-between items-center">
                        <span className="font-black text-[10px] text-blue-500 uppercase tracking-widest">{f.split(' ')[0]}</span>
                        <div className="w-2 h-2 rounded-full bg-slate-100 group-hover:bg-blue-400"></div>
                    </div>
                    <span className="font-bold text-xs md:text-sm text-slate-800">{f}</span>
                  </div>
                ))}
              </div>
            )}

            {slide.type === 'cta' && (
              <div className="space-y-6 md:space-y-8">
                <a 
                  href="https://wa.me/6285191555884" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-4 md:px-10 md:py-6 bg-blue-600 text-white rounded-2xl md:rounded-[2rem] font-black text-lg md:text-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/40 group"
                >
                  {slide.buttonText}
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            )}
          </div>

          {/* Visual Content */}
          <div className="relative order-1 lg:order-2 mb-8 lg:mb-0" data-aos="zoom-in" data-aos-delay="300">
            <div className="w-full aspect-[4/3] md:aspect-video lg:aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white shadow-2xl flex items-center justify-center p-3 md:p-4 border-4 md:border-8 border-slate-50 animate-float spirit-glow">
                <div className="w-full h-full rounded-[1.8rem] md:rounded-[2.5rem] overflow-hidden relative group">
                    {slide.visual}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none group-hover:from-blue-600/20 transition-all duration-700"></div>
                </div>
            </div>
            
            {/* Decorative Spirit-like Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 md:w-48 md:h-48 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 md:w-64 md:h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

        </div>
      </div>
    </main>

      <div className="fixed bottom-8 md:bottom-12 left-0 right-0 z-50 flex justify-center items-center gap-3 md:gap-4">
        <button 
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="p-3 md:p-5 bg-white border border-slate-200 rounded-2xl md:rounded-3xl shadow-xl hover:bg-slate-50 active:scale-95 transition-all text-slate-600 disabled:opacity-30 disabled:pointer-events-none group"
        >
          <ChevronLeft className="w-5 h-5 md:w-8 md:h-8 group-hover:-translate-x-1 transition-transform" />
        </button>
        
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-full px-4 md:px-8 py-3 md:py-6 shadow-2xl flex gap-1.5 md:gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1 md:h-2 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-6 md:w-12 bg-blue-600' : 'w-1 md:w-2 bg-slate-200 hover:bg-slate-400'}`}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="p-3 md:p-5 bg-blue-600 text-white rounded-2xl md:rounded-3xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none group"
        >
          <ChevronRight className="w-5 h-5 md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Footer Links */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-6 md:gap-8 text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
        <Link to="/digitalisasi-pesantren" className="hover:text-blue-600 transition-colors">Digitalisasi</Link>
        <Link to="/kisah-aiman" className="hover:text-blue-600 transition-colors">Cerita Kami</Link>
        <Link to="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
      </div>
    </div>
  );
};

export default AimanPitchPage;
