"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RefreshCw, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { data: session } = useSession();
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/account")
      .then((r) => r.json())
      .then((d) => { if (d.lastSyncedAt) setLastSynced(d.lastSyncedAt); })
      .catch(() => {});
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading("Syncing GitHub data...");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("GitHub data synced successfully!", { id: toastId });
        setLastSynced(new Date().toISOString());
        router.refresh();
      } else {
        toast.error(data.error || "Failed to sync data.", { id: toastId });
      }
    } catch {
      toast.error("An unexpected error occurred during sync.", { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "DEV";

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-[rgba(255,255,255,0.06)] bg-[#111111] sticky top-0 z-50 shrink-0 pt-safe">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onMenuClick}
          className="md:hidden flex items-center justify-center w-10 h-10 shrink-0 rounded-lg text-[#737373] hover:text-white hover:bg-[#1a1a1a] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-[16px] font-semibold text-white tracking-tight truncate">
            Welcome back, {session?.user?.name || "Developer"}
          </h1>
          <p className="hidden sm:block text-[12px] text-[#737373] mt-0.5">
            Analyze your repositories and map your tech career goals.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {lastSynced && (
          <span className="hidden md:block text-[11px] text-[#525252]">
            Synced {new Date(lastSynced).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <Button
          onClick={handleSync}
          disabled={syncing}
          variant="outline"
          size="sm"
          className="rounded-[10px] border-[rgba(255,255,255,0.06)] bg-[#1a1a1a] hover:bg-[#252525] text-[13px] h-9 gap-2 font-medium transition-colors duration-150 cursor-pointer text-[#a3a3a3] hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync GitHub"}</span>
        </Button>

        <div className="flex items-center gap-2 border-l border-[rgba(255,255,255,0.06)] pl-3">
          <Avatar className="w-8 h-8 rounded-[10px] border border-[rgba(255,255,255,0.06)]">
            <AvatarImage src={session?.user?.image || ""} className="object-cover" />
            <AvatarFallback className="rounded-[10px] bg-[#1a1a1a] text-[11px] text-[#737373] font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
