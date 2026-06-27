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
  const ghUser = await fetchGitHubUser(accessToken);
  const username = ghUser.login;

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

  // Sync up to 20 repositories to stay within reasonable timing and rate limits
  const reposToProcess = reposData.slice(0, 20);

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
