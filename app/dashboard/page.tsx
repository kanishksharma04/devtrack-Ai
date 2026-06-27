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
        <div className="p-4 rounded-[14px] bg-[#151515] border border-[rgba(255,255,255,0.06)] mb-6">
          <FaGithub className="w-10 h-10 text-[#737373]" />
        </div>
        <h2 className="text-[22px] font-semibold tracking-tight text-white mb-2">
          Connect your GitHub account
        </h2>
        <p className="text-[13px] text-[#a3a3a3] mb-8 leading-relaxed">
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Repositories"
          value={totalReposCount}
          icon={Code2}
          description="Synced from your GitHub"
        />
        <StatCard
          title="Total Commits"
          value={totalCommits}
          icon={Activity}
          description="In the past 12 months"
        />
        <StatCard
          title="Stars Gained"
          value={totalStars}
          icon={Star}
          description="Across all repositories"
        />
        <StatCard
          title="Forks Gained"
          value={totalForks}
          icon={GitFork}
          description="Repository forks"
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Left 2 Columns: Career Analysis Summary & Recent Repos */}
        <div className="md:col-span-2 space-y-8">
          {/* AI Career Coach Panel */}
          <div className="p-8 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-[rgba(255,255,255,0.06)] pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#1a1a1a] rounded-[10px]">
                  <Compass className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold text-white">AI Career Assistant</h2>
                  <p className="text-[12px] text-[#737373]">Portfolio-wide analysis and recommendations.</p>
                </div>
              </div>

              {dbUser.portfolioAnalysis ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#10B981]/10 text-[#10B981] font-medium text-[12px] tracking-wide">
                  <Award className="w-3.5 h-3.5" />
                  Score: {dbUser.portfolioAnalysis.overallScore}/100
                </div>
              ) : (
                <Link
                  href="/dashboard/career"
                  className="px-4 py-2 text-[13px] font-medium text-[#090909] bg-white hover:bg-[#e5e5e5] rounded-[10px] transition-colors duration-150 cursor-pointer"
                >
                  Generate Roadmap
                </Link>
              )}
            </div>

            {dbUser.portfolioAnalysis ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h4 className="text-[12px] font-medium text-[#737373] uppercase tracking-wide mb-2">Primary Role</h4>
                  <div className="text-[14px] font-medium text-white mb-4">
                    {dbUser.portfolioAnalysis.primaryRole} ({dbUser.portfolioAnalysis.careerLevel})
                  </div>

                  <h4 className="text-[12px] font-medium text-[#737373] uppercase tracking-wide mb-2">Key Strengths</h4>
                  <ul className="space-y-1.5 text-[13px] text-[#a3a3a3]">
                    {(dbUser.portfolioAnalysis.strengths as string[]).slice(0, 3).map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#10B981]">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-[12px] font-medium text-[#737373] uppercase tracking-wide mb-2">Career Steps</h4>
                  <ul className="space-y-2 text-[13px] text-[#a3a3a3]">
                    {(dbUser.portfolioAnalysis.careerRecommendations as string[]).slice(0, 3).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#1a1a1a] p-2.5 rounded-[10px]">
                        <span className="text-[#10B981]">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 text-right">
                    <Link
                      href="/dashboard/career"
                      className="text-[13px] font-medium text-[#10B981] hover:text-[#34d399] inline-flex items-center gap-1 transition-colors duration-150"
                    >
                      View Full Analysis →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-[14px] text-[#a3a3a3] mb-4">
                  Run a portfolio analysis to generate your career role insights, core strengths, and development roadmap!
                </p>
                <Link
                  href="/dashboard/career"
                  className="px-5 py-2.5 text-[13px] font-medium text-[#090909] bg-white hover:bg-[#e5e5e5] rounded-[10px] transition-colors duration-150 cursor-pointer inline-block"
                >
                  Analyze Developer Profile
                </Link>
              </div>
            )}
          </div>

          {/* Recent Repos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-white">Recently Synced Projects</h2>
              <Link
                href="/dashboard/repos"
                className="text-[13px] font-medium text-[#10B981] hover:text-[#34d399] transition-colors duration-150"
              >
                View all repos
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {serializedRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Language Distributions & Analytics Preview */}
        <div className="space-y-8">
          <div className="p-8 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px]">
            <h3 className="text-[14px] font-semibold text-white mb-6">Language breakdown</h3>
            {dbUser.codingAnalytics?.topLanguages ? (
              <div className="space-y-4">
                {(dbUser.codingAnalytics.topLanguages as any[]).slice(0, 5).map((lang, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-white font-medium">{lang.name}</span>
                      <span className="text-[#737373] font-mono">{lang.percentage}%</span>
                    </div>
                    <div className="h-1 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10B981] rounded-full"
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-4 text-center">
                  <Link
                    href="/dashboard/analytics"
                    className="text-[13px] font-medium text-[#10B981] hover:text-[#34d399] transition-colors duration-150"
                  >
                    View detailed analytics →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-[#737373] text-center py-4">No language stats available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
