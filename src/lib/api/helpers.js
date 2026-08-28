// lib/api/helpers.js

import { NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/rate-limit/rateLimiter";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";
import { getRateLimitKey } from "@/lib/rate-limit/getRateLimitKey";
import { db } from "@/lib/db";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { canResource } from "@/modules/auth/server/resource-authorization";
import { authorizeApiAction } from "@/modules/auth/authorization/api-policy";
import { isSameOriginMutation, getTrustedClientIp } from "@/lib/request-security";
import { PayloadTooLargeError, readJsonWithLimit } from "@/lib/request-body";
import { logger } from "@/lib/logger";
import { redactValue } from "@/lib/security/redact";

/* ============================================
   AUTHENTICATION HELPERS
   ============================================ */

/**
 * Resolve the canonical authenticated API user
 * @returns {Promise<{userId: string, isAdmin: boolean} | null>}
 */
export async function getApiUser(request) {
  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser?.id || sessionUser.invalidated) return null;

  const role = String(sessionUser.role || "").toUpperCase();
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  return {
    id: sessionUser.id,
    // Temporary compatibility alias for older API handlers. New code should use `id`.
    userId: sessionUser.id,
    role,
    permissions: sessionUser.permissions || [],
    isAdmin,
  };
}

/**
 * Middleware-style auth check with automatic error response
 */
export async function requireApiUser(request) {
  const user = await getApiUser(request);
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }
  return { error: null, user };
}

/**
 * Enforce an application permission using the canonical permission map.
 * Accepts the normalized user returned by setupApiHandler/requireApiUser.
 */
export function requirePermission(user, action, resource) {
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canResource(user, action, resource)) {
    return NextResponse.json(
      { error: "You don't have permission to perform this action" },
      { status: 403 },
    );
  }

  return null;
}

/* ============================================
   RATE LIMITING HELPERS
   ============================================ */

/**
 * Apply rate limiting with automatic error response
 * @param {Request} request - The request object
 * @param {string} action - The action being rate limited (e.g., "families:create")
 * @param {object} preset - Rate limit preset (default: ADMIN_API)
 * @returns {Promise<{error: NextResponse | null}>}
 */
export async function applyRateLimit(
  request,
  action,
  preset = RATE_LIMIT_PRESETS.ADMIN_API,
  userId = null,
) {
  const rateLimitKey = getRateLimitKey(request, action, userId);
  const rateLimitCheck = await consumeRateLimit(rateLimitKey, preset);

  if (!rateLimitCheck.allowed) {
    const response = NextResponse.json(
      { error: "Too many requests", retryAfter: rateLimitCheck.retryAfter },
      { status: 429 },
    );
    response.headers.set("Retry-After", String(rateLimitCheck.retryAfter || 1));
    return { error: response };
  }

  return { error: null, rateLimit: rateLimitCheck };
}

/* ============================================
   ACTIVITY LOGGING HELPERS
   ============================================ */

/**
 * Log activity to database
 */
export async function logActivity({
  userId,
  action,
  entity,
  entityId,
  entityName,
  description,
  request,
  metadata = {},
}) {
  try {
    const ipAddress = getTrustedClientIp(request) || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const requestId = request.headers.get("x-request-id") || request.headers.get("x-vercel-id") || null;

    await db.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        entityName,
        description,
        timestamp: new Date(),
        ipAddress,
        userAgent,
        requestId,
        metadata: Object.keys(metadata || {}).length ? metadata : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

/**
 * Helper to generate descriptive log messages for updates
 */
export function getUpdateDescription(entityName, entityType, changes) {
  const changedFields = Object.keys(changes).join(", ");
  return `Updated ${entityType} "${entityName}". Changed fields: ${changedFields}`;
}

/* ============================================
   VALIDATION HELPERS
   ============================================ */

/**
 * Handle Zod validation errors
 */
export function handleValidationError(error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Invalid request data", details: error.errors },
      { status: 400 },
    );
  }
  return null;
}

/**
 * Handle Prisma errors
 */
