import { Skeleton } from "@/components/ui/skeleton";

export default function CareerLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="space-y-1">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="p-6 border border-border bg-card rounded-[14px] flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-[10px]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-[10px]" />
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-8 border border-border bg-card rounded-[14px] space-y-4">
            <Skeleton className="h-4 w-32" />
            {[...Array(3)].map((_, j) => <Skeleton key={j} className="h-4 w-full" />)}
          </div>
        ))}
      </div>
      <div className="p-8 border border-border bg-card rounded-[14px] space-y-4">
        <Skeleton className="h-4 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-[10px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
