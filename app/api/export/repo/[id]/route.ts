import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pdf } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { RepoAuditPDF } from "@/lib/pdf/repo-audit-pdf";
import React from "react";

export const dynamic = "force-dynamic";

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Buffer>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const repo = await prisma.repository.findUnique({
      where: { id },
      include: { insights: true },
    });

    if (!repo || repo.userId !== userId) {
      return NextResponse.json({ error: "Repository not found." }, { status: 404 });
    }

    if (!repo.insights) {
      return NextResponse.json({ error: "No audit data found. Run an AI audit first." }, { status: 404 });
    }

    const generatedAt = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });

    const element = React.createElement(RepoAuditPDF, {
      repoName: repo.name,
      description: repo.description,
      insights: {
        ...repo.insights,
        highlights: repo.insights.highlights as string[],
        recommendations: repo.insights.recommendations as string[],
      },
      generatedAt,
    }) as unknown as React.ReactElement<DocumentProps>;

    const readableStream = await pdf(element).toBuffer();
    const buffer = await streamToBuffer(readableStream);
    const filename = `devtrack-audit-${repo.name}-${new Date().toISOString().split("T")[0]}.pdf`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("[export/repo]", error);
    return NextResponse.json({ error: error.message || "Failed to generate PDF." }, { status: 500 });
  }
}
