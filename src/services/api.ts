// Smart API Inference: Detect environment from hostname if VITE_API_URL is missing
const getInferredApiConfig = () => {
  const hostname = window.location.hostname;
  const isPestek = hostname.includes('pesantrenteknologi');
  const isPondok = hostname.includes('pondokinformatika') || hostname.includes('pisantri.online');
  const isDev = hostname.includes('dev.') || hostname.includes('dev--');
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  // Hardcoded production defaults
  const PROD_API = 'https://api.pondokinformatika.id';
  const DEV_API = 'https://api-dev.pondokinformatika.id';

  // Use canonical tenant names consistently
  const inferredTenant = isPestek ? 'pestek' : 'pondok_informatika';

  // Local development fallback priority:
  // 1. VITE_API_URL from .env
  // 2. http://localhost:8000 (Laravel Default)
  // 3. Remote Dev API
  const localApiDefault = 'http://localhost:8000';
  const inferredApi = isDev ? DEV_API : (isPondok || isPestek ? PROD_API : (isLocal ? (import.meta.env.VITE_API_URL || localApiDefault) : (import.meta.env.VITE_API_URL || DEV_API)));

  const config = {
    apiBase: inferredApi,
    tenant: isLocal ? (import.meta.env.VITE_TENANT_ID || 'pondok_informatika') : inferredTenant,
    source: isLocal ? 'Local (Env/Default)' : 'Production Inferred'
  };

  if (!isLocal) {
    console.info(`[ApiService] 🌐 Domain: ${hostname} | Inferred Tenant: ${config.tenant} `);
  }
  return config;
};

const _config = getInferredApiConfig();
export const API_BASE_URL = _config.apiBase.replace(/\/$/, '');

// Smart API_URL: Ensure we don't end up with /api/api if someone hardcodes it elsewhere
export const API_URL = `${API_BASE_URL}/api`;
export const TENANT_ID = _config.tenant;

// Log version to help with cache debugging
console.log('%c[ApiService] Version: 1.0.5 (Aggressive Inference + Path Fix)', 'color: #10b981; font-weight: bold;');

// Helper to get auth token
export function getToken(): string | null {
  try {
    const token = localStorage.getItem('pisantri_token') || localStorage.getItem('ppdb_token');
    if (token && token !== 'undefined' && token !== 'null' && token.length > 10) {
      return token;
    }
  } catch (e) {
    console.warn('[ApiService] Error reading token from localStorage', e);
  }
  return null;
}

export const getHeaders = (includeContentType = false): Record<string, string> => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'X-Tenant-ID': TENANT_ID,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// Public headers (no auth token) for public endpoints
export const getPublicHeaders = (): Record<string, string> => {
  return {
    'Accept': 'application/json',
    'X-Tenant-ID': TENANT_ID,
  };
};

interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    photo: string | null;
    santri_id?: number;
    status_santri?: 'Daftar' | 'Mondok' | 'Alumni' | 'Mengabdi' | 'Keluar';
  };
  token: string;
}

interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  photo: string | null;
  santri_id?: number;
  status_santri?: 'Daftar' | 'Mondok' | 'Alumni' | 'Mengabdi' | 'Keluar';
}

class ApiService {
  constructor() {
  }

