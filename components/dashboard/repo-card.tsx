"use client";

import { Badge } from "@/components/ui/badge";
import { Star, GitFork, ArrowUpRight, ShieldAlert, Cpu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface RepoCardProps {
  repo: {
    id: string;
    name: string;
    description: string | null;
    primaryLanguage: string | null;
    stars: number;
    forks: number;
    htmlUrl: string;
    insights?: {
      codeQualityScore: number;
    } | null;
  };
}

export function RepoCard({ repo }: RepoCardProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [insight, setInsight] = useState(repo.insights);

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "repo", repositoryId: repo.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInsight(data.data);
        toast.success("Audit complete!");
      } else {
        toast.error(data.error || "Failed to analyze repository.");
      }
    } catch {
      toast.error("An error occurred during repo analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] transition-transform duration-150 hover:-translate-y-0.5">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="font-semibold text-[14px] text-white truncate max-w-[200px]">
            {repo.name}
          </h3>
          <Link
            href={`/dashboard/repos/${repo.id}`}
            className="p-1.5 rounded-[8px] border border-[rgba(255,255,255,0.06)] bg-[#1a1a1a] text-[#737373] hover:text-white hover:bg-[#252525] transition-colors duration-150"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-[12px] text-[#a3a3a3] line-clamp-2 min-h-[32px] mb-4">
          {repo.description || "No description provided."}
        </p>

        <div className="flex items-center gap-3 text-[12px] text-[#737373] mb-4">
          {repo.primaryLanguage && (
            <Badge variant="secondary" className="px-2 py-0.5 rounded-md text-[10px] bg-[#1a1a1a] border-[rgba(255,255,255,0.06)] font-mono text-[#a3a3a3]">
              {repo.primaryLanguage}
            </Badge>
          )}
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />
            <span>{repo.stars}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="w-3.5 h-3.5" />
            <span>{repo.forks}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.06)] bg-[#111111] rounded-b-[14px] flex items-center justify-between">
        {insight ? (
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-[10px] font-medium text-[#10B981] uppercase tracking-wider">
              Audit Score: {insight.codeQualityScore}/100
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="text-[10px] font-medium text-[#f59e0b] uppercase tracking-wider">
              No Audit Data
            </span>
          </div>
        )}

        {!insight && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="text-[11px] font-medium text-[#a3a3a3] hover:text-white bg-[#1a1a1a] hover:bg-[#252525] px-3 py-1.5 rounded-[8px] border border-[rgba(255,255,255,0.06)] transition-colors duration-150 disabled:opacity-50 cursor-pointer"
          >
            {analyzing ? "Auditing..." : "Run AI Audit"}
          </button>
        )}
      </div>
    </div>
  );
}
