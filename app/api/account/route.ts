import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/utils";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const analytics = await prisma.codingAnalytics.findUnique({
      where: { userId },
      select: { lastSyncedAt: true },
    });
    return NextResponse.json({ lastSyncedAt: analytics?.lastSyncedAt ?? null });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, "Failed.") }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to delete account.") },
      { status: 500 }
    );
  }
}
