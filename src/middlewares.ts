import {
  NextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

import ErrorResponse from "./interfaces/ErrorResponse";

export function notFound(
  req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction,
) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

export function errorHandler(
  err: Error,
  req: ExpressRequest,
  res: ExpressResponse<ErrorResponse>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
}

// Fixed window per client IP. 120 requests a minute is plenty for the app (one call per place every 10 minutes);
// map tiles get their own, larger budget because one pan loads a few dozen.
// shortcut: in-memory, per process; use a shared store if the API runs on more than one instance.
const WINDOW_MS = 60_000;
export const RATE_LIMIT = 120;
export const TILE_RATE_LIMIT = 900;

function makeRateLimit(max: number) {
  const hits = new Map<string, number>();
  setInterval(() => hits.clear(), WINDOW_MS).unref();
  return (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    const key = req.ip ?? "unknown";
    const count = (hits.get(key) ?? 0) + 1;
    hits.set(key, count);
    if (count > max) {
      res
        .status(429)
        .json({ error: "Too many requests, try again in a minute" });
      return;
    }
    next();
  };
}

export const rateLimit = makeRateLimit(RATE_LIMIT);
export const tileRateLimit = makeRateLimit(TILE_RATE_LIMIT);
