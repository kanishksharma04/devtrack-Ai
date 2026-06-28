import { prisma } from "@/lib/prisma";

import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  GitFork,
  Activity,
  Code2,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import React from "react";

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { githubUsername: username },
  });
  if (!user) return { title: "Profile Not Found" };
  return {
    title: `${user.name || username} — DevTrack AI Portfolio`,
    description: `View ${user.name || username}'s developer portfolio, AI code audit scores, and career analysis on DevTrack AI.`,
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { githubUsername: username },
    include: {
      portfolioAnalysis: true,
      codingAnalytics: true,
      repositories: {
        orderBy: { stars: "desc" },
        take: 6,
        include: { insights: true },
      },
    },
  });

  if (!user || !user.isPublicProfile) notFound();

  const topLanguages = (user.codingAnalytics?.topLanguages as any[]) || [];
  const hasAnalysis = !!user.portfolioAnalysis;

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      {/* Header */}
      <header className="border-b border-[rgba(255,255,255,0.06)] bg-[#111111] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="DevTrack AI" width={24} height={24} className="rounded-md" />
          <span className="text-[14px] font-semibold text-white">DevTrack AI</span>
        </Link>
        <Link
          href="/"
          className="text-[13px] font-medium text-[#10B981] hover:text-[#34d399] transition-colors"
        >
          Get your portfolio →
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* Profile Hero */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-8 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px]">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || username}
              width={72}
              height={72}
              className="rounded-[14px] border border-[rgba(255,255,255,0.06)]"
            />
          ) : (
            <div className="w-18 h-18 rounded-[14px] bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#737373] font-bold text-2xl">
              {(user.name || username)[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-[22px] font-bold text-white tracking-tight">{user.name || username}</h1>
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] text-[#737373] hover:text-[#10B981] transition-colors mt-1"
            >
              <FaGithub className="w-3.5 h-3.5" />
              @{username}
              <ExternalLink className="w-3 h-3" />
            </a>
            {hasAnalysis && (
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[12px] font-medium">
                  <Award className="w-3.5 h-3.5" />
                  {user.portfolioAnalysis!.careerLevel} {user.portfolioAnalysis!.primaryRole}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] text-[#a3a3a3] text-[12px] font-medium">
                  Portfolio Score: {user.portfolioAnalysis!.overallScore}/100
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Code2, label: "Repositories", value: user.repositories.length },
            { icon: Activity, label: "Commits (1yr)", value: user.codingAnalytics?.totalCommits || 0 },
            { icon: Star, label: "Stars", value: user.codingAnalytics?.totalStars || 0 },
            { icon: GitFork, label: "Forks", value: user.codingAnalytics?.totalForks || 0 },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-5 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px]">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-[#737373]" />
                <span className="text-[11px] text-[#737373] uppercase tracking-wide">{label}</span>
              </div>
              <span className="text-[24px] font-semibold text-white">{value.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Language Breakdown */}
        {topLanguages.length > 0 && (
          <div className="p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
            <h2 className="text-[14px] font-semibold text-white">Language Breakdown</h2>
            <div className="space-y-3">
              {topLanguages.slice(0, 6).map((lang: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white font-medium">{lang.name}</span>
                    <span className="text-[#737373] font-mono">{lang.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${lang.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Career Analysis */}
        {hasAnalysis && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <h3 className="text-[14px] font-semibold text-white">Core Strengths</h3>
              </div>
              <ul className="space-y-2.5">
                {(user.portfolioAnalysis!.strengths as string[]).map((s, i) => (
                  <li key={i} className="flex gap-2 items-start text-[13px] text-[#a3a3a3]">
                    <span className="text-[#10B981] mt-0.5">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#f59e0b]" />
                <h3 className="text-[14px] font-semibold text-white">Growth Areas</h3>
              </div>
              <ul className="space-y-2.5">
                {(user.portfolioAnalysis!.weakAreas as string[]).map((w, i) => (
                  <li key={i} className="flex gap-2 items-start text-[13px] text-[#a3a3a3]">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Top Repositories */}
        {user.repositories.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-[16px] font-semibold text-white">Top Repositories</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {user.repositories.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-5 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-3 hover:border-[rgba(255,255,255,0.12)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-semibold text-white group-hover:text-[#10B981] transition-colors truncate">
                      {repo.name}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#525252] shrink-0 mt-0.5" />
                  </div>
                  {repo.description && (
                    <p className="text-[12px] text-[#737373] leading-relaxed line-clamp-2">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-[#737373]">
                    {repo.primaryLanguage && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        {repo.primaryLanguage}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      {repo.forks}
                    </span>
                    {repo.insights && (
                      <span className="ml-auto text-[#10B981] font-medium">
                        {repo.insights.codeQualityScore}/100
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[rgba(255,255,255,0.06)] py-8 text-center text-[12px] text-[#525252]">
        <p>
          Powered by{" "}
          <Link href="/" className="text-[#10B981] hover:text-[#34d399]">
            DevTrack AI
          </Link>{" "}
          — AI-powered developer portfolio analysis
        </p>
      </footer>
    </div>
  );
}
