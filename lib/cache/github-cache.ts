import { getRedis } from "../redis";

// TTL constants (seconds)
const TTL_REPOS_LIST = 300;    // 5 min — invalidated on every manual sync
const TTL_LANGUAGES = 3_600;   // 1 hour — language breakdown changes rarely

function reposKey(userId: string) {
  return `gh:${userId}:repos`;
}

function langsKey(userId: string, repoName: string) {
  return `gh:${userId}:langs:${repoName}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getCachedRepos(userId: string): Promise<any[] | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await redis.get<any[]>(reposKey(userId));
  } catch (err) {
    console.warn("[github-cache] getCachedRepos error:", err);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function setCachedRepos(userId: string, data: any[]): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(reposKey(userId), data, { ex: TTL_REPOS_LIST });
  } catch (err) {
    console.warn("[github-cache] setCachedRepos error:", err);
  }
}

export async function getCachedLanguages(
  userId: string,
  repoName: string
): Promise<Record<string, number> | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return await redis.get<Record<string, number>>(langsKey(userId, repoName));
  } catch (err) {
    console.warn("[github-cache] getCachedLanguages error:", err);
    return null;
  }
}

export async function setCachedLanguages(
  userId: string,
  repoName: string,
  data: Record<string, number>
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(langsKey(userId, repoName), data, { ex: TTL_LANGUAGES });
  } catch (err) {
    console.warn("[github-cache] setCachedLanguages error:", err);
  }
}

/**
 * Removes the repos-list cache entry for a user so the next sync always
 * fetches fresh data from GitHub. Per-repo language caches are left to
 * expire naturally (they change rarely and the sync rewrites them anyway).
 */
export async function invalidateUserReposCache(userId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(reposKey(userId));
  } catch (err) {
    console.warn("[github-cache] invalidateUserReposCache error:", err);
  }
}

/** Debug helper — returns hit/miss counts for observability. Not called in prod paths. */
export async function cacheDebugInfo(userId: string) {
  const redis = getRedis();
  if (!redis) return { redis: false };
  const reposTtl = await redis.ttl(reposKey(userId)).catch(() => -2);
  return { redis: true, repos_ttl_seconds: reposTtl };
}
