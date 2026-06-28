"use client";

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
  const days: { date: string; count: number }[] = [];
  const dailyCommits = analytics?.dailyContributions || {};

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const count = dailyCommits[dateStr] || 0;
    days.push({ date: dateStr, count });
  }

  // Build weeks (columns of 7 days)
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Determine month label per column (show label when the month changes)
  const weekMonthLabels: (string | null)[] = weeks.map((week, idx) => {
    const firstDay = new Date(week[0].date);
    const month = firstDay.getMonth();
    if (idx === 0) return MONTH_NAMES[month];
    const prevFirstDay = new Date(weeks[idx - 1][0].date);
    return firstDay.getMonth() !== prevFirstDay.getMonth() ? MONTH_NAMES[month] : null;
  });

  // Get color scale for commits
  const getColorClass = (count: number) => {
    if (count === 0) return "bg-[#1a1a1a]";
    if (count <= 2) return "bg-emerald-950/80";
    if (count <= 4) return "bg-emerald-800";
    if (count <= 8) return "bg-emerald-600";
    return "bg-emerald-400";
  };

  const tooltipStyle = {
    backgroundColor: "#151515",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "10px",
    fontSize: "12px",
    color: "#fff",
  };

  return (
    <div className="space-y-8 text-foreground">
      {/* 1. Contribution Heatmap */}
      <div className="p-4 md:p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
        <div>
          <h3 className="text-[14px] font-semibold text-white mb-1">
            Contribution Activity
          </h3>
          <p className="text-[12px] text-[#737373]">
            Your daily commits mapped across the last 365 days.
          </p>
        </div>

        <div className="overflow-x-auto pb-2 min-w-0">
          <div className="flex gap-2 p-4 bg-[#111111] rounded-[10px] w-fit">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-1 text-[9px] text-[#737373] font-medium pr-1 justify-items-end" style={{ paddingTop: "18px" }}>
              <span className="h-2.5 leading-none">Mon</span>
              <span className="h-2.5 leading-none invisible">Tue</span>
              <span className="h-2.5 leading-none">Wed</span>
              <span className="h-2.5 leading-none invisible">Thu</span>
              <span className="h-2.5 leading-none">Fri</span>
              <span className="h-2.5 leading-none invisible">Sat</span>
              <span className="h-2.5 leading-none invisible">Sun</span>
            </div>

            {/* Weeks with month labels */}
            <div className="flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {/* Month label row */}
                  <span className="h-3.5 text-[9px] text-[#737373] font-medium leading-none whitespace-nowrap">
                    {weekMonthLabels[weekIdx] ?? ""}
                  </span>
                  {/* Day cells */}
                  {week.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`w-2.5 h-2.5 rounded-sm transition-all hover:scale-125 ${getColorClass(day.count)}`}
                      title={`${day.date}: ${day.count} commit${day.count !== 1 ? "s" : ""}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 text-[10px] text-[#737373] font-medium">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#1a1a1a]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-950/80" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-800" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
          <span>More</span>
        </div>
      </div>

      {/* 2. Charts Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Commit Trend Area Chart */}
        <div className="p-4 md:p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-[14px] font-semibold text-white">
              Commit Velocity
            </h3>
          </div>
          <div className="h-64 w-full">
            {commitData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={commitData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="commits" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCommits)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[13px] text-[#737373]">
                No commit data available.
              </div>
            )}
          </div>
        </div>

        {/* Language Pie Chart */}
        <div className="p-4 md:p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-[14px] font-semibold text-white">
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
                        contentStyle={tooltipStyle}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="w-full sm:w-1/2 flex flex-col gap-2 mt-4 sm:mt-0 max-h-48 overflow-y-auto pr-2">
                  {languageData.slice(0, 6).map((lang, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="font-medium text-white">{lang.name}</span>
                      </div>
                      <span className="text-[#737373] font-mono">{lang.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[13px] text-[#737373]">
                No language data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Repo Stars Bar Chart */}
      {repoData.length > 0 && (
        <div className="p-4 md:p-6 border border-[rgba(255,255,255,0.06)] bg-[#151515] rounded-[14px] space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#f59e0b]" />
            <h3 className="text-[14px] font-semibold text-white">
              Project Popularity (Stars)
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repoData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="stars" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
