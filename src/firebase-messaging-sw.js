// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCiKoNcLlW1n6ZT9lCHqowhsNisBrje0nI",
  authDomain: "chitchat-notifications.firebaseapp.com",
  projectId: "chitchat-notifications",
  storageBucket: "chitchat-notifications.firebasestorage.app",
  messagingSenderId: "592281793531",
  appId: "1:592281793531:web:ebc822afbac45e31a3d15e"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
// In browser console
self.registration.showNotification('Test', { body: 'Is this working?' });

// ✅ Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('🔵 BACKGROUND MESSAGE RECEIVED:', payload);

  const title = payload.notification?.title || 'New message';
  const body = payload.notification?.body || '';
  const conversationId = payload.data?.conversationId;

  const notificationOptions = {
    body: body,
    icon: '/assets/icons/icon-96x96.png',
    badge: '/assets/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      conversationId: conversationId,
      url: conversationId ? `/chat/${conversationId}` : '/chat'
    },
    actions: [
      { action: 'open', title: '💬 Open Chat' },
      { action: 'close', title: '✕ Close' }
    ],
    requireInteraction: true,
    tag: 'chat-notification',
    renotify: true
  };

  self.registration.showNotification(title, notificationOptions);
});

// ✅ Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔵 NOTIFICATION CLICKED:', event);
  event.notification.close();

  const conversationId = event.notification.data?.conversationId;
  const urlToOpen = conversationId ? `/chat/${conversationId}` : '/chat';

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

console.log('✅ Firebase Messaging Service Worker LOADED');