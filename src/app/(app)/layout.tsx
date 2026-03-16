"use client";
import React, { useEffect } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { AppNav } from "@/components/app-nav";
import { useUser, useAuth } from "@/firebase";
import { useFirestoreSeed, useEnsureEmployee } from "@/hooks/use-firestore-data";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Rocket, Menu, X, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent animate-pulse shadow-lg shadow-primary/30" />
          <p className="text-sm text-muted-foreground">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <AppErrorBoundary>
      <AppLayoutInner>{children}</AppLayoutInner>
    </AppErrorBoundary>
  );
}

/** Animated hamburger — must live inside SidebarProvider */
function HamburgerButton() {
  const { openMobile, toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      aria-label="Toggle menu"
      className="md:hidden relative h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted/60 transition-colors duration-200"
    >
      <Menu
        className={`h-5 w-5 absolute transition-all duration-300 ${
          openMobile ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
        }`}
      />
      <X
        className={`h-5 w-5 absolute transition-all duration-300 ${
          openMobile ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
        }`}
      />
    </button>
  );
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const auth = useAuth();
  useFirestoreSeed();
  useEnsureEmployee(user);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      window.location.replace("/login");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        {/* Ambient glow overlays */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-10 h-56 w-56 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute bottom-8 right-0 h-44 w-44 rounded-full bg-accent/8 blur-3xl" />
        </div>

        {/* ── Logo ── */}
        <SidebarHeader className="relative px-5 py-5 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/40 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/50">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight leading-none text-sidebar-foreground">
                ITG Connect
              </h1>
              <p className="text-[10px] text-sidebar-foreground/35 mt-0.5 leading-none">
                Internal Hub
              </p>
            </div>
          </Link>
        </SidebarHeader>

        {/* ── Navigation ── */}
        <SidebarContent className="relative px-3 py-4 overflow-x-hidden">
          <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/30">
            Navigation
          </p>
          <AppNav />
        </SidebarContent>

        {/* ── User card footer ── */}
        <SidebarFooter className="relative px-3 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06]">
            <Avatar className="h-8 w-8 ring-2 ring-primary/30 shrink-0">
              {user?.photoURL && (
                <AvatarImage src={user.photoURL} alt={user.displayName || ""} />
              )}
              <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-primary to-accent text-white">
                {user?.displayName?.charAt(0) ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate leading-tight">
                {user?.displayName || "User"}
              </p>
              <p className="text-[10px] text-sidebar-foreground/40 truncate leading-tight">
                {user?.email || ""}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-1.5 rounded-lg text-sidebar-foreground/35 hover:text-sidebar-foreground hover:bg-white/10 transition-all duration-200 shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* ── Main content ── */}
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-border/50 bg-background/80 px-4 backdrop-blur-md md:px-6">
          <div className="flex items-center gap-3">
            <HamburgerButton />
            {/* Mobile wordmark */}
            <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/30">
                <Rocket className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">ITG Connect</span>
            </Link>
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 animate-fade-in">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
