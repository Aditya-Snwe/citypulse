// Service Worker for CityPulse Web Push Notifications
// Standards-based service worker compliant with W3C Push API and Notifications API.

self.addEventListener('install', (event) => {
  // Activate immediately
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  // Take control of all open clients immediately
  event.waitUntil(self.clients.claim())
})

// Listen for push notifications delivered by the push service
self.addEventListener('push', (event) => {
  if (!event.data) {
    return
  }

  let payload = {
    title: 'CityPulse Alert',
    body: 'A civic issue was reported near your saved location.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: {
      url: '/notifications',
    },
  }

  try {
    const json = event.data.json()
    if (json && typeof json === 'object') {
      payload = {
        title: json.title || payload.title,
        body: json.body || payload.body,
        icon: json.icon || payload.icon,
        badge: json.badge || payload.badge,
        data: {
          url: json.url || (json.reportId ? `/reports/${json.reportId}` : '/notifications'),
        },
      }
    }
  } catch {
    // If payload is plain text
    const text = event.data.text()
    if (text) {
      payload.body = text
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    data: payload.data,
    tag: payload.data?.url || 'citypulse-alert',
    renotify: true,
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions),
  )
})

// Handle notification click: focus existing window or open new one to target URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetPath = event.notification.data?.url || '/notifications'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Look for an existing client window to focus and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetPath)
          }
          return client.focus()
        }
      }
      // If no window is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetPath)
      }
    }),
  )
})
