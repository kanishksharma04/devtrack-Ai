import { getRedis } from "../redis";

// TTL constants (seconds)
const TTL_LANGUAGES = 3_600; // 1 hour — language breakdown changes rarely

function langsKey(userId: string, repoName: string) {
  return `gh:${userId}:langs:${repoName}`;
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
