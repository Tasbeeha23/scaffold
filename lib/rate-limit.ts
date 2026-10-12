const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const requests = new Map<string, number[]>();

export function getClientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
}

export function isRateLimited(key: string, now = Date.now()) {
  const recent = (requests.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  requests.set(key, recent);
  return recent.length > MAX_REQUESTS;
}

export function resetRateLimitForTests() {
  requests.clear();
}
