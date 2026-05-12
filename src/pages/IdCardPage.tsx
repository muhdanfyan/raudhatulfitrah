import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Printer, Loader2, Search, CheckSquare, Square, Users, Settings } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';



interface Santri {
  id: number;
  name: string;
  photo?: string;
  foto_url?: string;
  konsentrasi?: number;
  angkatan?: number;
  konsentrasi_nama?: string;
  angkatan_nama?: string;
  status?: string;
}

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

export default function IdCardPage() {
  const { id } = useParams<{ id?: string }>();
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrintView, setShowPrintView] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [settings, setSettings] = useState<IdCardSettings>(defaultSettings);
  const printRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('pisantri_user') || '{}');
  const isSantri = user.role === 'santri';
  const isAdmin = ['superadmin', 'akademik', 'pembinaan'].includes(user.role);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const json: any = await api.get('/settings/idcard');
      if (json.success && json.data) {
        setSettings({ ...defaultSettings, ...json.data });
      }
    } catch (err) {
      console.error('Failed to fetch ID card settings:', err);
    }
  };

  useEffect(() => {
    const fetchSantri = async () => {
      setLoading(true);
      try {
        let endpoint = `/santri?per_page=200&status=Mondok`;
        if (id) {
          endpoint = `/santri/${id}`;
        } else if (isSantri && user.santri_id) {
          endpoint = `/santri/${user.santri_id}`;
        }

        const json: any = await api.get(endpoint);
        
        if (json.status === 'success' || json.success) {
          if (id || isSantri) {
            // Single santri
            const santriData = json.data;
            setSantriList([santriData]);
            setSelectedIds([santriData.id]);
          } else {
            // List santri - API returns array directly in json.data
            const list = Array.isArray(json.data) ? json.data : (json.data?.data || []);
            setSantriList(list);
          }
        }
      } catch (err) {
        console.error('Failed to fetch santri:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSantri();
  }, [id]);

  const filteredSantri = santriList.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (santriId: number) => {
    setSelectedIds(prev =>
      prev.includes(santriId)
        ? prev.filter(id => id !== santriId)
        : [...prev, santriId]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredSantri.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSantri.map(s => s.id));
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    setShowPrintView(true);
    
    // Wait a bit for DOM to update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Wait for all QR codes to load
    const qrImages = document.querySelectorAll('.id-card-qr');
    const photoImages = document.querySelectorAll('.id-card-photo');
    
    const waitForImages = (images: NodeListOf<Element>) => {
      return Promise.all(
        Array.from(images).map((img) => {
          const imgEl = img as HTMLImageElement;
          if (imgEl.complete) return Promise.resolve();
          return new Promise((resolve) => {
            imgEl.onload = resolve;
            imgEl.onerror = resolve;
            // Timeout fallback in case image takes too long
            setTimeout(resolve, 3000);
          });
        })
      );
    };

    // Wait for all images (QR codes and photos)
    await Promise.all([
      waitForImages(qrImages),
      waitForImages(photoImages),
    ]);

    // Additional delay to ensure rendering
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const selectedSantri = santriList.filter(s => selectedIds.includes(s.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .id-card {
            page-break-inside: avoid;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        .id-card {
          width: 53.98mm;
          height: 85.60mm;
          background: #ffffff;
          border-radius: 3mm;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .id-card-header {
          width: 100%;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          padding: 3mm 2mm;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2mm;
        }
        .id-card-logo {
          width: 10mm;
          height: 10mm;
          border-radius: 50%;
          background: white;
          padding: 1mm;
          object-fit: contain;
        }
        .id-card-header-text {
          color: white;
          text-align: left;
        }
        .id-card-header-text .title {
          font-size: 2.8mm;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.2mm;
        }
        .id-card-header-text .subtitle {
          font-size: 2mm;
          opacity: 0.9;
        }
        .id-card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2mm;
          width: 100%;
        }
        .id-card-photo {
          width: 20mm;
          height: 20mm;
          border-radius: 2mm;
          border: 0.5mm solid #3b82f6;
          object-fit: cover;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        }
        .id-card-name {
          color: #1e293b;
          font-size: 3.2mm;
          font-weight: 700;
          margin-top: 2mm;
          text-align: center;
          max-width: 48mm;
          line-height: 1.3;
        }
        .id-card-info {
          color: #64748b;
          font-size: 2.5mm;
          text-align: center;
          margin-top: 1mm;
        }
        .id-card-info strong {
          color: #3b82f6;
          font-weight: 600;
        }
        .id-card-qr-section {
          margin-top: 2mm;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .id-card-qr {
          width: 14mm;
          height: 14mm;
          padding: 0.5mm;
          border: 0.3mm solid #e5e7eb;
          border-radius: 1mm;
        }
        .id-card-qr-label {
          font-size: 1.8mm;
          color: #94a3b8;
          margin-top: 0.5mm;
        }
        .id-card-footer {
          width: 100%;
          background: #f8fafc;
          border-top: 0.3mm solid #e5e7eb;
          padding: 1.5mm;
          text-align: center;
        }
        .id-card-footer-id {
          font-size: 2mm;
          color: #64748b;
          font-weight: 500;
        }
        .id-card-footer-year {
          font-size: 1.8mm;
          color: #94a3b8;
        }
      `}</style>

      {/* Control Panel - Hidden on print */}
      <div className="no-print space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Cetak ID Card Santri</h1>
          <div className="flex gap-2">
            {isAdmin && (
              <Link
                to="/idcard/settings"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Settings className="w-5 h-5" />
                Template
              </Link>
            )}
            <button
              onClick={handlePrint}
              disabled={selectedIds.length === 0 || isPrinting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memuat gambar...
                </>
              ) : (
                <>
                  <Printer className="w-5 h-5" />
                  Cetak ({selectedIds.length})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search & Select All - Only for admin */}
        {!isSantri && !id && (
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama santri..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={selectAll}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {selectedIds.length === filteredSantri.length ? (
                <CheckSquare className="w-5 h-5 text-primary" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
              Pilih Semua
            </button>
          </div>
        )}

        {/* Santri Grid for Selection */}
        {!isSantri && !id && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredSantri.map((santri) => (
              <div
                key={santri.id}
                onClick={() => toggleSelect(santri.id)}
                className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                  selectedIds.includes(santri.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {selectedIds.includes(santri.id) ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <img
                  src={santri.foto_url || (santri.photo ? `${api.getBaseUrl()}/storage/fotosantri/${santri.photo}` : '/default-avatar.png')}
                  alt={santri.name}
                  className="w-full aspect-square object-cover rounded-lg mb-2"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=?'; }}
                />
                <p className="text-xs font-medium text-gray-900 truncate">{santri.name}</p>
                <p className="text-xs text-gray-500 truncate">{santri.konsentrasi_nama || '-'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Preview Section */}
        {selectedIds.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Preview ID Card ({selectedIds.length} santri)
            </h2>
            <div className="flex flex-wrap gap-4 justify-center p-6 bg-gray-100 rounded-xl">
              {selectedSantri.map((santri) => (
                <IdCard key={santri.id} santri={santri} settings={settings} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Print Area */}
      <div className="print-area hidden print:block" ref={printRef}>
        <div className="flex flex-wrap gap-2 justify-start">
          {selectedSantri.map((santri) => (
            <IdCard key={santri.id} santri={santri} settings={settings} />
          ))}
        </div>
      </div>
    </>
  );
}

function IdCard({ santri, settings }: { santri: Santri; settings: IdCardSettings }) {
  const photoUrl = santri.foto_url || (santri.photo ? `${api.getBaseUrl()}/storage/fotosantri/${santri.photo}` : 'https://via.placeholder.com/100?text=?');
  const currentYear = new Date().getFullYear();
  
  const bgColor = settings.idcard_bg_color || '#1e40af';
  const textColor = settings.idcard_text_color || '#ffffff';
  const showLogo = settings.idcard_show_logo !== '0';
  const showQr = settings.idcard_show_qr !== '0';
  const logoUrl = settings.idcard_logo_url || `${api.getBaseUrl()}/logo.png`;
  const backgroundUrl = settings.idcard_background_url;
  
  return (
    <div 
      className="id-card"
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Header with Logo - only show if no background image */}
      {!backgroundUrl && (
        <div 
          className="id-card-header"
          style={{
            background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 100%)`,
          }}
        >
          {showLogo && (
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="id-card-logo"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="id-card-header-text" style={{ color: textColor }}>
            <div className="title">{settings.idcard_title || 'Pondok Pesantren'}</div>
            <div className="subtitle">{settings.idcard_subtitle || 'Informatika'}</div>
          </div>
        </div>
      )}
      
      {/* Body */}
      <div className="id-card-body">
        {/* Show logo at top when using background image */}
        {backgroundUrl && showLogo && (
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="id-card-logo-standalone"
            style={{
              width: '12mm',
              height: '12mm',
              borderRadius: '50%',
              objectFit: 'contain',
              marginBottom: '2mm',
              background: 'white',
              padding: '1mm',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <img
          src={photoUrl}
          alt={santri.name}
          className="id-card-photo"
          style={{ borderColor: bgColor }}
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=?'; }}
        />
        <div className="id-card-name">{santri.name}</div>
        <div className="id-card-info">
          <div style={{ color: bgColor, fontWeight: 600 }}>{santri.konsentrasi_nama || '-'}</div>
          <div>Angkatan {santri.angkatan_nama || '-'}</div>
        </div>
        
        {/* QR Code */}
        {showQr && (
          <div className="id-card-qr-section">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${santri.id}`}
              alt="QR Code"
              className="id-card-qr"
            />
            <div className="id-card-qr-label">{settings.idcard_footer_text || 'Scan untuk verifikasi'}</div>
          </div>
        )}
      </div>
      
    </div>
  );
}
