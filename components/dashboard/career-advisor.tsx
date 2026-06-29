"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Compass, RefreshCw, CheckCircle2, AlertTriangle, Lightbulb, User, Clock, Download } from "lucide-react";
import { toast } from "sonner";
import { useAnalysisJob } from "@/lib/hooks/use-analysis-job";

interface CareerAdvisorProps {
  userId: string;
  initialAnalysis: any;
}

export function CareerAdvisor({ userId: _userId, initialAnalysis }: CareerAdvisorProps) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const job = useAnalysisJob();
  const toastRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (job.status === "completed" && job.data) {
      setAnalysis(job.data);
      if (toastRef.current !== null) toast.success("Career roadmap generated!", { id: toastRef.current });
    } else if (job.status === "failed") {
      if (toastRef.current !== null) toast.error(job.error || "Analysis failed.", { id: toastRef.current });
    }
  }, [job.status, job.data, job.error]);

  const handleAnalyze = async () => {
    const id = toast.loading("Evaluating your developer profile...");
    toastRef.current = id;

    const result = await job.startJob("portfolio");
    if (!result.ok) {
      toast.dismiss(id);
      toastRef.current = null;
      if (result.httpStatus === 429) {
        toast.error(result.error || "Rate limit reached. Please wait before retrying.");
      } else {
        toast.error(result.error || "Failed to start analysis.");
      }
    }
    // On success, the useEffect above fires when status becomes completed/failed.
  };

  const loading = job.loading || job.status === "queued" || job.status === "running";

  if (!analysis) {
    return (
      <div className="p-8 border border-dashed border-border rounded-[14px] bg-card text-center max-w-2xl mx-auto my-12 text-foreground">
        <div className="w-12 h-12 bg-muted rounded-[10px] flex items-center justify-center mx-auto mb-4">
          <Compass className="w-5 h-5 text-brand" />
        </div>
        <h3 className="text-[16px] font-semibold mb-2">Generate Career Roadmap</h3>
        <p className="text-[13px] text-muted-foreground mb-6 leading-relaxed">
          Submit your aggregated GitHub commit trends, language distributions, and repository metrics to our AI career assistant to map your professional developer path.
        </p>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-foreground hover:opacity-90 text-background font-medium text-[13px] transition-opacity duration-150 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Evaluating Developer Profile..." : "Evaluate Profile & Build Roadmap"}
        </button>
      </div>
    );
  }

  const lastUpdated = analysis.updatedAt
    ? new Date(analysis.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-8 text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 md:p-6 rounded-[14px] border border-border">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-[10px] bg-muted flex items-center justify-center text-brand">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold">{analysis.primaryRole}</h3>
            <p className="text-[12px] text-text-muted-custom font-medium">Career Tier: {analysis.careerLevel}</p>
            {lastUpdated && (
              <p className="text-[11px] text-text-dim flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                Last analyzed: {lastUpdated}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-right">
            <span className="text-[10px] font-medium text-text-muted-custom uppercase tracking-wide block">Portfolio Health</span>
            <span className="text-[24px] font-semibold text-brand font-mono">{analysis.overallScore}/100</span>
          </div>

          <a
            href="/api/export/career"
            download
            className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-muted hover:bg-surface-5 text-[13px] h-9 px-3 font-medium transition-colors duration-150 text-muted-foreground hover:text-foreground"
          >
            <Download className="w-3 h-3" />
            Export PDF
          </a>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-muted hover:bg-surface-5 text-[13px] h-9 px-3 font-medium transition-colors duration-150 cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Re-evaluating..." : "Re-evaluate Profile"}
          </button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="p-4 md:p-8 border border-border bg-card rounded-[14px] space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <CheckCircle2 className="w-4 h-4 text-brand" />
            <h3 className="text-[14px] font-semibold">Core Strengths</h3>
          </div>
          <ul className="space-y-3.5">
            {(analysis.strengths as string[]).map((strength, idx) => (
              <li key={idx} className="flex gap-3 items-start text-[13px] text-muted-foreground leading-relaxed">
                <span className="text-brand">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 md:p-8 border border-border bg-card rounded-[14px] space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <AlertTriangle className="w-4 h-4 text-chart-3" />
            <h3 className="text-[14px] font-semibold">Gaps & Weak Areas</h3>
          </div>
          <ul className="space-y-3.5">
            {(analysis.weakAreas as string[]).map((weakness, idx) => (
              <li key={idx} className="flex gap-3 items-start text-[13px] text-muted-foreground leading-relaxed">
                <span className="text-chart-3">!</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-4 md:p-8 border border-border bg-card rounded-[14px] space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <Lightbulb className="w-4 h-4 text-brand" />
          <h3 className="text-[14px] font-semibold">AI Roadmap & Actionable Steps</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {(analysis.careerRecommendations as string[]).map((rec, idx) => (
            <div key={idx} className="p-5 rounded-[10px] bg-surface-2 border border-border space-y-2 flex flex-col justify-between h-full">
              <div>
                <span className="w-6 h-6 rounded-[8px] bg-muted flex items-center justify-center text-[10px] font-medium text-brand mb-3">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{rec}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
