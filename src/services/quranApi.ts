/**
 * Quran API Service
 * Using Al-Quran Cloud API (https://alquran.cloud/api)
 * Free, no API key required, CORS enabled
 */

export interface QuranAyat {
  number: number;
  numberInSurah: number;
  text: string;
  translation?: string;
  juz: number;
  page: number;
}

export interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface AlQuranCloudAyat {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
}

// AlQuranCloudResponse interface - kept for reference
// Used internally by the API but not exported

interface AlQuranEditionsResponse {
  code: number;
  status: string;
  data: Array<{
    number: number;
    name: string;
    englishName: string;
    numberOfAyahs: number;
    ayahs: AlQuranCloudAyat[];
  }>;
}

// Cache untuk menyimpan data surah yang sudah di-fetch
const surahCache: Map<string, QuranAyat[]> = new Map();

// Mapping nama surah Indonesia ke nomor
const SURAH_NAME_TO_NUMBER: Record<string, number> = {
  "Al-Fatihah": 1, "Al-Baqarah": 2, "Ali Imran": 3, "An-Nisa": 4, "Al-Maidah": 5,
  "Al-Anam": 6, "Al-A'raf": 7, "Al-Anfal": 8, "At-Taubah": 9, "Yunus": 10,
  "Hud": 11, "Yusuf": 12, "Ar-Ra'd": 13, "Ibrahim": 14, "Al-Hijr": 15,
  "An-Nahl": 16, "Al-Isra": 17, "Al-Kahf": 18, "Maryam": 19, "Ta Ha": 20,
  "Al-Anbiya": 21, "Al-Hajj": 22, "Al-Mu'minun": 23, "An-Nur": 24, "Al-Furqan": 25,
  "Asy-Syuara": 26, "An-Naml": 27, "Al-Qasas": 28, "Al-Ankabut": 29, "Ar-Rum": 30,
  "Luqman": 31, "As-Sajdah": 32, "Al-Ahzab": 33, "Saba'": 34, "Fatir": 35,
  "Ya Sin": 36, "As-Saffat": 37, "Sad": 38, "Az-Zumar": 39, "Ghafir": 40,
  "Fussilat": 41, "Asy-Syura": 42, "Az-Zukhruf": 43, "Ad-Dukhan": 44, "Al-Jasiyah": 45,
  "Al-Ahqaf": 46, "Muhammad": 47, "Al-Fath": 48, "Al-Hujurat": 49, "Qaf": 50,
  "Az-Zariyat": 51, "At-Tur": 52, "An-Najm": 53, "Al-Qamar": 54, "Ar-Rahman": 55,
  "Al-Waqi'ah": 56, "Al-Hadid": 57, "Al-Mujadilah": 58, "Al-Hasyr": 59, "Al-Mumtahanah": 60,
  "As-Saff": 61, "Al-Jumu'ah": 62, "Al-Munafiqun": 63, "At-Tagabun": 64, "At-Talaq": 65,
  "At-Tahrim": 66, "Al-Mulk": 67, "Al-Qalam": 68, "Al-Haqqah": 69, "Al-Ma'arij": 70,
  "Nuh": 71, "Al-Jinn": 72, "Al-Muzzammil": 73, "Al-Muddassir": 74, "Al-Qiyamah": 75,
  "Al-Insan": 76, "Al-Mursalat": 77, "An-Naba'": 78, "An-Nazi'at": 79, "Abasa": 80,
  "At-Takwir": 81, "Al-Infitar": 82, "Al-Muthaffifiyn": 83, "Al-Insyiqaq": 84, "Al-Buruj": 85,
  "At-Tariq": 86, "Al-A'la": 87, "Al-Gasyiyah": 88, "Al-Fajr": 89, "Al-Balad": 90,
  "Asy-Syams": 91, "Al-Lail": 92, "Ad-Duha": 93, "Al-Insyirah": 94, "At-Tin": 95,
  "Al-Alaq": 96, "Al-Qadr": 97, "Al-Bayyinah": 98, "Az-Zalzalah": 99, "Al-Adiyat": 100,
  "Al-Qariah": 101, "At-Takasur": 102, "Al-Asr": 103, "Al-Humazah": 104, "Al-Fil": 105,
  "Quraisy": 106, "Al-Ma'un": 107, "Al-Kausar": 108, "Al-Kafirun": 109, "An-Nasr": 110,
  "Al-Lahab": 111, "Al-Ikhlas": 112, "Al-Falaq": 113, "An-Nas": 114
};

/**
 * Get surah number from Indonesian name
 */
export function getSurahNumber(surahName: string): number {
  return SURAH_NAME_TO_NUMBER[surahName] || 0;
}

/**
 * Parse ayat range string like "1-10" or "5" into start and end numbers
 */
export function parseAyatRange(ayatStr: string): { start: number; end: number } {
  const cleaned = ayatStr.trim();
  if (cleaned.includes('-')) {
    const [start, end] = cleaned.split('-').map(s => parseInt(s.trim()));
    return { start: start || 1, end: end || start || 1 };
  }
  const num = parseInt(cleaned) || 1;
  return { start: num, end: num };
}

