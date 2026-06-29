"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global/error]", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-8">
          <Image src="/DevTrackAI_logo.png" alt="DevTrack AI" width={48} height={48} className="rounded-full mx-auto mb-6 opacity-80" />
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[14px] bg-red-500/10 border border-red-500/20 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-[11px] font-semibold text-red-500 uppercase tracking-widest mb-4">Server Error</p>
          <h1 className="text-[36px] font-semibold tracking-tight mb-3">
            Something went wrong
          </h1>
          <p className="text-[15px] text-muted-foreground max-w-sm leading-relaxed">
            An unexpected error occurred. Your data is safe. Try again or return to the homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium bg-foreground text-background hover:opacity-90 rounded-[10px] transition-opacity duration-150 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-muted-foreground border border-border bg-muted hover:bg-surface-5 hover:text-foreground rounded-[10px] transition-colors duration-150"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>
      </body>
    </html>
  );
}
