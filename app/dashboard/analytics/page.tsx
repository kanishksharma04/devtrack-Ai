import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnalyticsClient } from "@/components/dashboard/analytics-client";
import React from "react";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect("/");
  }

  const userId = (session.user as any).id;

  const analytics = await prisma.codingAnalytics.findUnique({
    where: { userId },
  });

  const repositories = await prisma.repository.findMany({
    where: { userId },
    orderBy: { stars: "desc" },
  });

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

      <AnalyticsClient analytics={analytics} repos={repositories} />
    </div>
  );
}
