"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const Header = ({ className, children, ...props }) => (
  <header
    className={cn(
      "flex h-16 shrink-0 items-center gap-3 px-4 sm:gap-4 sm:px-6",
      className
    )}
    {...props}
  >
    <SidebarTrigger variant="outline" className="h-9 w-9 shrink-0" />
    <Separator orientation="vertical" className="h-6" />
    {children}
  </header>
);
