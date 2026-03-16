"use client";

import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { LayoutDashboard, Award, Newspaper, Wrench, Users, MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "People", icon: Users },
  { href: "/achievements", label: "Achievements", icon: Award },
  { href: "/news", label: "News & Events", icon: Newspaper },
  { href: "/tools", label: "Developer Tools", icon: Wrench },
  { href: "/feedback", label: "Feedback", icon: MessageSquarePlus },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="gap-0.5">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <SidebarMenuItem key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-200 w-full",
                isActive
                  ? "bg-gradient-to-r from-primary/[0.18] to-accent/[0.08] text-sidebar-foreground"
                  : "text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-white/[0.05]"
              )}
            >
              {/* Icon box */}
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/40"
                    : "bg-white/[0.05] text-sidebar-foreground/50 group-hover:bg-white/[0.08] group-hover:text-sidebar-foreground/80"
                )}
              >
                <item.icon className="h-4 w-4" />
              </span>

              <span className="truncate flex-1">{item.label}</span>

              {/* Active dot */}
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 shadow-sm shadow-primary/60" />
              )}
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
