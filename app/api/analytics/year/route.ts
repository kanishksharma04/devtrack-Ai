import { NextResponse } from "next/server";
import { getSessionWithAccessToken } from "@/lib/auth";
import { getOrFetchContributionYear } from "@/lib/services/github";
import { checkYearFetchLimit } from "@/lib/rate-limit";
import { getErrorMessage } from "@/lib/utils";

// Backfilling a past year can mean one commits call per synced repo, so this
// needs more headroom than the platform default for users with many repos.
export const maxDuration = 60;

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

export async function GET(req: Request) {
  try {
    const sessionWithToken = await getSessionWithAccessToken();
    if (!sessionWithToken) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in and connect GitHub." },
        { status: 401 }
      );
    }
    const { userId, accessToken } = sessionWithToken;

    const yearParam = new URL(req.url).searchParams.get("year");
    const year = Number(yearParam);
    const currentYear = new Date().getFullYear();
    if (!yearParam || !Number.isInteger(year) || year < 2008 || year > currentYear) {
      return NextResponse.json({ error: "Invalid year." }, { status: 400 });
    }

    const rl = await checkYearFetchLimit(userId);
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rl.retryAfter}s before retrying.` },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const result = await getOrFetchContributionYear(userId, accessToken, year);

    return NextResponse.json(
      { success: true, ...result },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("GitHub Analytics Year API Error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to fetch contribution history.") },
      { status: 500 }
    );
  }
}
