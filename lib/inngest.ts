import { Inngest } from "inngest";
import { prisma } from "./prisma";
import { analyzeRepository, analyzePortfolio } from "./services/ai";

// INNGEST_EVENT_KEY is picked up automatically from the environment.
export const inngest = new Inngest({ id: "devtrack-ai" });

type AnalyzeEventData = {
  jobId: string;
  type: "repo" | "portfolio";
  userId: string;
  repositoryId?: string | null;
};

export const analyzeFunction = inngest.createFunction(
  {
    id: "analyze-job",
    triggers: [{ event: "devtrack/analyze.requested" }],
    retries: 3,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFailure: async ({ event, error }: { event: any; error: Error }) => {
      // In Inngest v4 onFailure, event.data.data holds the original event payload
      const { jobId } = event.data.data as AnalyzeEventData;
      await prisma.analysisJob
        .update({ where: { id: jobId }, data: { status: "failed", error: error.message } })
        .catch((e: unknown) => console.error("[inngest] onFailure db update error:", e));
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ event, step }: { event: { data: AnalyzeEventData }; step: any }) => {
    const { jobId, type, userId, repositoryId } = event.data;

    await step.run("mark-running", () =>
      prisma.analysisJob.update({ where: { id: jobId }, data: { status: "running" } })
    );

    // Each step.run call is independently retried on transient failure.
    // analyzeRepository / analyzePortfolio already upsert into the DB so
    // retrying them is safe — the last successful call wins.
    const result = await step.run("run-gemini-analysis", async () => {
      if (type === "repo") {
        if (!repositoryId) throw new Error("repositoryId required for repo analysis");
        return analyzeRepository(repositoryId);
      }
      return analyzePortfolio(userId);
    });

    await step.run("mark-completed", () =>
      prisma.analysisJob.update({
        where: { id: jobId },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { status: "completed", result: result as any },
      })
    );

    return result;
  }
);
