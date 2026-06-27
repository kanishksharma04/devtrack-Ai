import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CareerAdvisor } from "@/components/dashboard/career-advisor";
import { SharePortfolioButton } from "@/components/dashboard/share-portfolio-button";
import React from "react";

export default async function CareerPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect("/");
  }

  const userId = (session.user as any).id;

  const [analysis, user] = await Promise.all([
    prisma.portfolioAnalysis.findUnique({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { githubUsername: true } }),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
            AI Career Coach
          </h2>
          <p className="text-sm text-muted-foreground">
            Receive professional development guides, identify technical skill gaps, and optimize your resume based on your repositories.
          </p>
        </div>
        {user?.githubUsername && (
          <SharePortfolioButton username={user.githubUsername} />
        )}
      </div>

      <CareerAdvisor userId={userId} initialAnalysis={analysis} />
    </div>
  );
}
