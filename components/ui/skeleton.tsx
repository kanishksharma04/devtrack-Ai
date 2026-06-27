import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[10px] bg-[#1a1a1a]", className)}
      {...props}
    />
  );
}

export { Skeleton };
