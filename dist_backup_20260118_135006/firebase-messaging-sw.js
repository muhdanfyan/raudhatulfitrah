/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// TODO: Replace with your Firebase config from Firebase Console
// Go to: Firebase Console > Project Settings > General > Your apps > Web app
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "tiket-saya-e9058.firebaseapp.com",
  projectId: "tiket-saya-e9058",
  storageBucket: "tiket-saya-e9058.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Pisantri';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: payload.data?.notification_id || 'default',
    data: payload.data,
    actions: [
      { action: 'open', title: 'Buka' },
      { action: 'close', title: 'Tutup' },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data?.link || 'https://pisantri.online';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});
