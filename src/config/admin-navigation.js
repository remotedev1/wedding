import {
  Activity,
  CircleDollarSign,
  LayoutDashboard,
  Newspaper,
  RadioTower,
  Settings,
  Trophy,
  UserCog,
  UsersRound,
} from "lucide-react";
import { PERMISSIONS } from "@/modules/auth/server/permissions";

export const baseSidebarData = {
  navGroups: [
    {
      title: "Operate",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
        { title: "Command Center", url: "/dashboard/command-center", icon: RadioTower, permission: PERMISSIONS.OPERATIONS_VIEW },
        { title: "Operational Alerts", url: "/dashboard/operations", icon: Activity, permission: PERMISSIONS.OPERATIONS_VIEW },
      ],
    },
    {
      title: "Tournament",
      items: [
        { title: "Tournaments", url: "/dashboard/tournaments", icon: Trophy, permission: PERMISSIONS.TOURNAMENTS_VIEW },
        { title: "Families & Teams", url: "/dashboard/families", icon: UsersRound, permission: PERMISSIONS.FAMILIES_VIEW },
        { title: "Players", url: "/dashboard/families/players", icon: UserCog, permission: PERMISSIONS.PLAYERS_VIEW },
        { title: "Payments", url: "/dashboard/payments", icon: CircleDollarSign, permission: PERMISSIONS.PAYMENTS_VIEW },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          title: "Configuration",
          icon: Settings,
          permission: PERMISSIONS.SETTINGS_MANAGE,
          items: [
            { title: "Site settings", url: "/dashboard/site-setting", permission: PERMISSIONS.SETTINGS_MANAGE },
            { title: "Sponsors", url: "/dashboard/tournaments/sponsors", permission: PERMISSIONS.SPONSORS_MANAGE },
          ],
        },
        {
          title: "Publishing",
          icon: Newspaper,
          permission: PERMISSIONS.CONTENT_MANAGE,
          items: [
            { title: "News", url: "/dashboard/news", permission: PERMISSIONS.CONTENT_MANAGE },
            { title: "Blog", url: "/dashboard/blog", permission: PERMISSIONS.CONTENT_MANAGE },
          ],
        },
      ],
    },
  ],
};
