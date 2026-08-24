import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { MAX_PINS } from "@/lib/constants";
import { getErrorCode, getErrorMessage } from "@/lib/utils";

class PinLimitError extends Error {}

// Serializable isolation closes the check-then-act race on the pin cap: if
// two concurrent requests both read a count under MAX_PINS, Postgres aborts
// one of them with a serialization failure (P2034) instead of letting both
// inserts through and landing the user at 7+ pins.
async function attemptPin(userId: string, repositoryId: string) {
  return prisma.$transaction(
    async (tx) => {
      const currentCount = await tx.pinnedRepository.count({ where: { userId } });
      if (currentCount >= MAX_PINS) throw new PinLimitError();
      return tx.pinnedRepository.create({
        data: { userId, repositoryId, order: currentCount },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
}

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, "Failed.") }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repositoryId } = await request.json();
    if (!repositoryId || typeof repositoryId !== "string") {
      return NextResponse.json({ error: "repositoryId is required." }, { status: 400 });
    }

    // Verify repo belongs to this user
    const repo = await prisma.repository.findFirst({ where: { id: repositoryId, userId } });
    if (!repo) {
      return NextResponse.json({ error: "Repository not found." }, { status: 404 });
    }

    let pin;
    try {
      pin = await attemptPin(userId, repositoryId);
    } catch (err) {
      // Lost a race with a concurrent pin request for the same user — that's
      // an expected outcome under Serializable isolation, so retry once
      // rather than surfacing a transient conflict to the user.
      if (getErrorCode(err) === "P2034") {
        pin = await attemptPin(userId, repositoryId);
      } else {
        throw err;
      }
    }

    return NextResponse.json({ success: true, pin });
  } catch (error) {
    if (error instanceof PinLimitError) {
      return NextResponse.json(
        { error: `You can pin at most ${MAX_PINS} repositories.` },
        { status: 422 }
      );
    }
    if (getErrorCode(error) === "P2002") {
      return NextResponse.json({ error: "Repository is already pinned." }, { status: 409 });
    }
    return NextResponse.json({ error: getErrorMessage(error, "Failed.") }, { status: 500 });
  }
}
