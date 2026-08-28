"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { baseSidebarData } from "@/config/admin-navigation";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import { useCurrentUser } from "@/modules/auth/hooks/use-current-user";
import { hasPermission } from "@/modules/auth/server/permissions";

function allowed(item, permissions) {
  return !item.permission || hasPermission(permissions, item.permission);
}

export function AppSidebar({ ...props }) {
  const { user } = useCurrentUser();
  const permissions = user?.permissions || [];
  const navGroups = baseSidebarData.navGroups.map((group) => ({
    ...group,
    items: group.items
      .filter((item) => allowed(item, permissions))
      .map((item) => item.items ? { ...item, items: item.items.filter((child) => allowed(child, permissions)) } : item)
      .filter((item) => !item.items || item.items.length > 0),
  })).filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <div className="flex h-12 items-center gap-3 px-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white dark:bg-white dark:text-slate-950">TC</div>
          <div className="min-w-0 overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{process.env.NEXT_PUBLIC_COMPANY_NAME || "Tournament Control"}</p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Operations console</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>{navGroups.map((group) => <NavGroup key={group.title} {...group} />)}</SidebarContent>
      <SidebarFooter><NavUser /></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
