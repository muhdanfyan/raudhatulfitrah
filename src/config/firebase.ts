import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export const initFirebase = (): FirebaseApp | null => {
  if (!firebaseConfig.apiKey) {
    console.warn('Firebase config not found');
    return null;
  }
  
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
};

export const initMessaging = async (): Promise<Messaging | null> => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase messaging not supported');
      return null;
    }
    
    const firebaseApp = initFirebase();
    if (!firebaseApp) return null;
    
    if (!messaging) {
      messaging = getMessaging(firebaseApp);
    }
    return messaging;
  } catch (error) {
    console.error('Error initializing Firebase messaging:', error);
    return null;
  }
};

export const getMessagingInstance = (): Messaging | null => messaging;

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export { getToken, onMessage };
