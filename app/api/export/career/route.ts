import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pdf } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { CareerPDF } from "@/lib/pdf/career-pdf";
import { getErrorMessage } from "@/lib/utils";
import React from "react";

export const dynamic = "force-dynamic";

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Buffer>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user, analysis] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, githubUsername: true } }),
      prisma.portfolioAnalysis.findUnique({ where: { userId } }),
    ]);

    if (!analysis) {
      return NextResponse.json({ error: "No career analysis found. Generate one first." }, { status: 404 });
    }

    const generatedAt = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });

    const element = React.createElement(CareerPDF, {
      name: user?.name || user?.githubUsername || "Developer",
      username: user?.githubUsername || "unknown",
      analysis: {
        ...analysis,
        strengths: analysis.strengths as string[],
        weakAreas: analysis.weakAreas as string[],
        careerRecommendations: analysis.careerRecommendations as string[],
      },
      generatedAt,
    }) as unknown as React.ReactElement<DocumentProps>;

    const readableStream = await pdf(element).toBuffer();
    const buffer = await streamToBuffer(readableStream);
    const filename = `devtrack-career-report-${new Date().toISOString().split("T")[0]}.pdf`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[export/career]", error);
    return NextResponse.json({ error: getErrorMessage(error, "Failed to generate PDF.") }, { status: 500 });
  }
}
