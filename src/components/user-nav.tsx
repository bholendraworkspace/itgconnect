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
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-primary/50">
            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ""} />}
            <AvatarFallback>
              {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
            {currentEmployee && (
              <span 
                className={`absolute -bottom-1 -right-1.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full px-[0.2rem] text-[9px] font-bold text-white shadow-sm ring-2 ring-background z-10 ${completion >= 100 ? "bg-emerald-500" : "bg-primary"}`}
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
