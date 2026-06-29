import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ repositoryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
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
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Pin not found." }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || "Failed." }, { status: 500 });
  }
}
