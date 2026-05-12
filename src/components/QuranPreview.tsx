import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, BookOpen, Eye, EyeOff, AlertCircle } from 'lucide-react';
import {
  getSurahNumber,
  parseAyatRange,
  toArabicNumber,
  getAyatRange,
  type QuranAyat,
} from '../services/quranApi';

interface QuranPreviewProps {
  surahName: string;
  ayatRange: string; // e.g., "1-10" or "5"
  showTranslation?: boolean;
  className?: string;
}

export default function QuranPreview({
  surahName,
  ayatRange,
  showTranslation: initialShowTranslation = false,
  className = '',
}: QuranPreviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ayatList, setAyatList] = useState<QuranAyat[]>([]);
  const [totalAyat, setTotalAyat] = useState(0);
  const [displayRange, setDisplayRange] = useState({ start: 1, end: 1 });
  const [selectedRange, setSelectedRange] = useState({ start: 1, end: 1 });
  const [showTranslation, setShowTranslation] = useState(initialShowTranslation);
  const [contextSize, setContextSize] = useState(2); // ayat before/after

  const surahNumber = getSurahNumber(surahName);

  const fetchAyat = useCallback(async () => {
    if (!surahNumber || !ayatRange) return;

    setLoading(true);
    setError(null);

    try {
      const { start, end } = parseAyatRange(ayatRange);
      const result = await getAyatRange(surahNumber, start, end, contextSize, contextSize);

      setAyatList(result.ayatList);
      setTotalAyat(result.totalAyat);
      setDisplayRange({ start: result.displayStart, end: result.displayEnd });
      setSelectedRange({ start: result.selectedStart, end: result.selectedEnd });
    } catch (err: any) {
      setError(err.message || 'Gagal memuat ayat');
    } finally {
      setLoading(false);
    }
  }, [surahNumber, ayatRange, contextSize]);

  useEffect(() => {
    fetchAyat();
  }, [fetchAyat]);

  const handlePrev = () => {
    if (displayRange.start <= 1) return;
    // Expand context to show more ayat before
    setContextSize((prev) => prev + 3);
  };

  const handleNext = () => {
    if (displayRange.end >= totalAyat) return;
    setContextSize((prev) => prev + 3);
  };

  const isSelected = (ayatNumber: number) => {
    return ayatNumber >= selectedRange.start && ayatNumber <= selectedRange.end;
  };

  if (!surahName || !ayatRange) {
    return null;
  }

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm ${className}`}>
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-800">{surahName}</h3>
              <p className="text-gray-500 text-xs">Ayat {ayatRange}</p>
            </div>
          </div>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showTranslation 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={showTranslation ? 'Sembunyikan terjemahan' : 'Tampilkan terjemahan'}
          >
            {showTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showTranslation ? 'Tutup' : 'Arti'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500 text-sm">Memuat ayat...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-6 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{error}</span>
            <button
              onClick={fetchAyat}
              className="ml-3 text-xs underline hover:no-underline"
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <>
            {/* Ayat Display */}
            <div className="max-h-[280px] sm:max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              <div className="space-y-3 py-1">
                {ayatList.map((ayat, index) => (
                  <div
                    key={ayat.numberInSurah}
                    className={`relative transition-all duration-200 ${
                      isSelected(ayat.numberInSurah)
                        ? ''
                        : 'opacity-40 hover:opacity-60'
                    }`}
                  >
                    {/* Ayat Card */}
                    <div
                      className={`rounded-lg px-3 py-2.5 ${
                        isSelected(ayat.numberInSurah)
                          ? 'bg-emerald-50/70 border border-emerald-200/60'
                          : 'bg-gray-50/50 border border-transparent'
                      }`}
                    >
                      {/* Arabic Text with inline number */}
                      <div dir="rtl" className="text-right">
                        <p
                          className={`font-arabic leading-[2.2] ${
                            isSelected(ayat.numberInSurah)
                              ? 'text-xl sm:text-2xl text-gray-800'
                              : 'text-lg sm:text-xl text-gray-500'
                          }`}
                          style={{ 
                            fontFamily: "'Scheherazade New', 'Traditional Arabic', 'Amiri', serif",
                            wordSpacing: '6px'
                          }}
                        >
                          {ayat.text}
                          <span
                            className={`inline-block mx-2 text-sm font-sans ${
                              isSelected(ayat.numberInSurah) ? 'text-emerald-600' : 'text-gray-400'
                            }`}
                          >
                            ﴿{toArabicNumber(ayat.numberInSurah)}﴾
                          </span>
                        </p>
                      </div>

                      {/* Translation */}
                      {showTranslation && ayat.translation && (
                        <div dir="ltr" className="text-left mt-2 pt-2 border-t border-dashed border-gray-200">
                          <p className={`text-xs leading-relaxed ${
                            isSelected(ayat.numberInSurah) ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-gray-200 text-gray-500 text-[10px] font-medium mr-1.5">
                              {ayat.numberInSurah}
                            </span>
                            <span className="italic">{ayat.translation}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Simple Separator */}
                    {index < ayatList.length - 1 && isSelected(ayat.numberInSurah) && isSelected(ayatList[index + 1]?.numberInSurah) && (
                      <div className="flex items-center justify-center my-1">
                        <div className="w-4 h-px bg-emerald-200"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Compact Navigation */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={displayRange.start <= 1}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="text-center">
                <span className="text-[10px] text-gray-400">
                  {displayRange.start}-{displayRange.end} / {totalAyat}
                </span>
                <div className="text-[10px] text-emerald-600 font-medium">
                  Setoran: {selectedRange.start}{selectedRange.start !== selectedRange.end && `-${selectedRange.end}`}
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={displayRange.end >= totalAyat}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
