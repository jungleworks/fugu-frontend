// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
if ('function' === typeof importScripts) {
  importScripts('https://www.gstatic.com/firebasejs/7.15.4/firebase-app.js');
  importScripts('https://www.gstatic.com/firebasejs/7.15.5/firebase-messaging.js');
}
// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: '[PROJECT_API_KEY]',
  authDomain: '[PROJECT_AUTH_DOMAIN]',
  databaseURL: '[PROJECT_DB_URL]',
  projectId: '[PROJECT_ID]',
  storageBucket: '[STORAGE_BUCKET]',
  messagingSenderId: '[MESSAGE_ID]',
  appId: '[WEB_APP_ID]',
  measurementId: '[MEASUREMENT_ID]'
});
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(async (payload) => {
  // Customize notification here
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    icon: payload.data.icon,
    data: {
      url: self.location.protocol + '//' + self.location.hostname + '/' + payload.data.workspace + "/messages/" + payload.data.channel_id,
      channel_id: payload.data.channel_id,
      muid: payload.data.muid,
      notification_type: payload.data.notification_type,
      is_thread_message: payload.data.is_thread_message,
      workspace: payload.data.workspace
    }
  };

  if (self.location.hostname === 'localhost') {
    notificationOptions.data.url = self.location.protocol + '//' + self.location.hostname + ':3900/' + payload.data.workspace + "/messages/" + payload.data.channel_id
  }

  if (payload.data.notification_type === '22') {
    notificationOptions.data.url = notificationOptions.data.url + '?openTask=true';
  }

  if (payload.data.notification_type === '23') {
    notificationOptions.data.url = self.location.protocol + '//' + self.location.hostname + '/' + payload.data.workspace + "/meet/"
  }

  notificationOptions.body = payload.data.body;
  if (payload.data.notification_type == 17) {
    const countMissedVar = await getNotificationCount(payload);
    if (countMissedVar > 0) {
      notificationOptions.body = `You have ${countMissedVar} missed calls`;
    }
    notificationOptions.data.count = countMissedVar || 1;
  }
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

async function getNotificationCount(payload) {
  if (payload.data.notification_type == 17) {
    return registration.getNotifications()
      .then(notificationArr => {
        let count = 0;
        notificationArr.map((notification) => {
          if (notification.data.notification_type == 17) {
            count = parseInt(( notification.data.count || 1 ) + 1);
            notification.close();
          }
        });
        return count;
      });
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: "window",
    includeUncontrolled: true
  }).then((clientList) => {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url.indexOf(self.location.hostname) > -1 && !client.url.includes('/conference')) {
        client.postMessage({
          channel_id: event.notification.data.channel_id,
          muid: event.notification.data.muid,
          notification_type: event.notification.data.notification_type,
          is_thread_message: event.notification.data.is_thread_message,
          noti_workspace: event.notification.data.workspace
        });
        client.focus();
        return;
      }
    }
    if (clients.openWindow) {
      if (event.notification.data.is_thread_message == 'true') {
        return clients.openWindow(`${event.notification.data.url}?muid=${event.notification.data.muid}`);
      } else {
        return clients.openWindow(event.notification.data.url);
      }
    }
  }));
});

const version = 'v3';
const cacheName = `fugu-messages-${version}`;
const ASSETS_CACHE = `assets-cache-${version}`;
// const IMAGE_CACHE = `image-cache-${version}`
const expectedCaches = [
  cacheName,
  ASSETS_CACHE
  // IMAGE_CACHE
];

self.oninstall = (event) => {
  self.skipWaiting();
  /*   event.waitUntil(caches.open(ASSETS_CACHE).then(cache => {
      cache.addAll([
        '/**.bundle.css',
        '/**.bundle.js',
        '/**.chunk.js',
        "/assets/**"
      ])
    })) */
};
self.onactivate = (event) => {
  if (self.clients && clients.claim) {
    clients.claim();
  }
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!expectedCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
};
self.addEventListener('fetch', (event) => {
  /**
   * Only store first page of messages in cache.
   * Cache then network, cache request in chat component.
   */
  if (event.request.url.includes('getMessages') && event.request.url.includes('page_start=1')
    && !event.request.url.includes('page_start=10')) {
    event.respondWith(
      caches.open(cacheName).then((cache) => {
        return fetch(event.request).then((response) => {
          const urlSubstring = event.request.url.substring(0, event.request.url.indexOf('&device_id'));
          cache.put(urlSubstring, response.clone());
          return response;
        });
      })
    );
  }
  if (/* event.request.url.includes('bundle.js') || event.request.url.includes('bundle.css') || event.request.url.includes('chunk.js')
          || */ event.request.url.includes('assets/')) {
    event.respondWith(
      caches.open(ASSETS_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            // found response in cache
            return response;
          }
          // Fetching request from the network
          return fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch((error) => {
          // Handles exceptions that arise from match() or fetch().
          console.error('Error in fetch handler:', error);
          throw error;
        });
      }));
  }  /* else if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      // for offline page
      fetch(event.request.url).catch(error => {
          // Return the offline page
          return caches.match(offlineUrl);
      })
    );
  } */
});
self.addEventListener('message', (event) => {
  if (event.data.source && event.data.source === 'alterMessageResponse') {
    caches.open(cacheName).then((cache) => {
      const response = new Response(JSON.stringify(event.data.response));
      cache.put(event.data.url, response);
    });
  }
});
