"use client";

import { useState, useEffect, useRef } from "react";
import { GripVertical, Pin, X, Plus, Star, GitFork } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PinRepo {
  id: string;
  name: string;
  description: string | null;
  primaryLanguage: string | null;
  stars: number;
  forks: number;
}

interface Pin {
  id: string;
  repositoryId: string;
  order: number;
  repository: PinRepo;
}

interface PinManagerProps {
  allRepos: PinRepo[];
}

export function PinManager({ allRepos }: PinManagerProps) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const dragId = useRef<string | null>(null);
  const dragOverId = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/pins")
      .then((r) => r.json())
      .then((d) => { if (d.pins) setPins(d.pins); })
      .catch(() => toast.error("Failed to load pinned repos."))
      .finally(() => setLoading(false));
  }, []);

  const pinnedIds = new Set(pins.map((p) => p.repositoryId));
  const unpinnedRepos = allRepos.filter((r) => !pinnedIds.has(r.id));

  const handlePin = async (repositoryId: string) => {
    setShowAdd(false);
    const res = await fetch("/api/pins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repositoryId }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed to pin."); return; }

    const repo = allRepos.find((r) => r.id === repositoryId)!;
    setPins((prev) => [
      ...prev,
      { id: data.pin.id, repositoryId, order: prev.length, repository: repo },
    ]);
    toast.success(`Pinned ${repo.name}.`);
  };

  const handleUnpin = async (repositoryId: string) => {
    const res = await fetch(`/api/pins/${repositoryId}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed to unpin."); return; }
    setPins((prev) => prev.filter((p) => p.repositoryId !== repositoryId).map((p, i) => ({ ...p, order: i })));
    toast.success("Unpinned.");
  };

  const saveOrder = async (ordered: Pin[]) => {
    setSaving(true);
    const res = await fetch("/api/pins/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: ordered.map((p) => p.repositoryId) }),
    });
    if (!res.ok) toast.error("Failed to save order.");
    setSaving(false);
  };

  const handleDragStart = (_e: React.DragEvent, repositoryId: string) => {
    dragId.current = repositoryId;
  };

  const handleDragOver = (e: React.DragEvent, repositoryId: string) => {
    e.preventDefault();
    dragOverId.current = repositoryId;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragId.current;
    const to = dragOverId.current;
    if (!from || !to || from === to) return;

    const next = [...pins];
    const fromIdx = next.findIndex((p) => p.repositoryId === from);
    const toIdx = next.findIndex((p) => p.repositoryId === to);
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    const reordered = next.map((p, i) => ({ ...p, order: i }));

    setPins(reordered);
    saveOrder(reordered);
    dragId.current = null;
    dragOverId.current = null;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px]">
        <div className="h-4 w-36 bg-[#1a1a1a] rounded animate-pulse mb-4" />
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-12 bg-[#1a1a1a] rounded-[10px] animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4 text-[#10B981]" />
          <h3 className="text-[14px] font-semibold text-white">Pinned on Profile</h3>
          <span className="text-[11px] text-[#737373] bg-[#1a1a1a] px-2 py-0.5 rounded-full">
            {pins.length}/6
          </span>
        </div>
        {saving && <span className="text-[11px] text-[#737373]">Saving…</span>}
      </div>

      {pins.length === 0 ? (
        <p className="text-[13px] text-[#737373] py-2">
          No repos pinned yet. Pin up to 6 to highlight them on your public profile.
        </p>
      ) : (
        <ul className="space-y-2">
          {pins.map((pin) => (
            <li
              key={pin.repositoryId}
              draggable
              onDragStart={(e) => handleDragStart(e, pin.repositoryId)}
              onDragOver={(e) => handleDragOver(e, pin.repositoryId)}
              onDrop={handleDrop}
              className="flex items-center gap-3 px-3 py-2.5 bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-[10px] cursor-grab active:cursor-grabbing group"
            >
              <GripVertical className="w-4 h-4 text-[#525252] shrink-0 group-hover:text-[#737373]" />
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-medium text-white truncate block">
                  {pin.repository.name}
                </span>
                <div className="flex items-center gap-3 text-[11px] text-[#525252] mt-0.5">
                  {pin.repository.primaryLanguage && (
                    <span>{pin.repository.primaryLanguage}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />{pin.repository.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3 h-3" />{pin.repository.forks}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleUnpin(pin.repositoryId)}
                className="p-1.5 rounded-lg text-[#525252] hover:text-red-400 hover:bg-[#1a1a1a] transition-colors shrink-0"
                aria-label={`Unpin ${pin.repository.name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {pins.length < 6 && (
        <div className="relative">
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="flex items-center gap-2 text-[12px] font-medium text-[#a3a3a3] hover:text-white border border-dashed border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] px-3 py-2 rounded-[10px] transition-colors w-full justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            Add a repo to pin
          </button>

          {showAdd && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-[10px] shadow-xl z-10 max-h-52 overflow-y-auto">
              {unpinnedRepos.length === 0 ? (
                <p className="text-[12px] text-[#737373] px-4 py-3">All repos are pinned.</p>
              ) : (
                unpinnedRepos.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => handlePin(repo.id)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 hover:bg-[#1a1a1a] transition-colors",
                      "text-[13px] text-white"
                    )}
                  >
                    <span className="font-medium">{repo.name}</span>
                    {repo.primaryLanguage && (
                      <span className="ml-2 text-[11px] text-[#737373]">{repo.primaryLanguage}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
