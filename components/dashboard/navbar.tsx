"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("GitHub account data successfully synchronized!");
        window.location.reload();
      } else {
        alert(data.error || "Failed to sync data.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred during sync.");
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
    <header className="flex items-center justify-between px-8 py-4 border-b border-[rgba(255,255,255,0.06)] bg-[#111111] sticky top-0 z-50">
      <div>
        <h1 className="text-[16px] font-semibold text-white tracking-tight">
          Welcome back, {session?.user?.name || "Developer"}
        </h1>
        <p className="text-[12px] text-[#737373] mt-0.5">
          Analyze your repositories and map your tech career goals.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSync}
          disabled={syncing}
          variant="outline"
          size="sm"
          className="rounded-[10px] border-[rgba(255,255,255,0.06)] bg-[#1a1a1a] hover:bg-[#252525] text-[13px] h-9 gap-2 font-medium transition-colors duration-150 cursor-pointer text-[#a3a3a3] hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync GitHub"}
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
