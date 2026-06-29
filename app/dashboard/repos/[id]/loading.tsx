import { Skeleton } from "@/components/ui/skeleton";

export default function RepoDetailLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-[10px]" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-5 border border-border bg-card rounded-[14px] space-y-3">
            <Skeleton className="h-2 w-20" />
            <Skeleton className="h-8 w-14" />
            <Skeleton className="h-1 w-full rounded-full" />
          </div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 p-8 border border-border bg-card rounded-[14px] space-y-4">
          <Skeleton className="h-4 w-40" />
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="space-y-6">
          <div className="p-6 border border-border bg-card rounded-[14px] space-y-3">
            <Skeleton className="h-3 w-28" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </div>
          <div className="p-6 border border-border bg-card rounded-[14px] space-y-3">
            <Skeleton className="h-3 w-32" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
