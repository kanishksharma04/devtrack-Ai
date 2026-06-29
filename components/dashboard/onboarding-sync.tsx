"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function OnboardingSync() {
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading("Fetching your GitHub repositories...");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("GitHub profile synced successfully!", { id: toastId });
        router.refresh();
      } else {
        toast.error(data.error || "Failed to sync GitHub data.", { id: toastId });
      }
    } catch {
      toast.error("An error occurred during synchronization.", { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-[10px] bg-foreground hover:opacity-90 text-background font-medium transition-opacity duration-150 text-[13px] cursor-pointer disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Fetching Repositories..." : "Analyze GitHub Profile"}
    </button>
  );
}
