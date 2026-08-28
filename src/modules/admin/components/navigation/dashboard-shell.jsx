"use client";

import { CommandPalette } from "@/modules/admin/components/navigation/CommandPallete";
import { Header } from "@/modules/admin/components/navigation/header";
import { ProfileDropdown } from "@/modules/admin/components/navigation/profile-dropdown";
import { AppSidebar } from "@/modules/admin/components/navigation/sidebar";
import { ThemeSwitch } from "@/modules/admin/components/navigation/theme-switch";
import { TopNav } from "@/modules/admin/components/navigation/top-nav";
import { SidebarProvider } from "@/components/ui/sidebar";

const topNav = [{ title: "Overview", href: "/dashboard", isActive: true, disabled: false }];

export function DashboardShell({ children }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
        <AppSidebar />
        <div className="min-w-0 flex flex-1 flex-col">
          <Header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
            <TopNav links={topNav} />
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <CommandPalette />
              <ThemeSwitch />
              <ProfileDropdown />
            </div>
          </Header>
          <main className="flex-1 overflow-x-hidden">
            <div className="page-shell">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
