import { useState, useEffect, useRef } from 'react';
import { api, getPublicHeaders } from '../services/api';
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { Camera, CheckCircle, XCircle, AlertCircle, Loader2, Volume2, VolumeX, Trash2, RefreshCw, SwitchCamera, HelpCircle } from 'lucide-react';
import { getStudentPhotoUrl } from '../utils/imageUtils';

interface Santri {
  id_santri: number;
  nama_santri: string;
  foto_santri: string | null;
}

interface Agenda {
  id_agenda: number;
  nama_agenda: string;
  waktu_mulai: string;
  waktu_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
}

interface PresensiRecord {
  id_presensi: number;
  nama_santri: string;
  waktu: string;
  agenda: number;
  agenda_nama?: string;
}

const QR_READER_ID = 'qr-reader';


export default function PresensiQRPage() {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [agendaList, setAgendaList] = useState<Agenda[]>([]);
  const [selectedAgenda, setSelectedAgenda] = useState<number>(1);
  const [todayPresensi, setTodayPresensi] = useState<PresensiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{ status: 'success' | 'error' | 'warning' | 'idle'; message: string; santri?: Santri }>({ 
    status: 'idle', 
    message: 'Klik tombol untuk aktifkan kamera' 
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [outsideSchedule, setOutsideSchedule] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<PresensiRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Camera selection states
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    fetchData();
    getCameras();
    
    return () => {
      stopCamera();
    };
  }, []);

  // Get available cameras
  const getCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setAvailableCameras(devices);
        // Prefer back camera
        const backCamera = devices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('belakang') ||
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        );
        setSelectedCameraId(backCamera?.id || devices[0].id);
      }
    } catch (err) {
      console.log('Camera enumeration requires permission first');
    }
  };

  const fetchData = async () => {
    try {
      const [santriRes, agendaRes, presensiRes]: any[] = await Promise.all([
        api.get('/public/santri-list', { headers: getPublicHeaders() }),
        api.get('/public/agenda', { headers: getPublicHeaders() }),
        api.get('/public/presensi-hari-ini', { headers: getPublicHeaders() }),
      ]);

      const mappedSantri = (santriRes.data || []).map((s: any) => ({
        id_santri: s.id,
        nama_santri: s.name,
        foto_santri: s.foto,
      }));

      setSantriList(mappedSantri);
      
      const mappedPresensi = (presensiRes.data || []).map((p: any) => ({
        id_presensi: p.id,
        nama_santri: p.nama_santri,
        waktu: p.waktu,
        agenda: p.agenda,
        agenda_nama: p.agenda_nama,
      }));
      setTodayPresensi(mappedPresensi);
      
      setAgendaList(agendaRes.data || agendaRes || []);
      autoSelectAgenda(agendaRes.data || agendaRes || []);
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  const autoSelectAgenda = (agendas: Agenda[]) => {
    // Get time in WITA (Asia/Makassar, GMT+8) regardless of device timezone
    const now = new Date();
    const targetOffset = -480; // WITA is GMT+8
    const currentOffset = now.getTimezoneOffset();
    const diff = currentOffset - targetOffset;
    const adjustedNow = new Date(now.getTime() + diff * 60000);
    
    const currentMinutes = adjustedNow.getHours() * 60 + adjustedNow.getMinutes();
    let found = false;

    for (const agenda of agendas) {
      if (agenda.jam_mulai && agenda.jam_selesai) {
        const [mH, mM] = agenda.jam_mulai.split(':').map(Number);
        const [sH, sM] = agenda.jam_selesai.split(':').map(Number);
        const m = mH * 60 + mM;
        const s = sH * 60 + sM;

        if (currentMinutes >= m && currentMinutes <= s) {
          setSelectedAgenda(agenda.id_agenda);
          found = true;
          break;
        }
      }
    }

    if (!found && agendas.length > 0) {
      setSelectedAgenda(agendas[0].id_agenda);
      setOutsideSchedule(true);
    }
  };

  const startCamera = async (deviceId?: string) => {
    if (isStarting) return;
    setIsStarting(true);
    setCameraError(null);
    
    const targetDeviceId = deviceId || selectedCameraId;

    try {
      // Request permission first using native API
      console.log('Requesting camera permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      // Stop the temporary stream
      stream.getTracks().forEach(track => track.stop());
      console.log('Camera permission granted');

      // Re-fetch cameras after permission granted
      if (availableCameras.length === 0) {
        await getCameras();
      }

      // Create new instance if needed
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(QR_READER_ID, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false
        });
      }

      // Stop if already running
      if (html5QrCodeRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
        await html5QrCodeRef.current.stop();
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      console.log('Starting scanner with device:', targetDeviceId || 'environment');
      
      if (targetDeviceId) {
        await html5QrCodeRef.current.start(
          targetDeviceId,
          config,
          onScanSuccess,
          onScanFailure
        );
      } else {
        // Use environment facing camera by default (back camera)
        await html5QrCodeRef.current.start(
          { facingMode: 'environment' },
          config,
          onScanSuccess,
          onScanFailure
        );
      }

      setCameraActive(true);
      setScanResult({ status: 'idle', message: 'Arahkan kamera ke QR Code' });
      console.log('Scanner started successfully');
      
    } catch (err: any) {
      console.error('Camera error:', err);
      handleCameraError(err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCameraError = (err: any) => {
    const errorMessage = err.message || err.toString() || '';
    const errorName = err.name || '';
    
    console.log('Camera error details:', { name: errorName, message: errorMessage });
    
    if (errorName === 'NotAllowedError' || errorMessage.includes('Permission') || errorMessage.includes('denied')) {
      setCameraError('Izin kamera ditolak');
      setScanResult({ status: 'error', message: 'Izin kamera ditolak. Klik bantuan untuk panduan.' });
      setShowPermissionHelp(true);
    } else if (errorName === 'NotFoundError' || errorMessage.includes('not found') || errorMessage.includes('Requested device not found')) {
      setCameraError('Kamera tidak ditemukan');
      setScanResult({ status: 'error', message: 'Tidak ada kamera yang terdeteksi.' });
    } else if (errorName === 'NotReadableError' || errorMessage.includes('in use') || errorMessage.includes('Could not start')) {
      setCameraError('Kamera sedang digunakan');
      setScanResult({ status: 'error', message: 'Kamera sedang digunakan aplikasi lain. Tutup dan coba lagi.' });
    } else if (errorName === 'OverconstrainedError') {
      setCameraError('Kamera tidak support');
      setScanResult({ status: 'error', message: 'Kamera tidak mendukung konfigurasi yang diminta.' });
    } else if (errorMessage.includes('https') || errorMessage.includes('secure') || errorName === 'SecurityError') {
      setCameraError('HTTPS diperlukan');
      setScanResult({ status: 'error', message: 'Akses via HTTPS untuk menggunakan kamera.' });
    } else {
      setCameraError(errorMessage || 'Gagal mengakses kamera');
      setScanResult({ status: 'error', message: `Error: ${errorMessage || 'Unknown'}` });
      setShowPermissionHelp(true);
    }
  };

  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
        await html5QrCodeRef.current.stop();
      }
    } catch (err) {
      console.log('Error stopping camera:', err);
    }
    setCameraActive(false);
  };

  const switchCamera = async () => {
    if (availableCameras.length <= 1) return;
    
    const currentIndex = availableCameras.findIndex(c => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];
    
    setSelectedCameraId(nextCamera.id);
    
    if (cameraActive) {
      await stopCamera();
      setTimeout(() => startCamera(nextCamera.id), 100);
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const santriId = parseInt(decodedText, 10);

    if (isNaN(santriId)) {
      setScanResult({ status: 'error', message: `QR tidak valid: ${decodedText}` });
      playSound('error');
      setTimeout(() => { isProcessingRef.current = false; }, 2000);
      return;
    }

    const foundSantri = santriList.find(s => s.id_santri === santriId);

    if (!foundSantri) {
      setScanResult({ status: 'error', message: `Santri tidak ditemukan (ID: ${santriId})` });
      playSound('error');
      setTimeout(() => { isProcessingRef.current = false; }, 2000);
      return;
    }

    setScanResult({ status: 'idle', message: `Menyimpan...`, santri: foundSantri });

    try {
      const res: any = await api.post('/public/presensi', { 
        santri: santriId, 
        agenda: selectedAgenda 
      }, { 
        headers: getPublicHeaders() 
      });
      
      const resData = res.data || res;
      setScanResult({ status: 'success', message: `Presensi berhasil!`, santri: foundSantri });
      playSound('success');

      setTodayPresensi(prev => [{
        id_presensi: resData.id,
        nama_santri: resData.nama_santri,
        waktu: resData.waktu,
        agenda: resData.agenda,
        agenda_nama: resData.agenda_nama
      }, ...prev.slice(0, 19)]);

      setTimeout(() => {
        setScanResult({ status: 'idle', message: 'Arahkan kamera ke QR Code', santri: undefined });
        isProcessingRef.current = false;
      }, 2500);

    } catch (err: any) {
      const errorMsg = err.message || 'Gagal menyimpan';
      if (errorMsg.includes('sudah presensi')) {
        setScanResult({ status: 'warning', message: `Sudah presensi`, santri: foundSantri });
      } else {
        setScanResult({ status: 'error', message: errorMsg, santri: foundSantri });
      }
      playSound('error');
      setTimeout(() => { isProcessingRef.current = false; }, 2000);
    }
  };

  const onScanFailure = (error: string) => {
    // Ignore scan failures (no QR found in frame)
  };

  const playSound = (type: 'success' | 'error') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = type === 'success' ? 800 : 300;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start();
      setTimeout(() => { osc.stop(); ctx.close(); }, type === 'success' ? 200 : 400);
    } catch (e) {}
  };

  const handleDeletePresensi = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`/public/presensi/${deleteConfirm.id_presensi}`, {
        headers: getPublicHeaders()
      });
      setTodayPresensi(prev => prev.filter(p => p.id_presensi !== deleteConfirm.id_presensi));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus presensi');
    } finally {
      setDeleting(false);
    }
  };

  const getAgendaTimeRange = (agenda: Agenda) => {
    return `${agenda.jam_mulai || '--:--'} - ${agenda.jam_selesai || '--:--'}`;
  };

  const isAgendaActive = (agenda: Agenda) => {
    if (!agenda.jam_mulai || !agenda.jam_selesai) return false;
    
    // Get time in WITA
    const now = new Date();
    const targetOffset = -480;
    const currentOffset = now.getTimezoneOffset();
    const diff = currentOffset - targetOffset;
    const adjustedNow = new Date(now.getTime() + diff * 60000);
    
    const curr = adjustedNow.getHours() * 60 + adjustedNow.getMinutes();
    const [mH, mM] = agenda.jam_mulai.split(':').map(Number);
    const [sH, sM] = agenda.jam_selesai.split(':').map(Number);
    return curr >= (mH * 60 + mM) && curr <= (sH * 60 + sM);
  };

  const getStatusStyle = () => {
    switch (scanResult.status) {
      case 'success': return 'bg-green-100 border-green-500 text-green-700';
      case 'error': return 'bg-red-100 border-red-500 text-red-700';
      case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      default: return 'bg-primary/5 border-blue-300 text-primary-dark';
    }
  };

  const getCurrentCameraLabel = () => {
    const cam = availableCameras.find(c => c.id === selectedCameraId);
    return cam?.label || 'Kamera';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
        <span className="ml-2">Memuat...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presensi QR Code</h1>
          <p className="text-gray-600 text-sm">Scan QR Code ID Card santri</p>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg border ${soundEnabled ? 'bg-primary/5 border-blue-300' : 'bg-gray-100'}`}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
        </button>
      </div>

      {/* Agenda */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {agendaList.map(agenda => (
            <button
              key={agenda.id_agenda}
              onClick={() => setSelectedAgenda(agenda.id_agenda)}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex flex-col items-center ${
                selectedAgenda === agenda.id_agenda
                  ? 'bg-primary text-white'
                  : isAgendaActive(agenda)
                    ? 'bg-green-100 text-green-800 border-2 border-green-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{agenda.nama_agenda}</span>
              <span className={`text-xs ${selectedAgenda === agenda.id_agenda ? 'text-blue-100' : 'text-gray-500'}`}>
                {getAgendaTimeRange(agenda)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {outsideSchedule && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-yellow-700">Di luar jadwal presensi</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scanner */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan QR Code
          </h2>
          
          {/* Camera Container */}
          <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden border-4 border-primary" style={{ minHeight: '300px' }}>
            {/* QR Reader Container - always visible for html5-qrcode */}
            <div 
              id={QR_READER_ID} 
              className="w-full"
              style={{ minHeight: '300px' }}
            />
            
            {/* Overlay when camera not active */}
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 bg-gray-900">
                <Camera className="w-16 h-16 mb-4 opacity-50" />
                
                {/* Camera selector */}
                {availableCameras.length > 1 && (
                  <div className="mb-4 w-64">
                    <label className="block text-sm text-gray-300 mb-1 text-center">Pilih Kamera:</label>
                    <select
                      value={selectedCameraId}
                      onChange={(e) => setSelectedCameraId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {availableCameras.map((camera, index) => (
                        <option key={camera.id} value={camera.id}>
                          {camera.label || `Kamera ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {availableCameras.length > 0 && (
                  <p className="text-xs text-gray-400 mb-2">
                    {availableCameras.length} kamera terdeteksi
                  </p>
                )}
                
                <button
                  onClick={() => startCamera()}
                  disabled={isStarting}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-blue-400 rounded-lg font-medium flex items-center gap-2"
                >
                  {isStarting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                  {isStarting ? 'Memulai...' : 'Aktifkan Kamera'}
                </button>
                
                <button
                  onClick={getCameras}
                  className="mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Kamera
                </button>
                
                {cameraError && (
                  <div className="mt-4 text-center">
                    <p className="text-red-400 text-sm px-4 mb-2">{cameraError}</p>
                    <button
                      onClick={() => setShowPermissionHelp(true)}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm flex items-center gap-2 mx-auto"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Bantuan
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Camera controls overlay */}
            {cameraActive && (
              <div className="absolute top-2 left-2 right-2 flex justify-between z-10">
                {availableCameras.length > 1 ? (
                  <button
                    onClick={switchCamera}
                    className="px-3 py-1 bg-primary hover:bg-primary-dark text-white rounded text-sm flex items-center gap-1"
                    title={`Ganti ke kamera lain (${availableCameras.length} tersedia)`}
                  >
                    <SwitchCamera className="w-4 h-4" />
                    <span className="hidden sm:inline">Ganti</span>
                  </button>
                ) : (
                  <div />
                )}
                <button
                  onClick={stopCamera}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Stop
                </button>
              </div>
            )}
          </div>

          {/* Current camera info */}
          {cameraActive && availableCameras.length > 0 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Menggunakan: {getCurrentCameraLabel()}
            </p>
          )}

          {/* Result */}
          <div className={`mt-4 p-4 rounded-lg border-2 ${getStatusStyle()}`}>
            <div className="flex items-center gap-3">
              {scanResult.status === 'success' && <CheckCircle className="w-6 h-6 text-green-500" />}
              {scanResult.status === 'error' && <XCircle className="w-6 h-6 text-red-500" />}
              {scanResult.status === 'warning' && <AlertCircle className="w-6 h-6 text-yellow-500" />}
              {scanResult.status === 'idle' && <Camera className="w-6 h-6 text-primary-light" />}
              <div>
                <p className="font-medium">{scanResult.message}</p>
                {scanResult.santri && <p className="text-sm opacity-75">ID: {scanResult.santri.id_santri}</p>}
              </div>
            </div>
          </div>

          {scanResult.santri && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center gap-4">
              <img
                src={scanResult.santri.foto_santri
                  ? getStudentPhotoUrl(scanResult.santri.foto_santri, `https://ui-avatars.com/api/?name=${encodeURIComponent(scanResult.santri.nama_santri)}&size=64`)
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(scanResult.santri.nama_santri)}&size=64`}
                alt=""
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(scanResult.santri?.nama_santri || '')}&size=64`;
                }}
              />
              <div>
                <h3 className="font-semibold">{scanResult.santri.nama_santri}</h3>
                <p className="text-sm text-gray-500">ID: {scanResult.santri.id_santri}</p>
              </div>
            </div>
          )}
        </div>

        {/* Today's List */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Presensi Hari Ini</h2>
            <button 
              onClick={() => {
                if (window.confirm('Bersihkan cache dan muat ulang halaman?')) {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }
              }}
              className="text-[10px] text-gray-400 hover:text-primary transition-colors underline"
            >
              Masalah tampilan? Refresh
            </button>
          </div>
          
          {todayPresensi.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Belum ada presensi</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(() => {
                const grouped: Record<string, typeof todayPresensi> = {};
                
                todayPresensi.forEach(p => {
                  const agendaItem = agendaList.find(a => String(a.id_agenda) === String(p.agenda));
                  const category = p.agenda_nama || agendaItem?.nama_agenda || 'Lainnya';
                  if (!grouped[category]) grouped[category] = [];
                  grouped[category].push(p);
                });

                // Get categories in order they appear or prioritize based on agendaList
                const categories = Object.keys(grouped);

                return categories.map(category => {
                  const items = grouped[category];

                  return (
                    <div key={category} className="mb-6 last:mb-0">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-gray-700">{category}</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {items.length} hadir
                        </span>
                      </div>
                      <div className="space-y-1">
                        {items.map((p, idx) => (
                          <div key={p.id_presensi} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs">
                                {idx + 1}
                              </span>
                              <span>{p.nama_santri}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">{p.waktu}</span>
                              <button
                                onClick={() => setDeleteConfirm(p)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                title="Hapus"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}

          <div className="mt-4 pt-4 border-t flex justify-between text-sm">
            <span className="text-gray-500">Total</span>
            <span className="font-semibold">{todayPresensi.length} presensi</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Hapus Presensi?</h3>
            <p className="text-gray-600 mb-4">
              Apakah Anda yakin ingin menghapus presensi <strong>{deleteConfirm.nama_santri}</strong> pada {deleteConfirm.waktu}?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                disabled={deleting}
              >
                Batal
              </button>
              <button
                onClick={handleDeletePresensi}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Help Dialog */}
      {showPermissionHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Izin Kamera Diperlukan</h3>
                <p className="text-sm text-gray-500">Untuk scan QR Code presensi</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-primary/5 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-primary-dark mb-2">Cara Mengaktifkan Izin Kamera:</h4>
                <div className="space-y-2 text-sm text-primary-dark">
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-200 text-primary-dark rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                    <span>Klik ikon <strong>gembok/info</strong> di address bar browser</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-200 text-primary-dark rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                    <span>Cari pengaturan <strong>"Kamera"</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-200 text-primary-dark rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                    <span>Ubah ke <strong>"Izinkan"</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-200 text-primary-dark rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                    <span><strong>Refresh halaman</strong> (tekan F5)</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Penting:</strong> Pastikan akses via <strong>HTTPS</strong> (https://pondokinformatika.id)
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowPermissionHelp(false)}
                className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setShowPermissionHelp(false);
                  setCameraError(null);
                  startCamera();
                }}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