  getBaseUrl() {
    return API_BASE_URL;
  }

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem('pisantri_token', token);
    } else {
      localStorage.removeItem('pisantri_token');
    }
  }

  getToken(): string | null {
    return getToken();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const isFormData = options.body instanceof FormData;

    const headers: HeadersInit = {
      'Accept': 'application/json',
      ...options.headers,
    };

    // Only set Content-Type for non-FormData requests
    if (!isFormData) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    // Add X-Tenant-ID header for multi-tenant support
    const tenantId = TENANT_ID;
    if (tenantId && tenantId !== 'undefined' && tenantId !== 'null') {
      (headers as Record<string, string>)['X-Tenant-ID'] = tenantId;
    }

    // Always read token fresh from localStorage
    const currentToken = getToken();
    if (currentToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${currentToken}`;
    }

    // Standardize the endpoint path
    let cleanEndpoint = endpoint;
    if (cleanEndpoint.startsWith('/api/')) {
      cleanEndpoint = cleanEndpoint.substring(4); // Remove leading /api
    } else if (cleanEndpoint.startsWith('api/')) {
      cleanEndpoint = cleanEndpoint.substring(3); // Remove leading api
    }

    if (!cleanEndpoint.startsWith('/')) {
      cleanEndpoint = `/${cleanEndpoint}`;
    }

    const fullUrl = `${API_URL}${cleanEndpoint}`;

    // DEBUG: Log request details if 401 occurs
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Clear local session on 401 to prevent infinite redirect loops or persistent 401s
        localStorage.removeItem('pisantri_token');
        localStorage.removeItem('ppdb_token');
        localStorage.removeItem('ppdb_user');
        localStorage.removeItem('pisantri_user');

        const diagnostics = {
          url: fullUrl,
          tenant_header: (headers as any)['X-Tenant-ID'],
          auth_header_present: !!(headers as any)['Authorization'],
          token_preview: currentToken ? `${currentToken.substring(0, 10)}...` : 'none',
          env_api_url: import.meta.env.VITE_API_URL,
          env_tenant_id: import.meta.env.VITE_TENANT_ID,
          hostname: window.location.hostname,
          inferred_api: API_URL,
          inferred_tenant: TENANT_ID,
          timestamp: new Date().toISOString()
        };

        console.group('%c[ApiService] 401 Unauthorized Diagnostic', 'color: white; background: red; font-weight: bold; padding: 2px 5px;');
        console.error(`401 Unauthorized: ${cleanEndpoint}`);
        console.table(diagnostics);

        // Tenant Sanity Check
        const expectedTenant = window.location.hostname.includes('pesantrenteknologi') ? 'pestek' : 'pondok_informatika';
        if (TENANT_ID !== expectedTenant && !window.location.hostname.includes('localhost')) {
          console.error(`[ApiService] 🚨 Tenant Mismatch Detected! Site is ${window.location.hostname} but TENANT_ID is ${TENANT_ID}. Expected ${expectedTenant}.`);
          console.warn('This usually means the build environment variables (VITE_TENANT_ID) were not correctly set during build.');
        }
        console.groupEnd();
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Generic GET request
  async get(endpoint: string, options: RequestInit = {}): Promise<any> {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  // Generic POST request
  async post(endpoint: string, body?: any, options: RequestInit = {}): Promise<any> {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  // Generic PUT request
  async put(endpoint: string, body?: any, options: RequestInit = {}): Promise<any> {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // Generic DELETE request
  async delete(endpoint: string, options: RequestInit = {}): Promise<any> {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      this.setToken(response.data.token);
      return response.data;
    }

    throw new Error(response.message || 'Login gagal');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getMe(): Promise<UserResponse> {
    const response = await this.request<UserResponse>('/auth/me');
    if (response.data) {
      return response.data;
    }
    throw new Error('Gagal mengambil data user');
  }

  async ping(): Promise<boolean> {
    try {
      await this.request('/ping');
      return true;
    } catch {
      return false;
    }
  }

  // Dashboard APIs
  async getDashboardAdmin(): Promise<any> {
    const response = await this.request<any>('/dashboard/admin');
    return response;
  }

  async getDashboardAkademik(): Promise<any> {
    const response = await this.request<any>('/dashboard/akademik');
    return response;
  }

  async getDashboardSantri(santriId: number): Promise<any> {
    const response = await this.request<any>(`/dashboard/santri/${santriId}`);
    return response;
  }

  async getDashboardMusyrif(): Promise<any> {
    const response = await this.request<any>('/dashboard/musyrif');
    return response;
  }

  async getDashboardAsrama(): Promise<any> {
    const response = await this.request<any>('/dashboard/asrama');
    return response;
  }

  async getDashboardKoperasi(): Promise<any> {
    const response = await this.request<any>('/dashboard/koperasi');
    return response;
  }

  async getDashboardStats(): Promise<any> {
    const response = await this.request<any>('/dashboard/stats');
    return response.data;
  }

  // Rapor Management APIs
  async getRaporManagementRealtime(periode: string): Promise<any> {
    return this.request<any>(`/admin/rapor-management/realtime?periode=${periode}`);
  }

  async getRaporManagementSemester(year: number, semester: number): Promise<any> {
    return this.request<any>(`/admin/rapor-management/semester?year=${year}&semester=${semester}`);
  }

  async tanggapiMasukan(id: number, tanggapan: string, status: string = 'diterima'): Promise<any> {
    return this.request<any>(`/masukan/${id}/tanggapi`, {
      method: 'PUT',
      body: JSON.stringify({ tanggapan, status }),
    });
  }

  // Santri APIs
  async getSantriList(params?: { status?: string; angkatan?: number; search?: string; per_page?: number }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.angkatan) searchParams.append('angkatan', params.angkatan.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/santri?${queryString}` : '/santri';
    const response = await this.request<any>(endpoint);
    return response.data;
  }

  async getSantriDetail(id: number): Promise<any> {
    const response = await this.request<any>(`/santri/${id}`);
    return response.data;
  }

  async getSantriTahfidz(id: number): Promise<any> {
    const response = await this.request<any>(`/santri/${id}/tahfidz`);
    return response.data;
  }

  async getSantriPresensi(id: number, bulan?: string): Promise<any> {
    const endpoint = bulan ? `/santri/${id}/presensi?bulan=${bulan}` : `/santri/${id}/presensi`;
    const response = await this.request<any>(endpoint);
    return response.data;
  }

  // Master Data APIs
  async getMasterAngkatan(): Promise<any> {
    const response = await this.request<any>('/master/angkatan');
    // API returns array directly or { data: [...] }
    return Array.isArray(response) ? response : (response.data || []);
  }

  async getMasterKonsentrasi(): Promise<any> {
    const response = await this.request<any>('/master/konsentrasi');
    // API returns array directly or { data: [...] }
    return Array.isArray(response) ? response : (response.data || []);
  }

  async createSantri(data: any): Promise<any> {
    const response = await this.request<any>('/santri', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async updateSantri(id: number, data: any): Promise<any> {
    const response = await this.request<any>(`/santri/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  async deleteSantri(id: number): Promise<any> {
    const response = await this.request<any>(`/santri/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  // Presensi APIs
  async getPresensiHariIni(tanggal?: string): Promise<any> {
    const endpoint = tanggal ? `/presensi/hari-ini?tanggal=${tanggal}` : '/presensi/hari-ini';
    const response = await this.request<any>(endpoint);
    return response;
  }

  async getPresensiRekap(tanggal?: string): Promise<any> {
    const endpoint = tanggal ? `/presensi/rekap?tanggal=${tanggal}` : '/presensi/rekap';
    const response = await this.request<any>(endpoint);
    return response;
  }

  async getPresensiList(params?: { tanggal?: string; santri_id?: number; agenda_id?: number }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.tanggal) searchParams.append('tanggal', params.tanggal);
    if (params?.santri_id) searchParams.append('santri_id', String(params.santri_id));
    if (params?.agenda_id) searchParams.append('agenda_id', String(params.agenda_id));
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/presensi?${queryString}` : '/presensi';
    const response = await this.request<any>(endpoint);
    return response;
  }

  async getPresensiSkoring(santriId: number, pekanan?: boolean, bulan?: string): Promise<any> {
    const params = new URLSearchParams();
    if (pekanan) params.append('pekanan', 'true');
    if (bulan) params.append('bulan', bulan);
    const queryString = params.toString();
    const endpoint = queryString ? `/presensi/skoring/${santriId}?${queryString}` : `/presensi/skoring/${santriId}`;
    const response = await this.request<any>(endpoint);
    return response;
  }

  async createPresensi(santriId: number, agendaId: number, tanggal?: string, waktu?: string): Promise<any> {
    const body: any = { santri: santriId, agenda: agendaId };
    if (tanggal) body.tanggal = tanggal;
    if (waktu) body.waktu = waktu;
    const response = await this.request<any>('/presensi', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return response;
  }

  async deletePresensi(id: number): Promise<any> {
    const response = await this.request<any>(`/presensi/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  async updatePresensi(id: number, waktu: string): Promise<any> {
    const response = await this.request<any>(`/presensi/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ waktu }),
    });
    return response;
  }

  async getMasterAgenda(): Promise<any> {
    const response = await this.request<any>('/master/agenda/harian');
    // API returns array directly, not wrapped in data
    return Array.isArray(response) ? response : (response.data || response);
  }

  async uploadFotoSantri(id: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('foto', file);
    return this.post(`/santri/${id}/foto`, formData);
  }

  // Tahfidz APIs
  async getTahfidzList(params?: { tanggal?: string; santri_id?: number | string; status?: string; page?: number; per_page?: number }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.tanggal) searchParams.append('tanggal', params.tanggal);
    if (params?.santri_id) searchParams.append('santri_id', params.santri_id.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/tahfidz?${queryString}` : '/tahfidz';
    const response = await this.request<any>(endpoint);
    return response;
  }

  async getTahfidzDetail(id: number): Promise<any> {
    const response = await this.request<any>(`/tahfidz/${id}`);
    return response.data;
  }

  async createTahfidz(data: any): Promise<any> {
    const response = await this.request<any>('/tahfidz', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async updateTahfidz(id: number, data: any): Promise<any> {
    const response = await this.request<any>(`/tahfidz/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  async deleteTahfidz(id: number): Promise<any> {
    const response = await this.request<any>(`/tahfidz/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  async getTahfidzRekap(santriId: number): Promise<any> {
    const response = await this.request<any>(`/tahfidz/rekap/${santriId}`);
    return response;
  }

  async getTahfidzBelumSetor(): Promise<any> {
    const response = await this.request<any>('/tahfidz/belum-setor');
    return response;
  }

  async getMasterWaktuNyetor(): Promise<any> {
    const response = await this.request<any>('/master/waktu-nyetor');
    return response.data;
  }

  async getMasterNilaiTahfidz(): Promise<any> {
    const response = await this.request<any>('/master/nilai-tahfidz');
    return response.data;
  }

  async getMasterMusyrif(): Promise<any> {
    const response = await this.request<any>('/master/musyrif');
    return response.data;
  }

  async getMasterJabatan(): Promise<any> {
    const response = await this.request<any>('/master/jabatan');
    return Array.isArray(response) ? response : (response.data || []);
  }

  async getKepengelolaan(): Promise<any> {
    const response = await this.request<any>('/crud/kepengelolaan');
    // CRUD API returns { success: true, data: { items: [...], total, per_page, ... } }
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    // GenericCrudController returns paginated response with 'items' key
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    return [];
  }

  // ==================== JABATAN CRUD ====================
  async createJabatan(nama_jabatan: string): Promise<any> {
    const response = await this.request<any>('/crud/jabatan', {
      method: 'POST',
      body: JSON.stringify({ nama_jabatan, proker: 0 }),
    });
    return response;
  }

  async updateJabatan(id: number, nama_jabatan: string): Promise<any> {
    const response = await this.request<any>(`/crud/jabatan/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nama_jabatan }),
    });
    return response;
  }

  async deleteJabatan(id: number): Promise<any> {
    const response = await this.request<any>(`/crud/jabatan/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  // ==================== KEPENGELOLAAN (Santri-Jabatan Assignment) ====================
  async assignSantriToJabatan(santriId: number, jabatanId: number): Promise<any> {
    const response = await this.request<any>('/crud/kepengelolaan', {
      method: 'POST',
      body: JSON.stringify({ pejabat: santriId, jabatan: jabatanId, angkatan: 0 }),
    });
    return response;
  }

  async unassignSantriFromJabatan(kepengelolaanId: number): Promise<any> {
    const response = await this.request<any>(`/crud/kepengelolaan/${kepengelolaanId}`, {
      method: 'DELETE',
    });
    return response;
  }

  async findKepengelolaanBySantri(santriId: number): Promise<any> {
    // Get kepengelolaan entry for a specific santri
    const allKepengelolaan = await this.getKepengelolaan();
    return allKepengelolaan.find((k: any) => k.pejabat === santriId);
  }

  // ==================== ROADMAP ====================
  async getRoadmaps(konsentrasi?: number): Promise<any> {
    const params = konsentrasi ? `?konsentrasi=${konsentrasi}` : '';
    const response = await this.request<any>(`/roadmap${params}`);
    return response.data;
  }

  async getRoadmapDetail(id: number): Promise<any> {
    const response = await this.request<any>(`/roadmap/${id}`);
    return response.data;
  }

  async getRoadmapStats(): Promise<any> {
    const response = await this.request<any>('/roadmap/stats');
    return response.data;
  }

  async getRoadmapProgress(santriId: number, roadmapId: number): Promise<any> {
    const response = await this.request<any>(`/roadmap/santri/${santriId}/progress/${roadmapId}`);
    return response.data;
  }

  async updateRoadmapProgress(data: { santri_id: number; topic_id: number; status: string; catatan?: string }): Promise<any> {
    const response = await this.request<any>('/roadmap/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async getRoadmapCourses(roadmapId: number): Promise<any> {
    const response = await this.request<any>(`/roadmap/${roadmapId}/courses`);
    return response.data;
  }

  // Admin Roadmap
  async createRoadmap(data: any): Promise<any> {
    const response = await this.request<any>('/roadmap-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async updateRoadmap(id: number, data: any): Promise<any> {
    const response = await this.request<any>(`/roadmap-admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  async deleteRoadmap(id: number): Promise<any> {
    const response = await this.request<any>(`/roadmap-admin/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  async createRoadmapSection(roadmapId: number, data: any): Promise<any> {
    const response = await this.request<any>(`/roadmap-admin/${roadmapId}/sections`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async updateRoadmapSection(roadmapId: number, sectionId: number, data: any): Promise<any> {
    const response = await this.request<any>(`/roadmap-admin/${roadmapId}/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  async deleteRoadmapSection(roadmapId: number, sectionId: number): Promise<any> {
    const response = await this.request<any>(`/roadmap-admin/${roadmapId}/sections/${sectionId}`, {
      method: 'DELETE',
    });
    return response;
  }

  async createRoadmapTopic(sectionId: number, data: any): Promise<any> {
    const response = await this.request<any>(`/roadmap-admin/sections/${sectionId}/topics`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async updateRoadmapTopic(sectionId: number, topicId: number, data: any): Promise<any> {
    const response = await this.request<any>(`/roadmap-admin/sections/${sectionId}/topics/${topicId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  async deleteRoadmapTopic(sectionId: number, topicId: number): Promise<any> {
    const response = await this.request<any>(`/roadmap-admin/sections/${sectionId}/topics/${topicId}`, {
      method: 'DELETE',
    });
    return response;
  }

  async linkCourseToTopic(courseId: number, topicId: number): Promise<any> {
    const response = await this.request<any>('/roadmap-admin/link-course', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId, topic_id: topicId }),
    });
    return response;
  }

  // ============================================
  // TIME TRACKING API
  // ============================================

  // Santri Tracking
  async getTrackingToday(): Promise<any> {
    return this.request<any>('/tracking/today', { method: 'GET' });
  }

  async startTracking(data: { rencana_belajar: string; kategori_rencana?: string; target_durasi?: number; link_referensi?: string }): Promise<any> {
    return this.request<any>('/tracking/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async pauseTracking(): Promise<any> {
    return this.request<any>('/tracking/pause', { method: 'PUT' });
  }

  async resumeTracking(): Promise<any> {
    return this.request<any>('/tracking/resume', { method: 'PUT' });
  }

  async endTracking(): Promise<any> {
    return this.request<any>('/tracking/end', { method: 'PUT' });
  }

  async submitTracking(data: { hasil_belajar: string; link_hasil?: string; kendala?: string }): Promise<any> {
    return this.request<any>('/tracking/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTrackingHistory(): Promise<any> {
    return this.request<any>('/tracking/history', { method: 'GET' });
  }

  async getTrackingStats(): Promise<any> {
    return this.request<any>('/tracking/stats', { method: 'GET' });
  }

  async getTrackingLeaderboard(): Promise<any> {
    return this.request<any>('/tracking/leaderboard', { method: 'GET' });
  }

  async generateTrackingToken(): Promise<any> {
    return this.request<any>('/tracking/device/token', { method: 'GET' });
  }

  // Admin Tracking
  async getTrackingRealtime(): Promise<any> {
    return this.request<any>('/tracking/admin/realtime', { method: 'GET' });
  }

  async getTrackingReports(params?: { status?: string; tanggal?: string }): Promise<any> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any>(`/tracking/admin/reports${query ? `?${query}` : ''}`, { method: 'GET' });
  }

  async getTrackingReportDetail(id: number): Promise<any> {
    return this.request<any>(`/tracking/admin/reports/${id}`, { method: 'GET' });
  }

  async reviewTracking(id: number, data: { status: string; note?: string }): Promise<any> {
    return this.request<any>(`/tracking/admin/review/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getTrackingAnalytics(params?: { start_date?: string; end_date?: string }): Promise<any> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any>(`/tracking/admin/analytics${query ? `?${query}` : ''}`, { method: 'GET' });
  }

  async getTrackingViolations(params?: { status?: string; tipe?: string }): Promise<any> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any>(`/tracking/admin/violations${query ? `?${query}` : ''}`, { method: 'GET' });
  }

  async reviewViolation(id: number, data: { status: string; note?: string }): Promise<any> {
    return this.request<any>(`/tracking/admin/violations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getTrackingDevices(): Promise<any> {
    return this.request<any>('/tracking/admin/devices', { method: 'GET' });
  }

  async revokeTrackingDevice(id: number): Promise<any> {
    return this.request<any>(`/tracking/admin/devices/${id}`, { method: 'DELETE' });
  }

  // ==================== MANAGEMENT PROKER & JOBDESK ====================
  async getManagementProker(): Promise<any> {
    const response = await this.request<any>('/management/proker');
    return response;
  }

  async getManagementProkerByJabatan(): Promise<any> {
    const response = await this.request<any>('/management/proker/by-jabatan');
    return response.data;
  }

  async createProker(data: {
    nama_proker: string;
    deskripsi_proker?: string;
    tgl_pelaksanaan?: string;
    thn_proker?: string;
    sasaran_proker?: string;
    status_proker?: string;
    divisi_proker: number;
    proyeksi?: number;
  }): Promise<any> {
    return this.request<any>('/management/proker', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProker(id: number, data: any): Promise<any> {
    return this.request<any>(`/management/proker/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateProkerStatus(id: number, status_proker: string): Promise<any> {
    return this.request<any>(`/management/proker/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status_proker }),
    });
  }

  async deleteProker(id: number): Promise<any> {
    return this.request<any>(`/management/proker/${id}`, {
      method: 'DELETE',
    });
  }

  async saveJobDesc(data: { jabatan_id: number; deskripsi?: string; tanggung_jawab?: string; wewenang?: string }): Promise<any> {
    return this.request<any>('/management/jobdesk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProkerByDivision(division: string): Promise<any> {
    return this.request<any>(`/management/proker/division/${division}`);
  }

  // ==================== QURAN BOOKMARK ====================
  async getQuranBookmarks(): Promise<any> {
    const response = await this.request<any>('/santri-feature/quran-bookmark');
    return response;
  }

  async saveQuranBookmark(surah_number: number, ayat_number: number): Promise<any> {
    const tanggal = new Date().toISOString().split('T')[0];
    return this.request<any>('/santri-feature/quran-bookmark', {
      method: 'POST',
      body: JSON.stringify({ surah_number, ayat_number, tanggal }),
    });
  }

  async deleteQuranBookmark(id: number): Promise<any> {
    return this.request<any>(`/santri-feature/quran-bookmark/${id}`, { method: 'DELETE' });
  }

  async deleteAllQuranBookmarks(keepLast: boolean = false): Promise<any> {
    const params = keepLast ? '?keep_last=true' : '';
    return this.request<any>(`/santri-feature/quran-bookmark${params}`, { method: 'DELETE' });
  }

  // ==================== CALENDAR & AGGREGATOR ====================
  async getCalendarSettings(): Promise<any> {
    return this.get('/settings/calendar');
  }

  async updateCalendarSettings(data: { calendar_authorized_jabatans: number[] }): Promise<any> {
    return this.post('/settings/calendar', data);
  }

  // Calendar APIs
  async getCalendarEvents(start_date?: string, end_date?: string): Promise<any> {
    const params = new URLSearchParams();
    if (start_date) params.append('start_date', start_date);
    if (start_date) params.append('end_date', end_date || '');
    const queryString = params.toString();
    const endpoint = queryString ? `/calendar?${queryString}` : '/calendar';
    return this.request<any>(endpoint);
  }

  async getMonthEvents(month: number, year: number): Promise<any> {
    return this.get(`/calendar/month?month=${month}&year=${year}`);
  }

  async getDailyPulse(date: string): Promise<any> {
    return this.get(`/calendar/pulse?date=${date}`);
  }

  async getCalendarEvent(id: number): Promise<any> {
    return this.request<any>(`/calendar/${id}`);
  }

  async saveCalendarEvent(data: any): Promise<any> {
    return this.post('/calendar', data);
  }

  async updateCalendarEvent(id: number, data: any): Promise<any> {
    return this.put(`/calendar/${id}`, data);
  }

  async deleteCalendarEvent(id: number): Promise<any> {
    return this.delete(`/calendar/${id}`);
  }

  async getWhatsappDailyReport(date?: string): Promise<any> {
    const endpoint = date ? `/dashboard/daily-report?date=${date}` : '/dashboard/daily-report';
    return this.get(endpoint);
  }
}

export const api = new ApiService();
export type { LoginResponse, UserResponse, ApiResponse };