/**
 * Convert number to Arabic numeral
 */
export function toArabicNumber(num: number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
}

/**
 * Parse Tajweed text from API format to HTML
 * Converts formats like [h:1[ٱ] or [l[ل] to proper HTML spans
 */
export function parseTajweedText(text: string): string {
  if (!text) return '';

  // Map of tajweed code to CSS class
  const tajweedClasses: Record<string, string> = {
    'h': 'ham_wasl',         // Hamzah wasl
    'l': 'lam',              // Lam in definite article
    'n': 'idgham_no_ghunnah', // Idgham without ghunnah
    'p': 'madda_permissible', // Permissible prolongation
    's': 'slnt',             // Silent
    'q': 'qlq',              // Qalqalah
    'i': 'ikhfa',            // Ikhfa
    'f': 'ikhfa',            // Ikhfa (often 'f' in some versions)
    'g': 'ghunnah',          // Ghunnah
    'b': 'iqlab',            // Iqlab
    'm': 'idgham_ghunnah',   // Idgham with ghunnah
    'v': 'madda_permissible', // Permissible prolongation
    'a': 'madda_obligatory',  // Obligatory prolongation
    'o': 'madda_necessary',   // Necessary prolongation
    'u': 'idgham_wo_ghunnah', // Idgham without ghunnah
  };

  let result = text;

  // 1. Convert [code:num[text]] or [code[text]] into spans
  // This handles the primary tajweed markers
  result = result.replace(/\[([a-z0-9]+)(?::\d+)?\[([^\]]+)\]+\]?/g, (_match, code, content) => {
    const className = tajweedClasses[code] || 'tajweed-mark';
    return `<span class="${className}">${content}</span>`;
  });

  // 2. Clean up any remaining [code[ prefixes or loose codes like [q[ or [h:1[
  result = result.replace(/\[[a-z0-9]+(?::\d+)?\[/gi, '');

  // 3. Remove all remaining bracket characters and numeric code markers
  result = result.replace(/[\[\]]/g, '');

  // 4. Clean up any trailing code fragments that might have been left
  result = result.replace(/[a-z0-9]+:/gi, '');

  return result;
}

/**
 * Fetch surah with Arabic text and Indonesian translation
 */
export async function fetchSurahWithTranslation(surahNumber: number): Promise<QuranAyat[]> {
  const cacheKey = `surah-${surahNumber}`;

  // Check cache first
  if (surahCache.has(cacheKey)) {
    return surahCache.get(cacheKey)!;
  }

  try {
    // Fetch Arabic (Uthmani) and Indonesian translation in parallel
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,id.indonesian`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Quran data');
    }

    const data: AlQuranEditionsResponse = await response.json();

    if (data.code !== 200 || !data.data || data.data.length < 2) {
      throw new Error('Invalid response from Quran API');
    }

    const arabicData = data.data[0];
    const translationData = data.data[1];

    const ayatList: QuranAyat[] = arabicData.ayahs.map((ayat, index) => ({
      number: ayat.number,
      numberInSurah: ayat.numberInSurah,
      text: ayat.text,
      translation: translationData.ayahs[index]?.text || '',
      juz: ayat.juz,
      page: ayat.page,
    }));

    // Cache the result
    surahCache.set(cacheKey, ayatList);

    return ayatList;
  } catch (error) {
    console.error('Error fetching Quran:', error);
    throw error;
  }
}

/**
 * Fetch surah with Arabic text (Tajweed colored) and Indonesian translation
 */
export async function fetchSurahWithTajweed(surahNumber: number): Promise<QuranAyat[]> {
  const cacheKey = `surah-tajweed-${surahNumber}`;

  // Check cache first
  if (surahCache.has(cacheKey)) {
    return surahCache.get(cacheKey)!;
  }

  try {
    // Fetch Tajweed and Indonesian translation in parallel
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-tajweed,id.indonesian`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Quran data');
    }

    const data: AlQuranEditionsResponse = await response.json();

    if (data.code !== 200 || !data.data || data.data.length < 2) {
      throw new Error('Invalid response from Quran API');
    }

    const arabicData = data.data[0];
    const translationData = data.data[1];

    const ayatList: QuranAyat[] = arabicData.ayahs.map((ayat, index) => ({
      number: ayat.number,
      numberInSurah: ayat.numberInSurah,
      text: ayat.text, // Contains HTML tags for tajweed
      translation: translationData.ayahs[index]?.text || '',
      juz: ayat.juz,
      page: ayat.page,
    }));

    // Cache the result
    surahCache.set(cacheKey, ayatList);

    return ayatList;
  } catch (error) {
    console.error('Error fetching Quran Tajweed:', error);
    throw error;
  }
}

