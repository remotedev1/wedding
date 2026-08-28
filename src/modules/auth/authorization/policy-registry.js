import { PERMISSIONS } from "@/modules/auth/server/permissions";

export const POLICY_REGISTRY = {
  routes: {
    "/dashboard": { permission: PERMISSIONS.DASHBOARD_VIEW },
    "/dashboard/command-center": { permission: PERMISSIONS.OPERATIONS_VIEW },
    "/dashboard/operations": { permission: PERMISSIONS.OPERATIONS_VIEW },
    "/dashboard/payments": { permission: PERMISSIONS.PAYMENTS_VIEW },
    "/dashboard/families": { permission: PERMISSIONS.FAMILIES_VIEW },
    "/dashboard/families/players": { permission: PERMISSIONS.PLAYERS_VIEW },
    "/dashboard/users": { permission: PERMISSIONS.USERS_VIEW },
    "/dashboard/blog": { permission: PERMISSIONS.CONTENT_MANAGE },
    "/dashboard/change-password": { permission: PERMISSIONS.DASHBOARD_VIEW },
    "/dashboard/news": { permission: PERMISSIONS.CONTENT_MANAGE },
    "/dashboard/site-setting": { permission: PERMISSIONS.SETTINGS_MANAGE },
    "/dashboard/tournaments": { permission: PERMISSIONS.TOURNAMENTS_VIEW },
    "/dashboard/tournaments/[tournamentId]": { permission: PERMISSIONS.TOURNAMENTS_VIEW },
    "/dashboard/tournaments/[tournamentId]/operations": { permission: PERMISSIONS.OPERATIONS_VIEW },
    "/dashboard/tournaments/[tournamentId]/edit": { permission: PERMISSIONS.TOURNAMENTS_UPDATE },
    "/dashboard/tournaments/[tournamentId]/games": { permission: PERMISSIONS.GAMES_MANAGE },
    "/dashboard/tournaments/[tournamentId]/matches": { permission: PERMISSIONS.MATCHES_VIEW },
    "/dashboard/tournaments/[tournamentId]/matches/[matchesId]/result-correction": { permission: PERMISSIONS.MATCHES_MANAGE },
    "/dashboard/tournaments/[tournamentId]/participants": { permission: PERMISSIONS.PARTICIPANTS_MANAGE },
    "/dashboard/tournaments/[tournamentId]/placements": { permission: PERMISSIONS.PLACEMENTS_MANAGE },
    "/dashboard/tournaments/[tournamentId]/results": { permission: PERMISSIONS.OPERATIONS_VIEW },
    "/dashboard/tournaments/[tournamentId]/schedule": { permission: PERMISSIONS.OPERATIONS_VIEW },
    "/dashboard/tournaments/[tournamentId]/staff": { permission: PERMISSIONS.MATCHES_MANAGE },
    "/dashboard/tournaments/[tournamentId]/venues": { permission: PERMISSIONS.TOURNAMENTS_UPDATE },
    "/dashboard/tournaments/sponsors": { permission: PERMISSIONS.SPONSORS_MANAGE },
  },
  api: {
    "users:list": { permission: PERMISSIONS.USERS_VIEW },
    "users:create": { permission: PERMISSIONS.USERS_CREATE },
    "users:update": { permission: PERMISSIONS.USERS_UPDATE },
    "families:list": { permission: PERMISSIONS.FAMILIES_VIEW },
    "families:create": { permission: PERMISSIONS.FAMILIES_CREATE },
    "families:update": { permission: PERMISSIONS.FAMILIES_UPDATE },
    "players:list": { permission: PERMISSIONS.PLAYERS_VIEW },
    "players:manage": { permission: PERMISSIONS.PLAYERS_MANAGE },
    "tournaments:list": { permission: PERMISSIONS.TOURNAMENTS_VIEW },
    "tournaments:create": { permission: PERMISSIONS.TOURNAMENTS_CREATE },
    "tournaments:update": { permission: PERMISSIONS.TOURNAMENTS_UPDATE },
    "matches:list": { permission: PERMISSIONS.MATCHES_VIEW },
    "matches:update": { permission: PERMISSIONS.MATCHES_MANAGE },
    "matches:score": { permission: PERMISSIONS.MATCHES_SCORE },
    "payments:list": { permission: PERMISSIONS.PAYMENTS_VIEW },
    "payments:manage": { permission: PERMISSIONS.PAYMENTS_MANAGE },
    "operations:view": { permission: PERMISSIONS.OPERATIONS_VIEW },
    "operations:manage": { permission: PERMISSIONS.OPERATIONS_MANAGE },
    "content:manage": { permission: PERMISSIONS.CONTENT_MANAGE },
    "media:manage": { permission: PERMISSIONS.CONTENT_MANAGE },
    "family-tree:manage": { permission: PERMISSIONS.CONTENT_MANAGE },
  },
};

export function evaluateAccessRule(subject, rule){
  if(!rule) return false;
  const permissions=subject?.permissions||[];
  if(rule.authenticated && !subject) return false;
  if(rule.permission && !permissions.includes("*") && !permissions.includes(rule.permission)) return false;
  if(rule.anyOf && !rule.anyOf.some(p=>permissions.includes("*")||permissions.includes(p))) return false;
  if(rule.allOf && !rule.allOf.every(p=>permissions.includes("*")||permissions.includes(p))) return false;
  return true;
}
