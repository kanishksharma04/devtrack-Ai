"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { useState } from "react";
import { Info } from "lucide-react";

interface LoginButtonProps {
  hasGithubConfigured?: boolean;
}

export function LoginButton({ hasGithubConfigured = true }: LoginButtonProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleGitHubLogin = () => {
    setLoading("github");
    signIn("github", { callbackUrl: "/dashboard" }).catch((e) => {
      console.error(e);
      setLoading(null);
    });
  };

  const handleMockLogin = () => {
    setLoading("mock");
    signIn("credentials", { 
      callbackUrl: "/dashboard", 
      username: "demo-developer" 
    }).catch((e) => {
      console.error(e);
      setLoading(null);
    });
  };

  if (!hasGithubConfigured) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-xl mx-auto p-6 rounded-3xl border border-zinc-900 bg-zinc-950/60 backdrop-blur-md">
        <div className="flex items-start gap-3 text-left">
          <Info className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-semibold text-white text-sm">GitHub Credentials Offline</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              To connect your real GitHub account, define <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded font-mono">GITHUB_CLIENT_ID</code> and <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded font-mono">GITHUB_CLIENT_SECRET</code> inside <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded font-mono">.env.local</code>.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button
            onClick={handleMockLogin}
            disabled={loading !== null}
            className="flex-1 gap-2 px-6 py-6 h-auto rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading === "mock" ? "Entering Demo Mode..." : "Sign in with Mock Account (Demo)"}
          </Button>

          <Button
            onClick={handleGitHubLogin}
            disabled={loading !== null}
            variant="outline"
            className="flex-1 gap-2 px-6 py-6 h-auto rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-300 hover:text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <FaGithub className="w-4 h-4" />
            {loading === "github" ? "Connecting..." : "Connect GitHub"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleGitHubLogin}
      disabled={loading !== null}
      className="w-full sm:w-auto gap-3 px-8 py-6 h-auto rounded-2xl bg-white hover:bg-zinc-100 text-black font-semibold text-sm transition-all shadow-lg shadow-white/5 cursor-pointer disabled:opacity-55"
    >
      <FaGithub className="w-5 h-5" />
      {loading === "github" ? "Connecting to GitHub..." : "Connect with GitHub"}
    </Button>
  );
}