// Tajweed CSS styles - Elegant with underlines and subtle effects
export const TAJWEED_CSS = `
  /* Base tajweed styling */
  .tajweed [class^="h"], .tajweed [class*=" h"] { 
    color: #9CA3AF; 
  }
  
  /* Hamzah Wasl - Silent */
  .tajweed .ham_wasl { 
    color: #9CA3AF;
    opacity: 0.6;
  }
  
  /* Silent letters */
  .tajweed .slnt { 
    color: #9CA3AF; 
    letter-spacing: -10px;
    opacity: 0.4;
  }
  
  /* Mad/Panjang - Blue with underline wave */
  .tajweed .madda_normal { 
    color: #3B82F6;
    text-decoration: underline;
    text-decoration-style: wavy;
    text-decoration-color: rgba(59, 130, 246, 0.5);
    text-underline-offset: 4px;
  }
  .tajweed .madda_permissible { 
    color: #2563EB;
    text-decoration: underline;
    text-decoration-style: wavy;
    text-decoration-color: rgba(37, 99, 235, 0.6);
    text-underline-offset: 4px;
  }
  .tajweed .madda_necessary { 
    color: #1D4ED8;
    text-decoration: underline double;
    text-decoration-color: rgba(29, 78, 216, 0.7);
    text-underline-offset: 4px;
    font-weight: 600;
  }
  .tajweed .madda_obligatory { 
    color: #1E40AF;
    text-decoration: underline double;
    text-decoration-color: rgba(30, 64, 175, 0.8);
    text-underline-offset: 4px;
    font-weight: 700;
  }
  
  /* Qalqalah - Red bold with dot */
  .tajweed .qlq { 
    color: #EF4444;
    font-weight: 700;
    text-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
  }
  
  /* Ikhfa Marker - Green */
  .tajweed .imark, .tajweed .imark_ana, .tajweed .ikhfa { 
    color: #22C55E;
    text-decoration: underline dotted;
    text-decoration-color: rgba(34, 197, 94, 0.6);
    text-underline-offset: 4px;
  }
  
  /* Idgham - Green darker */
  .tajweed .idghaam_shafawi, .tajweed .idgham_shafawi, .tajweed .idgham_ghunnah { 
    color: #16A34A;
    text-decoration: underline;
    text-decoration-color: rgba(22, 163, 74, 0.5);
    text-underline-offset: 4px;
  }
  
  /* Idgham tanpa ghunnah */
  .tajweed .idgham_no_ghunnah, .tajweed .idgham_wo_ghunnah {
    color: #6B7280;
    text-decoration: underline;
    text-decoration-color: rgba(107, 114, 128, 0.3);
    text-underline-offset: 4px;
  }
  
  /* Ghunnah - Orange with glow */
  .tajweed .ghunnah { 
    color: #FB923C;
    font-weight: 600;
    text-shadow: 0 0 14px rgba(251, 146, 60, 0.5);
  }
  
  /* Iqlab - Cyan glow */
  .tajweed .iqlab { 
    color: #06B6D4;
    font-weight: 600;
    text-shadow: 0 0 12px rgba(6, 182, 212, 0.5);
  }
`;

/**
 * Get specific ayat range from a surah
 */
export async function getAyatRange(
  surahNumber: number,
  startAyat: number,
  endAyat: number,
  contextBefore: number = 2,
  contextAfter: number = 2
): Promise<{
  ayatList: QuranAyat[];
  totalAyat: number;
  displayStart: number;
  displayEnd: number;
  selectedStart: number;
  selectedEnd: number;
}> {
  const allAyat = await fetchSurahWithTranslation(surahNumber);
  const totalAyat = allAyat.length;

  // Calculate display range with context
  const displayStart = Math.max(1, startAyat - contextBefore);
  const displayEnd = Math.min(totalAyat, endAyat + contextAfter);

  // Filter ayat within display range
  const ayatList = allAyat.filter(
    ayat => ayat.numberInSurah >= displayStart && ayat.numberInSurah <= displayEnd
  );

  return {
    ayatList,
    totalAyat,
    displayStart,
    displayEnd,
    selectedStart: startAyat,
    selectedEnd: endAyat,
  };
}

/**
 * Get all surah list (for reference)
 */
export async function fetchSurahList(): Promise<QuranSurah[]> {
  const cacheKey = 'surah-list';

  // Try localStorage cache
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Invalid cache, continue to fetch
    }
  }

  try {
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await response.json();

    if (data.code === 200 && data.data) {
      const surahList: QuranSurah[] = data.data.map((s: any) => ({
        number: s.number,
        name: s.name,
        englishName: s.englishName,
        englishNameTranslation: s.englishNameTranslation,
        numberOfAyahs: s.numberOfAyahs,
        revelationType: s.revelationType,
      }));

      // Cache to localStorage
      localStorage.setItem(cacheKey, JSON.stringify(surahList));

      return surahList;
    }
    throw new Error('Invalid response');
  } catch (error) {
    console.error('Error fetching surah list:', error);
    throw error;
  }
}

/**
 * Clear cache (useful for memory management)
 */
export function clearQuranCache(): void {
  surahCache.clear();
}
