"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Compass, RefreshCw, CheckCircle2, AlertTriangle, Lightbulb, User, Clock } from "lucide-react";
import { toast } from "sonner";

interface CareerAdvisorProps {
  userId: string;
  initialAnalysis: any;
}

export function CareerAdvisor({ userId, initialAnalysis }: CareerAdvisorProps) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const toastId = toast.loading("Evaluating your developer profile...");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "portfolio" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalysis(data.data);
        toast.success("Career roadmap generated!", { id: toastId });
      } else {
        toast.error(data.error || "Failed to analyze portfolio.", { id: toastId });
      }
    } catch {
      toast.error("An error occurred during portfolio analysis.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) {
    return (
      <div className="p-8 border border-dashed border-[rgba(255,255,255,0.06)] rounded-[14px] bg-[#151515] text-center max-w-2xl mx-auto my-12 text-foreground">
        <div className="w-12 h-12 bg-[#1a1a1a] rounded-[10px] flex items-center justify-center mx-auto mb-4">
          <Compass className="w-5 h-5 text-[#10B981]" />
        </div>
        <h3 className="text-[16px] font-semibold text-white mb-2">Generate Career Roadmap</h3>
        <p className="text-[13px] text-[#a3a3a3] mb-6 leading-relaxed">
          Submit your aggregated GitHub commit trends, language distributions, and repository metrics to our AI career assistant to map your professional developer path.
        </p>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-white hover:bg-[#e5e5e5] text-[#090909] font-medium text-[13px] transition-colors duration-150 cursor-pointer disabled:opacity-50"
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
      {/* Overview Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#151515] p-6 rounded-[14px] border border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-[10px] bg-[#1a1a1a] flex items-center justify-center text-[#10B981]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-white">{analysis.primaryRole}</h3>
            <p className="text-[12px] text-[#737373] font-medium">Career Tier: {analysis.careerLevel}</p>
            {lastUpdated && (
              <p className="text-[11px] text-[#525252] flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                Last analyzed: {lastUpdated}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-medium text-[#737373] uppercase tracking-wide block">Portfolio Health</span>
            <span className="text-[24px] font-semibold text-[#10B981] font-mono">{analysis.overallScore}/100</span>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[#1a1a1a] hover:bg-[#252525] text-[13px] h-9 px-3 font-medium transition-colors duration-150 cursor-pointer text-[#a3a3a3] hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Re-evaluating..." : "Re-evaluate Profile"}
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="p-8 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
          <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-4">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-[14px] font-semibold text-white">Core Strengths</h3>
          </div>
          <ul className="space-y-3.5">
            {(analysis.strengths as string[]).map((strength, idx) => (
              <li key={idx} className="flex gap-3 items-start text-[13px] text-[#a3a3a3] leading-relaxed">
                <span className="text-[#10B981]">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-8 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
          <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-4">
            <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
            <h3 className="text-[14px] font-semibold text-white">Gaps & Weak Areas</h3>
          </div>
          <ul className="space-y-3.5">
            {(analysis.weakAreas as string[]).map((weakness, idx) => (
              <li key={idx} className="flex gap-3 items-start text-[13px] text-[#a3a3a3] leading-relaxed">
                <span className="text-[#f59e0b]">!</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Career Steps */}
      <div className="p-8 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-6">
        <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-4">
          <Lightbulb className="w-4 h-4 text-[#10B981]" />
          <h3 className="text-[14px] font-semibold text-white">AI Roadmap & Actionable Steps</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {(analysis.careerRecommendations as string[]).map((rec, idx) => (
            <div key={idx} className="p-5 rounded-[10px] bg-[#111111] border border-[rgba(255,255,255,0.06)] space-y-2 flex flex-col justify-between h-full">
              <div>
                <span className="w-6 h-6 rounded-[8px] bg-[#1a1a1a] flex items-center justify-center text-[10px] font-medium text-[#10B981] mb-3">
                  0{idx + 1}
                </span>
                <p className="text-[13px] text-[#a3a3a3] leading-relaxed">{rec}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
