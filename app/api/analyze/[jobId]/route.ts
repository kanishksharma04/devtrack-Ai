import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const userId = (session.user as any).id as string;
    const { jobId } = await params;

    const job = await prisma.analysisJob.findFirst({
      where: { id: jobId, userId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      data: job.result ?? null,
      error: job.error ?? null,
    });
  } catch (error: any) {
    console.error("[api/analyze/[jobId]] error:", error);
    return NextResponse.json({ error: "Failed to fetch job status." }, { status: 500 });
  }
}
