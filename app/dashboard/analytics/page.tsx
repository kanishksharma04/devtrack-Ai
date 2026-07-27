import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnalyticsClient } from "@/components/dashboard/analytics-client";
import React from "react";

export default async function AnalyticsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  const [analytics, repositories] = await Promise.all([
    prisma.codingAnalytics.findUnique({ where: { userId } }),
    prisma.repository.findMany({ where: { userId }, orderBy: { stars: "desc" } }),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
          Developer Analytics
        </h2>
        <p className="text-sm text-muted-foreground">
          Deep-dive coding statistics, commit velocities, and repository language distributions.
        </p>
      </div>

      <AnalyticsClient
        analytics={
          analytics
            ? {
                commitsPerMonth: analytics.commitsPerMonth as { month: string; commits: number }[] | null,
                topLanguages: analytics.topLanguages as { name: string; bytes: number; percentage: number }[] | null,
                dailyContributions: analytics.dailyContributions as Record<string, number> | null,
              }
            : null
        }
        repos={repositories}
      />
    </div>
  );
}
