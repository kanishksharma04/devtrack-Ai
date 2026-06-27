"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function OnboardingSync() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("GitHub profile data successfully synchronized!");
        window.location.reload();
      } else {
        alert(data.error || "Failed to sync GitHub data.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during synchronization.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={syncing}
      className="gap-2 px-6 py-5 rounded-2xl bg-white hover:bg-zinc-100 text-black font-semibold shadow-md shadow-white/5 transition-all text-sm cursor-pointer disabled:opacity-55"
    >
      <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Fetching Repositories..." : "Analyze GitHub Profile"}
    </Button>
  );
}
