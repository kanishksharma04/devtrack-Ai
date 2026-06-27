import { prisma } from "../prisma";

interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  size: number;
  open_issues_count: number;
  private: boolean;
  default_branch: string;
  pushed_at: string | null;
}

interface GitHubCommitResponse {
  commit: {
    author: {
      date: string;
    };
  };
}

// Custom serialization function to resolve BigInt JSON response failures
export function serializeDbRepo(repo: any) {
  if (!repo) return null;
  return {
    ...repo,
    githubId: repo.githubId ? repo.githubId.toString() : null,
  };
}

export async function fetchGitHubUser(accessToken: string) {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DevTrack-AI",
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub User API returned status ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<{ login: string; email: string | null }>;
}

export async function syncGitHubData(userId: string, accessToken: string) {
  if (accessToken === "mock_token" || accessToken.startsWith("mock_")) {
    const mockRepos = [
      {
        id: 101,
        name: "nextjs-saas-template",
        fullName: "vercel/next.js",
        description: "A production-ready Next.js SaaS starter kit with Auth, Database, and Stripe integration.",
        stars: 342,
        forks: 58,
        primaryLanguage: "TypeScript",
        languages: { TypeScript: 85000, CSS: 8000, HTML: 2000 },
        size: 1420,
        openIssues: 4,
        isPrivate: false,
        pushedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 102,
        name: "ai-copilot-agent",
        fullName: "google/gemini-cookbook",
        description: "Autonomous coding agent powered by Gemini 1.5 Pro and Next.js.",
        stars: 1205,
        forks: 184,
        primaryLanguage: "TypeScript",
        languages: { TypeScript: 124000, Python: 45000, Shell: 1500 },
        size: 3200,
        openIssues: 12,
        isPrivate: false,
        pushedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 103,
        name: "rust-query-builder",
        fullName: "diesel-rs/diesel",
        description: "A blazing fast, type-safe SQL query builder written in Rust.",
        stars: 489,
        forks: 32,
        primaryLanguage: "Rust",
        languages: { Rust: 98000, Shell: 500 },
        size: 890,
        openIssues: 1,
        isPrivate: false,
        pushedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 104,
        name: "react-native-chat-app",
        fullName: "facebook/react-native",
        description: "Real-time encrypted chat application using React Native and WebSockets.",
        stars: 154,
        forks: 22,
        primaryLanguage: "JavaScript",
        languages: { JavaScript: 43000, TypeScript: 12000, CSS: 3000 },
        size: 1120,
        openIssues: 6,
        isPrivate: false,
        pushedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    const syncedRepos = [];
    let totalStars = 0;
    let totalForks = 0;
    const languageStats: Record<string, number> = {};

    for (const repo of mockRepos) {
      totalStars += repo.stars;
      totalForks += repo.forks;
      for (const [lang, bytes] of Object.entries(repo.languages)) {
        languageStats[lang] = (languageStats[lang] || 0) + bytes;
      }

      const dbRepo = await prisma.repository.upsert({
        where: {
          githubId: BigInt(repo.id),
        },
        update: {
          userId,
          name: repo.name,
          fullName: repo.fullName,
          description: repo.description,
          htmlUrl: `https://github.com/${repo.fullName}`,
          stars: repo.stars,
          forks: repo.forks,
          primaryLanguage: repo.primaryLanguage,
          languages: repo.languages as any,
          size: repo.size,
          openIssues: repo.openIssues,
          isPrivate: repo.isPrivate,
          defaultBranch: "main",
          pushedAt: new Date(repo.pushedAt),
        },
        create: {
          userId,
          githubId: BigInt(repo.id),
          name: repo.name,
          fullName: repo.fullName,
          description: repo.description,
          htmlUrl: `https://github.com/${repo.fullName}`,
          stars: repo.stars,
          forks: repo.forks,
          primaryLanguage: repo.primaryLanguage,
          languages: repo.languages as any,
          size: repo.size,
          openIssues: repo.openIssues,
          isPrivate: repo.isPrivate,
          defaultBranch: "main",
          pushedAt: new Date(repo.pushedAt),
        },
      });
      syncedRepos.push(dbRepo);
    }

    const commitsPerDay: Record<string, number> = {};
    const commitsPerMonth: Record<string, number> = {};

    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toLocaleString("default", { month: "short", year: "2-digit" });
      commitsPerMonth[monthKey] = 0;
    }

    let totalCommits = 0;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    // Seed commit history
    for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const rand = Math.random();
      let commitCount = 0;
      if (isWeekend) {
        if (rand > 0.8) commitCount = Math.floor(Math.random() * 3) + 1;
      } else {
        if (rand > 0.45) commitCount = Math.floor(Math.random() * 5) + 1;
      }
      if (commitCount > 0) {
        commitsPerDay[dateStr] = commitCount;
        totalCommits += commitCount;
        
        const monthKey = d.toLocaleString("default", { month: "short", year: "2-digit" });
        if (monthKey in commitsPerMonth) {
          commitsPerMonth[monthKey] += commitCount;
        }
      }
    }

    const totalBytes = Object.values(languageStats).reduce((sum, bytes) => sum + bytes, 0);
    const topLanguages = Object.entries(languageStats)
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: totalBytes > 0 ? parseFloat(((bytes / totalBytes) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.bytes - a.bytes);

    const commitsPerMonthChart = Object.entries(commitsPerMonth).map(([month, count]) => ({
      month,
      commits: count,
    }));

    const analytics = await prisma.codingAnalytics.upsert({
      where: { userId },
      update: {
        totalCommits,
        commitsPerMonth: commitsPerMonthChart as any,
        dailyContributions: commitsPerDay as any,
        topLanguages: topLanguages as any,
        totalStars,
        totalForks,
        lastSyncedAt: new Date(),
      },
      create: {
        userId,
        totalCommits,
        commitsPerMonth: commitsPerMonthChart as any,
        dailyContributions: commitsPerDay as any,
        topLanguages: topLanguages as any,
        totalStars,
        totalForks,
        lastSyncedAt: new Date(),
      },
    });

    return {
      syncedReposCount: syncedRepos.length,
      totalCommits,
      totalStars,
      totalForks,
      topLanguages,
      analytics,
    };
  }

  const ghUser = await fetchGitHubUser(accessToken);
  const username = ghUser.login;

  // Store the GitHub username in the user record
  await prisma.user.update({
    where: { id: userId },
    data: { githubUsername: username },
  });

  // Fetch repositories of authenticated user sorted by last pushed
  const reposRes = await fetch(
    "https://api.github.com/user/repos?type=owner&sort=pushed&per_page=50",
    {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "DevTrack-AI",
      },
    }
  );

  if (!reposRes.ok) {
    throw new Error(`GitHub Repos API returned status ${reposRes.status}: ${reposRes.statusText}`);
  }

  const reposData = (await reposRes.json()) as GitHubRepoResponse[];

  const syncedRepos = [];
  let totalStars = 0;
  let totalForks = 0;
  const languageStats: Record<string, number> = {};
  const commitsPerDay: Record<string, number> = {};
  const commitsPerMonth: Record<string, number> = {};

  // Seed default last 12 months for chart keys
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toLocaleString("default", { month: "short", year: "2-digit" });
    commitsPerMonth[monthKey] = 0;
  }

  // Sync up to 50 repositories
  const reposToProcess = reposData.slice(0, 50);

  for (const repo of reposToProcess) {
    totalStars += repo.stargazers_count;
    totalForks += repo.forks_count;

    let languages: Record<string, number> = {};
    try {
      const langRes = await fetch(
        `https://api.github.com/repos/${username}/${repo.name}/languages`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "DevTrack-AI",
          },
        }
      );

      if (langRes.ok) {
        languages = await langRes.json();
        for (const [lang, bytes] of Object.entries(languages)) {
          languageStats[lang] = (languageStats[lang] || 0) + bytes;
        }
      }
    } catch (err) {
      console.error(`Failed to fetch languages for repo ${repo.name}:`, err);
    }

    const dbRepo = await prisma.repository.upsert({
      where: {
        githubId: BigInt(repo.id),
      },
      update: {
        userId,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        htmlUrl: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        primaryLanguage: repo.language,
        languages: languages as any,
        size: repo.size,
        openIssues: repo.open_issues_count,
        isPrivate: repo.private,
        defaultBranch: repo.default_branch,
        pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
      },
      create: {
        userId,
        githubId: BigInt(repo.id),
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        htmlUrl: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        primaryLanguage: repo.language,
        languages: languages as any,
        size: repo.size,
        openIssues: repo.open_issues_count,
        isPrivate: repo.private,
        defaultBranch: repo.default_branch,
        pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
      },
    });

    syncedRepos.push(dbRepo);
  }

  // Fetch commits for top 6 active repos from the past year to compute contribution heatmap
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const sinceIso = oneYearAgo.toISOString();
  const activeRepos = reposToProcess.slice(0, 6);
  let totalCommits = 0;

  for (const repo of activeRepos) {
    try {
      const commitsRes = await fetch(
        `https://api.github.com/repos/${username}/${repo.name}/commits?author=${username}&since=${sinceIso}&per_page=100`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "DevTrack-AI",
          },
        }
      );

      if (commitsRes.ok) {
        const commits = (await commitsRes.json()) as GitHubCommitResponse[];
        totalCommits += commits.length;

        for (const c of commits) {
          const dateStr = c.commit.author.date.split("T")[0]; // YYYY-MM-DD
          commitsPerDay[dateStr] = (commitsPerDay[dateStr] || 0) + 1;

          const commitDate = new Date(c.commit.author.date);
          const monthKey = commitDate.toLocaleString("default", { month: "short", year: "2-digit" });
          if (monthKey in commitsPerMonth) {
            commitsPerMonth[monthKey] += 1;
          }
        }
      }
    } catch (err) {
      console.error(`Failed to fetch commits for repo ${repo.name}:`, err);
    }
  }

  // Calculate language distribution percentages
  const totalBytes = Object.values(languageStats).reduce((sum, bytes) => sum + bytes, 0);
  const topLanguages = Object.entries(languageStats)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: totalBytes > 0 ? parseFloat(((bytes / totalBytes) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 8); // Keep top 8 languages

  const commitsPerMonthChart = Object.entries(commitsPerMonth).map(([month, count]) => ({
    month,
    commits: count,
  }));

  // Upsert aggregated coding analytics
  const analytics = await prisma.codingAnalytics.upsert({
    where: { userId },
    update: {
      totalCommits,
      commitsPerMonth: commitsPerMonthChart as any,
      dailyContributions: commitsPerDay as any,
      topLanguages: topLanguages as any,
      totalStars,
      totalForks,
      lastSyncedAt: new Date(),
    },
    create: {
      userId,
      totalCommits,
      commitsPerMonth: commitsPerMonthChart as any,
      dailyContributions: commitsPerDay as any,
      topLanguages: topLanguages as any,
      totalStars,
      totalForks,
      lastSyncedAt: new Date(),
    },
  });

  return {
    syncedReposCount: syncedRepos.length,
    totalCommits,
    totalStars,
    totalForks,
    topLanguages,
    analytics,
  };
}
