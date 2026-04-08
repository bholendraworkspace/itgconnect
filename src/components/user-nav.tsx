"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useUser } from "@/firebase";
import { useEmployees } from "@/hooks/use-firestore-data";
import { calculateCompletion } from "@/lib/utils";
import { User, LogOut, Settings } from "lucide-react";
import Link from "next/link";

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { employees } = useEmployees();
  const currentEmployee = user ? employees.find((e) => e.email === user.email) : null;
  const completion = currentEmployee ? calculateCompletion(currentEmployee).percentage : 0;

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      window.location.replace("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (isUserLoading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-14 w-14 rounded-full p-0">
          <div className="relative flex items-center justify-center h-14 w-14">
            {/* Circular progress ring */}
            <svg className="absolute inset-0 h-14 w-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="25" fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="3" />
              {currentEmployee && (
                <circle
                  cx="28" cy="28" r="25" fill="none"
                  className={completion >= 100 ? "text-emerald-500" : "text-primary"}
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 25}`}
                  strokeDashoffset={`${2 * Math.PI * 25 * (1 - completion / 100)}`}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              )}
            </svg>
            {/* Centered avatar */}
            <Avatar className="h-9 w-9 absolute">
              {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ""} />}
              <AvatarFallback>
                {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Percentage badge */}
            {currentEmployee && (
              <span
                className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full px-1 text-[8px] font-bold text-white shadow-sm ring-1 ring-background ${completion >= 100 ? "bg-emerald-500" : "bg-primary"}`}
              >
                {completion}%
              </span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile/edit">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
