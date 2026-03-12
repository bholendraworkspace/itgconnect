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
import { useFirestoreSeed, useEnsureEmployee } from "@/hooks/use-firestore-data";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/login");
    }
  }, [user, isUserLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent animate-pulse shadow-lg shadow-primary/30" />
          <p className="text-sm text-muted-foreground">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <AppLayoutInner>{children}</AppLayoutInner>;
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  useFirestoreSeed(); // Seed Firestore with initial data on first load
  useEnsureEmployee(user); // Create employee record for logged-in user if missing

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-sidebar-border">
        <SidebarHeader className="px-5 py-5">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/30 transition-transform group-hover:scale-105">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none">ITG Connect</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">Internal Hub</p>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-3 py-2">
          <AppNav />
        </SidebarContent>

        <SidebarFooter className="px-3 py-4 border-t border-sidebar-border">
          <Button
            asChild
            variant={pathname.startsWith("/profile") ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 rounded-xl h-10 font-medium"
          >
            <Link href="/profile">
              <User className="h-4 w-4" />
              Profile
            </Link>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 animate-fade-in">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
