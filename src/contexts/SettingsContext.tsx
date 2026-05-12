import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL, getPublicHeaders } from '../services/api';




export interface AppSettings {
  namaPesantren: string;
  namaSingkat: string;
  tagline: string;
  alamat: string;
  kontak: string;
  email: string;
  warnaUtama: string;
  logo: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  features: {
    akademik: boolean;
    koperasi: boolean;
    asrama: boolean;
    tahfidz: boolean;
    keuangan: boolean;
    humas: boolean;
    inventaris: boolean;
    kepengurusan: boolean;
  };
  contactWhatsapp: string;
  contactMapUrl: string;
  ppdbRegistrationAddress: string;
  ppdbPesantrenAddress: string;
  ppdbBoardingFee: string;
  ppdbHeroImage: string;
}

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleFeature: (feature: keyof AppSettings['features']) => void;
  refetchSettings: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  namaPesantren: 'Pondok Pesantren Al-Hikmah',
  namaSingkat: 'PISANTRI',
  tagline: 'Sistem Informasi Pondok Pesantren',
  alamat: 'Jl. Raya Puncak No. 123, Bogor, Jawa Barat',
  kontak: '+62 812-3456-7890',
  email: 'info@alhikmah.com',
  warnaUtama: '#2563EB',
  logo: '/logo.png',
  heroImage: '/images/ppdb.png',
  heroTitle: 'Mencetak Generasi IT Rabbani',
  heroSubtitle: 'Lembaga pendidikan yang mengintegrasikan teknologi informasi (IT) dan pendidikan agama (Pesantren).',
  features: {
    akademik: true,
    koperasi: true,
    asrama: true,
    tahfidz: true,
    keuangan: true,
    humas: true,
    inventaris: true,
    kepengurusan: true
  },
  contactWhatsapp: '6285191555884',
  contactMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5132.507044354368!2d119.45606437498239!3d-5.175219794802207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbee30060507e45%3A0x868801b511f72739!2sPesantren%20Teknologi%20Wahdah%20Islamiyah%20Makassar!5e1!3m2!1sen!2sid!4v1764727328890!5m2!1sen!2sid',
  ppdbRegistrationAddress: 'Kantor Wahdah Islamiyah Makassar Jl. Bukit Baruga, Ruko Malino C24, Antang, Makassar.',
  ppdbPesantrenAddress: 'Masjid Wahdah Hertasning Jl. Aroepala Hertasning Baru, Gosyen Indah, Lr. 2, Makassar.',
  ppdbBoardingFee: '1400000',
  ppdbHeroImage: '/images/ppdb.png'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Helper to fix mixed content and IP-based/Dev URLs
  const sanitizeUrl = (url: string | null): string => {
    if (!url) return defaultSettings.logo;
    
    let sanitized = url;
    const isProd = window.location.hostname.includes('pesantrenteknologi') || window.location.hostname.includes('pondokinformatika');
    
    // Fix IP-based URLs (Mixed Content) - handle any port
    if (sanitized.includes('210.79.191.137')) {
      // Replace any http://210.79.191.137:PORT pattern with HTTPS API domain
      sanitized = sanitized.replace(/http:\/\/210\.79\.191\.137(:\d+)?/g, 'https://api.pondokinformatika.id');
    }
    
    // If it's a local/IP-based logo, use default or Cloudinary fallback
    if (sanitized.includes('/logo.png') && sanitized.includes('api.pondokinformatika.id')) {
      // Use local logo instead of API-served logo
      return '/logo.png';
    }
    
    // Fix Dev API leaking into Production Domain
    if (isProd && sanitized.includes('api-dev.pondokinformatika.id')) {
      console.warn(`[SettingsContext] 🛡️ Sanitizing Dev URL found in Production: ${sanitized}`);
      sanitized = sanitized.replace('api-dev.pondokinformatika.id', 'api.pondokinformatika.id');
    }
    
    return sanitized;
  };

  const fetchSettingsFromAPI = async () => {
    try {
      // Gunakan public endpoint agar bisa diakses tanpa login
      const res = await fetch(`${API_URL}/public/settings`, {
        headers: getPublicHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const apiSettings = json.data;
        const newSettings: AppSettings = {
          namaPesantren: apiSettings.namaPesantren || apiSettings.app_name || defaultSettings.namaPesantren,
          namaSingkat: apiSettings.namaSingkat || apiSettings.app_short_name || defaultSettings.namaSingkat,
          tagline: apiSettings.tagline || apiSettings.app_tagline || defaultSettings.tagline,
          alamat: apiSettings.alamat || apiSettings.contact_address || defaultSettings.alamat,
          kontak: apiSettings.telepon || apiSettings.contact_phone || defaultSettings.kontak,
          email: apiSettings.email || apiSettings.contact_email || defaultSettings.email,
          warnaUtama: apiSettings.warnaUtama || apiSettings.app_color || defaultSettings.warnaUtama,
          logo: sanitizeUrl(apiSettings.logo || apiSettings.app_logo_url),
          heroImage: apiSettings.heroImage || defaultSettings.heroImage,
          heroTitle: apiSettings.heroTitle || apiSettings.app_hero_title || defaultSettings.heroTitle,
          heroSubtitle: apiSettings.heroSubtitle || apiSettings.app_hero_subtitle || defaultSettings.heroSubtitle,
          features: {
            akademik: apiSettings.feature_akademik !== '0' && apiSettings.feature_akademik !== false,
            koperasi: apiSettings.feature_koperasi !== '0' && apiSettings.feature_koperasi !== false,
            asrama: apiSettings.feature_asrama !== '0' && apiSettings.feature_asrama !== false,
            tahfidz: apiSettings.feature_tahfidz !== '0' && apiSettings.feature_tahfidz !== false,
            keuangan: apiSettings.feature_keuangan !== '0' && apiSettings.feature_keuangan !== false,
            humas: apiSettings.feature_humas !== '0' && apiSettings.feature_humas !== false,
            inventaris: apiSettings.feature_inventaris !== '0' && apiSettings.feature_inventaris !== false,
            kepengurusan: apiSettings.feature_kepengurusan !== '0' && apiSettings.feature_kepengurusan !== false,
          },
          contactWhatsapp: apiSettings.contactWhatsapp || apiSettings.contact_whatsapp || defaultSettings.contactWhatsapp,
          contactMapUrl: apiSettings.contactMapUrl || apiSettings.contact_map_url || defaultSettings.contactMapUrl,
          ppdbRegistrationAddress: apiSettings.ppdbRegistrationAddress || apiSettings.ppdb_registration_address || defaultSettings.ppdbRegistrationAddress,
          ppdbPesantrenAddress: apiSettings.ppdbPesantrenAddress || apiSettings.ppdb_pesantren_address || defaultSettings.ppdbPesantrenAddress,
          ppdbBoardingFee: apiSettings.ppdbBoardingFee || apiSettings.ppdb_boarding_fee || defaultSettings.ppdbBoardingFee,
          ppdbHeroImage: apiSettings.ppdbHeroImage || apiSettings.ppdb_hero_image_url || defaultSettings.ppdbHeroImage,
        };
        setSettings(newSettings);
        localStorage.setItem('pisantri_settings', JSON.stringify(newSettings));
        
        // Apply dynamic color to CSS - calculate shades
        const primaryColor = newSettings.warnaUtama;
        document.documentElement.style.setProperty('--color-primary', primaryColor);
        
        // Calculate color shades using hex manipulation
        const adjustColor = (color: string, amount: number): string => {
          const hex = color.replace('#', '');
          const num = parseInt(hex, 16);
          const r = Math.min(255, Math.max(0, (num >> 16) + amount));
          const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
          const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
          return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
        };
        
        document.documentElement.style.setProperty('--color-primary-light', adjustColor(primaryColor, 30));
        document.documentElement.style.setProperty('--color-primary-dark', adjustColor(primaryColor, -30));
        document.documentElement.style.setProperty('--color-primary-hover', adjustColor(primaryColor, -20));
        
        // Update document title
        document.title = newSettings.namaPesantren;
        
        // Update favicon dynamically
        const faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        const appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
        if (faviconLink && newSettings.logo) {
          faviconLink.href = newSettings.logo;
        }
        if (appleTouchIcon && newSettings.logo) {
          appleTouchIcon.href = newSettings.logo;
        }
      }
    } catch (e) {
      console.error('Failed to fetch settings from API', e);
      // Fallback to localStorage
      const storedSettings = localStorage.getItem('pisantri_settings');
      if (storedSettings) {
        try {
          const parsed = JSON.parse(storedSettings);
          setSettings({ ...defaultSettings, ...parsed, features: { ...defaultSettings.features, ...parsed.features } });
        } catch (parseError) {
          console.error('Failed to parse stored settings', parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsFromAPI();
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('pisantri_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFeature = (feature: keyof AppSettings['features']) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        features: {
          ...prev.features,
          [feature]: !prev.features[feature]
        }
      };
      localStorage.setItem('pisantri_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const refetchSettings = async () => {
    await fetchSettingsFromAPI();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, toggleFeature, refetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
