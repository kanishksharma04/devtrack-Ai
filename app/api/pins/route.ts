import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_PINS = 6;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const pins = await prisma.pinnedRepository.findMany({
      where: { userId },
      orderBy: { order: "asc" },
      include: {
        repository: {
          select: {
            id: true,
            name: true,
            description: true,
            primaryLanguage: true,
            stars: true,
            forks: true,
            htmlUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ pins });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { repositoryId } = await request.json();
    if (!repositoryId || typeof repositoryId !== "string") {
      return NextResponse.json({ error: "repositoryId is required." }, { status: 400 });
    }

    // Verify repo belongs to this user
    const repo = await prisma.repository.findFirst({ where: { id: repositoryId, userId } });
    if (!repo) {
      return NextResponse.json({ error: "Repository not found." }, { status: 404 });
    }

    const currentCount = await prisma.pinnedRepository.count({ where: { userId } });
    if (currentCount >= MAX_PINS) {
      return NextResponse.json(
        { error: `You can pin at most ${MAX_PINS} repositories.` },
        { status: 422 }
      );
    }

    const pin = await prisma.pinnedRepository.create({
      data: { userId, repositoryId, order: currentCount },
    });

    return NextResponse.json({ success: true, pin });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Repository is already pinned." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || "Failed." }, { status: 500 });
  }
}
