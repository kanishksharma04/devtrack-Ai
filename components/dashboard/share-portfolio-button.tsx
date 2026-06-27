"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SharePortfolioButtonProps {
  username: string;
}

export function SharePortfolioButton({ username }: SharePortfolioButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/u/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Portfolio link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#a3a3a3] border border-[rgba(255,255,255,0.06)] bg-[#1a1a1a] hover:bg-[#252525] hover:text-white rounded-[10px] transition-colors duration-150 cursor-pointer"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Share2 className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Share Portfolio"}
    </button>
  );
}
