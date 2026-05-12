import { useState, useEffect, useRef } from 'react';
import { API_URL, getHeaders } from '../services/api';
import { Save, Upload, Building, MapPin, Phone, Palette, Image as ImageIcon, Loader2, Trash2, Mail, Wand2, Calendar, Target } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import LandingPageSettingsTab from './LandingPageSettingsTab';
import RichTextEditor from '../components/RichTextEditor';

// Function to extract dominant color from image
const extractDominantColor = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('Canvas not supported');
        return;
      }

      // Use smaller size for faster processing
      const maxSize = 100;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Color counting with quantization
      const colorCounts: { [key: string]: { count: number; r: number; g: number; b: number } } = {};
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Skip transparent or near-white/near-black pixels
        if (a < 128) continue;
        const brightness = (r + g + b) / 3;
        if (brightness > 240 || brightness < 15) continue;
        
        // Quantize to reduce color space (group similar colors)
        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;
        const key = `${qr},${qg},${qb}`;
        
        if (!colorCounts[key]) {
          colorCounts[key] = { count: 0, r: 0, g: 0, b: 0 };
        }
        colorCounts[key].count++;
        colorCounts[key].r += r;
        colorCounts[key].g += g;
        colorCounts[key].b += b;
      }
      
      // Find the most common color
      let maxCount = 0;
      let dominantColor = { r: 37, g: 99, b: 235 }; // Default blue
      
      Object.values(colorCounts).forEach(({ count, r, g, b }) => {
        if (count > maxCount) {
          maxCount = count;
          // Average the actual colors in this bucket
          dominantColor = {
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count),
          };
        }
      });
      
      // Ensure the color is vibrant enough (increase saturation if needed)
      const max = Math.max(dominantColor.r, dominantColor.g, dominantColor.b);
      const min = Math.min(dominantColor.r, dominantColor.g, dominantColor.b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      
      // If color is too gray, boost saturation
      if (saturation < 0.3 && max > 50) {
        const factor = 1.5;
        const avg = (dominantColor.r + dominantColor.g + dominantColor.b) / 3;
        dominantColor.r = Math.min(255, Math.round(avg + (dominantColor.r - avg) * factor));
        dominantColor.g = Math.min(255, Math.round(avg + (dominantColor.g - avg) * factor));
        dominantColor.b = Math.min(255, Math.round(avg + (dominantColor.b - avg) * factor));
      }
      
      // Convert to hex
      const toHex = (n: number) => n.toString(16).padStart(2, '0');
      const hexColor = `#${toHex(dominantColor.r)}${toHex(dominantColor.g)}${toHex(dominantColor.b)}`;
      
      resolve(hexColor);
    };
    
    img.onerror = () => reject('Failed to load image');
    img.src = imageUrl;
  });
};


interface Settings {
  app_name: string;
  app_short_name: string;
  app_tagline: string;
  app_color: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  app_logo: string;
  app_logo_url?: string;
  feature_akademik: string;
  feature_koperasi: string;
  feature_asrama: string;
  feature_pembinaan: string;
  feature_keuangan: string;
}

interface CalendarSettings {
  calendar_authorized_jabatans: number[];
}

interface Jabatan {
  id_jabatan: number;
  nama_jabatan: string;
}

type ProgramSantri = 'mondok' | 'reguler' | 'online' | 'afterschool';

interface RequirementSettings {
  req_week_start_day: number;
  req_target_review: number;
  req_target_portfolio: number;
  req_target_hafalan: number;
  req_target_murojaah: number;
  req_target_murojaah_lama: number;
  req_target_murojaah_pekanan: number;
  req_target_tasmi: number;
  req_target_tulisan: number;
  req_target_sanksi: number;
  req_target_skoring: number;
  req_min_nilai_bobot: number;
  week_start_day_label?: string;
  week_end_day_label?: string;
  // Programs per requirement
  req_target_review_programs?: ProgramSantri[];
  req_target_portfolio_programs?: ProgramSantri[];
  req_target_hafalan_programs?: ProgramSantri[];
  req_target_murojaah_programs?: ProgramSantri[];
  req_target_murojaah_lama_programs?: ProgramSantri[];
  req_target_murojaah_pekanan_programs?: ProgramSantri[];
  req_target_tasmi_programs?: ProgramSantri[];
  req_target_tulisan_programs?: ProgramSantri[];
  req_target_sanksi_programs?: ProgramSantri[];
  req_target_skoring_programs?: ProgramSantri[];
  available_programs?: ProgramSantri[];
}

