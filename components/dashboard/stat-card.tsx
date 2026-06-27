import React from "react";
import { Card } from "@/components/ui/card";
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
  gradient = "from-emerald-500/10 to-teal-500/5",
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border/80 bg-card hover:border-zinc-700 transition-all duration-300 group rounded-2xl shadow-sm hover:shadow-md",
        className
      )}
    >
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full blur-3xl opacity-30 -mr-8 -mt-8 transition-opacity duration-300 group-hover:opacity-40",
          gradient
        )}
      />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            {title}
          </span>
          <div className="p-2.5 rounded-xl bg-muted border border-border/50 group-hover:border-zinc-700 group-hover:bg-zinc-800/50 transition-colors">
            <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>
        <div className="text-3xl font-bold tracking-tight text-white mb-1">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground font-medium">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}
