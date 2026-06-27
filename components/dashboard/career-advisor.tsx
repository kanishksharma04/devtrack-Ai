"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Compass, RefreshCw, CheckCircle2, AlertTriangle, Lightbulb, User } from "lucide-react";

interface CareerAdvisorProps {
  userId: string;
  initialAnalysis: any;
}

export function CareerAdvisor({ userId, initialAnalysis }: CareerAdvisorProps) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "portfolio" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalysis(data.data);
      } else {
        alert(data.error || "Failed to analyze portfolio.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during portfolio analysis.");
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) {
    return (
      <div className="p-8 border border-dashed border-border rounded-3xl bg-card/25 text-center max-w-2xl mx-auto my-12 text-foreground">
        <div className="w-12 h-12 bg-zinc-900 border border-border/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Compass className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2 font-sans">Generate Career Roadmap</h3>
        <p className="text-xs text-muted-foreground mb-6">
          Submit your aggregated GitHub commit trends, language distributions, and repository metrics to our AI career assistant to map your professional developer path.
        </p>
        <Button
          onClick={handleAnalyze}
          disabled={loading}
          className="gap-2 px-6 py-5 rounded-2xl bg-white hover:bg-zinc-100 text-black font-semibold shadow-md shadow-white/5 transition-all text-xs cursor-pointer disabled:opacity-55"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Evaluating Developer Profile..." : "Evaluate Profile & Build Roadmap"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-foreground">
      {/* Overview Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border/80 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-border/50 flex items-center justify-center text-emerald-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-sans">{analysis.primaryRole}</h3>
            <p className="text-xs text-muted-foreground font-semibold">Career Tier: {analysis.careerLevel}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Portfolio Health</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{analysis.overallScore}/100</span>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            variant="outline"
            size="sm"
            className="rounded-xl border-border bg-card hover:bg-muted text-xs h-9 gap-2 shadow-sm font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Re-evaluating..." : "Re-evaluate Profile"}
          </Button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column: Strengths */}
        <div className="p-8 border border-border bg-card rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
              Core Strengths
            </h3>
          </div>
          <ul className="space-y-3.5">
            {(analysis.strengths as string[]).map((strength, idx) => (
              <li key={idx} className="flex gap-3 items-start text-xs text-muted-foreground leading-relaxed">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Skill Gaps */}
        <div className="p-8 border border-border bg-card rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
              Gaps & Weak Areas
            </h3>
          </div>
          <ul className="space-y-3.5">
            {(analysis.weakAreas as string[]).map((weakness, idx) => (
              <li key={idx} className="flex gap-3 items-start text-xs text-muted-foreground leading-relaxed">
                <span className="text-amber-500 font-bold">!</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Career Steps */}
      <div className="p-8 border border-border bg-card rounded-3xl space-y-6">
        <div className="flex items-center gap-2 border-b border-border/50 pb-4">
          <Lightbulb className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
            AI Roadmap & Actionable Steps
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {(analysis.careerRecommendations as string[]).map((rec, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-muted/30 border border-border/50 space-y-2 flex flex-col justify-between h-full">
              <div>
                <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-border/80 flex items-center justify-center text-[10px] font-bold text-emerald-400 mb-3">
                  0{idx + 1}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {rec}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
