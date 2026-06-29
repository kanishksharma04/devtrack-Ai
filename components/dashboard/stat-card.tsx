import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  className?: string;
  gradient?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "border border-border bg-card rounded-[14px] p-6 transition-transform duration-150 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-medium text-text-muted-custom tracking-wide uppercase">
          {title}
        </span>
        <div className="p-2 rounded-[10px] bg-muted">
          <Icon className="w-4 h-4 text-text-muted-custom" />
        </div>
      </div>
      <div className="text-[40px] font-semibold tracking-tight text-foreground leading-none mb-1">
        {value}
      </div>
      {description && (
        <p className="text-[12px] text-text-muted-custom font-normal mt-1">
          {description}
        </p>
      )}
    </div>
  );
}
