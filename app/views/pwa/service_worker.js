self.addEventListener("push", async (event) => {
  const data = await event.data.json()
  event.waitUntil(Promise.all([showNotification(data), updateBadgeCount(data.options)]))
})

async function showNotification({ title, options }) {
  return self.registration.showNotification(title, options)
}

async function updateBadgeCount({ data: { badge } }) {
  return self.navigator.setAppBadge?.(badge || 0)
}

self.addEventListener("notificationclick", (event) => {
  const clickedNotificationPath = event.notification.data.path
  const clickedRoomId = extractRoomId(clickedNotificationPath)

  event.waitUntil(
    self.registration.getNotifications().then(notifications => {
      notifications.forEach(notification => {
        const notificationRoomId = extractRoomId(notification.data?.path)

        if (notification.data?.path && notificationRoomId === clickedRoomId) {
          notification.close()
        }
      })
    }).then(() => {
      const url = new URL(clickedNotificationPath, self.location.origin).href
      return openURL(url)
    })
  )
})

function extractRoomId(path) {
  const match = path?.match(/\/rooms\/(\d+)/)
  return match ? match[1] : null
}

async function openURL(url) {
  const clients = await self.clients.matchAll({ type: "window" })
  const focused = clients.find((client) => client.focused)

  if (focused) {
    await focused.navigate(url)
  } else {
    await self.clients.openWindow(url)
  }
}
