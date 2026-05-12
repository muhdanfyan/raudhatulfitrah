import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  ChevronLeft, ChevronRight, Bot, AlertTriangle, Timer, Heart,
  Zap, CheckCircle, Users2, Target, Sparkles, GraduationCap,
  Users, Shield, TrendingUp, Database, MessageSquare
} from 'lucide-react';

const AimanPiPresentationPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Comic Styling Components
  const NarratorBox = ({ children, color = "bg-yellow-400" }) => (
    <div className={`relative px-6 py-2 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] ${color} transform -skew-x-12 inline-block mb-4`}>
       <p className="font-black text-slate-900 uppercase italic text-sm transform skew-x-12">{children}</p>
    </div>
  );

  const SpeechBubble = ({ children, from = "left" }) => (
    <div className={`relative bg-white border-4 border-slate-900 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] mb-6 ${from === 'left' ? 'rounded-tl-none ml-4' : 'rounded-tr-none mr-4'}`}>
      <p className="font-bold text-slate-800 text-sm md:text-base leading-relaxed tracking-tight">{children}</p>
      <div className={`absolute top-0 ${from === 'left' ? '-left-4' : '-right-4'} w-8 h-8 bg-white border-4 border-slate-900 transform rotate-45 -z-10`}></div>
    </div>
  );

  const slides = [
    // Slide 0: Cover - Epic Comic Splash
    {
      type: 'hero',
      content: (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-[#fdfdfd] border-[12px] border-slate-900 rounded-[2rem] shadow-[16px_16px_0px_0px_rgba(15,23,42,1)] max-w-5xl">
          <div className="relative mb-10">
             <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-20"></div>
             <div className="relative border-8 border-slate-900 p-8 bg-white shadow-[10px_10px_0px_0px_rgba(99,102,241,1)] rotate-[-3deg]">
                <Bot className="w-40 h-40 md:w-56 md:h-56 text-indigo-600" />
                <div className="absolute -top-6 -right-10 bg-red-600 text-white border-4 border-slate-900 px-6 py-2 font-black text-xl uppercase italic skew-x-[15deg] shadow-lg animate-pulse">
                   BUATAN SANTRI!
                </div>
             </div>
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter leading-none skew-x-[-10deg]">
             KISAH AIMAN
          </h1>
          <div className="bg-slate-900 text-white px-8 py-3 transform skew-x-[-10deg] mb-8">
             <p className="text-2xl md:text-4xl font-black tracking-widest uppercase italic">The First AI Hero</p>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-sm md:text-lg italic">
             — PESANTREN INTELLIGENCE —
          </p>
        </div>
      )
    },

    // Slide 1: Babak 1 - The Crisis
    {
      type: 'content',
      title: 'Babak 1: Kegelapan Pondok',
      content: (
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <NarratorBox color="bg-orange-400">Prolog</NarratorBox>
                <div className="border-8 border-slate-900 p-8 bg-white shadow-[12px_12px_0px_0px_rgba(244,63,94,1)] relative">
                   <p className="text-2xl md:text-3xl font-black italic text-slate-900 leading-tight">
                      "Di tengah hiruk pikuk pondok, masalah datang bertubi-tubi. Data tercecer, ustadz kelelahan, dan kabar santri sulit sampai ke rumah..."
                   </p>
                   <div className="mt-8 flex gap-4">
                      <div className="bg-slate-900 text-white px-3 py-1 font-black uppercase text-xs">Crisis!</div>
                      <div className="bg-slate-900 text-white px-3 py-1 font-black uppercase text-xs">Manual Era!</div>
                   </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="border-4 border-slate-900 bg-red-50 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rotate-[2deg]">
                    <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
                    <p className="font-black text-sm uppercase">Bullying tak terdeteksi</p>
                 </div>
                 <div className="border-4 border-slate-900 bg-orange-50 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rotate-[-3deg]">
                    <Timer className="w-12 h-12 text-orange-600 mb-4" />
                    <p className="font-black text-sm uppercase">Admin manual 24 jam</p>
                 </div>
                 <div className="border-4 border-slate-900 bg-purple-50 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] col-span-2 flex items-center gap-4">
                    <Heart className="w-12 h-12 text-purple-600 shrink-0" />
                    <p className="font-black text-sm uppercase italic">Wali Santri rindu tanpa info...</p>
                 </div>
              </div>
           </div>
        </div>
      )
    },

    // Slide 2: Babak 2 - The Birth via Montir
    {
      type: 'content',
      title: 'Babak 2: Sang MONTIR & PEMBUAT',
      content: (
        <div className="max-w-6xl mx-auto px-4 h-full flex flex-col justify-center">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex flex-col justify-center">
                 <NarratorBox>The Creators</NarratorBox>
                 <SpeechBubble from="left">
                    "Kita tidak boleh diam saja! Kita punya ilmunya, kita punya kodenya. Mari kita rakit asisten digital kita sendiri!"
                 </SpeechBubble>
                 <div className="border-4 border-slate-900 bg-blue-100 p-6 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
                    <h4 className="font-black text-xl mb-4 italic uppercase">SANTRI PROGRAMMER</h4>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">
                       Bukan hanya sekadar guru, mereka adalah <strong>MONTIR</strong> yang memahami jerohan algoritma dan detak jantung pesantren.
                    </p>
                 </div>
              </div>
              <div className="relative h-[400px] border-8 border-slate-900 bg-slate-900 shadow-[15px_15px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black opacity-60"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative text-center">
                       <Zap className="w-32 h-32 text-blue-400 animate-pulse mb-4 mx-auto" />
                       <p className="text-blue-400 font-black tracking-widest text-xl animate-bounce">CODING ADAB...</p>
                       <div className="flex gap-2 justify-center mt-6">
                          <Database className="w-8 h-8 text-white/40" />
                          <MessageSquare className="w-8 h-8 text-white/40" />
                          <TrendingUp className="w-8 h-8 text-white/40" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )
    },

    // Slide 3: Babak 3 - The Activation
    {
      type: 'content',
       title: 'Babak 3: Aktivasi AIMAN',
       content: (
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
             <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full h-[500px]">
                <div className="md:col-span-5 border-[12px] border-slate-900 bg-white shadow-[15px_15px_0px_0px_rgba(99,102,241,1)] relative overflow-hidden">
                   <img src="/images/presentasi/aiman-ustadz.png" alt="Aiman" className="w-full h-full object-cover grayscale-[0.2]" />
                   <div className="absolute top-4 left-4 bg-indigo-600 text-white px-4 py-1 font-black text-xs uppercase italic border-2 border-slate-900 shadow-md">
                      UNIT 01: AIMAN
                   </div>
                </div>
                <div className="md:col-span-1 hidden md:flex items-center justify-center">
                   <div className="h-full w-2 bg-slate-900"></div>
                </div>
                <div className="md:col-span-6 flex flex-col justify-between py-4">
                   <div className="space-y-4">
                      <NarratorBox color="bg-indigo-600 text-white">Spec Sheet</NarratorBox>
                      <h4 className="text-5xl font-black text-slate-900 uppercase italic leading-none tracking-tighter mb-4">ASISTEN DIGITAL SANTRI</h4>
                      <div className="grid grid-cols-1 gap-3">
                         {[
                            { l: 'CORE', v: 'GOOGLE GEMINI AI' },
                            { l: 'OUTFIT', v: 'PECI & SARUNG DIGITAL' },
                            { l: 'LANG', v: 'INDONESIA NATURAL' },
                            { l: 'ROLE', v: 'MULTI-ROLE ADAPTIVE' }
                         ].map((s, i) => (
                            <div key={i} className="flex border-4 border-slate-900 bg-white">
                               <div className="w-24 bg-slate-900 text-white p-2 font-black text-xs flex items-center justify-center tracking-widest">{s.l}</div>
                               <div className="flex-1 p-2 font-black text-slate-800 text-lg uppercase italic ml-2">{s.v}</div>
                            </div>
                         ))}
                      </div>
                   </div>
                   <SpeechBubble from="right">
                      "Saya Aiman. Buatan tangan terampil santri, siap menyulap data menjadi kemaslahatan."
                   </SpeechBubble>
                </div>
             </div>
          </div>
       )
    },

    // Slide 4: Babak 3.1 - Ustadz Assistant
    {
       type: 'content',
       title: 'Babak 3.1: Senyum Sang Ustadz',
       content: (
          <div className="max-w-6xl mx-auto px-4 h-full flex items-center">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                   <NarratorBox color="bg-green-400">Admin Efficiency</NarratorBox>
                   <SpeechBubble from="left">
                      "Ustadz, biarkan saya yang merekap absensi dan perizinan. Ustadz silakan istirahat sejenak dan nikmati tehnya."
                   </SpeechBubble>
                   <div className="border-4 border-slate-900 bg-white p-6 shadow-[10px_10px_0px_0px_rgba(34,197,94,1)]">
                      <ul className="space-y-3">
                         <li className="flex items-center gap-3 font-bold">
                            <CheckCircle className="text-green-600 w-6 h-6" />
                            <span>Otomatisasi Laporan Presensi</span>
                         </li>
                         <li className="flex items-center gap-3 font-bold">
                            <CheckCircle className="text-green-600 w-6 h-6" />
                            <span>Analisis Data Perkembangan Santri</span>
                         </li>
                         <li className="flex items-center gap-3 font-bold">
                            <CheckCircle className="text-green-600 w-6 h-6" />
                            <span>Prediksi Potensi Masalah Kedisiplinan</span>
                         </li>
                      </ul>
                   </div>
                </div>
                <div className="border-8 border-slate-900 shadow-[15px_15px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
                   <img src="/images/presentasi/aiman_comic_ustadz.png" alt="Aiman helps Ustadz" className="w-full h-full object-cover" />
                </div>
             </div>
          </div>
       )
    },

    // Slide 5: Babak 3.2 - Santri Mentor
    {
       type: 'content',
       title: 'Babak 3.2: Sahabat Belajar Santri',
       content: (
          <div className="max-w-6xl mx-auto px-4 h-full flex items-center">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="border-8 border-slate-900 shadow-[-15px_15px_0px_0px_rgba(59,130,246,1)] overflow-hidden order-2 md:order-1">
                   <img src="/images/presentasi/aiman_comic_santri.png" alt="Aiman helps Santri" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-6 order-1 md:order-2">
                   <NarratorBox color="bg-blue-400">Learning Support</NarratorBox>
                   <SpeechBubble from="right">
                      "Jangan bingung, kawan! Ayat ini berkaitan dengan logika coding yang kamu pelajari. Mari kita bedah bersama!"
                   </SpeechBubble>
                   <div className="border-4 border-slate-900 bg-white p-6 shadow-[10px_10px_0px_0px_rgba(59,130,246,1)]">
                      <p className="font-black text-xl italic mb-4 uppercase">MENTORING 24/7</p>
                      <p className="font-bold text-slate-600 leading-relaxed">
                         Aiman hadir sebagai teman diskusi yang tidak pernah lelah, menghubungkan ilmu agama dengan teknologi modern.
                      </p>
                   </div>
                </div>
             </div>
          </div>
       )
    },

    // Slide 6: Babak 3.3 - Wali Support
    {
       type: 'content',
       title: 'Babak 3.3: Jembatan Rindu Wali Santri',
       content: (
          <div className="max-w-6xl mx-auto px-4 h-full flex items-center">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                   <NarratorBox color="bg-rose-400">Peace of Mind</NarratorBox>
                   <SpeechBubble from="left">
                      "Kabar gembira, Ibu! Ananda sudah setor hafalan juz 30 dengan lancar hari ini. Doakan terus ya!"
                   </SpeechBubble>
                   <div className="border-4 border-slate-900 bg-white p-6 shadow-[10px_10px_0px_0px_rgba(244,63,94,1)]">
                      <h4 className="font-black text-xl mb-2 uppercase">UPDATE REAL-TIME</h4>
                      <p className="font-bold text-slate-600">
                         Menghilangkan ketidakpastian. Wali santri bisa memantau kesehatan, prestasi, dan kegiatan harian anak dari genggaman.
                      </p>
                   </div>
                </div>
                <div className="border-8 border-slate-900 shadow-[15px_15px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
                   <img src="/images/presentasi/aiman_comic_wali.png" alt="Aiman helps Wali" className="w-full h-full object-cover" />
                </div>
             </div>
          </div>
       )
    },

    // Slide 7: Babak 4 - The Calibration (Learning)
    {
      type: 'content',
      title: 'Babak 4: Diplomasi Data & Rasa',
      content: (
        <div className="max-w-6xl mx-auto px-4 h-full flex flex-col justify-center">
           <div className="border-8 border-slate-900 bg-white p-12 shadow-[20px_20px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/halftone.png')] opacity-10 pointer-events-none"></div>
              <NarratorBox color="bg-rose-500 text-white">Calibration Phase</NarratorBox>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                 <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-6 rounded-tr-[3rem] rounded-bl-[3rem] font-black text-2xl shadow-xl border-4 border-white rotate-[-2deg] relative">
                       "Aiman, kenapa responmu kaku sekali? Ustadz lelah, bukan robot!"
                       <div className="absolute -top-4 -right-2 bg-yellow-400 text-slate-900 p-2 font-black text-[10px] border-2 border-slate-900 rotate-12">USTADZ DIALOGUE</div>
                    </div>
                    <div className="bg-indigo-100 border-8 border-slate-900 p-6 rounded-tl-[3rem] rounded-br-[3rem] font-black text-2xl shadow-xl rotate-[1deg] relative">
                       "Maafkan hamba. Saya sedang mempelajari adab dan tradisi pondok yang dalam..."
                       <div className="absolute -bottom-4 -left-2 bg-indigo-600 text-white p-2 font-black text-[10px] border-2 border-slate-900 -rotate-6">AIMAN DIALOGUE</div>
                    </div>
                 </div>
                 <div className="bg-yellow-50 border-4 border-slate-900 border-dashed p-8 flex flex-col items-center justify-center text-center">
                    <Sparkles className="w-16 h-16 text-yellow-600 mb-4 animate-spin-slow" />
                    <p className="font-black text-xl italic text-slate-800 leading-tight">
                       "Di tangan montir pesantren, Aiman belajar bahwa angka harus memiliki jiwa."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )
    },

    // Slide 8: Babak 5 - The Mechanics / Maintenance
    {
      type: 'content',
       title: 'Babak 5: Bengkel Algoritma',
       content: (
         <div className="max-w-6xl mx-auto px-4 h-full flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="border-8 border-slate-900 shadow-[-15px_15px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
                  <img src="/images/presentasi/aiman_comic_forge.png" alt="Aiman Forge" className="w-full h-full object-cover" />
               </div>
               <div className="space-y-8">
                  <h3 className="text-5xl font-black uppercase italic text-slate-900 tracking-tighter">THE MECHANICS CORNER</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {[
                        { label: "TUNING", desc: "Menyetel sensitivitas AI terhadap adab Islami", icon: Zap, color: "bg-blue-400" },
                        { label: "DIAGNOSTIC", desc: "Menganalisis anomali data santri real-time", icon: Database, color: "bg-yellow-400" },
                        { label: "OVERHAUL", desc: "Upgrade sistem setiap malam di asrama", icon: Bot, color: "bg-green-400" },
                        { label: "SHIELD", desc: "Memagari Aiman dari distorsi data luar", icon: Shield, color: "bg-red-400" }
                     ].map((item, i) => (
                        <div key={i} className={`border-4 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] bg-white transform hover:scale-105 transition-transform`}>
                           <div className={`${item.color} border-2 border-slate-900 p-2 inline-block mb-2`}>
                              <item.icon className="w-6 h-6 text-slate-900" />
                           </div>
                           <h4 className="text-lg font-black mb-1 uppercase italic tracking-tighter">{item.label}</h4>
                           <p className="text-[10px] font-bold text-slate-500 uppercase leading-snug">{item.desc}</p>
                        </div>
                     ))}
                  </div>
                  <div className="mt-8 text-center bg-slate-900 text-white p-4 font-black uppercase tracking-widest italic border-4 border-white shadow-xl">
                     "SANTRI: KAMI ADALAH MONTIR AIMAN!"
                  </div>
               </div>
            </div>
         </div>
       )
    },

    // Slide 9: Babak 6 - Vision / Scale
    {
       type: 'content',
       title: 'Babak 6: Ekspansi Pahlawan Digital',
       content: (
          <div className="max-w-6xl mx-auto px-4 h-full flex items-center">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                   <NarratorBox color="bg-indigo-600 text-white">The Future</NarratorBox>
                   <h3 className="text-6xl font-black uppercase italic leading-none tracking-tighter text-slate-900">MENERANGI INDONESIA</h3>
                   <p className="text-2xl font-bold italic leading-relaxed text-slate-600">
                      "Aiman tidak hanya milik satu pondok. Visi kami adalah membawa Aiman ke ribuan pesantren di pelosok negeri, memastikan setiap ustadz dan santri terbantu oleh teknologi yang beradab."
                   </p>
                   <div className="flex gap-4">
                      <div className="bg-yellow-400 border-4 border-slate-900 p-4 font-black text-center shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex-1">
                         <div className="text-3xl">1000+</div>
                         <div className="text-xs uppercase">Target Pesantren</div>
                      </div>
                      <div className="bg-blue-400 border-4 border-slate-900 p-4 font-black text-center shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex-1">
                         <div className="text-3xl">10JT+</div>
                         <div className="text-xs uppercase">Kehidupan Santri</div>
                      </div>
                   </div>
                </div>
                <div className="border-8 border-slate-900 shadow-[20px_20px_0px_0px_rgba(99,102,241,1)] overflow-hidden">
                   <img src="/images/presentasi/aiman_comic_scale.png" alt="Aiman Vision" className="w-full h-full object-cover" />
                </div>
             </div>
          </div>
       )
    },

    // Slide 10: Vision - The Final Page
    {
      type: 'hero',
      content: (
        <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/halftone.png')] opacity-10"></div>
           <div className="max-w-5xl text-center space-y-12 relative z-10">
              <h2 className="text-8xl md:text-[12rem] font-black uppercase italic leading-none tracking-tighter text-slate-900 skew-x-[-12deg] drop-shadow-[5px_5px_0px_rgba(59,130,246,1)]">
                 COLLECTOR'S EDITION
              </h2>
              <div className="bg-white border-[12px] border-slate-900 p-10 shadow-[20px_20px_0px_0px_rgba(15,23,42,1)] rotate-1 relative">
                 <div className="absolute -top-8 -left-8 bg-blue-600 text-white border-4 border-slate-900 px-6 py-2 font-black text-2xl uppercase italic skew-x-[-12deg]">BE PART OF US!</div>
                 <p className="text-3xl md:text-5xl font-black uppercase mb-6 italic text-indigo-700 tracking-tight">Kisah Ini Baru Dimulai...</p>
                 <p className="text-xl md:text-2xl font-bold italic leading-relaxed text-slate-700 max-w-2xl mx-auto mb-10">
                    "Aiman Mengajar Sambil Terus Belajar. Mari kembangkan bersama pahlawan digital kita ini di setiap asrama dan sekolah!"
                 </p>
                 <div className="flex flex-wrap justify-center gap-6">
                    <button className="bg-slate-900 text-white px-10 py-5 font-black uppercase italic border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] hover:bg-slate-800 hover:shadow-none transition-all">AKTIFKAN AIMAN!</button>
                    <button className="bg-white text-slate-900 px-10 py-5 font-black uppercase italic border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-50 hover:shadow-none transition-all">HUBUNGI MONTIR!</button>
                 </div>
              </div>
              <p className="text-slate-400 font-black tracking-[0.5em] text-sm md:text-lg">TO BE CONTINUED — VOLUME 02</p>
           </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 overflow-hidden flex flex-col relative font-sans selection:bg-yellow-400 selection:text-slate-900">
      <Helmet>
        <title>Kisah Aiman: The Comic Story | PISANTRI</title>
      </Helmet>

      {/* Progress Bar - Comic Style */}
      <div className="absolute top-0 left-0 w-full h-4 bg-slate-900 z-50 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 transition-all duration-500 border-r-4 border-white"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-y-auto">
        <div className={`min-h-screen flex items-center justify-center p-4 md:p-8 ${currentSlideData.type === 'hero' ? 'bg-indigo-50/30' : ''}`}>
           {currentSlideData.content}
        </div>
      </div>

      {/* Navigation Overlay */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none z-40 bg-gradient-to-t from-white/80 to-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          <button
            onClick={prevSlide}
            className="group w-16 h-16 bg-slate-900 border-4 border-white flex items-center justify-center hover:bg-indigo-600 transition-all shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] disabled:opacity-30 disabled:shadow-none"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-8 h-8 text-white group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="flex flex-col items-center">
             <div className="bg-white border-4 border-slate-900 px-6 py-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rotate-[-1deg]">
                <span className="font-black text-2xl italic tracking-tighter">
                  PAGE 0{currentSlide + 1}
                </span>
             </div>
             <div className="flex gap-2 mt-4">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 border-2 border-slate-900 transition-all ${
                      index === currentSlide 
                        ? 'bg-yellow-400 w-8' 
                        : 'bg-white hover:bg-slate-200'
                    }`}
                  />
                ))}
             </div>
          </div>

          <button
            onClick={nextSlide}
            className="group w-16 h-16 bg-slate-900 border-4 border-white flex items-center justify-center hover:bg-indigo-600 transition-all shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] disabled:opacity-30 disabled:shadow-none"
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight className="w-8 h-8 text-white group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
      
      {/* Decorative Texture */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/halftone.png')] opacity-[0.03] pointer-events-none z-0"></div>
    </div>
  );
};

export default AimanPiPresentationPage;
