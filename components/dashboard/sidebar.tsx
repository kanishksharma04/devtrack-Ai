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
        "flex flex-col w-64 border-r border-[rgba(255,255,255,0.06)] bg-[#111111] h-screen sticky top-0 text-foreground",
        className
      )}
    >
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#10B981]">
          <FaGithub className="w-4 h-4 text-white" />
        </div>
        <span className="text-[15px] font-semibold text-white tracking-tight">
          DevTrack AI
        </span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium transition-colors duration-150 relative",
                isActive
                  ? "bg-[#1a1a1a] text-white"
                  : "text-[#a3a3a3] hover:bg-[#1a1a1a]/50 hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#10B981] rounded-full" />
              )}
              <Icon
                className={cn(
                  "w-[18px] h-[18px]",
                  isActive ? "text-[#10B981]" : "text-[#737373]"
                )}
              />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-[#a3a3a3] hover:bg-[#1a1a1a]/50 hover:text-red-400 transition-colors duration-150 cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
