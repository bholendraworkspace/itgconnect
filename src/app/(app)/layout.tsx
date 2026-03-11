"use client";
import React, { useEffect } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";
import { Rocket, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/firebase";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <div>Loading...</div>; // Or a more sophisticated loading screen
  }

  if (!user) {
    return null; // Don't render the layout if not authenticated
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-r from-primary to-accent p-2">
              <Rocket className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">ITG Connect</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-4">
          <AppNav />
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Button
            asChild
            variant={pathname.startsWith("/profile") ? "secondary" : "ghost"}
            className="w-full justify-start gap-2"
          >
            <Link href="/profile">
              <User />
              Profile
            </Link>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Can be used for breadcrumbs or page titles */}
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
