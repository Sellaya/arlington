"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { LogOut, User, Settings, LifeBuoy } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function UserNav() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);


  return (
    <div className="flex items-center gap-4">
      {mounted ? <ThemeToggle /> : <div className="h-10 w-10" /> }
      {mounted ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 w-12 rounded-full min-h-[48px] min-w-[48px] hover:scale-110 active:scale-95 transition-transform duration-200 touch-3d">
              <Avatar className="h-11 w-11 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200">
                <AvatarFallback className="bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Jane Doe</p>
                <p className="text-xs leading-none text-muted-foreground">
                  jane.doe@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="#">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/configuration">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="h-12 w-12 rounded-full">
          <Avatar className="h-11 w-11 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}
