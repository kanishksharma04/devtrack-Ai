"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { useState } from "react";

export function LoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    signIn("github", { callbackUrl: "/dashboard" }).catch((e) => {
      console.error(e);
      setLoading(false);
    });
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={loading}
      className="w-full sm:w-auto gap-3 px-8 py-6 rounded-2xl bg-white hover:bg-zinc-100 text-black font-semibold text-sm transition-all shadow-lg shadow-white/5 cursor-pointer disabled:opacity-55"
    >
      <FaGithub className="w-5 h-5" />
      {loading ? "Connecting to GitHub..." : "Connect with GitHub"}
    </Button>
  );
}