export function handlePrismaError(error, entityName = "resource") {
  // Unique constraint violation
  if (error.code === "P2002") {
    return NextResponse.json(
      { error: `A ${entityName} with this identifier already exists` },
      { status: 409 },
    );
  }

  // Record not found
  if (error.code === "P2025") {
    return NextResponse.json(
      {
        error: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} not found`,
      },
      { status: 404 },
    );
  }

  // Foreign key constraint violation
  if (error.code === "P2003") {
    return NextResponse.json(
      { error: "Cannot perform this operation due to related records" },
      { status: 409 },
    );
  }

  return null;
}

/* ============================================
   QUERY HELPERS
   ============================================ */
/**
 * Parse and validate pagination parameters
 */
export function parsePagination(searchParams, maxLimit = 100) {
  const rawPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const rawLimit = Number.parseInt(searchParams.get("limit") || "10", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Math.min(
    Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 10,
    maxLimit,
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Build pagination response
 */
export function buildPaginationResponse(page, limit, total, items) {
  const skip = (page - 1) * limit;
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + items.length < total,
  };
}

/**
 * Build search where clause for Prisma
 */
export function buildSearchWhere(search, fields) {
  if (!search) return {};

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: search,
        mode: "insensitive",
      },
    })),
  };
}

/* ============================================
   RESPONSE HELPERS
   ============================================ */

/**
 * Success response
 */
export function successResponse(data, message, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status },
  );
}

/**
 * Error response
 */
export function errorResponse(message, status = 500, details = null) {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status },
  );
}

/**
 * Not found response
 */
export function notFoundResponse(entityName = "Resource") {
  return errorResponse(`${entityName} not found`, 404);
}

/* ============================================
   ENTITY HELPERS
   ============================================ */

/**
 * Check if entity exists
 */
export async function findEntity(model, id, entityName = "Resource") {
  const entity = await db[model].findUnique({ where: { id } });

  if (!entity) {
    return {
      error: notFoundResponse(entityName),
      entity: null,
    };
  }

  return { error: null, entity };
}

/**
 * Check for duplicate by field
 */
export async function checkDuplicate(
  model,
  field,
  value,
  excludeId = null,
  additionalWhere = {},
) {
  const where = {
    [field]: {
      equals: value,
      mode: "insensitive",
    },
    ...additionalWhere,
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existing = await db[model].findFirst({ where });
  return existing !== null;
}

/* ============================================
   DATE VALIDATION HELPERS
   ============================================ */

/**
 * Validate date range
 */
export function validateDateRange(startDate, endDate, fieldName = "date") {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    return errorResponse(
      `End ${fieldName} must be after start ${fieldName}`,
      400,
    );
  }

  return null;
}

/**
 * Build update data object (removes undefined values)
 */
export function buildUpdateData(validated) {
  const updateData = {};

  for (const [key, value] of Object.entries(validated)) {
    if (value !== undefined) {
      updateData[key] = value;
    }
  }

  return updateData;
}

/* ============================================
   COMPOSITE HELPERS (CONVENIENCE)
   ============================================ */

/**
 * All-in-one handler for common API setup
 * Returns early if auth or rate limit fails
 */
export async function setupApiHandler(request, action, options = {}) {
  const {
    requireAuthentication = true,
    rateLimit = true,
    rateLimitPreset = RATE_LIMIT_PRESETS.ADMIN_API,
    sameOriginMutation = true,
    enforceRegisteredPolicy = false,
  } = options;

  if (sameOriginMutation && !isSameOriginMutation(request)) {
    return {
      error: NextResponse.json({ error: "Cross-origin mutation rejected" }, { status: 403 }),
      user: null,
    };
  }

  let user = null;
  if (requireAuthentication) {
    const authResult = await requireApiUser(request);
    if (authResult.error) return authResult;
    user = authResult.user;

    const policy = authorizeApiAction(action, user, { failClosed: enforceRegisteredPolicy });
    if (!policy.ok) return { error: policy.response, user };
  }

  if (rateLimit) {
    const rateLimitResult = await applyRateLimit(
      request,
      action,
      rateLimitPreset,
      user?.id || null,
    );
    if (rateLimitResult.error) return { ...rateLimitResult, user };
  }

  return { error: null, user };
}

export async function readJsonRequest(request, limitBytes = 64 * 1024) {
  return readJsonWithLimit(request, limitBytes);
}

/* ============================================
   ERROR HANDLER WRAPPER
   ============================================ */

/**
 * Wrap handler with comprehensive error handling
 */
export function withErrorHandling(handler, entityName = "resource") {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      logger.error("API request failed", {
        entityName,
        error: redactValue(error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error),
      });

      if (error instanceof PayloadTooLargeError) {
        return errorResponse("Request body is too large", 413, { limitBytes: error.limitBytes });
      }

      // Try Zod error
      const zodError = handleValidationError(error);
      if (zodError) return zodError;

      // Try Prisma error
      const prismaError = handlePrismaError(error, entityName);
      if (prismaError) return prismaError;

      // Generic error
      return errorResponse(`Failed to process ${entityName}`, 500);
    }
  };
}
