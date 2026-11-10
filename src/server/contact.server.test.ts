// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { contactRuntimeEnv, handleContactRequest, MAX_CONTACT_BYTES } from "./contact.server";

const receiptId = "e70a627a-b3cb-4be8-85af-e87eed809037";
const input = {
  name: "Visitor",
  email: "visitor@example.com",
  message: "Hello from a visitor.",
  website: "",
  turnstileToken: "test-token",
  submissionId: "e70a627a-b3cb-4be8-85af-e87eed809038",
};
let limit: ReturnType<typeof vi.fn>;
let external: ReturnType<typeof vi.fn>;
let env: Record<string, unknown>;
function request(body: unknown = input, headers: Record<string, string> = {}) {
  return new Request("https://portfolio.example.com/api/contact", {
    method: "POST",
    headers: {
      origin: "https://portfolio.example.com",
      "content-type": "application/json",
      "cf-connecting-ip": "203.0.113.1",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  limit = vi.fn(async () => Response.json({ allowed: true, retryAfter: 0 }));
  env = {
    RESEND_API_KEY: "test-only-private-resend-key",
    CONTACT_TO_EMAIL: "private@example.com",
    CONTACT_FROM_EMAIL: "portfolio@contact.example.com",
    TURNSTILE_SECRET_KEY: "test-private-turnstile",
    CONTACT_RATE_LIMIT_SALT: "test-only-salt-with-more-than-32-characters",
    CONTACT_ALLOWED_ORIGIN: "https://portfolio.example.com",
    CONTACT_RATE_LIMITER: {
      idFromName: vi.fn((name: string) => name),
      get: () => ({ fetch: limit }),
    },
  };
  external = vi.fn(async (url: string) =>
    url.includes("siteverify")
      ? Response.json({
          success: true,
          hostname: "portfolio.example.com",
          action: "portfolio-contact",
        })
      : Response.json({ id: receiptId }),
  );
  vi.stubGlobal("fetch", external);
});
afterEach(() => vi.unstubAllGlobals());

describe("contact endpoint", () => {
  it("sends one text-only notification to the private inbox, with visitor reply-to", async () => {
    const response = await handleContactRequest(request(), env);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ accepted: true, receiptId });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(external).toHaveBeenCalledTimes(2);
    const [url, options] = external.mock.calls[1]! as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.headers).toMatchObject({
      Authorization: "Bearer test-only-private-resend-key",
      "Idempotency-Key": `portfolio-contact/${input.submissionId}`,
    });
    expect(JSON.parse(options.body as string)).toEqual({
      from: env["CONTACT_FROM_EMAIL"],
      to: [env["CONTACT_TO_EMAIL"]],
      reply_to: input.email,
      subject: "Portfolio contact message",
      text: `Name: ${input.name}\nEmail: ${input.email}\n\nMessage:\n${input.message}`,
    });
  });
  it.each([
    { name: "" },
    { email: "invalid" },
    { message: "" },
    { name: "a".repeat(101) },
    { name: " ".repeat(101) + "Visitor" },
    { message: "a".repeat(3001) },
    { email: `${"a".repeat(250)}@example.com` },
    { name: "Visitor\r\nBcc: victim@example.com" },
    { email: "a@example.com\r\nBcc: x@y.com" },
    { message: "NUL\0" },
    { turnstileToken: "" },
    { turnstileToken: "x".repeat(2049) },
    { submissionId: "invalid" },
    { website: "spam.example" },
    { website: " " },
    { to: "attacker@example.com" },
  ])("rejects invalid or injected fields: %j", async (change) => {
    expect((await handleContactRequest(request({ ...input, ...change }), env)).status).toBe(400);
    expect(external).not.toHaveBeenCalled();
  });
  it("rejects missing fields", async () => {
    expect((await handleContactRequest(request({}), env)).status).toBe(400);
  });
  it("rejects malformed JSON and cancels stalled request bodies", async () => {
    const malformed = new Request(request().url, {
      method: "POST",
      headers: request().headers,
      body: "{",
    });
    expect((await handleContactRequest(malformed, env)).status).toBe(400);
    vi.useFakeTimers();
    try {
      const cancelled = vi.fn();
      const body = new ReadableStream({ cancel: cancelled });
      const slow = new Request(request().url, {
        method: "POST",
        headers: request().headers,
        body,
        duplex: "half",
      } as RequestInit & { duplex: string });
      const pending = handleContactRequest(slow, env);
      await vi.advanceTimersByTimeAsync(5000);
      expect((await pending).status).toBe(400);
      expect(cancelled).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
    expect(external).not.toHaveBeenCalled();
  });
  it("retains HTML as literal plain text without constructing an HTML body", async () => {
    expect(
      (
        await handleContactRequest(
          request({ ...input, message: '<img src=x onerror="bad()">' }),
          env,
        )
      ).status,
    ).toBe(200);
    const body = JSON.parse((external.mock.calls[1]![1] as RequestInit).body as string);
    expect(body.html).toBeUndefined();
    expect(body.text).toContain('<img src=x onerror="bad()">');
  });
  it.each(
    Object.keys({
      RESEND_API_KEY: 1,
      CONTACT_TO_EMAIL: 1,
      CONTACT_FROM_EMAIL: 1,
      TURNSTILE_SECRET_KEY: 1,
      CONTACT_RATE_LIMIT_SALT: 1,
      CONTACT_ALLOWED_ORIGIN: 1,
      CONTACT_RATE_LIMITER: 1,
    }),
  )("fails closed without %s", async (key) => {
    delete env[key];
    expect((await handleContactRequest(request(), env)).status).toBe(503);
    expect(external).not.toHaveBeenCalled();
  });
  it("fails closed when the runtime has no Cloudflare bindings", async () => {
    expect((await handleContactRequest(request(), undefined)).status).toBe(503);
  });
  it("uses request-scoped bindings rather than global/process environment", () => {
    const req = Object.assign(request(), { runtime: { cloudflare: { env } } });
    expect(contactRuntimeEnv(req)).toBe(env);
    expect(contactRuntimeEnv(request())).toBeUndefined();
  });
  it.each(["https://attacker.example", "null", ""])(
    "rejects foreign/absent origin %s",
    async (origin) => {
      expect((await handleContactRequest(request(input, { origin }), env)).status).toBe(403);
      expect(external).not.toHaveBeenCalled();
    },
  );
  it("rejects cross-site fetches, non-JSON and encoded payloads", async () => {
    expect(
      (await handleContactRequest(request(input, { "sec-fetch-site": "cross-site" }), env)).status,
    ).toBe(403);
    expect(
      (await handleContactRequest(request(input, { "content-type": "text/plain" }), env)).status,
    ).toBe(415);
    expect(
      (await handleContactRequest(request(input, { "content-encoding": "gzip" }), env)).status,
    ).toBe(415);
  });
  it("rejects unsupported methods without running external services", async () => {
    const response = await handleContactRequest(
      new Request("https://portfolio.example.com/api/contact"),
      env,
    );
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
  });
  it("enforces declared and actual streaming byte limits", async () => {
    expect(
      (
        await handleContactRequest(
          request(input, { "content-length": String(MAX_CONTACT_BYTES + 1) }),
          env,
        )
      ).status,
    ).toBe(413);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(MAX_CONTACT_BYTES));
        controller.enqueue(new Uint8Array(1));
        controller.close();
      },
    });
    const req = new Request(request().url, {
      method: "POST",
      headers: request().headers,
      body: stream,
      duplex: "half",
    } as RequestInit & { duplex: string });
    expect((await handleContactRequest(req, env)).status).toBe(413);
    expect(external).not.toHaveBeenCalled();
  });
  it.each([
    { success: false },
    { success: true, hostname: "attacker.example", action: "portfolio-contact" },
    { success: true, hostname: "portfolio.example.com", action: "other-form" },
    {},
  ])("rejects failed, malformed or wrong-context Turnstile receipts: %j", async (verification) => {
    external.mockResolvedValueOnce(Response.json(verification));
    expect((await handleContactRequest(request(), env)).status).toBe(400);
    expect(external).toHaveBeenCalledTimes(1);
  });
  it("rejects a verification outage", async () => {
    external.mockResolvedValueOnce(new Response("internal details", { status: 500 }));
    expect((await handleContactRequest(request(), env)).status).toBe(503);
    expect(external).toHaveBeenCalledTimes(1);
  });
  it("rejects per-IP limits before verification and global limits before Resend", async () => {
    limit.mockResolvedValueOnce(Response.json({ allowed: false, retryAfter: 600 }));
    let response = await handleContactRequest(request(), env);
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("600");
    expect(external).not.toHaveBeenCalled();
    limit
      .mockResolvedValueOnce(Response.json({ allowed: true, retryAfter: 0 }))
      .mockResolvedValueOnce(Response.json({ allowed: false, retryAfter: 86400 }));
    response = await handleContactRequest(request(), env);
    expect(response.status).toBe(429);
    expect(external).toHaveBeenCalledTimes(1);
  });
  it("fails closed on unavailable or malformed rate limiter responses", async () => {
    limit.mockRejectedValueOnce(new Error("private details"));
    expect((await handleContactRequest(request(), env)).status).toBe(503);
    limit.mockResolvedValueOnce(Response.json({ allowed: true }));
    expect((await handleContactRequest(request(), env)).status).toBe(503);
    expect(external).not.toHaveBeenCalled();
  });
  it("does not trust alternate IP headers", async () => {
    const req = request();
    req.headers.delete("cf-connecting-ip");
    req.headers.set("x-forwarded-for", "203.0.113.1");
    expect((await handleContactRequest(req, env)).status).toBe(503);
  });
  it("hashes IP identities with a salt before addressing persistent storage", async () => {
    await handleContactRequest(request(), env);
    const names = (env["CONTACT_RATE_LIMITER"] as { idFromName: ReturnType<typeof vi.fn> })
      .idFromName.mock.calls;
    expect(names[0]![0]).toMatch(/^ip:[a-f0-9]{64}$/);
    expect(JSON.stringify(names)).not.toContain("203.0.113.1");
  });
  it.each([400, 401, 429, 500])(
    "sanitizes Resend HTTP %i without claiming acceptance",
    async (status) => {
      external
        .mockResolvedValueOnce(
          Response.json({
            success: true,
            hostname: "portfolio.example.com",
            action: "portfolio-contact",
          }),
        )
        .mockResolvedValueOnce(new Response(JSON.stringify(env), { status }));
      const response = await handleContactRequest(request(), env);
      expect(response.status).toBe(502);
      const body = await response.text();
      expect(body).not.toContain("private");
      expect(body).not.toContain("example.com");
      expect(body).toContain('"accepted":false');
    },
  );
  it("requires a real receipt and handles network failures without logging personal data", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    external.mockRejectedValueOnce(new Error(JSON.stringify(env)));
    expect((await handleContactRequest(request(), env)).status).toBe(503);
    external
      .mockResolvedValueOnce(
        Response.json({
          success: true,
          hostname: "portfolio.example.com",
          action: "portfolio-contact",
        }),
      )
      .mockResolvedValueOnce(Response.json({ accepted: true }));
    expect((await handleContactRequest(request(), env)).status).toBe(502);
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
  it("keeps the same provider idempotency key on retries", async () => {
    await handleContactRequest(request(), env);
    await handleContactRequest(request({ ...input, turnstileToken: "fresh-token" }), env);
    const keys = [external.mock.calls[1]!, external.mock.calls[3]!].map(
      (call) => (call[1] as RequestInit).headers,
    );
    expect(keys[0]).toEqual(keys[1]);
  });
});
