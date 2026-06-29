"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard/error]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto px-4">
      <div className="p-4 rounded-[14px] bg-red-500/10 border border-red-500/20 mb-6">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-[18px] font-semibold mb-2">Something went wrong</h2>
      <p className="text-[13px] text-muted-foreground mb-8 leading-relaxed">
        An unexpected error occurred in this section. Your data is safe — try refreshing or go back to the dashboard.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium bg-foreground text-background hover:opacity-90 rounded-[10px] transition-opacity duration-150 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-muted-foreground border border-border bg-muted hover:bg-surface-5 hover:text-foreground rounded-[10px] transition-colors duration-150"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
