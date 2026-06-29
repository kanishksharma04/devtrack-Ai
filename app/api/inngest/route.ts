import { serve } from "inngest/next";
import { inngest, analyzeFunction } from "@/lib/inngest";

// Inngest verifies the INNGEST_SIGNING_KEY on every incoming webhook call.
// The key is read automatically from the environment — never hard-code it.
// Set maxDuration to the Vercel Pro limit so long-running steps don't time out.
export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [analyzeFunction],
});
