"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  LineChart,
  Compass,
  LogOut,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Repositories", href: "/dashboard/repos", icon: FolderGit2 },
    { name: "Analytics", href: "/dashboard/analytics", icon: LineChart },
    { name: "Career Coach", href: "/dashboard/career", icon: Compass },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col w-64 border-r border-border bg-card/30 backdrop-blur-md h-screen sticky top-0 text-foreground",
        className
      )}
    >
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg shadow-teal-500/20">
          <FaGithub className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent font-sans">
          DevTrack AI
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group duration-200",
                isActive
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-transform group-hover:scale-110",
                  isActive ? "text-emerald-400" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
