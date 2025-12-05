import type { Metadata } from "next";

import "./globals.css";

import { Toaster } from "@/components/ui/toaster";

import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Arlington Estate Dashboard",
  description: "Manage your AI Receptionist and view analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="font-body bg-background text-foreground antialiased min-h-screen">
        <ThemeProvider>
          {/* Mobile-first app shell */}
          <div className="flex min-h-screen flex-col">
            {children}
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
