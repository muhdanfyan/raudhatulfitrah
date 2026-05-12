export type UserRole = 'superadmin' | 'akademik' | 'pembinaan' | 'asrama' | 'musyrif' | 'santri' | 'koperasi' | 'mentor' | 'ortu' | 'kepsek';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photo?: string;
  santri_id?: number;
  status_santri?: 'Daftar' | 'Mondok' | 'Alumni' | 'Mengabdi' | 'Keluar';
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  token: string | null;
  loading: boolean;
}

export interface DashboardStats {
  santriCount: number;
  absensiCount: number;
  sanksiCount: number;
  izinCount: number;
  kasBalance: number;
  masukanCount: number;
  inventarisCount: number;
  agendaCount: number;
}

export interface Santri {
  id: string;
  name: string;
  photo?: string;
  kelas?: string;
  asrama?: string;
  concentration?: string;
}

export interface TahfidzRecord {
  id: string;
  santriId: string;
  santriName: string;
  hafalan: string;
  score: number;
  musyrif: string;
  date: string;
}

export interface PresenceRecord {
  id: string;
  santriId: string;
  time: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
  date: string;
}

export interface ComplaintRecord {
  id: string;
  santriId: string;
  santriName: string;
  complaint: string;
  department: string;
  response?: string;
  status: 'pending' | 'processed' | 'resolved';
  date: string;
}
