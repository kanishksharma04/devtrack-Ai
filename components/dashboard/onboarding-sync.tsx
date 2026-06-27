"use client";

import { useState } from "react";
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
    <button
      onClick={handleSync}
      disabled={syncing}
      className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-[10px] bg-white hover:bg-[#e5e5e5] text-[#090909] font-medium transition-colors duration-150 text-[13px] cursor-pointer disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Fetching Repositories..." : "Analyze GitHub Profile"}
    </button>
  );
}
