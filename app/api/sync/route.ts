import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { syncGitHubData } from "@/lib/services/github";
import { checkSyncLimit } from "@/lib/rate-limit";

function rateLimitHeaders(result: {
  limit?: number;
  remaining?: number;
  reset?: number;
  retryAfter?: number;
}): Record<string, string> {
  const headers: Record<string, string> = {};
  if (result.limit !== undefined) headers["X-RateLimit-Limit"] = String(result.limit);
  if (result.remaining !== undefined) headers["X-RateLimit-Remaining"] = String(result.remaining);
  if (result.reset !== undefined) headers["X-RateLimit-Reset"] = String(Math.floor(result.reset / 1000));
  if (result.retryAfter !== undefined) headers["Retry-After"] = String(result.retryAfter);
  return headers;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken || !session.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in and connect GitHub." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id as string;

    const rl = await checkSyncLimit(userId);
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many sync requests. Please wait ${rl.retryAfter}s before retrying.` },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    // Cache invalidation happens inside syncGitHubData before fetching.
    const accessToken = (session as any).accessToken as string;
    const result = await syncGitHubData(userId, accessToken);

    return NextResponse.json(
      { success: true, message: "GitHub data synced successfully.", data: result },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error: any) {
    console.error("GitHub Sync API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync GitHub data." },
      { status: 500 }
    );
  }
}
