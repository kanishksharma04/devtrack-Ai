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
    <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent font-sans">
          Welcome back, {session?.user?.name || "Developer"}!
        </h1>
        <p className="text-xs text-muted-foreground">
          Analyze your repositories and map your tech career goals.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={handleSync}
          disabled={syncing}
          variant="outline"
          size="sm"
          className="rounded-xl border-border bg-card hover:bg-muted text-xs h-9 gap-2 shadow-sm font-medium transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync GitHub"}
        </Button>

        <div className="flex items-center gap-2 border-l border-border pl-4">
          <Avatar className="w-8 h-8 rounded-xl border border-border shadow-inner">
            <AvatarImage src={session?.user?.image || ""} className="object-cover" />
            <AvatarFallback className="rounded-xl bg-muted text-xs text-muted-foreground font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
