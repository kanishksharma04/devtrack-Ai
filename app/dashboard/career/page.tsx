import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CareerAdvisor } from "@/components/dashboard/career-advisor";
import React from "react";

export default async function CareerPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect("/");
  }

  const userId = (session.user as any).id;

  const analysis = await prisma.portfolioAnalysis.findUnique({
    where: { userId },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
          AI Career Coach
        </h2>
        <p className="text-sm text-muted-foreground">
          Receive professional development guides, identify technical skill gaps, and optimize your resume based on your repositories.
        </p>
      </div>

      <CareerAdvisor userId={userId} initialAnalysis={analysis} />
    </div>
  );
}
