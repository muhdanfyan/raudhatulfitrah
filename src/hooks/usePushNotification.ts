import { useState, useEffect, useCallback } from 'react';
import { initMessaging, getToken, onMessage, VAPID_KEY, getMessagingInstance } from '../config/firebase';
import { api } from '../services/api';

interface PushNotificationState {
  permission: NotificationPermission;
  token: string | null;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
}

export function usePushNotification() {
  const [state, setState] = useState<PushNotificationState>({
    permission: 'default',
    token: null,
    isSupported: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const init = async () => {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          error: 'Push notifications not supported',
        }));
        return;
      }

      const messaging = await initMessaging();
      
      if (!messaging) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          error: 'Firebase messaging not available',
        }));
        return;
      }

      const permission = Notification.permission;
      
      setState(prev => ({
        ...prev,
        permission,
        isSupported: true,
        isLoading: false,
      }));

      if (permission === 'granted') {
        await fetchToken();
      }
    };

    init();
  }, []);

  const fetchToken = useCallback(async () => {
    try {
      const messaging = getMessagingInstance();
      if (!messaging || !VAPID_KEY) return null;

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        setState(prev => ({ ...prev, token }));
        localStorage.setItem('fcm_token', token);
        await registerTokenWithBackend(token);
        return token;
      }
    } catch (error: any) {
      console.error('Error getting FCM token:', error);
      setState(prev => ({ ...prev, error: error.message }));
    }
    return null;
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const permission = await Notification.requestPermission();
      
      setState(prev => ({ ...prev, permission, isLoading: false }));

      if (permission === 'granted') {
        await fetchToken();
        return true;
      }
      
      return false;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message 
      }));
      return false;
    }
  }, [fetchToken]);

  const registerTokenWithBackend = async (token: string) => {
    try {
      const authToken = api.getToken();
      if (!authToken) return;

      await api.post('/fcm/register', {
        token,
        device_type: 'web',
        device_name: navigator.userAgent.substring(0, 100),
      });
    } catch (error) {
      console.error('Error registering token with backend:', error);
    }
  };

  const unregisterToken = useCallback(async () => {
    if (!state.token) return;

    try {
      const authToken = api.getToken();
      if (!authToken) return;

      await api.post('/fcm/unregister', { token: state.token });
      setState(prev => ({ ...prev, token: null }));
    } catch (error) {
      console.error('Error unregistering token:', error);
    }
  }, [state.token]);

  useEffect(() => {
    const messaging = getMessagingInstance();
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);

      if (Notification.permission === 'granted' && payload.notification) {
        new Notification(payload.notification.title || 'Pisantri', {
          body: payload.notification.body,
          icon: '/logo.png',
          badge: '/logo.png',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    ...state,
    requestPermission,
    unregisterToken,
    refreshToken: fetchToken,
  };
}
