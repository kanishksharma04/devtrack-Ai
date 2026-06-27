"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto">
      <div className="p-4 rounded-[14px] bg-red-500/10 border border-red-500/20 mb-6">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-[18px] font-semibold text-white mb-2">Something went wrong</h2>
      <p className="text-[13px] text-[#a3a3a3] mb-6 leading-relaxed">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 text-[13px] font-medium text-[#090909] bg-white hover:bg-[#e5e5e5] rounded-[10px] transition-colors duration-150 cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
