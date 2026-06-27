import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RepoDetailAudit } from "@/components/dashboard/repo-detail-audit";
import Link from "next/link";
import { ChevronLeft, ExternalLink, Star, GitFork } from "lucide-react";
import React from "react";

interface RepoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RepoDetailPage({ params }: RepoDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect("/");
  }

  const { id } = await params;

  const repo = await prisma.repository.findUnique({
    where: { id },
    include: { insights: true },
  });

  if (!repo || repo.userId !== (session.user as any).id) {
    redirect("/dashboard/repos");
  }

  const serializedRepo = {
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
          documentationScore: repo.insights.documentationScore,
          performanceScore: repo.insights.performanceScore,
          securityScore: repo.insights.securityScore,
          readabilityScore: repo.insights.readabilityScore,
          summary: repo.insights.summary,
          highlights: repo.insights.highlights,
          recommendations: repo.insights.recommendations,
        }
      : null,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground">
      {/* Back to Repos and Title */}
      <div className="space-y-4">
        <Link
          href="/dashboard/repos"
          className="text-xs font-semibold text-muted-foreground hover:text-white flex items-center gap-1 w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Repositories
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                {repo.name}
              </h2>
              {repo.primaryLanguage && (
                <span className="px-2 py-0.5 text-[10px] font-bold font-mono border border-border/50 bg-muted text-muted-foreground rounded-md">
                  {repo.primaryLanguage}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {repo.description || "No description provided."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground border border-border/85 px-4 py-2 rounded-xl bg-card">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-muted-foreground/10" />
                <span>{repo.stars} stars</span>
              </div>
              <div className="flex items-center gap-1 border-l border-border pl-3">
                <GitFork className="w-3.5 h-3.5" />
                <span>{repo.forks} forks</span>
              </div>
            </div>

            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-border/50 bg-muted hover:bg-zinc-800 text-muted-foreground hover:text-white transition-colors cursor-pointer"
              title="Open on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <RepoDetailAudit repoId={serializedRepo.id} initialInsights={serializedRepo.insights} />
    </div>
  );
}