const defaultSettings: Settings = {
  app_name: 'Pondok Pesantren Informatika',
  app_short_name: 'PISANTRI',
  app_tagline: 'Sistem Informasi Pondok Pesantren',
  app_color: '#2563eb',
  contact_phone: '',
  contact_email: '',
  contact_address: '',
  app_logo: '',
  feature_akademik: '1',
  feature_koperasi: '1',
  feature_asrama: '1',
  feature_pembinaan: '1',
  feature_keuangan: '1',
};

const defaultRequirementSettings: RequirementSettings = {
  req_week_start_day: 5,
  req_target_review: 2,
  req_target_portfolio: 1,
  req_target_hafalan: 5,
  req_target_murojaah: 0,
  req_target_murojaah_lama: 0,
  req_target_murojaah_pekanan: 0,
  req_target_tasmi: 0,
  req_target_tulisan: 1,
  req_target_sanksi: 0,
  req_target_skoring: 330,
  req_min_nilai_bobot: 2,
  req_target_review_programs: ['mondok', 'reguler', 'afterschool'],
  req_target_portfolio_programs: ['mondok', 'reguler', 'afterschool'],
  req_target_hafalan_programs: ['mondok'],
  req_target_murojaah_programs: ['mondok'],
  req_target_murojaah_lama_programs: ['mondok'],
  req_target_murojaah_pekanan_programs: ['mondok'],
  req_target_tasmi_programs: ['mondok'],
  req_target_tulisan_programs: ['mondok', 'reguler'],
  req_target_sanksi_programs: ['mondok', 'reguler', 'afterschool'],
  req_target_skoring_programs: ['mondok', 'reguler', 'afterschool'],
  available_programs: ['mondok', 'reguler', 'online', 'afterschool'],
};

const programLabels: Record<ProgramSantri, string> = {
  mondok: 'Mondok',
  reguler: 'Reguler',
  online: 'Online',
  afterschool: 'Afterschool',
};

const nilaiOptions = [
  { value: 0, label: 'Dhoif', color: 'text-red-600' },
  { value: 1, label: 'Naqish', color: 'text-orange-600' },
  { value: 2, label: 'Maqbul', color: 'text-yellow-600' },
  { value: 3, label: 'Jayyid', color: 'text-lime-600' },
  { value: 4, label: 'Jayyid Jiddan', color: 'text-green-600' },
  { value: 5, label: 'Mumtaz', color: 'text-emerald-600' },
];

const dayOptions = [
  { value: 0, label: 'Minggu' },
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' },
];

