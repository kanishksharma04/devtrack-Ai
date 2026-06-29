import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncGitHubData } from "@/lib/services/github";

export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.account.findMany({
    where: { provider: "github", access_token: { not: null } },
    select: { userId: true, access_token: true },
  });

  const results = { synced: 0, failed: 0, skipped: 0 };

  for (const account of accounts) {
    if (!account.access_token || account.access_token.startsWith("mock_")) {
      results.skipped++;
      continue;
    }

    try {
      await syncGitHubData(account.userId, account.access_token);
      results.synced++;
    } catch (err) {
      console.error(`[cron/sync] Failed for user ${account.userId}:`, err);
      results.failed++;
    }

    // Stagger requests to avoid GitHub rate-limit burst
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`[cron/sync] Done: synced=${results.synced} failed=${results.failed} skipped=${results.skipped}`);
  return NextResponse.json({ success: true, ...results });
}
