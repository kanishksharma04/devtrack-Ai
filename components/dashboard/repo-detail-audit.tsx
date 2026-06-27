"use client";

import { useState } from "react";
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
      <div className="p-8 border border-dashed border-[rgba(255,255,255,0.06)] rounded-[14px] bg-[#151515] text-center max-w-2xl mx-auto my-12 text-foreground">
        <div className="w-12 h-12 bg-[#1a1a1a] rounded-[10px] flex items-center justify-center mx-auto mb-4">
          <Cpu className="w-5 h-5 text-[#10B981]" />
        </div>
        <h3 className="text-[16px] font-semibold text-white mb-2">Run AI Code Quality Audit</h3>
        <p className="text-[13px] text-[#a3a3a3] mb-6 leading-relaxed">
          Submit this repository to Google Gemini for a complete review. Analyze readability, structure, performance and security metrics.
        </p>
        <button
          onClick={handleAudit}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-white hover:bg-[#e5e5e5] text-[#090909] font-medium text-[13px] transition-colors duration-150 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing Source Code..." : "Run AI Code Audit"}
        </button>
      </div>
    );
  }

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
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#10B981]" />
          <span className="text-[12px] font-medium text-[#10B981] uppercase tracking-wide">AI Audit Completed</span>
        </div>
        <button
          onClick={handleAudit}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[#1a1a1a] hover:bg-[#252525] text-[13px] h-9 px-3 font-medium transition-colors duration-150 cursor-pointer text-[#a3a3a3] hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Re-auditing..." : "Re-run AI Audit"}
        </button>
      </div>

      {/* Scores Grid */}
      <div className="grid gap-4 sm:grid-cols-5">
        {scores.map((score, idx) => (
          <div key={idx} className="p-5 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] flex flex-col justify-between">
            <span className="text-[10px] font-medium text-[#737373] uppercase tracking-wide mb-3">
              {score.label}
            </span>
            <div>
              <span className="text-[32px] font-semibold text-white tracking-tight">{score.value}</span>
              <span className="text-[12px] text-[#737373] ml-0.5">/100</span>
            </div>
            <div className="h-1 w-full bg-[#1a1a1a] rounded-full overflow-hidden mt-4">
              <div
                className="h-full rounded-full"
                style={{ width: `${score.value}%`, backgroundColor: score.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Audit Detail Content */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Summary */}
        <div className="md:col-span-2 p-8 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
          <h3 className="text-[14px] font-semibold text-white border-b border-[rgba(255,255,255,0.06)] pb-4">
            Analysis Summary
          </h3>
          <p className="text-[13px] text-[#a3a3a3] leading-relaxed">
            {insights.summary}
          </p>
        </div>

        {/* Right Column: Highlights & Recommendations */}
        <div className="space-y-6">
          {/* Highlights */}
          <div className="p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
            <h4 className="text-[12px] font-medium text-[#737373] uppercase tracking-wide">
              Project Highlights
            </h4>
            <ul className="space-y-3">
              {(insights.highlights as string[]).map((highlight, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-[13px] text-[#a3a3a3]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
            <h4 className="text-[12px] font-medium text-[#737373] uppercase tracking-wide">
              AI Recommendations
            </h4>
            <ul className="space-y-3">
              {(insights.recommendations as string[]).map((rec, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-[13px] text-[#a3a3a3]">
                  <ChevronRight className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
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
