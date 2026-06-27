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
        "border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] p-6 transition-transform duration-150 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-medium text-[#737373] tracking-wide uppercase">
          {title}
        </span>
        <div className="p-2 rounded-[10px] bg-[#1a1a1a]">
          <Icon className="w-4 h-4 text-[#737373]" />
        </div>
      </div>
      <div className="text-[40px] font-semibold tracking-tight text-white leading-none mb-1">
        {value}
      </div>
      {description && (
        <p className="text-[12px] text-[#737373] font-normal mt-1">
          {description}
        </p>
      )}
    </div>
  );
}
