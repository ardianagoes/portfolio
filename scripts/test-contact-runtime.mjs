import { createRequire } from "node:module";
import { delimiter } from "node:path";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const paths = process.env.PATH.split(delimiter).filter((path) => path.includes("_npx"));
const miniflarePath = require.resolve("miniflare", { paths });
const { Miniflare, Log, LogLevel, convertV4MiniflareOptions } = await import(
  pathToFileURL(miniflarePath)
);
const generated = JSON.parse(await readFile(".output/server/wrangler.json", "utf8"));
const buildInfo = JSON.parse(await readFile(".output/nitro.json", "utf8"));
assert.equal(buildInfo.preset, "cloudflare-module");
assert.ok(
  generated.durable_objects?.bindings?.some(
    (binding) =>
      binding.name === "CONTACT_RATE_LIMITER" && binding.class_name === "ContactRateLimiter",
  ),
);
assert.ok(
  generated.migrations?.some((migration) =>
    migration.new_sqlite_classes?.includes("ContactRateLimiter"),
  ),
);
const bindings = {
  RESEND_API_KEY: "runtime-smoke-secret-resend-canary",
  CONTACT_TO_EMAIL: "private-runtime-canary@example.com",
  CONTACT_FROM_EMAIL: "sender-runtime-canary@contact.example.com",
  TURNSTILE_SECRET_KEY: "runtime-smoke-secret-turnstile-canary",
  CONTACT_RATE_LIMIT_SALT: "runtime-smoke-private-hmac-salt-canary",
  CONTACT_ALLOWED_ORIGIN: "https://portfolio.example.com",
};
const id = "e70a627a-b3cb-4be8-85af-e87eed809037";
const submissions = new Map();
let externalCalls = 0;
const persistence = resolve("node_modules/.cache/contact-runtime-" + crypto.randomUUID());
const toOptions = (options) => ({
  ...convertV4MiniflareOptions(options),
  resourcePersistencePath: persistence,
});
const options = {
  name: "portfolio",
  modulesRoot: resolve(".output/server"),
  modules: [
    "index.mjs",
    ...(await readdir(".output/server", { recursive: true })).filter(
      (p) => p.endsWith(".mjs") && p !== "index.mjs",
    ),
  ].map((p) => ({ type: "ESModule", path: resolve(".output/server", p) })),

  compatibilityDate: generated.compatibility_date,
  compatibilityFlags: generated.compatibility_flags,
  durableObjects: { CONTACT_RATE_LIMITER: { className: "ContactRateLimiter", useSQLite: true } },
  assets: {
    directory: resolve(".output/public"),
    binding: "ASSETS",
    routerConfig: { has_user_worker: true, invoke_user_worker_ahead_of_assets: true },
  },
  log: new Log(LogLevel.NONE),
  outboundService: async (req) => {
    externalCalls++;
    const url = new URL(req.url);
    const body = await req.json();
    if (url.hostname === "challenges.cloudflare.com") {
      assert.equal(body.secret, bindings.TURNSTILE_SECRET_KEY);
      return Response.json({
        success: body.response !== "bad-token",
        hostname: "portfolio.example.com",
        action: "portfolio-contact",
      });
    }
    assert.equal(url.hostname, "api.resend.com", "all unexpected outbound access blocked");
    assert.equal(req.headers.get("authorization"), "Bearer " + bindings.RESEND_API_KEY);
    assert.deepEqual(body.to, [bindings.CONTACT_TO_EMAIL]);
    assert.equal(body.reply_to, "visitor@example.com");
    assert.equal(body.html, undefined);
    const key = req.headers.get("idempotency-key");
    if (submissions.has(key)) assert.deepEqual(submissions.get(key), body);
    submissions.set(key, body);
    return Response.json({ id });
  },
};
let mf = new Miniflare(toOptions(options));
const input = {
  name: "Runtime visitor",
  email: "visitor@example.com",
  message: "Runtime smoke only",
  website: "",
  turnstileToken: "good-token",
  submissionId: id,
};
const post = (body = input, headers = {}) =>
  mf.dispatchFetch("https://portfolio.example.com/api/contact", {
    method: "POST",
    headers: {
      origin: bindings.CONTACT_ALLOWED_ORIGIN,
      "content-type": "application/json",
      "cf-connecting-ip": "203.0.113.1",
      ...headers,
    },
    body: JSON.stringify(body),
  });
try {
  assert.equal((await mf.dispatchFetch("https://portfolio.example.com/api/contact")).status, 405);
  assert.equal((await post()).status, 503);
  assert.equal(externalCalls, 0);
  console.log("PASS built worker fails closed without secrets");
  await mf.setOptions(toOptions({ ...options, bindings }));
  assert.equal((await post(input, { origin: "https://attacker.example" })).status, 403);
  const accepted = await post();
  assert.equal(accepted.status, 200, await accepted.clone().text());
  assert.deepEqual(await accepted.json(), { accepted: true, receiptId: id });
  assert.equal((await post({ ...input, turnstileToken: "fresh-token" })).status, 200);
  assert.equal(submissions.size, 1);
  assert.equal((await post({ ...input, turnstileToken: "bad-token" })).status, 400);
  assert.equal((await post({ ...input, website: "bot" })).status, 400);
  for (let i = 0; i < 2; i++)
    assert.equal((await post({ ...input, submissionId: crypto.randomUUID() })).status, 200);
  assert.equal((await post()).status, 429);
  console.log(
    "PASS request-scoped secrets, mocked acceptance, idempotency, honeypot, Turnstile and actual SQLite per-IP rate limits",
  );
  await mf.dispose();
  mf = new Miniflare(toOptions({ ...options, bindings }));
  assert.equal((await post()).status, 429);
  console.log("PASS rate counters survive runtime restart");
  const namespace = await mf.getDurableObjectNamespace("CONTACT_RATE_LIMITER");
  const concurrent = namespace.get(namespace.idFromName("smoke-concurrent"));
  const results = await Promise.all(
    Array.from({ length: 10 }, async () =>
      (await concurrent.fetch("https://limiter/ip", { method: "POST" })).json(),
    ),
  );
  assert.equal(results.filter((r) => r.allowed).length, 5);
  console.log("PASS actual durable storage admits exactly five concurrent requests");
  const global = namespace.get(namespace.idFromName("smoke-global"));
  for (let i = 0; i < 50; i++)
    assert.equal(
      (await (await global.fetch("https://limiter/global", { method: "POST" })).json()).allowed,
      true,
    );
  assert.equal(
    (await (await global.fetch("https://limiter/global", { method: "POST" })).json()).allowed,
    false,
  );
  console.log("PASS actual durable daily global budget");
  const html = await (await mf.dispatchFetch("https://portfolio.example.com/")).text();
  const assets = await readdir(".output/public/assets");
  const publicFiles = [
    html,
    ...(await Promise.all(assets.map((n) => readFile(".output/public/assets/" + n, "utf8")))),
  ].join("\n");
  for (const [key, value] of Object.entries(bindings))
    if (key !== "CONTACT_ALLOWED_ORIGIN")
      assert.ok(!publicFiles.includes(value), key + " leaked to client");
  for (const key of [
    "RESEND_API_KEY",
    "CONTACT_TO_EMAIL",
    "TURNSTILE_SECRET_KEY",
    "CONTACT_RATE_LIMIT_SALT",
  ])
    assert.ok(!publicFiles.includes(key), key + " server configuration leaked to client");
  console.log("PASS private credential/recipient canaries absent from HTML and every client asset");
  console.log("PASS production integration; all external services mocked, zero real email sent");
} finally {
  await mf.dispose();
}
