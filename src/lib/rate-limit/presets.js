export const RATE_LIMIT_PRESETS = {
  AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 10, lockoutMs: 15 * 60 * 1000 },
  PASSWORD_RESET: { windowMs: 15 * 60 * 1000, maxRequests: 5, lockoutMs: 15 * 60 * 1000 },
  PUBLIC_REGISTRATION: { windowMs: 60 * 1000, maxRequests: 20 },
  PAYMENT: { windowMs: 60 * 1000, maxRequests: 20 },
  PUBLIC_API: { windowMs: 60 * 1000, maxRequests: 60 },
  AUTHENTICATED_API: { windowMs: 60 * 1000, maxRequests: 120 },
  ADMIN_API: { windowMs: 60 * 1000, maxRequests: 60 },
  SCORE_API: { windowMs: 60 * 1000, maxRequests: 180 },
};
