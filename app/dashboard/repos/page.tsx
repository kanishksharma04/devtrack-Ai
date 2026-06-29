import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RepoListSearch } from "@/components/dashboard/repo-list-search";
import { PinManager } from "@/components/dashboard/pin-manager";
import React from "react";

export default async function ReposPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect("/");
  }

  const userId = (session.user as any).id;

  const repositories = await prisma.repository.findMany({
    where: { userId },
    orderBy: { pushedAt: "desc" },
    include: { insights: true },
  });

  const serializedRepos = repositories.map((repo) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    primaryLanguage: repo.primaryLanguage,
    stars: repo.stars,
    forks: repo.forks,
    htmlUrl: repo.htmlUrl,
    insights: repo.insights ? { codeQualityScore: repo.insights.codeQualityScore } : null,
  }));

  const allReposForPins = repositories.map((repo) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    primaryLanguage: repo.primaryLanguage,
    stars: repo.stars,
    forks: repo.forks,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
          All Synced Repositories
        </h2>
        <p className="text-sm text-muted-foreground">
          View all connected projects, manage your pinned profile repos, and run AI code audits.
        </p>
      </div>

      <PinManager allRepos={allReposForPins} />

      <RepoListSearch initialRepos={serializedRepos} />
    </div>
  );
}
