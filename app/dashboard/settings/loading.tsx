import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="space-y-1">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="p-6 border border-border bg-card rounded-[14px] space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full rounded-[10px]" />
        <Skeleton className="h-10 w-full rounded-[10px]" />
      </div>
      <div className="p-6 border border-border bg-card rounded-[14px] space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full rounded-[10px]" />
      </div>
    </div>
  );
}
