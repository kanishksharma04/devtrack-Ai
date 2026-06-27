import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { syncGitHubData } from "@/lib/services/github";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).accessToken || !session.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in and connect GitHub." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const accessToken = (session as any).accessToken;

    const result = await syncGitHubData(userId, accessToken);

    return NextResponse.json({
      success: true,
      message: "GitHub data synced successfully.",
      data: result,
    });
  } catch (error: any) {
    console.error("GitHub Sync API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync GitHub data." },
      { status: 500 }
    );
  }
}
