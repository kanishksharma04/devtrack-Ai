"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "devtrack-tour-v1";

interface Step {
  target: string;
  title: string;
  description: string;
  placement?: "bottom" | "top" | "left" | "right";
}

const STEPS: Step[] = [
  {
    target: "[data-tour='sync']",
    title: "Sync your GitHub",
    description: "Start here — click Sync GitHub to pull in all your repositories, commit history, and language stats.",
    placement: "bottom",
  },
  {
    target: "[data-tour='nav-repos']",
    title: "Your Repositories",
    description: "Browse every repo synced from GitHub. Run an AI code audit on any repo to get quality scores and recommendations.",
    placement: "right",
  },
  {
    target: "[data-tour='nav-career']",
    title: "Career Coach",
    description: "Generate a personalized career roadmap powered by Gemini AI. See your strengths, gaps, and next steps.",
    placement: "right",
  },
  {
    target: "[data-tour='nav-analytics']",
    title: "Analytics",
    description: "Visualize your contribution heatmap, language breakdown, and commit velocity over the past year.",
    placement: "right",
  },
  {
    target: "[data-tour='theme-toggle']",
    title: "Light & Dark Mode",
    description: "Switch between light and dark themes anytime. Your preference is saved automatically.",
    placement: "bottom",
  },
];

interface TooltipRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getRect(selector: string): TooltipRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height };
}

const PAD = 12;

function tooltipPosition(rect: TooltipRect, placement: Step["placement"] = "bottom", tooltipW = 300, tooltipH = 160) {
  const vw = window.innerWidth;
  const vh = window.innerHeight + window.scrollY;

  const positions = {
    bottom: { top: rect.top + rect.height + PAD, left: rect.left + rect.width / 2 - tooltipW / 2 },
    top: { top: rect.top - tooltipH - PAD, left: rect.left + rect.width / 2 - tooltipW / 2 },
    right: { top: rect.top + rect.height / 2 - tooltipH / 2, left: rect.left + rect.width + PAD },
    left: { top: rect.top + rect.height / 2 - tooltipH / 2, left: rect.left - tooltipW - PAD },
  };

  let { top, left } = positions[placement];

  // Clamp within viewport
  left = Math.max(PAD, Math.min(left, vw - tooltipW - PAD));
  top = Math.max(PAD, Math.min(top, vh - tooltipH - PAD));

  return { top, left };
}

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<TooltipRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const resizeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay so page elements are rendered before we measure
      const t = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const measure = useCallback((stepIndex: number) => {
    const target = STEPS[stepIndex]?.target;
    if (!target) return;
    const r = getRect(target);
    setRect(r);
  }, []);

  useEffect(() => {
    if (!active) return;
    measure(step);

    const onResize = () => {
      if (resizeRef.current) clearTimeout(resizeRef.current);
      resizeRef.current = setTimeout(() => measure(step), 100);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, step, measure]);

  const dismiss = useCallback((completed = false) => {
    setActive(false);
    if (completed) localStorage.setItem(STORAGE_KEY, "completed");
    else localStorage.setItem(STORAGE_KEY, "skipped");
  }, []);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss(true);
    }
  }, [step, dismiss]);

  const prev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss(false);
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, next, prev, dismiss]);

  if (!mounted || !active) return null;

  const currentStep = STEPS[step];
  const pos = rect ? tooltipPosition(rect, currentStep.placement) : null;

  return createPortal(
    <>
      {/* Dim overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 motion-safe:transition-opacity duration-200"
        onClick={() => dismiss(false)}
        aria-hidden="true"
      />

      {/* Spotlight cutout */}
      {rect && (
        <div
          className="fixed z-[9999] rounded-[12px] ring-2 ring-brand shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none motion-safe:transition-all duration-200"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      {pos && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Tour step ${step + 1} of ${STEPS.length}: ${currentStep.title}`}
          className="fixed z-[10000] w-[300px] bg-card border border-border rounded-[14px] shadow-2xl p-5 motion-safe:transition-all duration-200"
          style={{ top: pos.top, left: pos.left }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-brand uppercase tracking-widest">
                {step + 1} / {STEPS.length}
              </span>
            </div>
            <button
              onClick={() => dismiss(false)}
              className="text-text-dim hover:text-foreground transition-colors rounded p-0.5 -mt-0.5 -mr-0.5"
              aria-label="Skip tour"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h3 className="text-[15px] font-semibold mb-1.5">{currentStep.title}</h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">{currentStep.description}</p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full transition-all duration-200",
                  i === step ? "w-4 h-1.5 bg-brand" : "w-1.5 h-1.5 bg-muted"
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => dismiss(false)}
              className="text-[12px] text-text-dim hover:text-muted-foreground transition-colors"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-muted-foreground border border-border bg-muted hover:bg-surface-5 rounded-[8px] transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Back
                </button>
              )}
              <button
                onClick={next}
                className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium bg-foreground text-background hover:opacity-90 rounded-[8px] transition-opacity"
                autoFocus
              >
                {step === STEPS.length - 1 ? "Done" : "Next"}
                {step < STEPS.length - 1 && <ChevronRight className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}

export function useTourReset() {
  return () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };
}
