/**
 * Production-Grade Structured Logger for PrepMeUp AI & Portfolio Platform.
 * Supports log levels (DEBUG, INFO, WARN, ERROR, AUDIT), formatted console output,
 * automated secret sanitization, and execution timing benchmarks.
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "AUDIT";

const SENSITIVE_KEYS = new Set([
  "password",
  "secret",
  "keysecret",
  "razorpay_key_secret",
  "razorpay_signature",
  "signature",
  "token",
  "otp",
  "authorization",
  "cookie",
  "access_token",
  "refresh_token",
]);

/**
 * Recursively sanitizes sensitive credential fields from log payloads
 */
function sanitizeData(data: any, depth = 0): any {
  if (depth > 5 || data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1));
  }

  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    const lowerKey = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes("secret") || lowerKey.includes("password") || lowerKey.includes("token")) {
      clean[k] = typeof v === "string" && v.length > 6 ? `${v.slice(0, 3)}***${v.slice(-3)}` : "[REDACTED]";
    } else if (typeof v === "object") {
      clean[k] = sanitizeData(v, depth + 1);
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

class AppLogger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogLevel, context: string, message: string, data?: any) {
    const timestamp = this.formatTimestamp();
    const sanitized = data ? sanitizeData(data) : undefined;

    const logEntry = {
      timestamp,
      level,
      context,
      message,
      ...(sanitized ? { data: sanitized } : {}),
    };

    const isProduction = process.env.NODE_ENV === "production";

    // In production or when JSON format is requested, log structured JSON string
    if (isProduction) {
      const output = JSON.stringify(logEntry);
      if (level === "ERROR") {
        console.error(output);
      } else if (level === "WARN") {
        console.warn(output);
      } else {
        console.log(output);
      }
      return;
    }

    // In local dev, print colorized human-readable line
    const colorMap: Record<LogLevel, string> = {
      DEBUG: "\x1b[36m", // Cyan
      INFO: "\x1b[32m",  // Green
      WARN: "\x1b[33m",  // Yellow
      ERROR: "\x1b[31m", // Red
      AUDIT: "\x1b[35m", // Magenta
    };
    const reset = "\x1b[0m";
    const color = colorMap[level] || reset;

    const prefix = `${color}[${timestamp}] [${level}] [${context}]${reset}`;
    if (level === "ERROR") {
      console.error(`${prefix} ${message}`, sanitized || "");
    } else if (level === "WARN") {
      console.warn(`${prefix} ${message}`, sanitized || "");
    } else {
      console.log(`${prefix} ${message}`, sanitized || "");
    }
  }

  debug(context: string, message: string, data?: any) {
    if (process.env.NODE_ENV !== "production" || process.env.DEBUG === "true") {
      this.log("DEBUG", context, message, data);
    }
  }

  info(context: string, message: string, data?: any) {
    this.log("INFO", context, message, data);
  }

  warn(context: string, message: string, data?: any) {
    this.log("WARN", context, message, data);
  }

  error(context: string, message: string, error?: any, data?: any) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    this.log("ERROR", context, message, { error: errorDetails, ...data });
  }

  audit(event: string, details: Record<string, any>) {
    this.log("AUDIT", "SECURITY_AUDIT", `Event: ${event}`, details);
  }

  /**
   * Logs an HTTP request completion with status, duration, and client details
   */
  httpRequest(params: {
    method: string;
    url: string;
    statusCode: number;
    durationMs: number;
    ip?: string;
    userAgent?: string;
    userId?: string;
  }) {
    const { method, url, statusCode, durationMs, ip, userAgent, userId } = params;
    const isError = statusCode >= 400;
    const level: LogLevel = statusCode >= 500 ? "ERROR" : isError ? "WARN" : "INFO";

    this.log(
      level,
      "HTTP",
      `${method} ${url} -> ${statusCode} (${durationMs.toFixed(1)}ms)`,
      {
        method,
        url,
        statusCode,
        durationMs,
        ip: ip || "unknown",
        userId: userId || "guest",
        userAgent: userAgent ? userAgent.slice(0, 80) : undefined,
      }
    );
  }
}

export const logger = new AppLogger();
