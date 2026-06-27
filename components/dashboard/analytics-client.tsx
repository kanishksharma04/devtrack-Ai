"use client";

import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Activity, Code, Star } from "lucide-react";

interface AnalyticsClientProps {
  analytics: any;
  repos: any[];
}

export function AnalyticsClient({ analytics, repos }: AnalyticsClientProps) {
  // Commit chart data
  const commitData = analytics?.commitsPerMonth || [];

  // Top languages data
  const languageData = (analytics?.topLanguages as any[]) || [];
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#ef4444", "#14b8a6"];

  // Top repos by stars
  const repoData = repos
    .slice(0, 5)
    .map((r) => ({
      name: r.name,
      stars: r.stars,
    }))
    .filter((r) => r.stars > 0);

  // Generate heatmap coordinates (last 365 days)
  const today = new Date();
  const days = [];
  const dailyCommits = analytics?.dailyContributions || {};

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = dailyCommits[dateStr] || 0;
    days.push({ date: dateStr, count });
  }

  // Get color scale for commits
  const getColorClass = (count: number) => {
    if (count === 0) return "bg-zinc-900 border border-zinc-950";
    if (count <= 2) return "bg-emerald-950/80 border border-emerald-950";
    if (count <= 4) return "bg-emerald-800 border border-emerald-900";
    if (count <= 8) return "bg-emerald-600 border border-emerald-700";
    return "bg-emerald-400 border border-emerald-500";
  };

  return (
    <div className="space-y-8 text-foreground">
      {/* 1. Contribution Heatmap */}
      <Card className="p-6 border border-border/80 bg-card rounded-3xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider mb-1">
            Contribution Activity
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Your daily commits mapped across the last 365 days.
          </p>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-[760px] p-4 bg-black/40 rounded-2xl border border-border/30 w-fit">
            {/* Days label */}
            <div className="grid grid-rows-7 gap-1 text-[9px] text-muted-foreground font-semibold pr-2 justify-items-end pt-5">
              <span>Mon</span>
              <span className="invisible">Tue</span>
              <span>Wed</span>
              <span className="invisible">Thu</span>
              <span>Fri</span>
              <span className="invisible">Sat</span>
              <span className="invisible">Sun</span>
            </div>
            
            {/* Heatmap Grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-1">
              {days.map((day, idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-sm transition-all hover:scale-125 ${getColorClass(day.count)}`}
                  title={`${day.date}: ${day.count} commits`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground font-bold">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-zinc-900 border border-zinc-950" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-950/80 border border-emerald-950" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-800 border border-emerald-900" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600 border border-emerald-700" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 border border-emerald-500" />
          <span>More</span>
        </div>
      </Card>

      {/* 2. Charts Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Commit Trend Area Chart */}
        <Card className="p-6 border border-border bg-card rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
              Commit Velocity
            </h3>
          </div>
          <div className="h-64 w-full">
            {commitData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={commitData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "12px", fontSize: "12px", color: "#fff" }}
                  />
                  <Area type="monotone" dataKey="commits" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCommits)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                No commit data available.
              </div>
            )}
          </div>
        </Card>

        {/* Language Pie Chart */}
        <Card className="p-6 border border-border bg-card rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
              Language Focus
            </h3>
          </div>
          <div className="h-64 w-full flex flex-col justify-between">
            {languageData.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center justify-between h-full">
                <div className="w-full sm:w-1/2 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="bytes"
                      >
                        {languageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [`${(value / 1024).toFixed(1)} KB`]}
                        contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "12px", fontSize: "11px", color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="w-full sm:w-1/2 flex flex-col gap-2 mt-4 sm:mt-0 max-h-48 overflow-y-auto pr-2">
                  {languageData.slice(0, 6).map((lang, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="font-semibold text-white">{lang.name}</span>
                      </div>
                      <span className="text-muted-foreground font-mono">{lang.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                No language data available.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 3. Repo Stars Bar Chart */}
      {repoData.length > 0 && (
        <Card className="p-6 border border-border bg-card rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
              Project Popularity (Stars)
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repoData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "12px", fontSize: "11px", color: "#fff" }}
                />
                <Bar dataKey="stars" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
