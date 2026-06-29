import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { orderedIds } = await request.json();
    if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== "string")) {
      return NextResponse.json({ error: "orderedIds must be an array of strings." }, { status: 400 });
    }

    // Verify all IDs belong to this user
    const owned = await prisma.pinnedRepository.findMany({
      where: { userId },
      select: { repositoryId: true },
    });
    const ownedSet = new Set(owned.map((p) => p.repositoryId));
    if (orderedIds.some((id) => !ownedSet.has(id))) {
      return NextResponse.json({ error: "One or more IDs do not belong to you." }, { status: 403 });
    }

    await prisma.$transaction(
      orderedIds.map((repositoryId, idx) =>
        prisma.pinnedRepository.update({
          where: { userId_repositoryId: { userId, repositoryId } },
          data: { order: idx },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed." }, { status: 500 });
  }
}
