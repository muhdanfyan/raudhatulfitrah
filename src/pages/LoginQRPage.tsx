import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CheckCircle, XCircle, AlertCircle, Loader2, ArrowLeft, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { api, API_URL, getPublicHeaders } from '../services/api';



const mapRole = (role: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'superadmin': 'superadmin',
    'admin': 'superadmin',
    'akademik': 'akademik',
    'pembinaan': 'pembinaan',
    'asrama': 'asrama',
    'musyrif': 'musyrif',
    'pengontrol': 'musyrif',
    'koperasi': 'koperasi',
    'santri': 'santri',
    'members': 'santri',
  };
  return roleMap[role] || 'santri';
};

export default function LoginQRPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{ 
    status: 'success' | 'error' | 'warning' | 'idle' | 'scanning'; 
    message: string 
  }>({ 
    status: 'idle', 
    message: 'Klik tombol untuk aktifkan kamera' 
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setScanResult({ status: 'scanning', message: 'Menghidupkan kamera...' });

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        onScanFailure
      );

      setCameraActive(true);
      setScanResult({ status: 'scanning', message: 'Arahkan QR Code ke kamera' });
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError(err.message || 'Tidak dapat mengakses kamera');
      setScanResult({ status: 'error', message: 'Gagal mengakses kamera. Pastikan izin kamera diberikan.' });
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping camera:', err);
      }
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    
    // Pause scanning
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.pause();
      } catch (e) {
        // Ignore
      }
    }
    
    await processQRCode(decodedText);
  };

  const onScanFailure = (_error: any) => {
    // Ignore scan failures - this is called frequently when no QR code is detected
  };

  const processQRCode = async (data: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setScanResult({ status: 'scanning', message: 'Memproses QR Code...' });

    try {
      // QR Code bisa berisi santri_id langsung (angka) atau format lain
      let santriId = data.trim();

      // Coba parse jika berupa JSON
      try {
        const parsed = JSON.parse(data);
        if (parsed.santri_id) {
          santriId = parsed.santri_id.toString();
        } else if (parsed.id) {
          santriId = parsed.id.toString();
        }
      } catch {
        // Bukan JSON, gunakan data langsung
      }

      console.log('Processing santri_id:', santriId);

      const response = await fetch(`${API_URL}/auth/qr-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...getPublicHeaders()
        },
        body: JSON.stringify({ santri_id: santriId }),
      });

      const result = await response.json();

      if (result.status === 'success' && result.data) {
        setScanResult({ status: 'success', message: `Selamat datang, ${result.data.user.name}!` });
        
        // Simpan token ke api service DAN localStorage
        api.setToken(result.data.token);
        
        // Set user di context
        const mappedUser = {
          id: result.data.user.id.toString(),
          name: result.data.user.name,
          email: result.data.user.email,
          role: mapRole(result.data.user.role),
          photo: result.data.user.photo,
          santri_id: result.data.user.santri_id,
        };
        setUser(mappedUser);
        localStorage.setItem('pisantri_user', JSON.stringify(mappedUser));

        // Stop camera dan redirect
        await stopCamera();
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setScanResult({ status: 'error', message: result.message || 'QR Code tidak valid' });
        setTimeout(async () => {
          setIsProcessing(false);
          setScanResult({ status: 'scanning', message: 'Arahkan QR Code ke kamera' });
          // Resume scanning
          if (html5QrCodeRef.current) {
            try {
              await html5QrCodeRef.current.resume();
            } catch (e) {
              // Restart camera if resume fails
              await startCamera();
            }
          }
        }, 2000);
      }
    } catch (err: any) {
      console.error('QR Login error:', err);
      setScanResult({ status: 'error', message: 'Gagal memproses login. Coba lagi.' });
      setTimeout(async () => {
        setIsProcessing(false);
        setScanResult({ status: 'scanning', message: 'Arahkan QR Code ke kamera' });
        if (html5QrCodeRef.current) {
          try {
            await html5QrCodeRef.current.resume();
          } catch (e) {
            await startCamera();
          }
        }
      }, 2000);
    }
  };

  const getStatusColor = () => {
    switch (scanResult.status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'scanning': return 'bg-primary-light';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (scanResult.status) {
      case 'success': return <CheckCircle className="w-6 h-6" />;
      case 'error': return <XCircle className="w-6 h-6" />;
      case 'warning': return <AlertCircle className="w-6 h-6" />;
      case 'scanning': return <Loader2 className="w-6 h-6 animate-spin" />;
      default: return <QrCode className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/login" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Login dengan QR Code</h1>
              <p className="text-sm text-gray-600">Scan ID Card santri untuk masuk</p>
            </div>
          </div>

          {/* Camera View */}
          <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-4" style={{ minHeight: '300px' }}>
            <div id={scannerContainerId} className="w-full" />
            
            {/* Overlay saat kamera tidak aktif */}
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                <QrCode className="w-20 h-20 text-gray-600 mb-4" />
                <p className="text-gray-400 text-center px-4">
                  {cameraError || 'Kamera belum aktif'}
                </p>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className={`${getStatusColor()} text-white rounded-lg p-3 flex items-center gap-3 mb-4`}>
            {getStatusIcon()}
            <span className="font-medium">{scanResult.message}</span>
          </div>

          {/* Action Button */}
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Aktifkan Kamera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Matikan Kamera
            </button>
          )}

          {/* Alternative Login */}
          <div className="mt-4 text-center">
            <Link 
              to="/login" 
              className="text-primary hover:text-primary-dark text-sm font-medium"
            >
              Login dengan Email & Password
            </Link>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Cara Login:</h3>
            <ol className="text-sm text-primary-dark space-y-1 list-decimal list-inside">
              <li>Klik tombol "Aktifkan Kamera"</li>
              <li>Izinkan akses kamera di browser</li>
              <li>Arahkan QR Code ID Card ke kamera</li>
              <li>Tunggu hingga terbaca otomatis</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
