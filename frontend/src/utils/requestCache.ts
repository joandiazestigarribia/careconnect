class RequestCache {
  private pendingRequests = new Map<string, Promise<any>>();
  private completedRequests = new Map<string, number>();
  private readonly minInterval = 2000; 

  async execute<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const lastCompleted = this.completedRequests.get(key) || 0;

    const pending = this.pendingRequests.get(key);
    if (pending) {
      console.log(`[RequestCache] Reusing pending request: ${key}`);
      return pending as Promise<T>;
    }

    if (now - lastCompleted < this.minInterval) {
      console.log(`[RequestCache] Request throttled: ${key}`);
      throw new Error('Request throttled');
    }

    console.log(`[RequestCache] Starting new request: ${key}`);
    const requestPromise = requestFn()
      .then((result) => {
        console.log(`[RequestCache] Request completed: ${key}`);
        this.completedRequests.set(key, Date.now());
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        console.log(`[RequestCache] Request failed: ${key}`, error);
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }

  isRecent(key: string): boolean {
    const lastCompleted = this.completedRequests.get(key) || 0;
    return Date.now() - lastCompleted < this.minInterval;
  }

  clear(key?: string) {
    if (key) {
      this.pendingRequests.delete(key);
      this.completedRequests.delete(key);
    } else {
      this.pendingRequests.clear();
      this.completedRequests.clear();
    }
  }
}

export const globalRequestCache = new RequestCache();
