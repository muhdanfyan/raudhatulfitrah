import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { Map, Marker } from 'pigeon-maps';
import { MapPin, Loader2, AlertCircle, Camera, CheckCircle, XCircle, Volume2, VolumeX, SwitchCamera, Navigation } from 'lucide-react';

const QR_READER_ID = 'qr-reader-hadir';


interface ScanResult {
  status: 'idle' | 'success' | 'error' | 'warning' | 'processing';
  message: string;
  data?: {
    santri_nama?: string;
    santri_foto?: string;
    agenda?: string;
    jarak_meter?: number;
    waktu?: string;
  };
}

interface PresensiRecord {
  id: number;
  santri_nama: string;
  agenda: string;
  waktu: string;
  jarak: number;
  via: string;
}

export default function HadirPage() {
  // GPS States
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<string>('unknown');
  
  // Live GPS Tracking States
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [lastGpsUpdate, setLastGpsUpdate] = useState<Date | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [gpsLost, setGpsLost] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Camera States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isStarting, setIsStarting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scan States
  const [scanResult, setScanResult] = useState<ScanResult>({ status: 'idle', message: 'Aktifkan GPS terlebih dahulu' });
  const [todayPresensi, setTodayPresensi] = useState<PresensiRecord[]>([]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    checkPermission();
    getCameras();
    fetchTodayPresensi();
    return () => { 
      stopCamera(); 
      stopGpsTracking();
    };
  }, []);

  // Start live GPS tracking
  const startGpsTracking = () => {
    if (!('geolocation' in navigator)) return;
    
    setIsTracking(true);
    setGpsLost(false);
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setAccuracy(position.coords.accuracy);
        setLastGpsUpdate(new Date());
        setGpsLost(false);
        setGpsError(null);
      },
      (err) => {
        setGpsLost(true);
        if (err.code === 1) setGpsError('Izin lokasi ditolak');
        else if (err.code === 2) setGpsError('GPS tidak tersedia');
        else if (err.code === 3) setGpsError('GPS timeout');
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 3000,
        timeout: 10000
      }
    );
  };

  // Stop GPS tracking
  const stopGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const fetchTodayPresensi = async () => {
    try {
      const json: any = await api.get('/api/public/presensi-hari-ini');
      const mapped = (json.data || []).map((p: any) => ({
        id: p.id,
        santri_nama: p.nama_santri,
        agenda: p.agenda_nama || p.agenda,
        waktu: p.waktu,
        jarak: p.jarak_meter || null,
        via: p.via || 'manual',
      }));
      setTodayPresensi(mapped);
    } catch (err) {
      console.error('Gagal fetch presensi:', err);
    }
  };

  const checkPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionState(permission.state);
      permission.onchange = () => setPermissionState(permission.state);
    } catch {
      setPermissionState('unsupported');
    }
  };

  const getLocationGPS = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Browser tidak mendukung GPS');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setGpsLoading(false);
        setScanResult({ status: 'idle', message: 'Arahkan kamera ke QR Code Santri' });
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) setGpsError('Izin lokasi ditolak');
        else if (err.code === 2) setGpsError('GPS tidak tersedia');
        else setGpsError('Timeout');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const getCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setAvailableCameras(devices);
        const backCamera = devices.find(d =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('belakang') ||
          d.label.toLowerCase().includes('rear')
        );
        setSelectedCameraId(backCamera?.id || devices[0].id);
      }
    } catch (err) {
      console.log('Camera enumeration requires permission first');
    }
  };

  const startCamera = async (deviceId?: string) => {
    if (isStarting || !lat || !lng) return;
    setIsStarting(true);
    setCameraError(null);

    const targetDeviceId = deviceId || selectedCameraId;

    try {
      // Request permission first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      stream.getTracks().forEach(track => track.stop());

      // Re-fetch cameras after permission
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

      if (targetDeviceId) {
        await html5QrCodeRef.current.start(targetDeviceId, config, onScanSuccess, () => {});
      } else {
        await html5QrCodeRef.current.start({ facingMode: 'environment' }, config, onScanSuccess, () => {});
      }

      setCameraActive(true);
      setScanResult({ status: 'idle', message: 'Arahkan kamera ke QR Code Santri' });
      
      // Start live GPS tracking saat kamera aktif
      startGpsTracking();
    } catch (err: any) {
      const errorMessage = err.message || err.toString() || '';
      const errorName = err.name || '';
      
      if (errorName === 'NotAllowedError' || errorMessage.includes('Permission') || errorMessage.includes('denied')) {
        setCameraError('Izin kamera ditolak. Aktifkan di pengaturan browser.');
      } else if (errorName === 'NotFoundError' || errorMessage.includes('not found')) {
        setCameraError('Kamera tidak ditemukan');
      } else if (errorName === 'NotReadableError' || errorMessage.includes('in use')) {
        setCameraError('Kamera sedang digunakan aplikasi lain');
      } else {
        setCameraError(errorMessage || 'Gagal mengakses kamera');
      }
    } finally {
      setIsStarting(false);
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
    
    // Stop GPS tracking saat kamera berhenti
    stopGpsTracking();
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
    if (isProcessingRef.current || !lat || !lng) return;
    
    // Block scan jika GPS hilang
    if (gpsLost) {
      setScanResult({ status: 'error', message: 'GPS hilang! Tunggu sampai sinyal kembali.' });
      playSound('error');
      return;
    }
    
    isProcessingRef.current = true;

    const santriId = parseInt(decodedText, 10);
    if (isNaN(santriId)) {
      setScanResult({ status: 'error', message: `QR tidak valid: ${decodedText}` });
      playSound('error');
      setTimeout(() => { isProcessingRef.current = false; }, 2000);
      return;
    }

    setScanResult({ status: 'processing', message: 'Memvalidasi lokasi...' });

    try {
      const json: any = await api.post('/api/public/presensi-hadir', {
        santri_id: santriId,
        scan_lat: lat,
        scan_lng: lng,
      });
      const data = json;
      // Since api service throws on non-2xx, we dont need res.ok
        let message = data.message || 'Gagal';
        if (data.code === 'NO_LOCATION') {
          message = `${data.santri_nama}: Belum set lokasi masjid di Dashboard`;
        } else if (data.code === 'OUT_OF_RADIUS') {
          message = `${data.santri_nama}: Di luar radius (${data.jarak_meter}m dari ${data.max_radius}m max)`;
        } else if (data.code === 'NO_AGENDA') {
          message = 'Tidak ada agenda aktif saat ini';
        } else if (data.code === 'ALREADY_PRESENT') {
          message = `${data.santri_nama}: Sudah presensi ${data.agenda}`;
          setScanResult({ status: 'warning', message, data: { santri_nama: data.santri_nama, agenda: data.agenda } });
          playSound('error');
          setTimeout(() => { isProcessingRef.current = false; }, 3000);
          return;
        }
        throw new Error(message);

      setScanResult({
        status: 'success',
        message: 'Presensi berhasil!',
        data: {
          santri_nama: data.data.santri_nama,
          santri_foto: data.data.santri_foto,
          agenda: data.data.agenda,
          jarak_meter: data.data.jarak_meter,
          waktu: data.data.waktu,
        },
      });
      playSound('success');

      setTodayPresensi(prev => [{
        id: data.data.id,
        santri_nama: data.data.santri_nama,
        agenda: data.data.agenda,
        waktu: data.data.waktu,
        jarak: data.data.jarak_meter,
        via: 'lokasi',
      }, ...prev]);

      setTimeout(() => {
        setScanResult({ status: 'idle', message: 'Arahkan kamera ke QR Code Santri' });
        isProcessingRef.current = false;
      }, 3000);

    } catch (err: any) {
      setScanResult({ status: 'error', message: err.message });
      playSound('error');
      setTimeout(() => { isProcessingRef.current = false; }, 3000);
    }
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
    } catch {}
  };

  const gpsReady = lat !== null && lng !== null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Presensi via Lokasi
          </h1>
          <p className="text-emerald-100 text-sm mt-1">Validasi GPS + Auto-detect Agenda</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* GPS Section */}
        <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
          isTracking ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-gray-200'
        }`}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className={`w-5 h-5 ${gpsReady ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span className="font-semibold text-gray-800">
                {isTracking ? 'Live GPS Tracking' : 'Lokasi GPS'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isTracking && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500 text-white animate-pulse">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  LIVE
                </span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                gpsLost ? 'bg-red-100 text-red-700' :
                gpsReady ? 'bg-green-100 text-green-700' :
                permissionState === 'denied' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {gpsLost ? 'Sinyal Hilang' :
                 gpsReady ? 'Aktif' : 
                 permissionState === 'denied' ? 'Ditolak' : 'Belum aktif'}
              </span>
            </div>
          </div>

          <div className="p-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                {!gpsReady ? (
                  <button
                    onClick={getLocationGPS}
                    disabled={gpsLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    {gpsLoading ? 'Mengambil lokasi...' : 'Aktifkan Lokasi GPS'}
                  </button>
                ) : (
                  <div className={`p-3 rounded-lg border ${
                    gpsLost ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {gpsLost ? (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        )}
                        <span className={`text-sm font-medium ${gpsLost ? 'text-red-800' : 'text-emerald-800'}`}>
                          {gpsLost ? 'GPS Hilang!' : 'Lokasi Terdeteksi'}
                        </span>
                      </div>
                      {accuracy && !gpsLost && (
                        <span className="text-xs text-emerald-600 font-medium">
                          ±{Math.round(accuracy)}m
                        </span>
                      )}
                    </div>
                    <p className={`font-mono text-xs ${gpsLost ? 'text-red-700' : 'text-emerald-700'}`}>
                      {lat?.toFixed(6)}, {lng?.toFixed(6)}
                    </p>
                    {isTracking && lastGpsUpdate && !gpsLost && (
                      <p className="text-xs text-emerald-600 mt-1">
                        Update: {Math.round((Date.now() - lastGpsUpdate.getTime()) / 1000)}s lalu
                      </p>
                    )}
                  </div>
                )}

                {gpsError && !gpsLost && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-red-600 text-xs">{gpsError}</p>
                  </div>
                )}
                
                {gpsLost && isTracking && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                    <p className="text-yellow-700 text-xs">
                      Sinyal GPS hilang! Presensi tidak bisa dilakukan sampai GPS kembali.
                    </p>
                  </div>
                )}
              </div>

              <div className="w-28 h-24 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                <Map center={[lat ?? -6.2088, lng ?? 106.8456]} zoom={lat ? 15 : 4}>
                  {lat !== null && lng !== null && (
                    <Marker width={24} anchor={[lat, lng]} color={gpsLost ? "#ef4444" : "#10b981"} />
                  )}
                </Map>
              </div>
            </div>
          </div>
        </div>

        {/* Scanner Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className={`w-5 h-5 ${cameraActive ? 'text-primary' : 'text-gray-400'}`} />
              <span className="font-semibold text-gray-800">Scan QR Santri</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-1.5 rounded hover:bg-gray-100">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-gray-600" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
              </button>
              {availableCameras.length > 1 && cameraActive && (
                <button onClick={switchCamera} className="p-1.5 rounded hover:bg-gray-100">
                  <SwitchCamera className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          <div className="p-4">
            {!gpsReady ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Aktifkan GPS terlebih dahulu</p>
                <p className="text-sm">GPS diperlukan untuk validasi lokasi presensi</p>
              </div>
            ) : (
              <>
                {!cameraActive ? (
                  <button
                    onClick={() => startCamera()}
                    disabled={isStarting}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    {isStarting ? 'Memulai kamera...' : 'Mulai Scan QR'}
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium text-sm"
                  >
                    Berhenti Scan
                  </button>
                )}

                {cameraError && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-red-600 text-xs">{cameraError}</p>
                  </div>
                )}

                {/* QR Reader Container */}
                <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden border-4 border-primary mt-4" style={{ minHeight: '300px' }}>
                  <div 
                    id={QR_READER_ID} 
                    className="w-full"
                    style={{ minHeight: '300px' }}
                  />
                  {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <div className="text-center text-gray-400">
                        <Camera className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p>Klik tombol untuk mulai scan</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scan Result */}
                <div className={`mt-4 p-4 rounded-lg ${
                  scanResult.status === 'success' ? 'bg-green-50 border border-green-200' :
                  scanResult.status === 'error' ? 'bg-red-50 border border-red-200' :
                  scanResult.status === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  scanResult.status === 'processing' ? 'bg-primary/5 border border-blue-200' :
                  'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {scanResult.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
                    {scanResult.status === 'error' && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                    {scanResult.status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />}
                    {scanResult.status === 'processing' && <Loader2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 animate-spin" />}
                    {scanResult.status === 'idle' && <Camera className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />}

                    <div className="flex-1">
                      <p className={`font-medium ${
                        scanResult.status === 'success' ? 'text-green-800' :
                        scanResult.status === 'error' ? 'text-red-800' :
                        scanResult.status === 'warning' ? 'text-yellow-800' :
                        scanResult.status === 'processing' ? 'text-primary-dark' :
                        'text-gray-600'
                      }`}>
                        {scanResult.message}
                      </p>

                      {scanResult.data && scanResult.status === 'success' && (
                        <div className="mt-2 text-sm space-y-1">
                          <p className="text-green-700"><strong>{scanResult.data.santri_nama}</strong></p>
                          <p className="text-green-600">Agenda: {scanResult.data.agenda}</p>
                          <p className="text-green-600">Jarak: {scanResult.data.jarak_meter}m | Waktu: {scanResult.data.waktu}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs font-medium">
                            via Lokasi
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-primary/5 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-primary-dark mb-2">Cara Kerja</h3>
          <ul className="text-sm text-primary-dark space-y-1">
            <li>1. Aktifkan GPS perangkat Anda (sekali di awal)</li>
            <li>2. Klik "Mulai Scan QR" - GPS akan tracking otomatis</li>
            <li>3. Scan QR Code Santri</li>
            <li>4. Sistem validasi jarak dengan koordinat TERBARU (max 10m)</li>
            <li>5. Agenda terdeteksi otomatis berdasarkan waktu</li>
          </ul>
          <p className="text-xs text-primary mt-2 italic">
            * GPS tracking aktif selama kamera menyala untuk mencegah kecurangan lokasi
          </p>
        </div>

        {/* Today's Presensi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4">Presensi Hari Ini</h2>
          
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
                  const category = p.agenda || 'Lainnya';
                  if (!grouped[category]) grouped[category] = [];
                  grouped[category].push(p);
                });

                // Get unique categories and sort them (latest first based on time of first item)
                const sortedCategories = Object.keys(grouped).sort((a, b) => {
                  const timeA = grouped[a][0]?.waktu || '';
                  const timeB = grouped[b][0]?.waktu || '';
                  return timeB.localeCompare(timeA);
                });

                return sortedCategories.map(category => {
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
                          <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs">
                                {idx + 1}
                              </span>
                              <span>{p.santri_nama}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">{p.waktu}</span>
                              {p.jarak && <span className="text-xs text-emerald-600 font-medium">{p.jarak}m</span>}
                              <span className={`px-1.5 py-0.5 rounded text-xs ${
                                p.via === 'lokasi' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {p.via === 'lokasi' ? 'Lokasi' : 'Manual'}
                              </span>
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
    </div>
  );
}
