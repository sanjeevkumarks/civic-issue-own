self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || "Digital Civic Response", {
    body: data.body || "",
    data: data.complaintId || null
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const complaintId = event.notification.data;
  const target = complaintId ? `/complaints/${complaintId}` : "/";
  event.waitUntil(clients.openWindow(target));
});
