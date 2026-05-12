// Date Utility - menggunakan tanggal lokal, bukan UTC

/**
 * Mendapatkan tanggal lokal dalam format YYYY-MM-DD
 * Menghindari masalah timezone dengan toISOString() yang selalu UTC
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Mendapatkan tanggal lokal dengan offset hari
 * @param days - jumlah hari (positif = masa depan, negatif = masa lalu)
 */
export const getLocalDateWithOffset = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
};

/**
 * Cek apakah tanggal sama dengan hari ini (lokal)
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getLocalDateString();
};
