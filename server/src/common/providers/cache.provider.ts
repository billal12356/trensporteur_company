import { Provider } from '@nestjs/common';

export interface ICacheManager {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttlMs?: number): void;
  delete(key: string): void;
  clear(): void;
}

export class InMemoryCacheManager implements ICacheManager {
  private cache = new Map<string, { value: any; expiry: number }>();

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    return cached.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number = 60000): void { // Default 60 seconds
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const CacheProvider: Provider = {
  provide: 'CACHE_MANAGER',
  useClass: InMemoryCacheManager,
};
