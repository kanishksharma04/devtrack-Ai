"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  LineChart,
  Compass,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import Image from "next/image";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, tour: undefined },
    { name: "Repositories", href: "/dashboard/repos", icon: FolderGit2, tour: "nav-repos" },
    { name: "Analytics", href: "/dashboard/analytics", icon: LineChart, tour: "nav-analytics" },
    { name: "Career Coach", href: "/dashboard/career", icon: Compass, tour: "nav-career" },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, tour: undefined },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col w-64 border-r border-border bg-sidebar h-full text-foreground",
        className
      )}
    >
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <Image src="/DevTrackAI_logo.png" alt="DevTrack AI" width={28} height={28} className="rounded-full object-cover" />
        <span className="flex-1 text-[15px] font-semibold tracking-tight">
          DevTrack AI
        </span>
        <button
          onClick={onClose}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => onClose?.()}
              data-tour={link.tour}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium transition-colors duration-150 relative",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-brand rounded-full" />
              )}
              <Icon
                className={cn(
                  "w-[18px] h-[18px]",
                  isActive ? "text-brand" : "text-text-muted-custom"
                )}
              />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-red-500 transition-colors duration-150 cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
