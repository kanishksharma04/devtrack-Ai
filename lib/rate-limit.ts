const requestMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = requestMap.get(key);

  if (!entry || now > entry.resetAt) {
    requestMap.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (entry.count >= limit) {
    return { success: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { success: true };
}
