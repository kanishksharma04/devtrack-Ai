"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeSidebar = () => {
    setSidebarOpen(false);
    // Return focus to the control that opened the drawer so keyboard users
    // aren't left with focus on a now-hidden element.
    menuButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!sidebarOpen) return;

    const drawer = drawerRef.current;
    // Move focus into the drawer on open, and trap Tab/Shift+Tab inside it
    // while it's the mobile overlay — without this, a keyboard user could
    // tab from the drawer's last link straight into the Navbar/content
    // sitting behind the backdrop, even though it's visually obscured.
    const focusable = drawer ? Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];
    focusable[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSidebar();
        return;
      }
      if (e.key !== "Tab" || !drawer) return;

      const items = Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-1 text-foreground">
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 md:hidden",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar: fixed overlay on mobile, in-flow on desktop */}
      <div
        ref={drawerRef}
        role={sidebarOpen ? "dialog" : undefined}
        aria-modal={sidebarOpen ? true : undefined}
        aria-label={sidebarOpen ? "Sidebar navigation" : undefined}
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-full transition-transform duration-200 ease-in-out",
          "md:relative md:z-auto md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onClose={closeSidebar} />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <Navbar onMenuClick={() => setSidebarOpen((s) => !s)} menuButtonRef={menuButtonRef} />
        <main className="flex-1 p-4 md:p-8 pb-safe">{children}</main>
      </div>
    </div>
  );
}
