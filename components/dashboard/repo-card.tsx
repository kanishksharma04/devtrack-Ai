"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, GitFork, ArrowUpRight, ShieldAlert, Cpu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
      } else {
        alert(data.error || "Failed to analyze repository.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during repo analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="flex flex-col h-full border border-border/80 bg-card hover:border-zinc-700 transition-all duration-300 group rounded-2xl relative overflow-hidden">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[200px] font-sans">
            {repo.name}
          </h3>
          <Link
            href={`/dashboard/repos/${repo.id}`}
            className="p-1.5 rounded-lg border border-border/50 bg-muted text-muted-foreground hover:text-foreground hover:bg-zinc-800 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] mb-4">
          {repo.description || "No description provided."}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          {repo.primaryLanguage && (
            <Badge variant="secondary" className="px-2 py-0.5 rounded-md text-[10px] bg-muted border-border font-mono">
              {repo.primaryLanguage}
            </Badge>
          )}
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-muted-foreground/20" />
            <span>{repo.stars}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="w-3.5 h-3.5" />
            <span>{repo.forks}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border bg-muted/10 flex items-center justify-between">
        {insight ? (
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
              Audit Score: {insight.codeQualityScore}/100
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">
              No Audit Data
            </span>
          </div>
        )}

        {!insight && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="text-[10px] font-bold text-white hover:text-emerald-400 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg border border-border transition-colors disabled:opacity-55 cursor-pointer"
          >
            {analyzing ? "Auditing..." : "Run AI Audit"}
          </button>
        )}
      </div>
    </Card>
  );
}
