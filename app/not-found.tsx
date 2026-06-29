import Link from "next/link";
import Image from "next/image";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-8">
        <Image src="/DevTrackAI_logo.png" alt="DevTrack AI" width={48} height={48} className="rounded-full mx-auto mb-6 opacity-80" />
        <p className="text-[11px] font-semibold text-brand uppercase tracking-widest mb-4">404 — Not Found</p>
        <h1 className="text-[36px] font-semibold tracking-tight mb-3">
          Page doesn&apos;t exist
        </h1>
        <p className="text-[15px] text-muted-foreground max-w-sm leading-relaxed">
          The page you&apos;re looking for has moved, been deleted, or never existed. Check the URL or head back to safety.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium bg-foreground text-background hover:opacity-90 rounded-[10px] transition-opacity duration-150"
        >
          <Home className="w-3.5 h-3.5" />
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-muted-foreground border border-border bg-muted hover:bg-surface-5 hover:text-foreground rounded-[10px] transition-colors duration-150"
        >
          <Search className="w-3.5 h-3.5" />
          Home
        </Link>
      </div>
    </div>
  );
}
