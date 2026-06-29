"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { User, Shield, Trash2, Calendar, HelpCircle } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";
import { useTourReset } from "@/components/dashboard/onboarding-tour";

interface SettingsClientProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: string;
    accounts: { provider: string; providerAccountId: string }[];
    repoCount: number;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        toast.success("Account deleted. Goodbye!");
        await signOut({ callbackUrl: "/" });
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete account.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const resetTour = useTourReset();
  const githubAccount = user.accounts.find((a) => a.provider === "github");
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="p-6 border border-border bg-card rounded-[14px] space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <User className="w-4 h-4 text-brand" />
          <h3 className="text-[14px] font-semibold">Profile</h3>
        </div>
        <div className="flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={56}
              height={56}
              className="rounded-[10px] border border-border"
            />
          ) : (
            <div className="w-14 h-14 rounded-[10px] bg-muted border border-border flex items-center justify-center text-text-muted-custom font-semibold text-lg">
              {user.name?.[0]?.toUpperCase() || "D"}
            </div>
          )}
          <div>
            <p className="text-[15px] font-semibold">{user.name || "Developer"}</p>
            <p className="text-[13px] text-text-muted-custom">{user.email || "No email on file"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-3 rounded-[10px] bg-surface-2 border border-border">
            <p className="text-[10px] text-text-muted-custom uppercase tracking-wide mb-1">Repositories</p>
            <p className="text-[16px] font-semibold">{user.repoCount}</p>
          </div>
          <div className="p-3 rounded-[10px] bg-surface-2 border border-border">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3 h-3 text-text-muted-custom" />
              <p className="text-[10px] text-text-muted-custom uppercase tracking-wide">Joined</p>
            </div>
            <p className="text-[13px] font-medium">{joinDate}</p>
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="p-6 border border-border bg-card rounded-[14px] space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <Shield className="w-4 h-4 text-brand" />
          <h3 className="text-[14px] font-semibold">Connected Accounts</h3>
        </div>
        {githubAccount ? (
          <div className="flex items-center gap-3 p-3 rounded-[10px] bg-surface-2 border border-border">
            <FaGithub className="w-5 h-5" />
            <div className="flex-1">
              <p className="text-[13px] font-medium">GitHub</p>
              <p className="text-[11px] text-text-muted-custom">ID: {githubAccount.providerAccountId}</p>
            </div>
            <span className="text-[11px] px-2 py-1 rounded-full bg-brand-muted text-brand font-medium">
              Connected
            </span>
          </div>
        ) : (
          <p className="text-[13px] text-text-muted-custom">No connected accounts.</p>
        )}
      </div>

      {/* Help & Onboarding */}
      <div className="p-6 border border-border bg-card rounded-[14px] space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <HelpCircle className="w-4 h-4 text-brand" />
          <h3 className="text-[14px] font-semibold">Help & Onboarding</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium">Restart Guided Tour</p>
            <p className="text-[12px] text-text-muted-custom mt-0.5">
              Replay the onboarding walkthrough to rediscover key features.
            </p>
          </div>
          <button
            onClick={resetTour}
            className="ml-4 shrink-0 px-4 py-2 text-[13px] font-medium text-muted-foreground border border-border bg-muted hover:bg-surface-5 hover:text-foreground rounded-[10px] transition-colors duration-150 cursor-pointer"
          >
            Restart Tour
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 border border-red-500/20 bg-card rounded-[14px] space-y-4">
        <div className="flex items-center gap-2 border-b border-red-500/10 pb-4">
          <Trash2 className="w-4 h-4 text-red-500" />
          <h3 className="text-[14px] font-semibold text-red-500">Danger Zone</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium">Delete Account</p>
            <p className="text-[12px] text-text-muted-custom mt-0.5">
              Permanently delete your account, all repositories, analytics, and AI analyses. This cannot be undone.
            </p>
          </div>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="ml-4 shrink-0 px-4 py-2 text-[13px] font-medium text-red-500 border border-red-500/30 rounded-[10px] hover:bg-red-500/10 transition-colors duration-150 cursor-pointer"
            >
              Delete Account
            </button>
          ) : (
            <div className="ml-4 shrink-0 flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-2 text-[12px] font-medium text-muted-foreground border border-border rounded-[10px] hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-3 py-2 text-[12px] font-medium text-white bg-red-600 hover:bg-red-700 rounded-[10px] transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
