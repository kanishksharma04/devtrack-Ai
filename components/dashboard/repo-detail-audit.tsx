"use client";

import { useState } from "react";
import { Cpu, RefreshCw, CheckCircle2, ChevronRight, Clock, Download } from "lucide-react";
import { toast } from "sonner";

interface RepoDetailAuditProps {
  repoId: string;
  initialInsights: any;
}

export function RepoDetailAudit({ repoId, initialInsights }: RepoDetailAuditProps) {
  const [insights, setInsights] = useState(initialInsights);
  const [loading, setLoading] = useState(false);

  const handleAudit = async () => {
    setLoading(true);
    const toastId = toast.loading("Running AI code audit...");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "repo", repositoryId: repoId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInsights(data.data);
        toast.success("Audit complete!", { id: toastId });
      } else {
        toast.error(data.error || "Failed to analyze repository.", { id: toastId });
      }
    } catch {
      toast.error("An error occurred during audit.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!insights) {
    return (
      <div className="p-8 border border-dashed border-border rounded-[14px] bg-card text-center max-w-2xl mx-auto my-12 text-foreground">
        <div className="w-12 h-12 bg-muted rounded-[10px] flex items-center justify-center mx-auto mb-4">
          <Cpu className="w-5 h-5 text-brand" />
        </div>
        <h3 className="text-[16px] font-semibold mb-2">Run AI Code Quality Audit</h3>
        <p className="text-[13px] text-muted-foreground mb-6 leading-relaxed">
          Submit this repository to Google Gemini for a complete review. Analyze readability, structure, performance and security metrics.
        </p>
        <button
          onClick={handleAudit}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-foreground hover:opacity-90 text-background font-medium text-[13px] transition-opacity duration-150 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing Source Code..." : "Run AI Code Audit"}
        </button>
      </div>
    );
  }

  const lastUpdated = insights.updatedAt
    ? new Date(insights.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const FLAT_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];

  const scores = [
    { label: "Code Quality", value: insights.codeQualityScore, color: FLAT_COLORS[0] },
    { label: "Documentation", value: insights.documentationScore, color: FLAT_COLORS[1] },
    { label: "Performance", value: insights.performanceScore, color: FLAT_COLORS[2] },
    { label: "Security Health", value: insights.securityScore, color: FLAT_COLORS[3] },
    { label: "Readability Score", value: insights.readabilityScore, color: FLAT_COLORS[4] },
  ];

  return (
    <div className="space-y-8 text-foreground">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand" />
            <span className="text-[12px] font-medium text-brand uppercase tracking-wide">AI Audit Completed</span>
          </div>
          {lastUpdated && (
            <span className="text-[11px] text-text-dim flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastUpdated}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/export/repo/${repoId}`}
            download
            className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-muted hover:bg-surface-5 text-[13px] h-9 px-3 font-medium transition-colors duration-150 text-muted-foreground hover:text-foreground"
          >
            <Download className="w-3 h-3" />
            Export PDF
          </a>
          <button
            onClick={handleAudit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-muted hover:bg-surface-5 text-[13px] h-9 px-3 font-medium transition-colors duration-150 cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Re-auditing..." : "Re-run AI Audit"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {scores.map((score, idx) => (
          <div key={idx} className="p-5 border border-border bg-card rounded-[14px] flex flex-col justify-between">
            <span className="text-[10px] font-medium text-text-muted-custom uppercase tracking-wide mb-3">
              {score.label}
            </span>
            <div>
              <span className="text-[32px] font-semibold tracking-tight">{score.value}</span>
              <span className="text-[12px] text-text-muted-custom ml-0.5">/100</span>
            </div>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden mt-4">
              <div
                className="h-full rounded-full"
                style={{ width: `${score.value}%`, backgroundColor: score.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 p-4 md:p-8 border border-border bg-card rounded-[14px] space-y-4">
          <h3 className="text-[14px] font-semibold border-b border-border pb-4">
            Analysis Summary
          </h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{insights.summary}</p>
        </div>

        <div className="space-y-6">
          <div className="p-4 md:p-6 border border-border bg-card rounded-[14px] space-y-4">
            <h4 className="text-[12px] font-medium text-text-muted-custom uppercase tracking-wide">Project Highlights</h4>
            <ul className="space-y-3">
              {(insights.highlights as string[]).map((highlight, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-[13px] text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 md:p-6 border border-border bg-card rounded-[14px] space-y-4">
            <h4 className="text-[12px] font-medium text-text-muted-custom uppercase tracking-wide">AI Recommendations</h4>
            <ul className="space-y-3">
              {(insights.recommendations as string[]).map((rec, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-[13px] text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-brand shrink-0 mt-0.5" />
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
