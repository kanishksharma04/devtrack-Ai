import { serve } from "inngest/next";
import { inngest, analyzeFunction } from "@/lib/inngest";

// Inngest verifies the INNGEST_SIGNING_KEY on every incoming webhook call.
// The key is read automatically from the environment — never hard-code it.
// 60s is the Vercel Hobby plan ceiling. Inngest calls this endpoint once per
// step, so each invocation is short even for long-running jobs.
export const maxDuration = 60;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [analyzeFunction],
});
