import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/modules/auth/schemas/auth.schema";
import { validateCredentials, validatePhoneCredentials } from "@/modules/auth/server/credentials";
import { db } from "@/lib/db";
import { getServerEnvironment } from "@/config/env";
import { getTrustedClientIp } from "@/lib/request-security";
import { consumeRateLimit } from "@/lib/rate-limit/rateLimiter";
import { getRateLimitKey } from "@/lib/rate-limit/getRateLimitKey";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";

const environment = getServerEnvironment();

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  update,
} = NextAuth({
  secret: environment.authSecret,
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/auth/login", error: "/auth/login" },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const limited = await consumeRateLimit(getRateLimitKey(request, "auth:login"), RATE_LIMIT_PRESETS.AUTH);
        if (!limited.allowed) return null;
        return validateCredentials(parsed.data.email, parsed.data.password, {
          userAgent: request?.headers?.get?.("user-agent") || null,
          ipAddress: request ? (getTrustedClientIp(request) || null) : null,
        });
      },
    }),
    Credentials({
      id: "phone-credentials",
      name: "Phone Credentials",
      credentials: {
        phoneNumber: { label: "Phone number", type: "tel" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const phoneNumber = String(credentials?.phoneNumber || "").trim();
        const password = String(credentials?.password || "");
        if (!/^[6-9]\d{9}$/.test(phoneNumber) || password.length < 6) return null;
        const limited = await consumeRateLimit(getRateLimitKey(request, "auth:phone-login"), RATE_LIMIT_PRESETS.AUTH);
        if (!limited.allowed) return null;
        return validatePhoneCredentials(phoneNumber, password, {
          userAgent: request?.headers?.get?.("user-agent") || null,
          ipAddress: request ? (getTrustedClientIp(request) || null) : null,
        });
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roles = user.roles || [user.role];
        token.permissions = user.permissions || [];
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phoneNumber = user.phoneNumber;
        token.familyId = user.familyId;
        token.authVersion = user.authVersion || 0;
        token.sessionId = user.sessionId;
        token.invalidated = false;
        return token;
      }

      if (!token.id || token.invalidated) return token;
      if (!token.sessionId) {
        token.invalidated = true;
        return token;
      }

      const dbSession = await db.session.findFirst({
        where: { id: token.sessionId, userId: token.id, revokedAt: null, expiresAt: { gt: new Date() } },
        include: { user: true },
      });
      const snapshot = dbSession?.user;
      if (!snapshot || snapshot.isBlocked || !snapshot.isActive || (snapshot.authVersion || 0) !== (token.authVersion || 0)) {
        token.invalidated = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || token.sub || "";
        session.user.role = token.role;
        session.user.roles = token.roles || (token.role ? [token.role] : []);
        session.user.permissions = token.permissions || [];
        session.user.email = token.email;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.phoneNumber = token.phoneNumber;
        session.user.familyId = token.familyId;
        session.user.sessionId = token.sessionId || "";
        session.user.invalidated = Boolean(token.invalidated);
      }
      return session;
    },
  },
});
