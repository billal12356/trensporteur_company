import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Custom Rate Limit configuration
 * @param limit - Max number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

// Decorator metadata key
export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Custom decorator to set rate limit on a controller or route
 * Usage: @RateLimit({ limit: 5, windowMs: 60000 }) // 5 requests per minute
 */
export function RateLimit(config: RateLimitConfig) {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      // Method-level decorator
      Reflect.defineMetadata(RATE_LIMIT_KEY, config, descriptor.value);
    } else {
      // Class-level decorator
      Reflect.defineMetadata(RATE_LIMIT_KEY, config, target);
    }
    return descriptor || target;
  };
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  // In-memory store: key = IP + route, value = request count & reset time
  private readonly store = new Map<string, RateLimitEntry>();

  // Cleanup interval to prevent memory leaks (runs every 5 minutes)
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(private reflector: Reflector) {
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  canActivate(context: ExecutionContext): boolean {
    // Check method-level first, then class-level config
    const config =
      this.reflector.get<RateLimitConfig>(RATE_LIMIT_KEY, context.getHandler()) ||
      this.reflector.get<RateLimitConfig>(RATE_LIMIT_KEY, context.getClass());

    // If no @RateLimit decorator found, allow the request
    if (!config) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const route = request.method + ':' + request.url;
    const key = `${ip}:${route}`;

    const now = Date.now();
    const entry = this.store.get(key);

    // If no entry or window expired, start fresh
    if (!entry || now > entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // If within window and under limit, increment
    if (entry.count < config.limit) {
      entry.count++;
      return true;
    }

    // Rate limit exceeded
    const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);

    const response = context.switchToHttp().getResponse();
    response.setHeader('Retry-After', retryAfterSeconds.toString());
    response.setHeader('X-RateLimit-Limit', config.limit.toString());
    response.setHeader('X-RateLimit-Remaining', '0');
    response.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: `لقد تجاوزت الحد المسموح به. حاول مرة أخرى بعد ${retryAfterSeconds} ثانية.`,
        error: 'Too Many Requests',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  /** Remove expired entries to prevent memory leaks */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}
