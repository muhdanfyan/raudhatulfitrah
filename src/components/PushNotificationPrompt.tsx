import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X, Loader2 } from 'lucide-react';
import { usePushNotification } from '../hooks/usePushNotification';

export default function PushNotificationPrompt() {
  const { 
    permission, 
    isSupported, 
    isLoading, 
    requestPermission 
  } = usePushNotification();
  
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('push_prompt_seen');
    if (!hasSeenPrompt && isSupported && permission === 'default') {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    localStorage.setItem('push_prompt_seen', 'true');
  };

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      handleDismiss();
    }
  };

  if (!isSupported || permission === 'granted' || !showPrompt || dismissed) {
    return null;
  }

  if (permission === 'denied') {
    return (
      <div className="fixed bottom-4 right-4 max-w-sm bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-lg z-50">
        <div className="flex items-start gap-3">
          <BellOff className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800">Notifikasi Diblokir</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Aktifkan notifikasi di pengaturan browser untuk menerima update.
            </p>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white border border-gray-200 rounded-xl p-4 shadow-lg z-50">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Aktifkan Notifikasi</h3>
          <p className="text-sm text-gray-600 mt-1">
            Dapatkan update langsung tentang presensi, hafalan, dan informasi penting lainnya.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Aktifkan
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-gray-600 text-sm font-medium hover:text-gray-900"
            >
              Nanti saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
