"use client";

import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";

interface LoginButtonProps {
  hasGithubConfigured?: boolean;
  isDev?: boolean;
  authError?: string | null;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthCallback: "GitHub OAuth failed. Check your Client ID and Secret.",
  OAuthSignin: "Could not initiate GitHub sign-in.",
  Callback: "Authentication callback error. Please try again.",
  OAuthCallbackError: "GitHub rejected the OAuth request.",
  AccessDenied: "Sign-in was denied — check your database connection and environment variables on Vercel.",
  Default: "Authentication failed. Please try again.",
};

export function LoginButton({ hasGithubConfigured = true, isDev = false, authError }: LoginButtonProps) {
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authError) {
      const message = AUTH_ERROR_MESSAGES[authError] ?? AUTH_ERROR_MESSAGES.Default;
      toast.error(message, { id: "auth-error" });
    }
  }, [authError]);

  const handleGitHubLogin = () => {
    if (!hasGithubConfigured) return;
    setLoading("github");
    signIn("github", { callbackUrl: "/dashboard" }).catch(() => {
      toast.error("Failed to connect to GitHub.");
      setLoading(null);
    });
  };

  const handleMockLogin = () => {
    setLoading("mock");
    signIn("credentials", {
      callbackUrl: "/dashboard",
      username: "demo-developer",
    }).catch(() => {
      toast.error("Failed to sign in with demo account.");
      setLoading(null);
    });
  };

  if (!hasGithubConfigured) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-xl mx-auto p-6 rounded-[14px] border border-border bg-card">
        <div className="flex items-start gap-3 text-left">
          <Info className="w-5 h-5 text-brand mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-semibold text-foreground text-[14px]">GitHub Credentials Offline</h4>
            <p className="text-[13px] text-muted-foreground leading-relaxed font-medium">
              To connect your real GitHub account, define{" "}
              <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">GITHUB_CLIENT_ID</code>{" "}
              and{" "}
              <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">GITHUB_CLIENT_SECRET</code>{" "}
              inside{" "}
              <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">.env.local</code>.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          {isDev && (
            <button
              onClick={handleMockLogin}
              disabled={loading !== null}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 h-auto rounded-[10px] bg-brand hover:bg-brand-hover text-white font-semibold text-[13px] transition-colors duration-150 cursor-pointer disabled:opacity-50"
            >
              {loading === "mock" ? "Entering Demo Mode..." : "Sign in with Demo Account"}
            </button>
          )}

          <button
            onClick={handleGitHubLogin}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 h-auto rounded-[10px] border border-border bg-muted hover:bg-surface-5 text-muted-foreground hover:text-foreground font-medium text-[13px] transition-colors duration-150 cursor-pointer disabled:opacity-50"
          >
            <FaGithub className="w-4 h-4" />
            {loading === "github" ? "Connecting..." : "Connect GitHub"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleGitHubLogin}
      disabled={loading !== null}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 h-auto rounded-[10px] bg-white hover:bg-[#e5e5e5] text-[#090909] font-medium text-[14px] transition-colors duration-150 cursor-pointer disabled:opacity-55"
    >
      <FaGithub className="w-5 h-5" />
      {loading === "github" ? "Connecting to GitHub..." : "Connect with GitHub"}
    </button>
  );
}
