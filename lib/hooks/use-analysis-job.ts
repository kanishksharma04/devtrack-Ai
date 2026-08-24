"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type JobStatus = "queued" | "running" | "completed" | "failed";

export interface JobState {
  loading: boolean;
  jobId: string | null;
  status: JobStatus | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any | null;
  error: string | null;
  /** HTTP status of the initial POST — useful for surfacing 429 to the caller */
  httpStatus: number | null;
}

const POLL_INTERVAL_MS = 2_000;

export function useAnalysisJob() {
  const [state, setState] = useState<JobState>({
    loading: false,
    jobId: null,
    status: null,
    data: null,
    error: null,
    httpStatus: null,
  });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Tracks whether a job is in flight synchronously, unlike `state.loading`
  // which only updates on the next render. Without this, a second startJob
  // call landing before that render commits (e.g. a fast double-click) would
  // tear down the first job's poll via stopPolling() below and orphan it.
  const inFlightRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  /**
   * Starts a background analysis job.
   * Returns { ok, httpStatus, error?, jobId? } so callers can handle 429 distinctly.
   */
  const startJob = useCallback(
    async (type: "repo" | "portfolio", repositoryId?: string) => {
      if (inFlightRef.current) {
        return { ok: false, httpStatus: 0, error: "An analysis is already in progress." };
      }
      inFlightRef.current = true;

      stopPolling();
      setState({ loading: true, jobId: null, status: null, data: null, error: null, httpStatus: null });

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, ...(repositoryId ? { repositoryId } : {}) }),
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const json = await res.json().catch(() => ({})) as any;

        if (!res.ok) {
          inFlightRef.current = false;
          setState({
            loading: false,
            jobId: null,
            status: null,
            data: null,
            error: json.error || "Failed to start analysis.",
            httpStatus: res.status,
          });
          return { ok: false, httpStatus: res.status, error: json.error as string | undefined };
        }

        const { jobId } = json as { jobId: string; status: string };
        setState((prev) => ({ ...prev, jobId, status: "queued", httpStatus: res.status }));

        pollRef.current = setInterval(async () => {
          try {
            const poll = await fetch(`/api/analyze/${jobId}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pollJson = await poll.json().catch(() => ({})) as any;

            if (pollJson.status === "completed") {
              stopPolling();
              inFlightRef.current = false;
              setState({
                loading: false,
                jobId,
                status: "completed",
                data: pollJson.data,
                error: null,
                httpStatus: 200,
              });
            } else if (pollJson.status === "failed") {
              stopPolling();
              inFlightRef.current = false;
              setState({
                loading: false,
                jobId,
                status: "failed",
                data: null,
                error: pollJson.error || "Analysis failed.",
                httpStatus: 200,
              });
            } else {
              setState((prev) => ({ ...prev, status: pollJson.status ?? prev.status }));
            }
          } catch {
            // Transient network error — keep polling
          }
        }, POLL_INTERVAL_MS);

        return { ok: true, httpStatus: res.status, jobId };
      } catch {
        inFlightRef.current = false;
        setState({
          loading: false,
          jobId: null,
          status: null,
          data: null,
          error: "Network error. Please try again.",
          httpStatus: 0,
        });
        return { ok: false, httpStatus: 0, error: "Network error." };
      }
    },
    [stopPolling]
  );

  return { ...state, startJob };
}
