import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/login-button";
import { Compass, Cpu, LineChart } from "lucide-react";
import React from "react";

export const unstable_instant = false;

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session && (session as any).accessToken) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-foreground font-sans relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl opacity-40 -translate-x-1/2" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl opacity-40 translate-x-1/2" />

      {/* Navigation */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-zinc-900 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500">
            <span className="font-bold text-white text-sm">D</span>
          </div>
          <span className="text-lg font-bold text-white tracking-wide">DevTrack AI</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center max-w-4xl mx-auto space-y-10 z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/35 bg-emerald-500/5 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <span>✨ Now in Enterprise Beta</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white font-sans leading-[1.1]">
            AI-powered Career Coach <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              For Modern Developers
            </span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Connect your GitHub repositories in seconds to receive automated AI-powered portfolio audits, career trajectory recommendations, code quality metrics, and visual coding analytics.
          </p>
        </div>

        <div>
          <LoginButton />
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left w-full pt-12">
          <div className="p-6 border border-zinc-900 bg-zinc-950/40 rounded-2xl space-y-3">
            <div className="p-2 w-fit bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">AI Code Audits</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Google Gemini reviews your code quality, performance structure, documentation, and readability, outputting automated suggestions.
            </p>
          </div>

          <div className="p-6 border border-zinc-900 bg-zinc-950/40 rounded-2xl space-y-3">
            <div className="p-2 w-fit bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Interactive Analytics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Explore your commit velocity trends, language byte percentages, and contribution heatmaps synced directly from GitHub.
            </p>
          </div>

          <div className="p-6 border border-zinc-900 bg-zinc-950/40 rounded-2xl space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="p-2 w-fit bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Career Roadmap</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Map your strengths, weaknesses, and skill gaps to senior engineering levels and receive customized steps to boost your career.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-900 text-center text-xs text-muted-foreground bg-black z-10">
        <p>© 2026 DevTrack AI. Designed for elite developers.</p>
      </footer>
    </div>
  );
}
