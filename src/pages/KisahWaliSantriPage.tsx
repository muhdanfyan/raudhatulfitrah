import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  ChevronLeft, ChevronRight, Phone, ArrowRight, X, Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  quote?: string;
  quoteAuthor?: string;
  content?: React.ReactNode;
  image: string;
  overlayColor?: string;
  textPosition?: 'bottom-left' | 'bottom-right' | 'center' | 'top-left';
  stats?: { value: string; label: string }[];
}

export default function KisahWaliSantriPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const images = {
    happy: '/images/presentasi/wali-happy.png',
    worried: '/images/presentasi/wali-worried.png',
    relieved: '/images/presentasi/wali-relieved.png',
  };

  const slides: Slide[] = [
    {
      id: 1,
      title: 'Kisah Ibu Aisyah',
      subtitle: 'Wali Santri yang Akhirnya Tenang',
      image: images.happy,
      overlayColor: 'from-rose-900/80 via-slate-900/60 to-transparent',
      textPosition: 'bottom-left',
    },
    {
      id: 2,
      title: 'Dulu Saya Selalu Cemas',
      quote: 'Anak saya sudah makan belum ya? Hafalannya sampai mana? Uang sakunya masih ada? Saya harus terus menelepon ustadz...',
      quoteAuthor: 'Ibu Aisyah, saat awal Fauzan masuk pondok',
      image: images.worried,
      overlayColor: 'from-slate-900/85 via-slate-900/75 to-slate-900/40',
      textPosition: 'bottom-left',
    },
    {
      id: 3,
      title: 'Telepon Tak Pernah Diangkat',
      quote: 'Kadang ustadz sibuk, telepon tidak diangkat. Saya jadi semakin khawatir. Tidak bisa fokus bekerja.',
      quoteAuthor: 'Ibu Aisyah',
      image: images.worried,
      overlayColor: 'from-rose-900/80 via-slate-900/70 to-transparent',
      textPosition: 'bottom-left',
    },
    {
      id: 4,
      title: 'Lalu Pondok Pakai PISANTRI',
      subtitle: 'Segalanya Berubah',
      quote: 'Ustadz bilang, Bunda sekarang bisa pantau perkembangan Fauzan langsung dari HP. Ada portal khusus wali santri.',
      quoteAuthor: 'Ustadz Ahmad',
      image: images.relieved,
      overlayColor: 'from-emerald-900/80 via-slate-900/60 to-transparent',
      textPosition: 'bottom-left',
    },
    {
      id: 5,
      title: 'Hafalan Anak Terpantau',
      subtitle: 'Real-time, Tanpa Bertanya',
      quote: 'Sekarang saya bisa lihat sendiri: Fauzan sudah hafal 15 juz, terakhir setoran kemarin, murojaah rutin setiap minggu.',
      quoteAuthor: 'Ibu Aisyah',
      image: images.happy,
      overlayColor: 'from-emerald-900/80 via-slate-900/70 to-transparent',
      textPosition: 'bottom-left',
      stats: [
        { value: '15', label: 'Juz Hafalan' },
        { value: '24/7', label: 'Akses' },
      ],
    },
    {
      id: 6,
      title: 'Uang Saku Transparan',
      subtitle: 'Tahu Setiap Transaksi',
      quote: 'Dulu tidak tahu uang anak dipakai untuk apa. Sekarang ada riwayat lengkap: beli apa, kapan, berapa.',
      quoteAuthor: 'Ibu Aisyah',
      image: images.relieved,
      overlayColor: 'from-amber-900/80 via-slate-900/70 to-transparent',
      textPosition: 'bottom-left',
    },
    {
      id: 7,
      title: 'Presensi & Kedisiplinan',
      subtitle: 'Semua Terlihat',
      quote: 'Sholat jamaah, presensi kelas, poin kedisiplinan... semua bisa saya pantau. Tidak ada yang tersembunyi.',
      quoteAuthor: 'Ibu Aisyah',
      image: images.happy,
      overlayColor: 'from-blue-900/80 via-slate-900/70 to-transparent',
      textPosition: 'bottom-left',
    },
    {
      id: 8,
      title: 'Notifikasi Langsung ke HP',
      subtitle: 'Tidak Perlu Menunggu Laporan',
      quote: 'Kalau Fauzan izin, sakit, atau ada hal penting, saya langsung dapat notifikasi. Tidak perlu menunggu kabar.',
      quoteAuthor: 'Ibu Aisyah',
      image: images.relieved,
      overlayColor: 'from-cyan-900/80 via-slate-900/70 to-transparent',
      textPosition: 'bottom-left',
    },
    {
      id: 9,
      title: 'Akhirnya Bisa Tidur Tenang',
      quote: 'Alhamdulillah... sekarang saya bisa tidur nyenyak tanpa khawatir. Perkembangan anak bisa dipantau kapan saja.',
      quoteAuthor: 'Ibu Aisyah, tersenyum lega',
      image: images.happy,
      overlayColor: 'from-purple-900/80 via-slate-900/70 to-transparent',
      textPosition: 'bottom-left',
    },
    {
      id: 10,
      title: 'Portal Wali Santri',
      subtitle: 'Semua dalam Genggaman',
      image: images.happy,
      overlayColor: 'from-blue-900/85 via-indigo-900/80 to-purple-900/70',
      textPosition: 'center',
      stats: [
        { value: '24/7', label: 'Akses' },
        { value: '100%', label: 'Transparan' },
        { value: '0', label: 'Telepon Cemas' },
      ],
    },
    {
      id: 11,
      title: '💝 Inovasi untuk Ketenangan Ibu',
      subtitle: 'Tidak Ada di Pondok Manapun',
      quote: 'Jam 2 pagi saya terbangun, khawatir tentang anak. Saya buka HP, chat dengan Aiman - AI asisten pondok. Langsung dapat info hafalan, kesehatan, saldo anak. MasyaAllah... pondok mana yang punya ini?',
      quoteAuthor: 'Ibu Aisyah, sangat terkesan',
      image: '/images/presentasi/aiman-wali.png',
      overlayColor: 'from-violet-900/90 via-rose-900/85 to-pink-900/80',
      textPosition: 'bottom-left',
      stats: [
        { value: 'EKSKLUSIF', label: 'Pesantren Ini' },
        { value: 'Jam 2 Pagi', label: 'pun Siap' },
        { value: 'Sopan', label: '& Ramah' },
      ],
      content: (
        <div className="space-y-4 mt-6">
          <div className="bg-gradient-to-r from-rose-500/20 to-pink-500/20 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-rose-400/50 max-w-2xl">
            <div className="flex items-start gap-4">
              <Bot className="w-10 h-10 text-rose-300 flex-shrink-0 animate-pulse" />
              <div>
                <h3 className="text-rose-200 font-black text-xl mb-2 uppercase tracking-wide">
                  AIMAN - Digital Assistant 🤖
                </h3>
                <p className="text-white text-sm leading-relaxed">
                  Seperti memiliki asisten pribadi yang sigap! Aiman muncul dengan display lengkap: foto anak tersenyum, grafik hafalan, status kesehatan, saldo jajan - semua ter-display real-time. Hati ibu pun tenang!
                </p>
              </div>
            </div>
          </div>
          <p className="text-rose-200 text-sm font-bold px-2">
            💝 Keajaiban teknologi Islami untuk ketenangan orang tua
          </p>
        </div>
      ),
    },
    {
      id: 12,
      title: 'Tenang Karena Tahu',
      subtitle: 'Itulah Nilai PISANTRI untuk Wali',
      image: images.relieved,
      overlayColor: 'from-blue-900/85 via-slate-900/80 to-slate-900/70',
      textPosition: 'center',
      content: (
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <a 
            href="https://demopisantri.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-blue-50 transition-all text-lg"
          >
            Coba Demo
            <ArrowRight className="w-5 h-5" />
          </a>
          <a 
            href="https://wa.me/6285191555884" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition-all text-lg"
          >
            <Phone className="w-5 h-5" />
            WhatsApp
          </a>
        </div>
      ),
    },
    {
      id: 13,
      title: 'بَارَكَ اللهُ فِيْكُمْ',
      subtitle: 'Terima Kasih',
      image: images.happy,
      overlayColor: 'from-slate-900/90 via-slate-900/85 to-slate-900/70',
      textPosition: 'center',
      content: (
        <div className="text-center mt-8">
          <p className="text-white/60 italic mb-6">"Ketenangan orang tua adalah bagian dari kebahagiaan anak..."</p>
          <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">
            PISANTRI
          </p>
          <p className="text-white/40 text-sm mt-2">www.pondokinformatika.id</p>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  const slide = slides[currentSlide];
  const isCenter = slide.textPosition === 'center';

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Helmet>
        <title>Kisah Ibu Aisyah - Wali Santri | PISANTRI</title>
      </Helmet>

      <div className="relative min-h-screen">
        {/* Background Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Full Image Container - Responsive Layout */}
        <div className="absolute inset-0 flex items-center justify-center md:justify-end">
          {/* Image with full visibility */}
          <div className="relative w-full h-full md:w-[65%] lg:w-[60%] flex items-end justify-center md:items-center md:justify-end">
            <img 
              src={slide.image} 
              alt=""
              className="max-h-[85vh] md:max-h-[95vh] w-auto max-w-full object-contain object-bottom md:object-center transition-all duration-700 drop-shadow-2xl"
            />
          </div>
        </div>
        
        {/* Gradient Overlays for Aesthetic Negative Space */}
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayColor?.replace('to-t', 'to-r') || 'from-slate-900/95 via-slate-900/70 to-transparent'}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-black/90 md:via-black/50 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
        
        {/* Decorative Gradient Orbs - Rose theme */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10 z-50">
          <div 
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-40 p-4 md:p-6 flex justify-between items-center">
          <Link 
            to="/digitalisasi-pesantren" 
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </Link>
          <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
            <span className="text-sm text-white/90 font-medium">{currentSlide + 1}/{slides.length}</span>
          </div>
        </header>

        {/* Content */}
        <div className={`absolute inset-0 flex ${isCenter ? 'items-center justify-center' : 'items-end'} z-20`}>
          <div className={`${isCenter ? 'text-center px-6' : 'p-6 md:p-12 lg:p-16'} max-w-4xl`}>
            
            {slide.subtitle && (
              <p 
                className="text-rose-300 text-sm md:text-base uppercase tracking-[0.3em] mb-4 font-light"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
              >
                {slide.subtitle}
              </p>
            )}

            <h1 
              className={`font-black leading-[0.9] tracking-tight mb-6 ${
                isCenter ? 'text-4xl md:text-6xl lg:text-7xl' : 'text-4xl md:text-6xl lg:text-8xl'
              }`}
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.6), 0 2px 15px rgba(0,0,0,0.4)' }}
            >
              {slide.title}
            </h1>

            {slide.quote && (
              <div className="mb-6">
                <p 
                  className="text-lg md:text-2xl text-white italic leading-relaxed max-w-2xl"
                  style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
                >
                  "{slide.quote}"
                </p>
                {slide.quoteAuthor && (
                  <p className="text-rose-300/80 mt-3 text-sm" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
                    — {slide.quoteAuthor}
                  </p>
                )}
              </div>
            )}

            {slide.stats && (
              <div className={`flex ${isCenter ? 'justify-center' : 'justify-start'} gap-8 md:gap-12 mt-8`}>
                {slide.stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div 
                      className="text-4xl md:text-6xl font-black text-white"
                      style={{ textShadow: '0 4px 25px rgba(0,0,0,0.6)' }}
                    >
                      {stat.value}
                    </div>
                    <div 
                      className="text-rose-300/80 text-xs md:text-sm uppercase tracking-wider mt-1"
                      style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {slide.content}
          </div>
        </div>

        {/* Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 z-40 p-4 md:p-6 flex justify-center items-center gap-4">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              currentSlide === 0 
                ? 'bg-white/5 text-white/20' 
                : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentSlide ? 'bg-rose-400 w-8' : 'bg-white/30 w-2 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              currentSlide === slides.length - 1 
                ? 'bg-white/5 text-white/20' 
                : 'bg-rose-500 text-white hover:bg-rose-400'
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </nav>
      </div>
    </div>
  );
}
