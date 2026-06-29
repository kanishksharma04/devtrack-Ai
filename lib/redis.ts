import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

/**
 * Returns a shared Upstash Redis client, or null when env vars are absent.
 * All callers must tolerate null — Redis is an optimization, never a hard dep.
 */
export function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}
