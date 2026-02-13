import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "PAYMENT_REQUIRED"
  | "INTERNAL_ERROR";

export type ApiErrorPayload = {
  error: string;
  code?: ApiErrorCode;
  details?: Record<string, unknown>;
};

/**
 * Standardized API error response.
 * Use consistent structure: { error, code?, details? }
 */
export function apiError(
  message: string,
  status: number = 400,
  options?: { code?: ApiErrorCode; details?: Record<string, unknown> }
): NextResponse {
  const payload: ApiErrorPayload = {
    error: message,
    ...(options?.code && { code: options.code }),
    ...(options?.details && { details: options.details }),
  };
  return NextResponse.json(payload, { status });
}

/** 401 Unauthorized - not authenticated */
export function unauthorized(message = "Authentication required"): NextResponse {
  return apiError(message, 401, { code: "UNAUTHORIZED" });
}

/** 403 Forbidden - authenticated but not allowed */
export function forbidden(message = "Access denied"): NextResponse {
  return apiError(message, 403, { code: "FORBIDDEN" });
}

/** 404 Not Found */
export function notFound(message = "Resource not found"): NextResponse {
  return apiError(message, 404, { code: "NOT_FOUND" });
}

/** 400 Bad Request - validation or invalid input */
export function badRequest(
  message: string,
  details?: Record<string, unknown>
): NextResponse {
  return apiError(message, 400, { code: "VALIDATION_ERROR", details });
}

/** 402 Payment Required */
export function paymentRequired(message = "Payment required"): NextResponse {
  return apiError(message, 402, { code: "PAYMENT_REQUIRED" });
}

/** 409 Conflict */
export function conflict(message: string): NextResponse {
  return apiError(message, 409, { code: "CONFLICT" });
}

/** 500 Internal Server Error */
export function internalError(message = "An unexpected error occurred"): NextResponse {
  return apiError(message, 500, { code: "INTERNAL_ERROR" });
}
