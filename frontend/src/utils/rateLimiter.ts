class RateLimiter {
  private lastRequestTime: Map<string, number> = new Map();
  private minInterval: number;

  constructor(minIntervalMs: number = 5000) {
    this.minInterval = minIntervalMs;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const lastRequest = this.lastRequestTime.get(key) || 0;
    
    if (now - lastRequest < this.minInterval) {
      return false;
    }
    
    this.lastRequestTime.set(key, now);
    return true;
  }

  reset(key: string): void {
    this.lastRequestTime.delete(key);
  }
}

export const globalRateLimiter = new RateLimiter(5000);

class RequestCache {
  private pendingRequests: Map<string, Promise<any>> = new Map();

  async execute<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    const requestPromise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }
}

export const globalRequestCache = new RequestCache();
