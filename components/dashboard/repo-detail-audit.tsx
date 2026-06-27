"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Cpu, RefreshCw, CheckCircle2, ChevronRight } from "lucide-react";

interface RepoDetailAuditProps {
  repoId: string;
  initialInsights: any;
}

export function RepoDetailAudit({ repoId, initialInsights }: RepoDetailAuditProps) {
  const [insights, setInsights] = useState(initialInsights);
  const [loading, setLoading] = useState(false);

  const handleAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "repo", repositoryId: repoId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInsights(data.data);
      } else {
        alert(data.error || "Failed to analyze repository.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during audit.");
    } finally {
      setLoading(false);
    }
  };

  if (!insights) {
    return (
      <div className="p-8 border border-dashed border-border rounded-3xl bg-card/25 text-center max-w-2xl mx-auto my-12 text-foreground">
        <div className="w-12 h-12 bg-zinc-900 border border-border/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Cpu className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2 font-sans">Run AI Code Quality Audit</h3>
        <p className="text-xs text-muted-foreground mb-6">
          Submit this repository to Google Gemini for a complete review. Analyze readability, structure, performance and security metrics.
        </p>
        <Button
          onClick={handleAudit}
          disabled={loading}
          className="gap-2 px-6 py-5 rounded-2xl bg-white hover:bg-zinc-100 text-black font-semibold shadow-md shadow-white/5 transition-all text-xs cursor-pointer disabled:opacity-55"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing Source Code..." : "Run AI Code Audit"}
        </Button>
      </div>
    );
  }

  const scores = [
    { label: "Code Quality", value: insights.codeQualityScore, color: "from-blue-500 to-indigo-500" },
    { label: "Documentation", value: insights.documentationScore, color: "from-amber-500 to-orange-500" },
    { label: "Performance", value: insights.performanceScore, color: "from-emerald-500 to-teal-500" },
    { label: "Security Health", value: insights.securityScore, color: "from-rose-500 to-pink-500" },
    { label: "Readability Score", value: insights.readabilityScore, color: "from-cyan-500 to-blue-500" },
  ];

  return (
    <div className="space-y-8 text-foreground">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">AI Audit Completed</span>
        </div>
        <Button
          onClick={handleAudit}
          disabled={loading}
          variant="outline"
          size="sm"
          className="rounded-xl border-border bg-card hover:bg-muted text-xs h-9 gap-2 shadow-sm font-semibold transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Re-auditing..." : "Re-run AI Audit"}
        </Button>
      </div>

      {/* Scores Grid */}
      <div className="grid gap-4 sm:grid-cols-5">
        {scores.map((score, idx) => (
          <div key={idx} className="p-5 border border-border bg-card rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
              {score.label}
            </span>
            <div>
              <span className="text-3xl font-extrabold text-white tracking-tight">{score.value}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-4">
              <div
                className={`h-full bg-gradient-to-r ${score.color} rounded-full`}
                style={{ width: `${score.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Audit Detail Content */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Summary */}
        <div className="md:col-span-2 p-8 border border-border bg-card rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider border-b border-border/50 pb-4">
            Analysis Summary
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insights.summary}
          </p>
        </div>

        {/* Right Column: Highlights & Recommendations */}
        <div className="space-y-6">
          {/* Highlights */}
          <div className="p-6 border border-border bg-card rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-white font-sans uppercase tracking-wider">
              Project Highlights
            </h4>
            <ul className="space-y-3">
              {(insights.highlights as string[]).map((highlight, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-xs text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="p-6 border border-border bg-card rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-white font-sans uppercase tracking-wider">
              AI Recommendations
            </h4>
            <ul className="space-y-3">
              {(insights.recommendations as string[]).map((rec, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-xs text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
