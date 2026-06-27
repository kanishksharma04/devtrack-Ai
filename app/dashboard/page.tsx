import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { RepoCard } from "@/components/dashboard/repo-card";
import { OnboardingSync } from "@/components/dashboard/onboarding-sync";
import {
  Code2,
  Star,
  GitFork,
  Activity,
  Compass,
  Award,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import React from "react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect("/");
  }

  const userId = (session.user as any).id;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      repositories: {
        take: 3,
        orderBy: { pushedAt: "desc" },
        include: { insights: true },
      },
      codingAnalytics: true,
      portfolioAnalysis: true,
    },
  });

  if (!dbUser) {
    redirect("/");
  }

  const hasRepos = dbUser.repositories.length > 0;

  if (!hasRepos) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-xl mx-auto">
        <div className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 mb-6 shadow-xl shadow-black/40">
          <FaGithub className="w-12 h-12 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2 font-sans">
          Connect your GitHub account
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          DevTrack AI needs to sync your public repositories, languages, and commit activities to build your developer portfolio charts and run AI audits.
        </p>
        <OnboardingSync />
      </div>
    );
  }

  // Calculate metrics
  const totalReposCount = await prisma.repository.count({ where: { userId } });
  const totalCommits = dbUser.codingAnalytics?.totalCommits || 0;
  const totalStars = dbUser.codingAnalytics?.totalStars || 0;
  const totalForks = dbUser.codingAnalytics?.totalForks || 0;

  // Serialize repos for rendering to avoid BigInt issues
  const serializedRepos = dbUser.repositories.map((repo) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    primaryLanguage: repo.primaryLanguage,
    stars: repo.stars,
    forks: repo.forks,
    htmlUrl: repo.htmlUrl,
    insights: repo.insights
      ? {
          codeQualityScore: repo.insights.codeQualityScore,
        }
      : null,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-foreground">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Repositories"
          value={totalReposCount}
          icon={Code2}
          description="Synced from your GitHub"
          gradient="from-blue-500/10 to-indigo-500/5"
        />
        <StatCard
          title="Total Commits"
          value={totalCommits}
          icon={Activity}
          description="In the past 12 months"
          gradient="from-emerald-500/10 to-teal-500/5"
        />
        <StatCard
          title="Stars Gained"
          value={totalStars}
          icon={Star}
          description="Across all repositories"
          gradient="from-amber-500/10 to-orange-500/5"
        />
        <StatCard
          title="Forks Gained"
          value={totalForks}
          icon={GitFork}
          description="Repository forks"
          gradient="from-pink-500/10 to-purple-500/5"
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Left 2 Columns: Career Analysis Summary & Recent Repos */}
        <div className="md:col-span-2 space-y-8">
          {/* AI Career Coach Panel */}
          <div className="p-8 border border-border/80 bg-card rounded-3xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-full blur-3xl opacity-30" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-border/50 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-zinc-900 border border-border/50 rounded-2xl">
                  <Compass className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-sans">AI Career Assistant</h2>
                  <p className="text-xs text-muted-foreground">Portfolio-wide analysis and recommendations.</p>
                </div>
              </div>

              {dbUser.portfolioAnalysis ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5" />
                  Score: {dbUser.portfolioAnalysis.overallScore}/100
                </div>
              ) : (
                <Link
                  href="/dashboard/career"
                  className="px-4 py-2 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-xl transition-all cursor-pointer"
                >
                  Generate Roadmap
                </Link>
              )}
            </div>

            {dbUser.portfolioAnalysis ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Primary Role</h4>
                  <div className="text-sm font-semibold text-white mb-4">
                    {dbUser.portfolioAnalysis.primaryRole} ({dbUser.portfolioAnalysis.careerLevel})
                  </div>

                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Key Strengths</h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {(dbUser.portfolioAnalysis.strengths as string[]).slice(0, 3).map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Career Steps</h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {(dbUser.portfolioAnalysis.careerRecommendations as string[]).slice(0, 3).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-muted/40 p-2.5 rounded-xl border border-border/30">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 text-right">
                    <Link
                      href="/dashboard/career"
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                    >
                      View Full Analysis →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4 font-medium">
                  Run a portfolio analysis to generate your career role insights, core strengths, and development roadmap!
                </p>
                <Link
                  href="/dashboard/career"
                  className="px-5 py-2.5 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-xl transition-all cursor-pointer inline-block"
                >
                  Analyze Developer Profile
                </Link>
              </div>
            )}
          </div>

          {/* Recent Repos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white font-sans">Recently Synced Projects</h2>
              <Link
                href="/dashboard/repos"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                View all repos
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {serializedRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Language Distributions & Analytics Preview */}
        <div className="space-y-8">
          <div className="p-8 border border-border/80 bg-card rounded-3xl">
            <h3 className="text-sm font-bold text-white font-sans mb-6">Language breakdown</h3>
            {dbUser.codingAnalytics?.topLanguages ? (
              <div className="space-y-4">
                {(dbUser.codingAnalytics.topLanguages as any[]).slice(0, 5).map((lang, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-white">{lang.name}</span>
                      <span className="text-muted-foreground">{lang.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-4 text-center">
                  <Link
                    href="/dashboard/analytics"
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    View detailed analytics →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No language stats available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
