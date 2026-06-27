import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-48 w-full rounded-[10px]" />
        </div>
        <div className="p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-48 w-full rounded-[10px]" />
        </div>
      </div>
      <div className="p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
        <Skeleton className="h-4 w-44" />
        <div className="grid grid-cols-7 gap-1">
          {[...Array(52 * 7)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-3 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
