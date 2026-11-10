import { z } from "zod";
import { contactReceiptSchema, contactSchema } from "../components/portfolio/contact-schema";

export const MAX_CONTACT_BYTES = 16_384;
const SAFE_ERROR = "Your message could not be sent. Please try again later.";

interface RateLimiterNamespace {
  idFromName(name: string): unknown;
  get(id: unknown): { fetch(request: Request): Promise<Response> };
}

const address = z
  .string()
  .max(255)
  .email()
  .regex(/^[^\p{Cc}]+$/u);
const configSchema = z.object({
  RESEND_API_KEY: z
    .string()
    .min(1)
    .max(256)
    .regex(/^[^\p{Cc}]+$/u),
  CONTACT_TO_EMAIL: address,
  CONTACT_FROM_EMAIL: address,
  TURNSTILE_SECRET_KEY: z.string().min(1).max(256),
  CONTACT_RATE_LIMIT_SALT: z.string().min(32).max(256),
  CONTACT_ALLOWED_ORIGIN: z
    .string()
    .url()
    .refine((value) => {
      const url = new URL(value);
      return (
        value === url.origin &&
        (url.protocol === "https:" ||
          (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))
      );
    }),
});
const submissionSchema = contactSchema
  .extend({
    website: z.string().max(200).default(""),
    turnstileToken: z.string().min(1).max(2048),
    submissionId: z.string().uuid(),
  })
  .strict();

export function contactRuntimeEnv(request: Request): unknown {
  // Nitro 3 attaches per-request bindings here. Never read process-global __env__.
  return (request as Request & { runtime?: { cloudflare?: { env?: unknown } } }).runtime?.cloudflare
    ?.env;
}

function reply(status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    },
  });
}

async function limitedJson(request: Request): Promise<unknown> {
  const size = request.headers.get("content-length");
  if (size && (!/^\d+$/.test(size) || Number(size) > MAX_CONTACT_BYTES)) throw new Error("size");
  if (!request.body) throw new Error("body");
  const reader = request.body.getReader();
  const buffer = new Uint8Array(MAX_CONTACT_BYTES);
  let length = 0;
  let expired = false;
  const timer = setTimeout(() => {
    expired = true;
    void reader.cancel().catch(() => {});
  }, 5000);
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (expired) throw new Error("timeout");
      if (done) break;
      if (length + value.byteLength > MAX_CONTACT_BYTES) throw new Error("size");
      buffer.set(value, length);
      length += value.byteLength;
    }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, length)));
  } finally {
    clearTimeout(timer);
    void reader.cancel().catch(() => {});
  }
}

async function hashIp(ip: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(salt),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function allow(namespace: RateLimiterNamespace, name: string, kind: "ip" | "global") {
  const stub = namespace.get(namespace.idFromName(name));
  const response = await stub.fetch(
    new Request(`https://contact-limiter/${kind}`, { method: "POST" }),
  );
  if (!response.ok) throw new Error("limiter");
  return z
    .object({ allowed: z.boolean(), retryAfter: z.number().int().min(0).max(86400) })
    .parse(await response.json());
}

/** All failures are sanitized here, before the application's generic error logger. */
export async function handleContactRequest(
  request: Request,
  environment: unknown,
): Promise<Response> {
  const fail = (status: number, extra?: Record<string, string>) =>
    reply(status, { accepted: false, error: SAFE_ERROR }, extra);
  if (request.method !== "POST") return fail(405, { Allow: "POST" });
  try {
    const config = configSchema.safeParse(environment);
    const namespace = (environment as { CONTACT_RATE_LIMITER?: RateLimiterNamespace } | undefined)
      ?.CONTACT_RATE_LIMITER;
    if (!config.success || !namespace?.idFromName || !namespace.get) return fail(503);
    const env = config.data;
    if (
      request.headers.get("origin") !== env.CONTACT_ALLOWED_ORIGIN ||
      request.headers.get("sec-fetch-site") === "cross-site"
    )
      return fail(403);
    if (
      request.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json" ||
      ![null, "identity"].includes(request.headers.get("content-encoding"))
    )
      return fail(415);
    let json: unknown;
    try {
      json = await limitedJson(request);
    } catch (error) {
      return fail(error instanceof Error && error.message === "size" ? 413 : 400);
    }
    const input = submissionSchema.safeParse(json);
    if (!input.success || input.data.website !== "") return fail(400);
    // Cloudflare overwrites this header on published Workers. No X-Forwarded-For fallback.
    const ip = request.headers.get("cf-connecting-ip");
    if (!ip || ip.length > 64) return fail(503);
    const perIp = await allow(
      namespace,
      `ip:${await hashIp(ip, env.CONTACT_RATE_LIMIT_SALT)}`,
      "ip",
    );
    if (!perIp.allowed) return fail(429, { "Retry-After": String(perIp.retryAfter) });

    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: input.data.turnstileToken,
        remoteip: ip,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!verification.ok) return fail(503);
    const verified = z
      .object({
        success: z.boolean(),
        hostname: z.string().optional(),
        action: z.string().optional(),
      })
      .safeParse(await verification.json());
    if (
      !verified.success ||
      !verified.data.success ||
      verified.data.action !== "portfolio-contact" ||
      verified.data.hostname !== new URL(env.CONTACT_ALLOWED_ORIGIN).hostname
    )
      return fail(400);

    // Budget is reserved only after human verification; failed provider attempts also count.
    const global = await allow(namespace, "global", "global");
    if (!global.allowed) return fail(429, { "Retry-After": String(global.retryAfter) });
    const { name, email, message, submissionId } = input.data;
    const sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `portfolio-contact/${submissionId}`,
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [env.CONTACT_TO_EMAIL],
        reply_to: email,
        subject: "Portfolio contact message",
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!sent.ok) return fail(502);
    const receipt = z.object({ id: z.string().uuid() }).safeParse(await sent.json());
    if (!receipt.success) return fail(502);
    return reply(200, contactReceiptSchema.parse({ accepted: true, receiptId: receipt.data.id }));
  } catch {
    // Do not log provider responses, request bodies, headers, bindings, or visitor data.
    return fail(503);
  }
}
