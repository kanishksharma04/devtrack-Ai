"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { User, Shield, Trash2, Calendar } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";

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

  const githubAccount = user.accounts.find((a) => a.provider === "github");
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
        <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-4">
          <User className="w-4 h-4 text-[#10B981]" />
          <h3 className="text-[14px] font-semibold text-white">Profile</h3>
        </div>
        <div className="flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={56}
              height={56}
              className="rounded-[10px] border border-[rgba(255,255,255,0.06)]"
            />
          ) : (
            <div className="w-14 h-14 rounded-[10px] bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#737373] font-semibold text-lg">
              {user.name?.[0]?.toUpperCase() || "D"}
            </div>
          )}
          <div>
            <p className="text-[15px] font-semibold text-white">{user.name || "Developer"}</p>
            <p className="text-[13px] text-[#737373]">{user.email || "No email on file"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-3 rounded-[10px] bg-[#111111] border border-[rgba(255,255,255,0.06)]">
            <p className="text-[10px] text-[#737373] uppercase tracking-wide mb-1">Repositories</p>
            <p className="text-[16px] font-semibold text-white">{user.repoCount}</p>
          </div>
          <div className="p-3 rounded-[10px] bg-[#111111] border border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3 h-3 text-[#737373]" />
              <p className="text-[10px] text-[#737373] uppercase tracking-wide">Joined</p>
            </div>
            <p className="text-[13px] font-medium text-white">{joinDate}</p>
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
        <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-4">
          <Shield className="w-4 h-4 text-[#10B981]" />
          <h3 className="text-[14px] font-semibold text-white">Connected Accounts</h3>
        </div>
        {githubAccount ? (
          <div className="flex items-center gap-3 p-3 rounded-[10px] bg-[#111111] border border-[rgba(255,255,255,0.06)]">
            <FaGithub className="w-5 h-5 text-white" />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-white">GitHub</p>
              <p className="text-[11px] text-[#737373]">ID: {githubAccount.providerAccountId}</p>
            </div>
            <span className="text-[11px] px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] font-medium">
              Connected
            </span>
          </div>
        ) : (
          <p className="text-[13px] text-[#737373]">No connected accounts.</p>
        )}
      </div>

      {/* Danger Zone */}
      <div className="p-6 border border-red-500/20 bg-[#151515] rounded-[14px] space-y-4">
        <div className="flex items-center gap-2 border-b border-red-500/10 pb-4">
          <Trash2 className="w-4 h-4 text-red-400" />
          <h3 className="text-[14px] font-semibold text-red-400">Danger Zone</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-white">Delete Account</p>
            <p className="text-[12px] text-[#737373] mt-0.5">
              Permanently delete your account, all repositories, analytics, and AI analyses. This cannot be undone.
            </p>
          </div>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="ml-4 shrink-0 px-4 py-2 text-[13px] font-medium text-red-400 border border-red-500/30 rounded-[10px] hover:bg-red-500/10 transition-colors duration-150 cursor-pointer"
            >
              Delete Account
            </button>
          ) : (
            <div className="ml-4 shrink-0 flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-2 text-[12px] font-medium text-[#a3a3a3] border border-[rgba(255,255,255,0.06)] rounded-[10px] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
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
