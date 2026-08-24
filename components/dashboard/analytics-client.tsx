"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Activity, Code, Star, ChevronDown, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CommitMonth {
  month: string;
  commits: number;
}

interface LanguageStat {
  name: string;
  bytes: number;
  percentage: number;
}

interface AnalyticsData {
  commitsPerMonth?: CommitMonth[] | null;
  topLanguages?: LanguageStat[] | null;
  dailyContributions?: Record<string, number> | null;
}

interface AnalyticsClientProps {
  analytics: AnalyticsData | null;
  repos: { name: string; stars: number }[];
  fetchedYears: number[];
  githubJoinedYear: number | null;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Parses the "YYYY-MM-DD" keys directly instead of `new Date(dateStr)` —
// the latter reparses as UTC and shifts the displayed date for anyone
// behind UTC, the same class of bug already fixed for the month labels below.
function formatCellDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

type GridCell = { date: string; count: number } | null;

export function AnalyticsClient({
  analytics,
  repos,
  fetchedYears: initialFetchedYears,
  githubJoinedYear,
}: AnalyticsClientProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const commitData = analytics?.commitsPerMonth || [];
  const languageData = analytics?.topLanguages || [];
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#ef4444", "#14b8a6"];

  const repoData = repos
    .slice(0, 5)
    .map((r) => ({ name: r.name, stars: r.stars }))
    .filter((r) => r.stars > 0);

  const [dailyContributions, setDailyContributions] = useState<Record<string, number>>(
    () => analytics?.dailyContributions || {}
  );
  const [fetchedYears, setFetchedYears] = useState<number[]>(initialFetchedYears);
  const [selectedYear, setSelectedYear] = useState<number | "current">("current");
  const [loadingYear, setLoadingYear] = useState<number | null>(null);

  // GitHub-style year picker: the current (in-progress) year always shows the
  // trailing-365-day view; past full calendar years are fetched on demand
  // (see /api/analytics/year) the first time they're selected, then cached
  // both server-side (fetchedYears) and here in local state.
  const currentCalendarYear = new Date().getFullYear();
  const minYear = githubJoinedYear ?? currentCalendarYear - 5;
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentCalendarYear - 1; y >= minYear; y--) years.push(y);
    return years;
  }, [currentCalendarYear, minYear]);

  const handleSelectYear = useCallback(
    async (year: number | "current") => {
      setSelectedYear(year);
      if (year === "current" || fetchedYears.includes(year)) return;

      setLoadingYear(year);
      try {
        const res = await fetch(`/api/analytics/year?year=${year}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load that year.");
        setDailyContributions(data.dailyContributions);
        setFetchedYears(data.fetchedYears);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load that year.");
        setSelectedYear("current");
      } finally {
        setLoadingYear(null);
      }
    },
    [fetchedYears]
  );

  // Build a calendar-aligned grid so each row is always the same real weekday
  // (Mon..Sun), matching the hardcoded row labels below. "current" mode is a
  // fixed trailing 365-day window; a specific year is Jan 1 - Dec 31 of that
  // year (365 or 366 days). Either way we pad the start back to the most
  // recent Monday and the end forward to the next Sunday.
  const { weeks, weekMonthLabels } = useMemo(() => {
    let startDate: Date;
    let endDate: Date;
    if (selectedYear === "current") {
      const today = new Date();
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 364);
    } else {
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31);
    }

    const leadingBlanks = (startDate.getDay() + 6) % 7; // Mon=0 .. Sun=6
    const cells: GridCell[] = Array(leadingBlanks).fill(null);
    for (const d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      cells.push({ date: dateStr, count: dailyContributions[dateStr] || 0 });
    }
    const trailingBlanks = (7 - (cells.length % 7)) % 7;
    cells.push(...Array(trailingBlanks).fill(null));

    const weeks: GridCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    const weekMonth = (week: GridCell[]): number | null => {
      const cell = week.find((c) => c !== null);
      return cell ? Number(cell.date.split("-")[1]) - 1 : null;
    };
    const weekMonthLabels: (string | null)[] = weeks.map((week, idx) => {
      const month = weekMonth(week);
      if (month === null) return null;
      const prevMonth = idx > 0 ? weekMonth(weeks[idx - 1]) : null;
      return month !== prevMonth ? MONTH_NAMES[month] : null;
    });

    return { weeks, weekMonthLabels };
  }, [selectedYear, dailyContributions]);

  const getHeatColor = (count: number) => {
    if (isDark) {
      if (count === 0) return "bg-muted";
      if (count <= 2) return "bg-emerald-950/80";
      if (count <= 4) return "bg-emerald-800";
      if (count <= 8) return "bg-emerald-600";
      return "bg-emerald-400";
    } else {
      if (count === 0) return "bg-muted";
      if (count <= 2) return "bg-emerald-100";
      if (count <= 4) return "bg-emerald-300";
      if (count <= 8) return "bg-emerald-500";
      return "bg-emerald-700";
    }
  };

  const axisColor = isDark ? "#525252" : "#a3a3a3";
  const tooltipStyle = {
    backgroundColor: isDark ? "#151515" : "#ffffff",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
    borderRadius: "10px",
    fontSize: "12px",
    color: isDark ? "#fff" : "#0a0a0a",
  };

  if (repos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 border border-border bg-card rounded-[14px]">
        <div className="p-4 rounded-[14px] bg-muted mb-4">
          <Activity className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-[15px] font-semibold mb-1">No repositories synced yet</h3>
        <p className="text-[13px] text-muted-foreground max-w-sm">
          Sync your GitHub account from the dashboard to see commit activity, language breakdowns, and repo stats here.
        </p>
      </div>
    );
  }

  const isLoadingSelected = selectedYear !== "current" && loadingYear === selectedYear;

  return (
    <div className="space-y-8 text-foreground">
      {/* Contribution Heatmap */}
      <div className="p-4 md:p-6 border border-border bg-card rounded-[14px] space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[14px] font-semibold mb-1">Contribution Activity</h3>
            <p className="text-[12px] text-text-muted-custom">
              {selectedYear === "current"
                ? "Your daily commits mapped across the last 365 days."
                : `Your daily commits mapped across ${selectedYear}.`}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={loadingYear !== null}
                className="shrink-0 gap-1.5 rounded-[10px] text-[12px]"
              >
                {selectedYear === "current" ? "Last 12 months" : selectedYear}
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-72 min-w-36 overflow-y-auto">
              <DropdownMenuItem onSelect={() => handleSelectYear("current")}>
                <span className="flex-1">Last 12 months</span>
                {selectedYear === "current" && <Check className="w-3.5 h-3.5" />}
              </DropdownMenuItem>
              {yearOptions.map((y) => (
                <DropdownMenuItem key={y} onSelect={() => handleSelectYear(y)}>
                  <span className="flex-1">{y}</span>
                  {selectedYear === y && <Check className="w-3.5 h-3.5" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="overflow-x-auto pb-2 min-w-0">
          <div className="flex gap-2 p-4 bg-surface-2 rounded-[10px] w-fit">
            <div className="flex flex-col gap-1 text-[9px] text-text-muted-custom font-medium pr-1 justify-items-end" style={{ paddingTop: "18px" }}>
              <span className="h-2.5 leading-none">Mon</span>
              <span className="h-2.5 leading-none invisible">Tue</span>
              <span className="h-2.5 leading-none">Wed</span>
              <span className="h-2.5 leading-none invisible">Thu</span>
              <span className="h-2.5 leading-none">Fri</span>
              <span className="h-2.5 leading-none invisible">Sat</span>
              <span className="h-2.5 leading-none invisible">Sun</span>
            </div>

            {isLoadingSelected ? (
              <div className="flex h-33 w-140 max-w-full items-center justify-center text-[12px] text-text-muted-custom">
                Loading {loadingYear} contribution history…
              </div>
            ) : (
              <TooltipProvider delayDuration={150}>
                <div className="flex gap-1">
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-1">
                      <span className="h-3.5 text-[9px] text-text-muted-custom font-medium leading-none whitespace-nowrap">
                        {weekMonthLabels[weekIdx] ?? ""}
                      </span>
                      {week.map((day, dayIdx) =>
                        day ? (
                          <UITooltip key={dayIdx}>
                            <TooltipTrigger asChild>
                              <div
                                className={`w-2.5 h-2.5 rounded-sm transition-all hover:scale-125 ${getHeatColor(day.count)}`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              {day.count} {day.count === 1 ? "contribution" : "contributions"} on {formatCellDate(day.date)}
                            </TooltipContent>
                          </UITooltip>
                        ) : (
                          <div key={dayIdx} className="w-2.5 h-2.5" />
                        )
                      )}
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 text-[10px] text-text-muted-custom font-medium">
          <span>Less</span>
          <div className={`w-2.5 h-2.5 rounded-sm ${getHeatColor(0)}`} />
          <div className={`w-2.5 h-2.5 rounded-sm ${getHeatColor(1)}`} />
          <div className={`w-2.5 h-2.5 rounded-sm ${getHeatColor(3)}`} />
          <div className={`w-2.5 h-2.5 rounded-sm ${getHeatColor(6)}`} />
          <div className={`w-2.5 h-2.5 rounded-sm ${getHeatColor(10)}`} />
          <span>More</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="p-4 md:p-6 border border-border bg-card rounded-[14px] space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand" />
            <h3 className="text-[14px] font-semibold">Commit Velocity</h3>
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
                  <XAxis dataKey="month" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="commits" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCommits)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[13px] text-text-muted-custom">
                No commit data available.
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-6 border border-border bg-card rounded-[14px] space-y-4">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-brand" />
            <h3 className="text-[14px] font-semibold">Language Focus</h3>
          </div>
          <div className="h-64 w-full flex flex-col justify-between">
            {languageData.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center justify-between h-full">
                <div className="w-full sm:w-1/2 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={languageData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="bytes">
                        {languageData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => [`${(Number(value) / 1024).toFixed(1)} KB`]}
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
                        <span className="font-medium">{lang.name}</span>
                      </div>
                      <span className="text-text-muted-custom font-mono">{lang.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[13px] text-text-muted-custom">
                No language data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {repoData.length > 0 && (
        <div className="p-4 md:p-6 border border-border bg-card rounded-[14px] space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-chart-3" />
            <h3 className="text-[14px] font-semibold">Project Popularity (Stars)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repoData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="stars" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