const ProgramCheckboxes = ({ 
  programs, 
  onChange, 
  availablePrograms = ['mondok', 'reguler', 'online', 'afterschool'] as ProgramSantri[]
}: { 
  programs: ProgramSantri[]; 
  onChange: (programs: ProgramSantri[]) => void;
  availablePrograms?: ProgramSantri[];
}) => {
  const toggle = (p: ProgramSantri) => {
    if (programs.includes(p)) {
      onChange(programs.filter(x => x !== p));
    } else {
      onChange([...programs, p]);
    }
  };
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {availablePrograms.map(p => (
        <button
          key={p}
          type="button"
          onClick={() => toggle(p)}
          className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
            programs.includes(p) 
              ? 'bg-gray-800 text-white border-gray-800' 
              : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
          }`}
        >
          {programLabels[p]}
        </button>
      ))}
    </div>
  );
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [reqSettings, setReqSettings] = useState<RequirementSettings>(defaultRequirementSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'umum' | 'fitur' | 'requirement' | 'landing' | 'kalender'>('umum');
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings>({ calendar_authorized_jabatans: [] });
  const [availableJabatans, setAvailableJabatans] = useState<Jabatan[]>([]);
  
  // Landing Page Settings
  const [landingSettings, setLandingSettings] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_image: '',
    about_image: '',
    visi: '',
    misi: '',
  });
  
  // Hero Image Upload State
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [aboutImagePreview, setAboutImagePreview] = useState<string | null>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const aboutImageInputRef = useRef<HTMLInputElement>(null);
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [extractingColor, setExtractingColor] = useState(false);
  const [autoColorDetected, setAutoColorDetected] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { refetchSettings: refetchGlobalSettings } = useSettings();

  useEffect(() => {
    fetchSettings();
    fetchRequirementSettings();
    fetchLandingSettings();
    fetchCalendarSettings();
    fetchAvailableJabatans();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings/general`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSettings({ ...defaultSettings, ...json.data });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirementSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings/requirement`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setReqSettings({ ...defaultRequirementSettings, ...json.data });
      }
    } catch (err) {
      console.error('Failed to fetch requirement settings:', err);
    }
  };

  const fetchLandingSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings/landing`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setLandingSettings(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch landing settings:', err);
    }
  };

  const fetchCalendarSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings/calendar`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCalendarSettings(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch calendar settings:', err);
    }
  };

  const fetchAvailableJabatans = async () => {
    try {
      const res = await fetch(`${API_URL}/master/jabatan`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (Array.isArray(json)) {
        setAvailableJabatans(json);
      } else if (json.data && Array.isArray(json.data)) {
        setAvailableJabatans(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch jabatans:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      if (activeTab === 'requirement') {
        // Save requirement settings
        const res = await fetch(`${API_URL}/settings/requirement`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify(reqSettings),
        });
        
        const json = await res.json();
        
        if (json.success) {
          setReqSettings({ ...defaultRequirementSettings, ...json.data });
          setMessage({ type: 'success', text: 'Pengaturan requirement berhasil disimpan!' });
        } else {
          setMessage({ type: 'error', text: json.message || 'Gagal menyimpan pengaturan' });
        }
      } else if (activeTab === 'landing') {
        // Save landing page settings with FormData for file upload
        const formData = new FormData();
        formData.append('hero_title', landingSettings.hero_title);
        formData.append('hero_subtitle', landingSettings.hero_subtitle);
        formData.append('visi', landingSettings.visi);
        formData.append('misi', landingSettings.misi);
        
        // Add hero image if selected
        if (heroImageFile) {
          formData.append('hero_image', heroImageFile);
        }
        
        // Add about image if selected
        if (aboutImageFile) {
          formData.append('about_image', aboutImageFile);
        }
        
        const res = await fetch(`${API_URL}/settings/landing`, {
          method: 'POST',
          headers: getHeaders(),
          body: formData,
        });
        
        const json = await res.json();
        
        if (json.success) {
          setLandingSettings(prev => ({ ...prev, ...json.data }));
          setHeroImageFile(null);
          setHeroImagePreview(null);
          setAboutImageFile(null);
          setAboutImagePreview(null);
          setMessage({ type: 'success', text: 'Pengaturan landing page berhasil disimpan!' });
          // Refresh global settings
          await refetchGlobalSettings();
        } else {
          setMessage({ type: 'error', text: json.message || 'Gagal menyimpan pengaturan' });
        }
      } else if (activeTab === 'kalender') {
        const res = await fetch(`${API_URL}/settings/calendar`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify(calendarSettings),
        });
        
        const json = await res.json();
        
        if (json.success) {
          setCalendarSettings(json.data);
          setMessage({ type: 'success', text: 'Pengaturan kalender berhasil disimpan!' });
        } else {
          setMessage({ type: 'error', text: json.message || 'Gagal menyimpan pengaturan' });
        }
      } else {
        // Save general/feature settings
        const formData = new FormData();
        
        // Add text settings
        Object.entries(settings).forEach(([key, value]) => {
          if (value !== undefined && value !== null && !key.includes('_url')) {
            formData.append(key, value);
          }
        });
        
        // Add logo if selected
        if (logoFile) {
          formData.append('app_logo', logoFile);
        }
        
        const res = await fetch(`${API_URL}/settings/general`, {
          method: 'POST',
          headers: getHeaders(),
          body: formData,
        });
        
        const json = await res.json();
        
        if (json.success) {
          setSettings({ ...defaultSettings, ...json.data });
          setLogoFile(null);
          setLogoPreview(null);
          setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
          // Refresh global settings agar header terupdate
          await refetchGlobalSettings();
        } else {
          setMessage({ type: 'error', text: json.message || 'Gagal menyimpan pengaturan' });
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('remove_logo', '1');
      
      const res = await fetch(`${API_URL}/settings/general`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData,
      });
      
      const json = await res.json();
      if (json.success) {
        setSettings({ ...settings, app_logo: '', app_logo_url: undefined });
        setLogoPreview(null);
        setMessage({ type: 'success', text: 'Logo berhasil dihapus!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menghapus logo' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (file: File | null) => {
    if (!file) return;
    setLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    
    // Auto-detect dominant color
    setExtractingColor(true);
    setAutoColorDetected(null);
    try {
      const dominantColor = await extractDominantColor(previewUrl);
      setAutoColorDetected(dominantColor);
      // Auto-apply the detected color
      setSettings(prev => ({ ...prev, app_color: dominantColor }));
      setMessage({ type: 'success', text: `Warna dominan terdeteksi: ${dominantColor}` });
    } catch (err) {
      console.error('Failed to extract color:', err);
    } finally {
      setExtractingColor(false);
    }
  };

  const handleExtractColorFromExisting = async () => {
    const imageUrl = logoPreview || settings.app_logo_url;
    if (!imageUrl) return;
    
    setExtractingColor(true);
    try {
      const dominantColor = await extractDominantColor(imageUrl);
      setAutoColorDetected(dominantColor);
      setSettings(prev => ({ ...prev, app_color: dominantColor }));
      setMessage({ type: 'success', text: `Warna dominan terdeteksi: ${dominantColor}` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal mengekstrak warna dari logo' });
    } finally {
      setExtractingColor(false);
    }
  };

  const toggleFeature = (key: keyof Settings) => {
    const current = settings[key];
    setSettings({ ...settings, [key]: current === '1' ? '0' : '1' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const features = [
    { key: 'feature_akademik', label: 'Akademik', desc: 'Fitur tahfidz, presensi, dan data akademik' },
    { key: 'feature_koperasi', label: 'Koperasi', desc: 'Fitur produk, pesanan, dan dompet santri' },
    { key: 'feature_asrama', label: 'Asrama', desc: 'Fitur inventaris, piket, dan keuangan asrama' },
    { key: 'feature_pembinaan', label: 'Pembinaan', desc: 'Fitur tata tertib, sanksi, dan pelanggaran' },
    { key: 'feature_keuangan', label: 'Keuangan', desc: 'Fitur kas, pemasukan, dan pengeluaran' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-600">Kelola identitas pesantren dan fitur aplikasi</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-400"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('umum')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'umum'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Umum
          </button>
          <button
            onClick={() => setActiveTab('fitur')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'fitur'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Fitur Aplikasi
          </button>
          <button
            onClick={() => setActiveTab('landing')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'landing'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Landing Page
          </button>
          <button
            onClick={() => setActiveTab('requirement')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requirement'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Requirement Pekanan
          </button>
          <button
            onClick={() => setActiveTab('kalender')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'kalender'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Kalender
          </button>
        </nav>
      </div>

      {activeTab === 'umum' ? (
        <div className="space-y-6">
          {/* Identitas Dasar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-gray-500" />
                Informasi Dasar
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pesantren
                </label>
                <input
                  type="text"
                  value={settings.app_name}
                  onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary"
                  placeholder="Masukkan nama pesantren"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Singkat / Akronim
                  </label>
                  <input
                    type="text"
                    value={settings.app_short_name}
                    onChange={(e) => setSettings({ ...settings, app_short_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary"
                    placeholder="PISANTRI"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.app_tagline}
                    onChange={(e) => setSettings({ ...settings, app_tagline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary"
                    placeholder="Sistem Informasi..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={settings.contact_phone}
                      onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary"
                      placeholder="+62..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Resmi
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary"
                      placeholder="admin@pesantren.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Lengkap
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    value={settings.contact_address}
                    onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary"
                    placeholder="Jl. ..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tampilan & Branding */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-gray-500" />
                Tampilan & Branding
              </h2>
            </div>
            <div className="p-6">
              {/* Logo dan Warna Sejajar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Aplikasi */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Logo Aplikasi
                  </label>
                  <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                    <div className="relative w-28 h-28 bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden mb-4">
                      {(logoPreview || settings.app_logo_url) ? (
                        <img src={logoPreview || settings.app_logo_url} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                      )}
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleLogoChange(e.target.files?.[0] || null)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                      {(settings.app_logo || logoFile) && (
                        <button
                          onClick={handleRemoveLogo}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 shadow-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      PNG, JPG. Max 2MB.<br />Ukuran persegi (1:1)
                    </p>
                  </div>
                </div>

                {/* Warna Utama */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Warna Utama Aplikasi
                  </label>
                  <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    {/* Color Preview */}
                    <div 
                      className="w-28 h-28 rounded-xl shadow-lg mb-4 flex items-center justify-center transition-all"
                      style={{ backgroundColor: settings.app_color }}
                    >
                      <span className="text-white text-2xl font-bold drop-shadow">Aa</span>
                    </div>
                    
                    {/* Color Picker */}
                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                      <input
                        type="color"
                        value={settings.app_color}
                        onChange={(e) => setSettings({ ...settings, app_color: e.target.value })}
                        className="h-10 w-14 p-0.5 rounded-lg border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.app_color}
                        onChange={(e) => setSettings({ ...settings, app_color: e.target.value })}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm uppercase"
                        placeholder="#2563EB"
                      />
                    </div>
                    
                    {/* Auto Extract Color Button */}
                    {(logoPreview || settings.app_logo_url) && (
                      <button
                        onClick={handleExtractColorFromExisting}
                        disabled={extractingColor}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 shadow-md transition-all"
                      >
                        {extractingColor ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4" />
                        )}
                        {extractingColor ? 'Mengekstrak...' : 'Ambil Warna dari Logo'}
                      </button>
                    )}
                    
                    {/* Auto Color Indicator */}
                    {autoColorDetected && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: autoColorDetected }} />
                        Warna otomatis: {autoColorDetected}
                      </div>
                    )}

                    {/* Preset Colors */}
                    <div className="flex gap-2 mt-4">
                      {['#2563EB', '#37abdf', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'].map((color) => (
                        <button
                          key={color}
                          onClick={() => { 
                            setSettings({ ...settings, app_color: color });
                            setAutoColorDetected(null);
                          }}
                          className={`w-7 h-7 rounded-full shadow-sm transition-transform hover:scale-110 ${settings.app_color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Digunakan di header & tombol<br />
                      <span className="text-purple-600">Upload logo untuk auto-detect warna</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Header */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preview Header
                </label>
                <div 
                  className="rounded-xl p-4 flex items-center gap-3 shadow-lg"
                  style={{ backgroundColor: settings.app_color }}
                >
                  {(logoPreview || settings.app_logo_url) ? (
                    <img src={logoPreview || settings.app_logo_url} alt="Logo" className="h-10 w-auto" />
                  ) : (
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-white/60" />
                    </div>
                  )}
                  <div>
                    <span className="text-white font-bold text-lg block leading-tight">
                      {settings.app_short_name || 'PISANTRI'}
                    </span>
                    <span className="text-white/70 text-xs block leading-tight">
                      {settings.app_tagline || 'Sistem Informasi Pondok Pesantren'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'fitur' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Modul & Fitur</h2>
              <p className="text-sm text-gray-500">Aktifkan atau nonaktifkan modul sesuai kebutuhan pesantren</p>
            </div>
            <div className="divide-y divide-gray-200">
              {features.map((feature) => (
                <div key={feature.key} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{feature.label}</h3>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleFeature(feature.key as keyof Settings)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      settings[feature.key as keyof Settings] === '1' ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings[feature.key as keyof Settings] === '1' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'requirement' ? (
        /* Tab Requirement Pekanan */
        <div className="space-y-6">
          {/* Periode Pekan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                Periode Pekan
              </h2>
              <p className="text-sm text-gray-500">Tentukan hari mulai dan akhir periode pekanan</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hari Mulai Pekan
                  </label>
                  <select
                    value={reqSettings.req_week_start_day}
                    onChange={(e) => setReqSettings({ ...reqSettings, req_week_start_day: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary"
                  >
                    {dayOptions.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Pekan akan berakhir pada hari {dayOptions[(reqSettings.req_week_start_day + 6) % 7]?.label}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="bg-primary/5 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-primary-dark font-medium">Preview Periode</p>
                    <p className="text-lg text-blue-900 font-bold mt-1">
                      {dayOptions[reqSettings.req_week_start_day]?.label} - {dayOptions[(reqSettings.req_week_start_day + 6) % 7]?.label}
                    </p>
                    <p className="text-xs text-primary mt-1">7 hari penuh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Target Requirement */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-gray-500" />
                Target Requirement Pekanan
              </h2>
              <p className="text-sm text-gray-500">Tentukan target yang harus dipenuhi santri setiap pekan</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Review */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Target Review
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reqSettings.req_target_review}
                    onChange={(e) => setReqSettings({ ...reqSettings, req_target_review: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  />
                  <p className="text-xs text-purple-600 mt-1">Review buku/video/artikel per pekan</p>
                  <ProgramCheckboxes 
                    programs={reqSettings.req_target_review_programs || []} 
                    onChange={(p) => setReqSettings({ ...reqSettings, req_target_review_programs: p })} 
                  />
                </div>

                {/* Portfolio */}
                <div className="bg-primary/5 border border-blue-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-primary-dark mb-2">
                    Target Portfolio
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reqSettings.req_target_portfolio}
                    onChange={(e) => setReqSettings({ ...reqSettings, req_target_portfolio: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary bg-white"
                  />
                  <p className="text-xs text-primary mt-1">Karya/project per pekan</p>
                  <ProgramCheckboxes 
                    programs={reqSettings.req_target_portfolio_programs || []} 
                    onChange={(p) => setReqSettings({ ...reqSettings, req_target_portfolio_programs: p })} 
                  />
                </div>

                {/* Hafalan */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Target Hafalan Baru
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reqSettings.req_target_hafalan}
                    onChange={(e) => setReqSettings({ ...reqSettings, req_target_hafalan: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  />
                  <p className="text-xs text-green-600 mt-1">Setoran hafalan baru per pekan</p>
                  <ProgramCheckboxes 
                    programs={reqSettings.req_target_hafalan_programs || []} 
                    onChange={(p) => setReqSettings({ ...reqSettings, req_target_hafalan_programs: p })} 
                  />
                </div>

                {/* Murojaah */}
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Target Murojaah
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reqSettings.req_target_murojaah}
                    onChange={(e) => setReqSettings({ ...reqSettings, req_target_murojaah: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  />
                  <p className="text-xs text-teal-600 mt-1">Setoran murojaah per pekan (0 = tidak wajib)</p>
                  <ProgramCheckboxes 
                    programs={reqSettings.req_target_murojaah_programs || []} 
                    onChange={(p) => setReqSettings({ ...reqSettings, req_target_murojaah_programs: p })} 
                  />
                </div>

                {/* Murojaah Lama */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Target Murojaah Lama
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reqSettings.req_target_murojaah_lama}
                    onChange={(e) => setReqSettings({ ...reqSettings, req_target_murojaah_lama: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  />
                  <p className="text-xs text-emerald-600 mt-1">Setoran murojaah lama per pekan (0 = tidak wajib)</p>
                  <ProgramCheckboxes 
                    programs={reqSettings.req_target_murojaah_lama_programs || []} 
                    onChange={(p) => setReqSettings({ ...reqSettings, req_target_murojaah_lama_programs: p })} 
                  />
                </div>

                {/* Murojaah Pekanan */}
                <div className="bg-lime-50 border border-lime-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-lime-700 mb-2">
                    Target Murojaah Pekanan
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reqSettings.req_target_murojaah_pekanan}
                    onChange={(e) => setReqSettings({ ...reqSettings, req_target_murojaah_pekanan: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-lime-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 bg-white"
                  />
                  <p className="text-xs text-lime-600 mt-1">Setoran murojaah pekanan per pekan (0 = tidak wajib)</p>
                  <ProgramCheckboxes 
                    programs={reqSettings.req_target_murojaah_pekanan_programs || []} 
                    onChange={(p) => setReqSettings({ ...reqSettings, req_target_murojaah_pekanan_programs: p })} 
                  />
                </div>

                {/* Tasmi */}
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-sky-700 mb-2">
                    Target Tasmi
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reqSettings.req_target_tasmi}
                    onChange={(e) => setReqSettings({ ...reqSettings, req_target_tasmi: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                  />
                  <p className="text-xs text-sky-600 mt-1">Setoran tasmi per pekan (0 = tidak wajib)</p>
                  <ProgramCheckboxes 
                    programs={reqSettings.req_target_tasmi_programs || []} 
                    onChange={(p) => setReqSettings({ ...reqSettings, req_target_tasmi_programs: p })} 
                  />
                </div>

                {/* Tulisan */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-amber-700 mb-2">
                    Target Tulisan
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reqSettings.req_target_tulisan}
                    onChange={(e) => setReqSettings({ ...reqSettings, req_target_tulisan: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                  />
                  <p className="text-xs text-amber-600 mt-1">Artikel/tulisan per pekan</p>
                  <ProgramCheckboxes 
                    programs={reqSettings.req_target_tulisan_programs || []} 
                    onChange={(p) => setReqSettings({ ...reqSettings, req_target_tulisan_programs: p })} 
                  />
                </div>

                {/* Sanksi */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    Batas Sanksi Aktif
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reqSettings.req_target_sanksi}
                    onChange={(e) => setReqSettings({ ...reqSettings, req_target_sanksi: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                  />
                  <p className="text-xs text-red-600 mt-1">Maksimal sanksi aktif (0 = tidak boleh ada)</p>
                  <ProgramCheckboxes 
                    programs={reqSettings.req_target_sanksi_programs || []} 
                    onChange={(p) => setReqSettings({ ...reqSettings, req_target_sanksi_programs: p })} 
                  />
                </div>

                {/* Skoring Presensi */}
                <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-cyan-700 mb-2">
                    Target Skoring Presensi
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="350"
                    value={reqSettings.req_target_skoring}
                    onChange={(e) => setReqSettings({ ...reqSettings, req_target_skoring: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
                  />
                  <p className="text-xs text-cyan-600 mt-1">Minimal poin (maks: 350/pekan)</p>
                  <ProgramCheckboxes 
                    programs={reqSettings.req_target_skoring_programs || []} 
                    onChange={(p) => setReqSettings({ ...reqSettings, req_target_skoring_programs: p })} 
                  />
                </div>
              </div>

              {/* Nilai Minimal */}
              <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <h3 className="text-sm font-medium text-indigo-700 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Nilai Minimal yang Diterima
                </h3>
                <p className="text-xs text-indigo-600 mb-3">
                  Hafalan, Review, dan Portfolio hanya terhitung jika nilainya minimal mencapai nilai yang dipilih
                </p>
                <select
                  value={reqSettings.req_min_nilai_bobot}
                  onChange={(e) => setReqSettings({ ...reqSettings, req_min_nilai_bobot: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  {nilaiOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} (Bobot: {option.value})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-indigo-500 mt-2">
                  Nilai di bawah "{nilaiOptions.find(o => o.value === reqSettings.req_min_nilai_bobot)?.label}" tidak akan dihitung
                </p>
              </div>

              {/* Info Box */}
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Keterangan Skoring Presensi:</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Tepat waktu = 10 poin per agenda</li>
                  <li>• Terlambat = 5 poin per agenda</li>
                  <li>• 5 agenda harian x 7 hari = maksimal 350 poin/pekan</li>
                  <li>• Target 330 poin = 94% kehadiran tepat waktu</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'landing' ? (
        /* Tab Landing Page - Data Dinamis */
        <div className="space-y-6">
          {/* Hero Section - Basic Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Hero & Visi Misi</h2>
              <p className="text-sm text-gray-500">Konten utama halaman depan</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Hero</label>
                  <input
                    type="text"
                    value={landingSettings.hero_title}
                    onChange={(e) => setLandingSettings({ ...landingSettings, hero_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary text-sm"
                    placeholder="Judul utama landing page"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Hero</label>
                  <div className="flex items-center gap-2">
                    <input ref={heroImageInputRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setHeroImageFile(file); setHeroImagePreview(URL.createObjectURL(file)); }
                      }}
                    />
                    <button type="button" onClick={() => heroImageInputRef.current?.click()}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                      {heroImagePreview || landingSettings.hero_image ? 'Ganti' : 'Upload'}
                    </button>
                    {(heroImagePreview || landingSettings.hero_image) && (
                      <img src={heroImagePreview || landingSettings.hero_image} alt="Hero" className="h-9 w-16 object-cover rounded" />
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle Hero</label>
                <textarea
                  value={landingSettings.hero_subtitle}
                  onChange={(e) => setLandingSettings({ ...landingSettings, hero_subtitle: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary text-sm"
                  placeholder="Deskripsi singkat..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visi</label>
                  <RichTextEditor
                    value={landingSettings.visi}
                    onChange={(value) => setLandingSettings({ ...landingSettings, visi: value })}
                    placeholder="Visi pondok..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Misi</label>
                  <RichTextEditor
                    value={landingSettings.misi}
                    onChange={(value) => setLandingSettings({ ...landingSettings, misi: value })}
                    placeholder="Misi pondok..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Landing Page Data - CRUD untuk semua tabel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Data Dinamis Landing Page</h2>
              <p className="text-sm text-gray-500">Kelola section, fitur, program, karakteristik, dan sambutan</p>
            </div>
            <div className="p-4">
              <LandingPageSettingsTab />
            </div>
          </div>
        </div>
      ) : activeTab === 'kalender' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                Otoritas Input Kalender
              </h2>
              <p className="text-sm text-gray-500">Pilih jabatan yang diperbolehkan menambah/edit event di dashboard mereka</p>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  <strong>Catatan:</strong> Superadmin dan Admin memiliki akses penuh secara default. Jabatan yang dipilih di bawah ini akan dapat menginput event yang otomatis dikategorikan sesuai bidang mereka.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableJabatans.map((jabatan) => (
                  <label 
                    key={jabatan.id_jabatan}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                      checked={calendarSettings.calendar_authorized_jabatans.includes(jabatan.id_jabatan)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setCalendarSettings(prev => ({
                          ...prev,
                          calendar_authorized_jabatans: checked
                            ? [...prev.calendar_authorized_jabatans, jabatan.id_jabatan]
                            : prev.calendar_authorized_jabatans.filter(id => id !== jabatan.id_jabatan)
                        }));
                      }}
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">{jabatan.nama_jabatan}</span>
                  </label>
                ))}
              </div>

              {availableJabatans.length === 0 && (
                <div className="text-center py-8 text-gray-500 italic">
                  Tidak ada data jabatan ditemukan.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
