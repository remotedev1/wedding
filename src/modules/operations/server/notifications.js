import { db } from "@/lib/db";

export async function createOperationalNotification({
  type = "SYSTEM",
  severity = "INFO",
  title,
  message,
  href = null,
  audience = "ADMIN",
  entity = null,
  entityId = null,
  expiresAt = null,
}) {
  if (!title || !message) return null;
  try {
    return await db.operationalNotification.create({
      data: { type, severity, title, message, href, audience, entity, entityId, expiresAt, readBy: [] },
    });
  } catch (error) {
    console.error("Failed to create operational notification", error);
    return null;
  }
}

export async function markNotificationRead(notificationId, userId) {
  const notification = await db.operationalNotification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.readBy.includes(userId)) return notification;
  return db.operationalNotification.update({
    where: { id: notificationId },
    data: { readBy: { push: userId } },
  });
}
