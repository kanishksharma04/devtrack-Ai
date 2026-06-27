import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { analyzeRepository, analyzePortfolio } from "@/lib/services/ai";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const { success, retryAfter } = rateLimit(`analyze:${userId}`, 10, 60 * 60 * 1000);
    if (!success) {
      return NextResponse.json(
        { error: `Too many analysis requests. Please wait ${retryAfter}s before retrying.` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { type, repositoryId } = body;

    if (!type || (type !== "repo" && type !== "portfolio")) {
      return NextResponse.json(
        { error: "Invalid type parameter. Must be 'repo' or 'portfolio'." },
        { status: 400 }
      );
    }

    if (type === "repo") {
      if (!repositoryId) {
        return NextResponse.json(
          { error: "repositoryId parameter is required for repo analysis." },
          { status: 400 }
        );
      }
      const insight = await analyzeRepository(repositoryId);
      return NextResponse.json({ success: true, data: insight });
    } else {
      const analysis = await analyzePortfolio(userId);
      return NextResponse.json({ success: true, data: analysis });
    }
  } catch (error: any) {
    console.error("AI Analysis API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform AI analysis." },
      { status: 500 }
    );
  }
}
