import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorCode, getErrorMessage } from "@/lib/utils";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ repositoryId: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { repositoryId } = await params;

    await prisma.pinnedRepository.delete({
      where: { userId_repositoryId: { userId, repositoryId } },
    });

    // Compact order values so there are no gaps
    const remaining = await prisma.pinnedRepository.findMany({
      where: { userId },
      orderBy: { order: "asc" },
    });
    await prisma.$transaction(
      remaining.map((p, idx) =>
        prisma.pinnedRepository.update({ where: { id: p.id }, data: { order: idx } })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (getErrorCode(error) === "P2025") {
      return NextResponse.json({ error: "Pin not found." }, { status: 404 });
    }
    return NextResponse.json({ error: getErrorMessage(error, "Failed.") }, { status: 500 });
  }
}
