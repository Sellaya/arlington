"use client";

import React from "react";
import { Instagram } from "lucide-react";

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-xl mt-auto pb-20 md:pb-0">
      <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {currentYear} Arlington Estate. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <a
              href="https://www.instagram.com/sellayadigital"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              <span>Sellaya</span>
              <Instagram className="h-3 w-3 opacity-70" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

