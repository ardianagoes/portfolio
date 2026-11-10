// @vitest-environment node
import { describe, expect, it, vi, afterEach } from "vitest";
import { ContactRateLimiter, type CounterState, type CounterStorage } from "./contact-rate-limiter";

// Models persistent storage, serializing transactions across recreated object instances.
function persistentState(): CounterState {
  const values = new Map<string, unknown>();
  let queue = Promise.resolve();
  const storage: CounterStorage = {
    get: async <T>(key: string) => values.get(key) as T | undefined,
    put: async (key, value) => {
      values.set(key, value);
    },
    delete: async (key) => {
      values.delete(key);
    },
    setAlarm: vi.fn(async () => {}),
  };
  return {
    storage: {
      ...storage,
      transaction: <T>(work: (tx: CounterStorage) => Promise<T>) => {
        const result = queue.then(() => work(storage));
        queue = result.then(() => {});
        return result;
      },
    },
  };
}
const check = async (limiter: ContactRateLimiter, kind = "ip") =>
  (await limiter.fetch(new Request(`https://limiter/${kind}`, { method: "POST" }))).json();
afterEach(() => vi.useRealTimers());
describe("persistent contact limiter", () => {
  it("allows only five concurrent attempts and retains counts after recreation", async () => {
    const state = persistentState();
    const first = new ContactRateLimiter(state);
    const results = await Promise.all(Array.from({ length: 10 }, () => check(first)));
    expect(results.filter((r) => r.allowed)).toHaveLength(5);
    expect(await check(new ContactRateLimiter(state))).toMatchObject({ allowed: false });
  });
  it("expires counters, schedules cleanup, and preserves a newly started window", async () => {
    vi.useFakeTimers();
    const state = persistentState();
    const limiter = new ContactRateLimiter(state);
    await check(limiter);
    expect(state.storage.setAlarm).toHaveBeenCalled();
    vi.setSystemTime(Date.now() + 600_001);
    expect(await check(limiter)).toMatchObject({ allowed: true });
    await limiter.alarm();
    expect(await state.storage.get("bucket")).toBeDefined();
    vi.setSystemTime(Date.now() + 600_001);
    await limiter.alarm();
    expect(await state.storage.get("bucket")).toBeUndefined();
  });
  it("enforces a separate daily budget of fifty verified delivery attempts", async () => {
    const limiter = new ContactRateLimiter(persistentState());
    for (let i = 0; i < 50; i++)
      expect(await check(limiter, "global")).toMatchObject({ allowed: true });
    expect(await check(limiter, "global")).toMatchObject({ allowed: false });
  });
  it("rejects invalid internal routes and methods", async () => {
    const limiter = new ContactRateLimiter(persistentState());
    expect((await limiter.fetch(new Request("https://limiter/ip"))).status).toBe(404);
    expect(
      (await limiter.fetch(new Request("https://limiter/other", { method: "POST" }))).status,
    ).toBe(404);
  });
});
