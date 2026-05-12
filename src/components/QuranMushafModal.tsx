import { useState, useEffect, useCallback, Fragment, useRef } from 'react';
import { X, Book, Loader2, ChevronLeft, ChevronRight, Eye, LayoutGrid, ScrollText, Palette, Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';
import { 
  fetchSurahList, 
  fetchSurahWithTranslation,
  fetchSurahWithTajweed,
  toArabicNumber,
  parseTajweedText,
  TAJWEED_CSS,
  type QuranAyat,
  type QuranSurah 
} from '../services/quranApi';
import { api } from '../services/api';

interface QuranBookmark {
  id: number;
  surah_number: number;
  ayat_number: number;
  tanggal: string;
}

interface QuranMushafModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSurah?: string;
}

export default function QuranMushafModal({ isOpen, onClose, initialSurah }: QuranMushafModalProps) {
  const [loading, setLoading] = useState(false);
  const [surahs, setSurahs] = useState<QuranSurah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedAyat, setSelectedAyat] = useState<number>(1);
  const [ayatList, setAyatList] = useState<QuranAyat[]>([]);
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>([]);
  const [lastRead, setLastRead] = useState<QuranBookmark | null>(null);
  const [viewMode, setViewMode] = useState<'mushaf' | 'list'>('mushaf');
  const [showTranslation, setShowTranslation] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showTajweed, setShowTajweed] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [scale, setScale] = useState(1);
  const mushafContainerRef = useRef<HTMLDivElement>(null);

  // Responsive Scaling Logic
  useEffect(() => {
    const handleResize = () => {
      if (!mushafContainerRef.current) return;
      const containerWidth = mushafContainerRef.current.offsetWidth;
      const contentWidth = 800; // Ideal width for Madinah Mushaf page
      const padding = 32; // Horizontal padding
      
      if (containerWidth < contentWidth + padding) {
        const newScale = (containerWidth - padding) / contentWidth;
        setScale(Math.max(0.4, newScale));
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, viewMode]);

  // Fetch surah list on mount
  useEffect(() => {
    const loadSurahs = async () => {
      try {
        const list = await fetchSurahList();
        setSurahs(list);
        
        if (initialSurah) {
          const found = list.find(s => s.englishName.toLowerCase() === initialSurah.toLowerCase());
          if (found) setSelectedSurah(found.number);
        }
      } catch (err) {
        console.error('Failed to load surah list', err);
      }
    };
    loadSurahs();
  }, [initialSurah]);

  // Fetch ayat when selected surah or tajweed mode changes
  const loadAyat = useCallback(async () => {
    if (!selectedSurah) return;
    setLoading(true);
    try {
      const data = showTajweed 
        ? await fetchSurahWithTajweed(selectedSurah)
        : await fetchSurahWithTranslation(selectedSurah);
      setAyatList(data);
    } catch (err) {
      console.error('Failed to load ayat', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSurah, showTajweed]);

  const fetchBookmarks = useCallback(async () => {
    try {
      const response = await api.getQuranBookmarks();
      setBookmarks(response.history || []);
      if (response.last_read) {
        setLastRead(response.last_read);
        if (initialLoad) {
          setSelectedSurah(response.last_read.surah_number);
          setSelectedAyat(response.last_read.ayat_number);
        }
      }
    } catch (err) {
      console.error('Failed to load bookmarks', err);
    }
  }, [initialLoad]);

  useEffect(() => {
    if (isOpen) {
      fetchBookmarks();
    }
  }, [isOpen, fetchBookmarks]);

  useEffect(() => {
    if (isOpen) {
      loadAyat();
      if (!initialLoad) {
        setSelectedAyat(1);
      }
    }
  }, [isOpen, selectedSurah, loadAyat]);

  // Effect to scroll to ayat after ayatList is loaded on first load
  useEffect(() => {
    if (isOpen && ayatList.length > 0 && initialLoad && lastRead) {
      setTimeout(() => {
        scrollToAyat(lastRead.ayat_number);
        setInitialLoad(false);
      }, 500);
    }
  }, [isOpen, ayatList, initialLoad, lastRead]);

  const handleSaveBookmark = async (surahNum: number, ayatNum: number) => {
    try {
      await api.saveQuranBookmark(surahNum, ayatNum);
      fetchBookmarks();
    } catch (err) {
      console.error('Failed to save bookmark', err);
    }
  };

  const handleResetBookmarks = async (keepLast: boolean = false) => {
    setResetting(true);
    try {
      const response = await api.deleteAllQuranBookmarks(keepLast);
      if (keepLast && response.kept_bookmark) {
        // Refresh bookmarks to get the remaining one
        fetchBookmarks();
      } else {
        setBookmarks([]);
        setLastRead(null);
      }
      setShowResetConfirm(false);
    } catch (err) {
      console.error('Failed to reset bookmarks', err);
    } finally {
      setResetting(false);
    }
  };

  const scrollToAyat = useCallback((ayatNum: number) => {
    const element = document.getElementById(`ayat-${ayatNum}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleAyatChange = (ayatNum: number) => {
    setSelectedAyat(ayatNum);
    scrollToAyat(ayatNum);
  };

  if (!isOpen) return null;

  const currentSurah = surahs.find(s => s.number === selectedSurah);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-[#fcfbf7] w-full max-w-6xl h-full sm:h-[95vh] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border border-white/10">
        
        {/* Dynamic Background Texture for Paper Feel */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}></div>

        {/* Header - Responsive Two-Row Layout */}
        <div className="relative z-10 bg-white/90 backdrop-blur-xl border-b border-earth-200 p-3 sm:p-5">
          {/* Top Row: Logo + Action Buttons + Close */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <Book className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h2 className="text-sm sm:text-lg font-black text-slate-900 uppercase tracking-tight leading-none">Mushaf</h2>
                <p className="text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Pisantri Digital</p>
              </div>
            </div>

            {/* Center: Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center">
              {/* View Mode Switcher */}
              <div className="bg-slate-100/80 p-0.5 sm:p-1 rounded-lg sm:rounded-xl flex items-center gap-0.5 border border-slate-200/50">
                <button 
                  onClick={() => setViewMode('mushaf')}
                  className={`flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all ${viewMode === 'mushaf' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <ScrollText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Halaman</span>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Daftar</span>
                </button>
              </div>

              {/* Translation Toggle */}
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-all border text-[10px] sm:text-xs font-bold ${showTranslation ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                title="Terjemahan"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Terjemah</span>
              </button>

              {/* Tajweed Toggle */}
              <button
                onClick={() => setShowTajweed(!showTajweed)}
                className={`flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-all border text-[10px] sm:text-xs font-bold ${showTajweed ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                title="Tajweed Berwarna"
              >
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Tajweed</span>
              </button>

              {/* Reset Bookmarks Button */}
              {bookmarks.length > 0 && (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-all border bg-white border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 text-[10px] sm:text-xs font-bold"
                  title="Reset Penanda"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Bottom Row: Surah & Ayat Navigation */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 pt-3 border-t border-slate-100">
            {/* Previous Surah */}
            <button
              onClick={() => selectedSurah > 1 && setSelectedSurah(selectedSurah - 1)}
              disabled={selectedSurah <= 1}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Surah Selector */}
            <div className="relative flex-1 max-w-[180px] sm:max-w-[240px]">
              <select
                value={selectedSurah}
                onChange={(e) => setSelectedSurah(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all cursor-pointer appearance-none pr-8 sm:pr-10 text-center"
              >
                {surahs.map(s => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.englishName}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 rotate-90" />
            </div>

            {/* Ayat Selector */}
            <div className="relative w-[80px] sm:w-[100px]">
              <select
                value={selectedAyat}
                onChange={(e) => handleAyatChange(Number(e.target.value))}
                className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all cursor-pointer appearance-none pr-6 sm:pr-8 text-center"
              >
                {Array.from({ length: currentSurah?.numberOfAyahs || 0 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Ayat {i + 1}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-4 h-4 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500 rotate-90" />
            </div>

            {/* Next Surah */}
            <button
              onClick={() => selectedSurah < 114 && setSelectedSurah(selectedSurah + 1)}
              disabled={selectedSurah >= 114}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 fade-in duration-200">
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 mb-2">
                Reset Penanda Bacaan?
              </h3>
              <p className="text-sm text-center text-slate-500 mb-6">
                Anda memiliki <strong>{bookmarks.length} penanda</strong> bacaan. Pilih tindakan:
              </p>
              <div className="flex flex-col gap-2">
                {/* Option 1: Delete all except last */}
                <button
                  onClick={() => handleResetBookmarks(true)}
                  disabled={resetting}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      Simpan Terakhir
                    </>
                  )}
                </button>
                
                {/* Option 2: Delete all */}
                <button
                  onClick={() => handleResetBookmarks(false)}
                  disabled={resetting}
                  className="w-full px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Semua
                </button>
                
                {/* Option 3: Cancel */}
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all"
                  disabled={resetting}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-10 custom-scrollbar" style={{ background: 'linear-gradient(135deg, #fdfcf9 0%, #f8f5eb 50%, #fdfcf9 100%)' }} ref={mushafContainerRef}>
          {/* Inject Tajweed CSS */}
          {showTajweed && <style dangerouslySetInnerHTML={{ __html: TAJWEED_CSS }} />}
          
          {/* Tajweed Index - Compact at Top */}
          {showTajweed && (
            <div className="max-w-4xl mx-auto mb-6 no-print">
              <div className="bg-white/60 backdrop-blur-md border border-earth-100 rounded-2xl py-3 px-4 shadow-sm flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9px] sm:text-[10px]">
                <span className="text-slate-500 font-bold uppercase tracking-widest opacity-60">Panduan Tajweed:</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></span><span className="text-blue-600 font-bold">Mad</span></span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-200"></span><span className="text-red-600 font-bold">Qalqalah</span></span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-200"></span><span className="text-orange-600 font-bold">Ghunnah</span></span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200"></span><span className="text-green-600 font-bold">Ikhfa</span></span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500 shadow-sm shadow-cyan-200"></span><span className="text-cyan-600 font-bold">Iqlab</span></span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-200"></span><span className="text-purple-600 font-bold">Idgham</span></span>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
              <p className="text-emerald-900/60 font-bold uppercase tracking-widest text-xs animate-pulse">Memuat Kalam Ilahi...</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              
              {/* Traditional Page Frame */}
              <div className="relative group/mushaf">
                {/* Decorative Borders */}
                {/* Page Content Scaled Wrapper */}
                <div 
                  className="relative transition-all duration-300 ease-out flex justify-center"
                  style={{ 
                    minHeight: `${60 * scale}vh`,
                    perspective: '1000px'
                  }}
                >
                  <div 
                    className="relative bg-white/95 shadow-inner p-6 sm:p-12 min-h-[60vh] rounded-[20px] sm:rounded-[40px] border border-earth-100 flex flex-col items-center"
                    style={{ 
                      width: '800px',
                      transform: `scale(${scale})`,
                      transformOrigin: 'top center',
                      marginBottom: `calc(800px * (1 - ${scale}) * -1)` 
                    }}
                  >
                    {/* Decorative Borders (Scaled) */}
                    <div className="absolute -inset-4 border-[12px] border-[#e8dfc4] rounded-[30px] pointer-events-none opacity-80 ring-1 ring-earth-200"></div>
                    <div className="absolute -inset-2 border-[2px] border-[#c4ae78] rounded-[24px] pointer-events-none opacity-40"></div>
                    
                    {/* Surah Header Ornament */}
                    <div className="mb-12 relative flex items-center justify-center w-full">
                    <div className="absolute inset-0 flex items-center">
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-earth-300 to-transparent"></div>
                    </div>
                    <div className="relative bg-[#ffffff] border-4 border-[#e8dfc4] px-10 py-4 rounded-2xl shadow-sm ring-1 ring-[#c4ae78]/30">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#e8dfc4] rotate-45 border border-[#c4ae78]"></div>
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#e8dfc4] rotate-45 border border-[#c4ae78]"></div>
                      <h3 className="text-2xl sm:text-3xl font-arabic text-earth-900" style={{ fontFamily: "'Scheherazade New', serif" }}>
                        سُوْرَةُ {currentSurah?.name?.replace('سورة ', '') || ''}
                      </h3>
                      <p className="text-[8px] sm:text-[10px] font-black text-center text-earth-600 uppercase tracking-[0.3em] mt-1">
                        {currentSurah?.revelationType} • {ayatList.length} Ayat
                      </p>
                    </div>
                  </div>

                  {/* Bismillah */}
                  {selectedSurah !== 1 && selectedSurah !== 9 && (
                    <div className="text-center mb-10 w-full relative z-10">
                      <p className="font-arabic text-4xl text-gray-900" style={{ fontFamily: "'Scheherazade New', serif" }}>
                        بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                      </p>
                    </div>
                  )}
                  {/* View Mode: Mushaf (Page Layout) */}
                  {viewMode === 'mushaf' ? (
                    <div dir="rtl" className={`text-right ${showTranslation ? 'space-y-10' : ''}`}>
                      {showTranslation ? (
                        /* Interlinear Layout (When Translation is ON) */
                        <div className="flex flex-col items-center text-center space-y-12">
                          {ayatList.map((ayat) => (
                            <div key={ayat.number} id={`ayat-${ayat.numberInSurah}`} className="group/ayat w-full">
                              {/* Arabic Text Block */}
                              <p 
                                className={`font-arabic text-gray-900 mb-4 ${showTajweed ? 'tajweed' : ''}`}
                                style={{ 
                                  fontFamily: "'Scheherazade New', serif",
                                  fontSize: 'clamp(1.75rem, 5vw, 2.875rem)',
                                  lineHeight: '1.9'
                                }}
                              >
                                {showTajweed ? (
                                  <span dangerouslySetInnerHTML={{ 
                                    __html: parseTajweedText(
                                      selectedSurah !== 1 && ayat.numberInSurah === 1 
                                        ? ayat.text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '').trim() 
                                        : ayat.text
                                    )
                                  }} />
                                ) : (
                                  selectedSurah !== 1 && ayat.numberInSurah === 1 
                                    ? ayat.text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '').trim() 
                                    : ayat.text
                                )}
                                
                                <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mx-1 sm:mx-2 font-sans text-emerald-600/50 align-middle relative group/marker">
                                  <span className="absolute scale-[1.6] sm:scale-[2] opacity-30 group-hover/marker:opacity-60 transition-opacity">﴿</span>
                                  <span className="text-[10px] sm:text-[12px] font-bold mt-1">{toArabicNumber(ayat.numberInSurah)}</span>
                                  <span className="absolute scale-[1.6] sm:scale-[2] opacity-30 group-hover/marker:opacity-60 transition-opacity">﴾</span>

                                  {/* Clickable Bookmark Icon */}
                                  <button
                                    onClick={() => handleSaveBookmark(selectedSurah, ayat.numberInSurah)}
                                    className={`absolute -top-2 -right-3 transition-all flex items-center justify-center z-20 ${
                                      lastRead?.surah_number === selectedSurah && lastRead?.ayat_number === ayat.numberInSurah
                                        ? 'text-amber-500 scale-125 drop-shadow-lg animate-bounce'
                                        : bookmarks.some((b: QuranBookmark) => b.surah_number === selectedSurah && b.ayat_number === ayat.numberInSurah)
                                          ? 'text-emerald-500 scale-110 drop-shadow-md'
                                          : 'text-slate-300 opacity-30 group-hover/marker:opacity-100 hover:text-emerald-400 hover:scale-125'
                                    }`}
                                    title={lastRead?.surah_number === selectedSurah && lastRead?.ayat_number === ayat.numberInSurah ? '📖 Bacaan Terakhir' : 'Tandai Selesai Baca'}
                                  >
                                    {(lastRead?.surah_number === selectedSurah && lastRead?.ayat_number === ayat.numberInSurah) || bookmarks.some((b: QuranBookmark) => b.surah_number === selectedSurah && b.ayat_number === ayat.numberInSurah)
                                      ? <BookmarkCheck className="w-5 h-5 fill-current" />
                                      : <Bookmark className="w-5 h-5" />
                                    }
                                  </button>
                                </span>
                              </p>

                              {/* Small Interlinear Translation */}
                              <div dir="ltr" className="flex justify-center">
                                <p className="max-w-2xl text-earth-600 italic text-sm sm:text-base leading-relaxed border-t border-earth-200/50 pt-2 px-6">
                                  {ayat.translation}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Flowing Paragraph (When Translation is OFF) */
                        <div 
                          className="font-arabic text-gray-900 leading-[2.8] pt-10 mushaf-page-content w-full"
                          style={{ 
                            fontFamily: "'Scheherazade New', serif",
                            fontSize: '2.85rem',
                            direction: 'rtl',
                            textAlign: 'justify',
                            textAlignLast: 'center',
                            textJustify: 'inter-word',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {ayatList.map((ayat, index) => {
                            const prevAyat = index > 0 ? ayatList[index - 1] : null;
                            const isNewPage = prevAyat && prevAyat.page !== ayat.page;

                            return (
                              <Fragment key={ayat.number}>
                                {isNewPage && (
                                  <div className="w-full flex items-center gap-4 my-10 opacity-30 select-none no-print" dir="ltr">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-earth-300"></div>
                                    <div className="px-4 py-1 border border-earth-200 rounded-full text-[10px] font-bold text-earth-400 uppercase tracking-[0.2em] whitespace-nowrap">
                                      Halaman {ayat.page}
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-earth-300"></div>
                                  </div>
                                )}
                                <span id={`ayat-${ayat.numberInSurah}`} className={`inline group/ayat relative ${showTajweed ? 'tajweed' : ''}`}>
                                  {showTajweed ? (
                                    <span dangerouslySetInnerHTML={{ 
                                      __html: parseTajweedText(
                                        selectedSurah !== 1 && ayat.numberInSurah === 1 
                                          ? ayat.text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '').trim() 
                                          : ayat.text
                                      )
                                    }} />
                                  ) : (
                                    selectedSurah !== 1 && ayat.numberInSurah === 1 
                                      ? ayat.text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '').trim() 
                                      : ayat.text
                                  )}
                                  
                                  <span className="inline-flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 mx-1 sm:mx-2 font-sans text-emerald-600/50 hover:text-emerald-700 transition-colors cursor-help align-middle mb-1 relative group/marker">
                                    <span className="absolute scale-[1.5] sm:scale-[1.9] opacity-30 group-hover/marker:opacity-60 transition-opacity">﴿</span>
                                    <span className="text-[9px] sm:text-[11px] font-bold mt-0.5">{toArabicNumber(ayat.numberInSurah)}</span>
                                    <span className="absolute scale-[1.5] sm:scale-[1.9] opacity-30 group-hover/marker:opacity-60 transition-opacity">﴾</span>

                                    {/* Bookmark Icon (Float) */}
                                    <button
                                      onClick={() => handleSaveBookmark(selectedSurah, ayat.numberInSurah)}
                                      className={`absolute -top-2 -right-3 transition-all flex items-center justify-center z-20 ${
                                        lastRead?.surah_number === selectedSurah && lastRead?.ayat_number === ayat.numberInSurah
                                          ? 'text-amber-500 scale-125 drop-shadow-lg animate-bounce'
                                          : bookmarks.some((b: QuranBookmark) => b.surah_number === selectedSurah && b.ayat_number === ayat.numberInSurah)
                                            ? 'text-emerald-500 scale-110 drop-shadow-md'
                                            : 'text-slate-300 hover:text-emerald-400 opacity-0 group-hover/ayat:opacity-100 hover:scale-125 active:scale-95'
                                      }`}
                                      title={lastRead?.surah_number === selectedSurah && lastRead?.ayat_number === ayat.numberInSurah ? '📖 Bacaan Terakhir' : 'Tandai Selesai Baca'}
                                    >
                                      {(lastRead?.surah_number === selectedSurah && lastRead?.ayat_number === ayat.numberInSurah) || bookmarks.some((b: QuranBookmark) => b.surah_number === selectedSurah && b.ayat_number === ayat.numberInSurah)
                                        ? <BookmarkCheck className="w-4 sm:w-5 h-4 sm:h-5 fill-current" />
                                        : <Bookmark className="w-4 sm:w-5 h-4 sm:h-5" />
                                      }
                                    </button>
                                  </span>
                                </span>
                              </Fragment>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* View Mode: List (Verse by Verse) */
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                      {ayatList.map((ayat) => (
                        <div key={ayat.number} id={`ayat-${ayat.numberInSurah}`} className="group/list relative pb-8 border-b border-earth-50 last:border-0">
                          <div dir="rtl" className="text-right">
                            <p 
                                className="font-arabic text-4xl leading-[2.2] text-gray-900"
                                style={{ fontFamily: "'Scheherazade New', serif" }}
                            >
                                {selectedSurah !== 1 && ayat.numberInSurah === 1 
                                    ? ayat.text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '').trim() 
                                    : ayat.text}
                                <span className="inline-flex items-center justify-center w-12 h-12 mx-4 text-lg font-sans text-emerald-600/40 border-2 border-emerald-50 rounded-full align-middle mb-2">
                                    {toArabicNumber(ayat.numberInSurah)}

                                    {/* Bookmark Icon (List) */}
                                    <button
                                      onClick={() => handleSaveBookmark(selectedSurah, ayat.numberInSurah)}
                                      className={`absolute -top-2 -right-2 transition-all flex items-center justify-center z-10 ${
                                        lastRead?.surah_number === selectedSurah && lastRead?.ayat_number === ayat.numberInSurah
                                          ? 'text-amber-500 scale-125 drop-shadow-lg animate-bounce'
                                          : bookmarks.some((b: QuranBookmark) => b.surah_number === selectedSurah && b.ayat_number === ayat.numberInSurah)
                                            ? 'text-emerald-500 scale-110 drop-shadow-md'
                                            : 'text-slate-300 hover:text-emerald-400 hover:scale-125 active:scale-95'
                                      }`}
                                      title={lastRead?.surah_number === selectedSurah && lastRead?.ayat_number === ayat.numberInSurah ? '📖 Bacaan Terakhir' : 'Tandai Selesai Baca'}
                                    >
                                      {(lastRead?.surah_number === selectedSurah && lastRead?.ayat_number === ayat.numberInSurah) || bookmarks.some((b: QuranBookmark) => b.surah_number === selectedSurah && b.ayat_number === ayat.numberInSurah)
                                        ? <BookmarkCheck className="w-6 h-6 fill-current" />
                                        : <Bookmark className="w-6 h-6" />
                                      }
                                    </button>
                                </span>
                            </p>
                          </div>
                          {showTranslation && (
                            <div className="mt-4 flex gap-4 bg-earth-50/50 p-4 rounded-xl border border-earth-100">
                                <span className="flex-shrink-0 w-6 h-6 bg-white border border-earth-200 rounded flex items-center justify-center text-[10px] font-bold text-earth-400">
                                    {ayat.numberInSurah}
                                </span>
                                <p className="text-slate-600 italic text-sm leading-relaxed">
                                    {ayat.translation}
                                </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                    {/* Info Marginal */}
                    <div className="mt-8 flex justify-between px-2 text-[10px] font-bold text-earth-400 uppercase tracking-widest w-full">
                      <span>Pisantri Mushaf Edition</span>
                      <div className="flex items-center gap-4">
                        <span>Halaman {ayatList[0]?.page || 1}</span>
                        <span>Juz {ayatList[0]?.juz || 1}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>



        {/* Footer Switches */}
        <div className="bg-white border-t border-earth-100 p-3 sm:p-6 flex items-center justify-between px-4 sm:px-8 relative z-20">
          <button 
            disabled={selectedSurah <= 1}
            onClick={() => setSelectedSurah(prev => prev - 1)}
            className="flex items-center gap-1.5 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest border border-transparent hover:border-earth-200"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Sebelumnya</span>
          </button>

          <div className="flex flex-col items-center">
             <div className="w-8 sm:w-12 h-1 bg-emerald-100 rounded-full mb-1"></div>
             <div className="text-[8px] sm:text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                {currentSurah?.englishName}
             </div>
          </div>

          <button 
            disabled={selectedSurah >= 114}
            onClick={() => setSelectedSurah(prev => prev + 1)}
            className="flex items-center gap-1.5 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest border border-transparent hover:border-earth-200"
          >
            <span className="hidden xs:inline">Berikutnya</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');
        
        .font-arabic {
          line-height: 2.0 !important;
        }

        /* Responsive Mushaf Container */
        .mushaf-content {
          container-type: inline-size;
        }
        
        @container (max-width: 400px) {
          .mushaf-content .font-arabic {
            font-size: 1.5rem !important;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e0d7c0;
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c4ae78;
        }

        /* Earth Theme Colors */
        :root {
          --earth-50: #fdfcf9;
          --earth-100: #fcfbf7;
          --earth-200: #f4f1e5;
          --earth-300: #e8dfc4;
          --earth-400: #c4ae78;
          --earth-900: #3d301b;
        }
        
        .text-earth-400 { color: #c4ae78; }
        .text-earth-600 { color: #8e7a4b; }
        .text-earth-700 { color: #6d5d36; }
        .text-earth-800 { color: #4e4226; }
        .text-earth-900 { color: #3d301b; }
        .bg-earth-50 { background-color: #fdfcf9; }
        .bg-earth-100 { background-color: #fcfbf7; }
        .bg-earth-200 { background-color: #f4f1e5; }
        .bg-earth-300 { background-color: #e8dfc4; }
        .border-earth-50 { border-color: #fdfcf9; }
        .border-earth-100 { border-color: #fcfbf7; }
        .border-earth-200 { border-color: #f4f1e5; }
        .border-earth-300 { border-color: #e8dfc4; }
      `}</style>
    </div>
  );
}
