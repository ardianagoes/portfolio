// Structural interfaces keep this small Worker module independent of a Node SDK.
export interface CounterStorage {
  get<T>(key: string): Promise<T | undefined>;
  put(key: string, value: unknown): Promise<unknown>;
  delete(key: string): Promise<unknown>;
  setAlarm(time: number): Promise<unknown>;
}

export interface CounterState {
  storage: CounterStorage & {
    transaction<T>(work: (storage: CounterStorage) => Promise<T>): Promise<T>;
  };
}

type Bucket = { count: number; expires: number };

/** Persistent, atomic counters. No IP addresses, emails, tokens or messages are stored. */
export class ContactRateLimiter {
  constructor(private readonly state: CounterState) {}

  async fetch(request: Request): Promise<Response> {
    const kind = new URL(request.url).pathname;
    if (request.method !== "POST" || !["/ip", "/global"].includes(kind)) {
      return new Response(null, { status: 404 });
    }
    const windowMs = kind === "/ip" ? 10 * 60_000 : 24 * 60 * 60_000;
    const limit = kind === "/ip" ? 5 : 50;
    const result = await this.state.storage.transaction(async (storage) => {
      const now = Date.now();
      let bucket = await storage.get<Bucket>("bucket");
      if (!bucket || bucket.expires <= now) {
        bucket = { count: 0, expires: now + windowMs };
      }
      if (bucket.count >= limit) {
        return { allowed: false, retryAfter: Math.ceil((bucket.expires - now) / 1000) };
      }
      await storage.put("bucket", { ...bucket, count: bucket.count + 1 });
      await storage.setAlarm(bucket.expires);
      return { allowed: true, retryAfter: 0 };
    });
    return Response.json(result);
  }

  async alarm(): Promise<void> {
    await this.state.storage.transaction(async (storage) => {
      const bucket = await storage.get<Bucket>("bucket");
      if (!bucket || bucket.expires <= Date.now()) await storage.delete("bucket");
      else await storage.setAlarm(bucket.expires);
    });
  }
}
