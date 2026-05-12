import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Save, Upload, Trash2, Loader2, Eye, RotateCcw, Info, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';



interface IdCardSettings {
  idcard_title?: string;
  idcard_subtitle?: string;
  idcard_bg_color?: string;
  idcard_text_color?: string;
  idcard_show_logo?: string;
  idcard_show_qr?: string;
  idcard_background?: string;
  idcard_background_url?: string;
  idcard_logo?: string;
  idcard_logo_url?: string;
  idcard_footer_text?: string;
}

const defaultSettings: IdCardSettings = {
  idcard_title: 'Pondok Pesantren',
  idcard_subtitle: 'Informatika',
  idcard_bg_color: '#1e40af',
  idcard_text_color: '#ffffff',
  idcard_show_logo: '1',
  idcard_show_qr: '1',
  idcard_footer_text: 'Scan untuk verifikasi',
};

export default function IdCardSettingsPage() {
  const [settings, setSettings] = useState<IdCardSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  
  const backgroundInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const json: any = await api.get('/api/settings/idcard');
      if (json.success && json.data) {
        setSettings({ ...defaultSettings, ...json.data });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const formData = new FormData();
      
      // Add text settings (exclude logo & color - managed in general settings)
      const allowedKeys = ['idcard_title', 'idcard_subtitle', 'idcard_footer_text', 'idcard_show_logo', 'idcard_show_qr'];
      allowedKeys.forEach(key => {
        const value = settings[key as keyof IdCardSettings];
        if (value !== undefined) {
          formData.append(key, value);
        }
      });
      
      // Add background if selected
      if (backgroundFile) {
        formData.append('idcard_background', backgroundFile);
      }
      
      const json: any = await api.post('/api/settings/idcard', formData);
      
      if (json.success) {
        setSettings({ ...defaultSettings, ...json.data });
        setBackgroundFile(null);
        setBackgroundPreview(null);
        setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
      } else {
        setMessage({ type: 'error', text: json.message || 'Gagal menyimpan pengaturan' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBackground = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('remove_background', '1');
      
      const json: any = await api.post('/api/settings/idcard', formData);
      if (json.success) {
        setSettings({ ...settings, idcard_background: '', idcard_background_url: '' });
        setBackgroundPreview(null);
        setMessage({ type: 'success', text: 'Background berhasil dihapus!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menghapus background' });
    } finally {
      setSaving(false);
    }
  };

  const handleBackgroundChange = (file: File | null) => {
    if (!file) return;
    setBackgroundFile(file);
    setBackgroundPreview(URL.createObjectURL(file));
  };

  const handleReset = () => {
    setSettings(prev => ({
      ...prev,
      idcard_title: defaultSettings.idcard_title,
      idcard_subtitle: defaultSettings.idcard_subtitle,
      idcard_footer_text: defaultSettings.idcard_footer_text,
      idcard_show_logo: defaultSettings.idcard_show_logo,
      idcard_show_qr: defaultSettings.idcard_show_qr,
    }));
    setBackgroundFile(null);
    setBackgroundPreview(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Template ID Card</h1>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <Link
            to="/idcard"
            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5"
          >
            <Eye className="w-4 h-4" />
            Preview Cetak
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-400"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Info: Logo & Warna dari Settings General */}
      <div className="bg-primary/5 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-primary-dark">
            <strong>Logo</strong> dan <strong>Warna</strong> ID Card diambil dari pengaturan umum aplikasi.
          </p>
          <Link to="/settings" className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark mt-1">
            Ubah di Pengaturan Umum <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="space-y-6">
          {/* Text Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Teks ID Card</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Utama</label>
                <input
                  type="text"
                  value={settings.idcard_title || ''}
                  onChange={(e) => setSettings({ ...settings, idcard_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Pondok Pesantren"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Judul</label>
                <input
                  type="text"
                  value={settings.idcard_subtitle || ''}
                  onChange={(e) => setSettings({ ...settings, idcard_subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Informatika"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teks Footer QR</label>
                <input
                  type="text"
                  value={settings.idcard_footer_text || ''}
                  onChange={(e) => setSettings({ ...settings, idcard_footer_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Scan untuk verifikasi"
                />
              </div>
            </div>
          </div>

          {/* Toggle Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tampilan</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Tampilkan Logo</span>
                <input
                  type="checkbox"
                  checked={settings.idcard_show_logo === '1'}
                  onChange={(e) => setSettings({ ...settings, idcard_show_logo: e.target.checked ? '1' : '0' })}
                  className="w-5 h-5 text-primary rounded focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Tampilkan QR Code</span>
                <input
                  type="checkbox"
                  checked={settings.idcard_show_qr === '1'}
                  onChange={(e) => setSettings({ ...settings, idcard_show_qr: e.target.checked ? '1' : '0' })}
                  className="w-5 h-5 text-primary rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Background Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Background Kartu</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Custom (Opsional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Jika diupload, background akan menggantikan header biru default. Pastikan desain sudah include logo, nama, dll.
              </p>
              <div className="flex items-start gap-4">
                <div className="w-32 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                  {(backgroundPreview || settings.idcard_background_url) ? (
                    <img
                      src={backgroundPreview || settings.idcard_background_url}
                      alt="Background"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={backgroundInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBackgroundChange(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <button
                    onClick={() => backgroundInputRef.current?.click()}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Pilih File
                  </button>
                  {(settings.idcard_background || backgroundFile) && (
                    <button
                      onClick={handleRemoveBackground}
                      className="ml-2 px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Hapus
                    </button>
                  )}
                  <p className="text-xs text-gray-500">PNG/JPG, maks 2MB. Ukuran: 324x514px (rasio ID Card)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview ID Card</h2>
            <div className="flex justify-center p-6 bg-gray-100 rounded-xl">
              <div 
                className="relative overflow-hidden rounded-[3mm] shadow-lg"
                style={{
                  width: '53.98mm',
                  height: '85.60mm',
                  minWidth: '204px',
                  minHeight: '323px',
                  background: (backgroundPreview || settings.idcard_background_url) 
                    ? `url(${backgroundPreview || settings.idcard_background_url}) center/cover`
                    : '#ffffff',
                  border: '1px solid #e5e7eb',
                }}
              >
                {/* Header - only show if no background */}
                {!(backgroundPreview || settings.idcard_background_url) && (
                  <div 
                    className="w-full py-3 px-2 flex items-center justify-center gap-2"
                    style={{ 
                      background: `linear-gradient(135deg, ${settings.idcard_bg_color || '#1e40af'} 0%, ${settings.idcard_bg_color || '#1e40af'}cc 100%)`,
                    }}
                  >
                    {settings.idcard_show_logo === '1' && (
                      <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center overflow-hidden">
                        {settings.idcard_logo_url ? (
                          <img 
                            src={settings.idcard_logo_url} 
                            alt="Logo" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">Logo</span>
                        )}
                      </div>
                    )}
                    <div style={{ color: settings.idcard_text_color || '#ffffff' }}>
                      <div className="text-[10px] font-bold uppercase tracking-wide">
                        {settings.idcard_title || 'Pondok Pesantren'}
                      </div>
                      <div className="text-[8px] opacity-90">
                        {settings.idcard_subtitle || 'Informatika'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Body */}
                <div className="flex-1 flex flex-col items-center justify-center p-2 mt-2">
                  {/* Show logo when using background image */}
                  {(backgroundPreview || settings.idcard_background_url) && settings.idcard_show_logo === '1' && (
                    <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center overflow-hidden mb-2 shadow">
                      {settings.idcard_logo_url ? (
                        <img 
                          src={settings.idcard_logo_url} 
                          alt="Logo" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">Logo</span>
                      )}
                    </div>
                  )}
                  {/* Photo */}
                  <div 
                    className="w-16 h-16 rounded-lg border-2 bg-gray-200 flex items-center justify-center overflow-hidden"
                    style={{ borderColor: settings.idcard_bg_color || '#3b82f6' }}
                  >
                    <span className="text-xs text-gray-500">Foto</span>
                  </div>
                  
                  {/* Name */}
                  <div className="text-[11px] font-bold text-gray-900 mt-2 text-center">
                    Nama Santri
                  </div>
                  
                  {/* Info */}
                  <div className="text-[9px] text-gray-600 text-center mt-1">
                    <div style={{ color: settings.idcard_bg_color || '#3b82f6', fontWeight: 600 }}>
                      Konsentrasi
                    </div>
                    <div>Angkatan -</div>
                  </div>

                  {/* QR Code */}
                  {settings.idcard_show_qr === '1' && (
                    <div className="mt-2 flex flex-col items-center">
                      <div className="w-12 h-12 border border-gray-300 rounded bg-white flex items-center justify-center">
                        <span className="text-[6px] text-gray-400">QR</span>
                      </div>
                      <div className="text-[6px] text-gray-400 mt-0.5">
                        {settings.idcard_footer_text || 'Scan untuk verifikasi'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">
              Ukuran kartu: 53.98mm x 85.60mm (standar ID Card)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
