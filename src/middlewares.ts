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
