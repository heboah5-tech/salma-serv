const WINDOW_MS = 60_000;
const READ_LIMIT = 120;
const WRITE_LIMIT = 30;
const STREAM_LIMIT = 10;
const buckets = new Map();

function getClientKey(req) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function getLimit(req) {
  if (req.path.endsWith("/stream")) return STREAM_LIMIT;
  return ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
    ? WRITE_LIMIT
    : READ_LIMIT;
}

function prune(now) {
  for (const [key, bucket] of buckets) {
    if (now - bucket.startedAt >= WINDOW_MS) buckets.delete(key);
  }
}

export function abuseProtection(req, res, next) {
  const now = Date.now();
  if (buckets.size > 10_000) prune(now);

  const key = `${getClientKey(req)}:${req.method}:${req.path.endsWith("/stream") ? "stream" : "api"}`;
  const limit = getLimit(req);
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.startedAt >= WINDOW_MS) {
    buckets.set(key, { startedAt: now, count: 1 });
    res.set("X-RateLimit-Limit", String(limit));
    res.set("X-RateLimit-Remaining", String(limit - 1));
    return next();
  }

  bucket.count += 1;
  const remaining = Math.max(0, limit - bucket.count);
  res.set("X-RateLimit-Limit", String(limit));
  res.set("X-RateLimit-Remaining", String(remaining));

  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - (now - bucket.startedAt)) / 1000));
    res.set("Retry-After", String(retryAfter));
    return res.status(429).json({
      error: "Too many requests",
      retryAfterSeconds: retryAfter,
    });
  }

  return next();
}