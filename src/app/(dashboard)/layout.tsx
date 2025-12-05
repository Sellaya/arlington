"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Briefcase,
  Calendar,
  AreaChart,
  Settings,
  PanelLeft,
  Instagram,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { GlobalSearch } from "@/components/global-search";
import { AppFooter } from "@/components/app-footer";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/interactions", icon: MessageSquare, label: "Interactions" },
  { href: "/management", icon: Briefcase, label: "Management" },
  { href: "/bookings", icon: Calendar, label: "Bookings" },
  { href: "/analytics", icon: AreaChart, label: "Analytics" },
  { href: "/configuration", icon: Settings, label: "Configuration" },
];

function SidebarToggleButton() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="h-8 w-8 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
      aria-label="Toggle Sidebar"
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Command+K shortcut for global search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="offcanvas" className="hidden border-r border-border/40 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 backdrop-blur-xl shadow-3d-lg md:flex transition-all duration-200 ease-linear">
          <SidebarHeader className="px-4 pb-4 pt-5">
            <div className="flex items-center justify-between gap-2">
              <Link href="/" className="flex items-center gap-2 flex-1 min-w-0 group">
                <div className="relative h-10 w-10 flex-shrink-0">
                  <Image
                    src="/arlington-logo.png"
                    alt="The Arlington Estate Logo"
                    fill
                    className="object-contain transition-transform duration-200 group-hover:scale-105"
                    priority
                  />
                </div>
                <span className="text-base font-semibold font-headline truncate">
                  Arlington Estate
                </span>
              </Link>
              <SidebarToggleButton />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu className="px-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className="rounded-xl text-sm min-h-[48px] transition-all duration-200 transform-gpu data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/15 data-[active=true]:to-accent/10 data-[active=true]:text-primary data-[active=true]:shadow-3d-sm data-[active=true]:border-l-4 data-[active=true]:border-primary hover:scale-[1.02] hover:shadow-3d-sm active:scale-[0.98] touch-3d"
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="px-4 pb-4 pt-2 mt-auto">
            <div className="flex flex-col gap-2">
              <div className="h-px bg-sidebar-border/50 w-full" />
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-sidebar-foreground/70 text-center">
                  Product by{" "}
                  <a
                    href="https://www.instagram.com/sellayadigital"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sidebar-foreground hover:text-primary transition-colors duration-200 font-medium group"
                  >
                    <span>Sellaya</span>
                    <Instagram className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </a>
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="w-full max-w-none">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-20 flex h-14 w-full items-center gap-3 border-b border-border/40 bg-gradient-to-r from-background/95 via-background/90 to-background/95 px-3 backdrop-blur-xl shadow-3d-md sm:h-16 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <SidebarTrigger className="md:hidden flex-shrink-0" />
              <div className="flex items-center gap-2 md:hidden flex-1 min-w-0">
                <div className="relative h-8 w-8 flex-shrink-0">
                  <Image
                    src="/arlington-logo.png"
                    alt="The Arlington Estate Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">Arlington Estate</span>
                </div>
              </div>
              {/* Desktop toggle button */}
              <div className="hidden md:flex items-center gap-2 flex-1 min-w-0">
                <SidebarToggleButton />
                <div className="relative h-8 w-8 flex-shrink-0">
                  <Image
                    src="/arlington-logo.png"
                    alt="The Arlington Estate Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">Arlington Estate</span>
                </div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <UserNav />
            </div>
          </header>

          <main className="flex-1 w-full max-w-none px-3 pb-20 pt-4 sm:px-4 sm:pb-8 sm:pt-6 md:px-6 md:pb-10 md:pt-8 lg:px-8 lg:pb-12 lg:pt-10 xl:px-10 xl:pb-14 xl:pt-12 2xl:px-12 2xl:pb-16 2xl:pt-14">
            <div className="flex w-full max-w-none flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 2xl:gap-10">
              {children}
            </div>
          </main>

          {/* Footer */}
          <AppFooter />

          {/* Mobile Bottom Navigation */}
          <nav 
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-xl shadow-3d-lg md:hidden"
            aria-label="Main navigation"
          >
            <div className="grid grid-cols-6 h-16">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <item.icon 
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                    <span 
                      className="text-xs font-medium truncate w-full text-center px-1"
                      style={{ fontSize: 'clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem)' }}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </SidebarInset>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </SidebarProvider>
  );
}
