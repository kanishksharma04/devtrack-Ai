import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { checkAnalyzeLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/lib/inngest";

// This route now just enqueues a job and returns immediately.
// Actual Gemini work happens in the Inngest function at /api/inngest.
export const maxDuration = 30;

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const rl = await checkAnalyzeLimit(userId);
    if (!rl.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${rl.retryAfter}s before retrying.` },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { type, repositoryId } = body as { type?: string; repositoryId?: string };

    if (!type || (type !== "repo" && type !== "portfolio")) {
      return NextResponse.json(
        { error: "Invalid type parameter. Must be 'repo' or 'portfolio'." },
        { status: 400 }
      );
    }
    if (type === "repo" && !repositoryId) {
      return NextResponse.json(
        { error: "repositoryId is required for repo analysis." },
        { status: 400 }
      );
    }

    // Idempotency — return an existing queued/running job for the same resource
    // rather than enqueuing a duplicate that would double-call Gemini.
    const existing = await prisma.analysisJob.findFirst({
      where: {
        userId,
        type,
        repositoryId: repositoryId ?? null,
        status: { in: ["queued", "running"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return NextResponse.json(
        { jobId: existing.id, status: existing.status, queued: true },
        { headers: rateLimitHeaders(rl) }
      );
    }

    const job = await prisma.analysisJob.create({
      data: { userId, type, repositoryId: repositoryId ?? null, status: "queued" },
    });

    await inngest.send({
      name: "devtrack/analyze.requested",
      data: { jobId: job.id, type, userId, repositoryId: repositoryId ?? null },
    });

    return NextResponse.json(
      { jobId: job.id, status: "queued" },
      { status: 202, headers: rateLimitHeaders(rl) }
    );
  } catch (error: any) {
    console.error("[api/analyze] error:", error);
    return NextResponse.json(
      { error: "Failed to enqueue analysis job." },
      { status: 500 }
    );
  }
}
