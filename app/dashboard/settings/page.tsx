import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/dashboard/settings-client";
import React from "react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect("/");
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: { select: { provider: true, providerAccountId: true } },
      _count: { select: { repositories: true } },
    },
  });

  if (!user) redirect("/");

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-foreground">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account, data, and privacy settings.
        </p>
      </div>
      <SettingsClient
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          createdAt: user.createdAt.toISOString(),
          accounts: user.accounts,
          repoCount: user._count.repositories,
        }}
      />
    </div>
  );
}
