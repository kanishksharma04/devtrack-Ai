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
    <div className="flex flex-col h-full border border-border bg-card rounded-[14px] transition-transform duration-150 hover:-translate-y-0.5">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="font-semibold text-[14px] text-foreground truncate max-w-50">
            {repo.name}
          </h3>
          <Link
            href={`/dashboard/repos/${repo.id}`}
            className="p-1.5 rounded-[8px] border border-border bg-muted text-text-muted-custom hover:text-foreground hover:bg-surface-5 transition-colors duration-150"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-[12px] text-muted-foreground line-clamp-2 min-h-8 mb-4">
          {repo.description || "No description provided."}
        </p>

        <div className="flex items-center gap-3 text-[12px] text-text-muted-custom mb-4">
          {repo.primaryLanguage && (
            <Badge variant="secondary" className="px-2 py-0.5 rounded-md text-[10px] bg-muted border-border font-mono text-muted-foreground">
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

      <div className="px-6 py-4 border-t border-border bg-surface-2 rounded-b-[14px] flex items-center justify-between">
        {insight ? (
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-brand" />
            <span className="text-[10px] font-medium text-brand uppercase tracking-wider">
              Audit Score: {insight.codeQualityScore}/100
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-chart-3" />
            <span className="text-[10px] font-medium text-chart-3 uppercase tracking-wider">
              No Audit Data
            </span>
          </div>
        )}

        {!insight && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-surface-5 px-3 py-1.5 rounded-[8px] border border-border transition-colors duration-150 disabled:opacity-50 cursor-pointer"
          >
            {analyzing ? "Auditing..." : "Run AI Audit"}
          </button>
        )}
      </div>
    </div>
  );
}
