import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/login-button";
import { Compass, Cpu, LineChart } from "lucide-react";
import Image from "next/image";
import React from "react";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (session && (session as any).accessToken) {
    redirect("/dashboard");
  }

  const hasGithubConfigured = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  const isDev = process.env.NODE_ENV !== "production";
  const resolvedParams = searchParams ? await searchParams : {};
  const authError = resolvedParams?.error ?? null;

  return (
    <div className="flex flex-col min-h-screen bg-[#090909] text-foreground font-sans relative overflow-hidden">
      {/* Navigation */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-[rgba(255,255,255,0.06)] bg-[#111111] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Image src="/DevTrackAI_logo.png" alt="DevTrack AI" width={32} height={32} className="rounded-full object-cover" />
          <span className="text-lg font-bold text-white tracking-wide">DevTrack AI</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center max-w-4xl mx-auto space-y-10 z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#10B981]/20 bg-[#10B981]/10 text-[#10B981] text-xs font-semibold uppercase tracking-wider">
            <span>✨ Now in Enterprise Beta</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white font-sans leading-[1.1]">
            AI-powered Career Coach <br />
            <span className="text-[#10B981]">
              For Modern Developers
            </span>
          </h1>
          <p className="text-sm md:text-base text-[#a3a3a3] max-w-2xl mx-auto leading-relaxed font-medium">
            Connect your GitHub repositories in seconds to receive automated AI-powered portfolio audits, career trajectory recommendations, code quality metrics, and visual coding analytics.
          </p>
        </div>

        <div>
          <LoginButton hasGithubConfigured={hasGithubConfigured} isDev={isDev} authError={authError} />
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left w-full pt-12">
          <div className="p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-3">
            <div className="p-2 w-fit bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] rounded-[10px]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-[14px]">AI Code Audits</h3>
            <p className="text-[13px] text-[#737373] leading-relaxed font-medium">
              Google Gemini reviews your code quality, performance structure, documentation, and readability, outputting automated suggestions.
            </p>
          </div>

          <div className="p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-3">
            <div className="p-2 w-fit bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] rounded-[10px]">
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-[14px]">Interactive Analytics</h3>
            <p className="text-[13px] text-[#737373] leading-relaxed font-medium">
              Explore your commit velocity trends, language byte percentages, and contribution heatmaps synced directly from GitHub.
            </p>
          </div>

          <div className="p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="p-2 w-fit bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] rounded-[10px]">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-[14px]">Career Roadmap</h3>
            <p className="text-[13px] text-[#737373] leading-relaxed font-medium">
              Map your strengths, weaknesses, and skill gaps to senior engineering levels and receive customized steps to boost your career.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-[rgba(255,255,255,0.06)] text-center text-xs text-[#737373] bg-[#090909] z-10">
        <p>© 2026 DevTrack AI. Designed for elite developers.</p>
      </footer>
    </div>
  );
}
