import crypto from "node:crypto";
import { getTrustedClientIp } from "@/lib/request-security";

function hash(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 32);
}

export function getRateLimitKey(request, action, userId = null) {
  const ip = getTrustedClientIp(request) || "direct";
  const subject = userId ? `user:${userId}` : `ip:${hash(ip)}`;
  return `${String(action || "api")}:${subject}`;
}
