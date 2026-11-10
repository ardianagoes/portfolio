# Contact email activation

The existing contact form posts to `/api/contact` in the same TanStack Start
server entry. The Cloudflare-oriented Nitro build and Lovable integration remain
in place. No email is sent to the visitor. The notification is plain text, its
recipient comes only from server configuration, and Reply-To is the visitor's
validated email. A success message means Resend accepted the API request; it does
not guarantee inbox delivery.

## Configuration

Copy `.env.example` as a reference, never as production credentials.

| Variable / binding        | Where to configure           | Purpose                                                                          |
| ------------------------- | ---------------------------- | -------------------------------------------------------------------------------- |
| `VITE_TURNSTILE_SITE_KEY` | Build environment            | Public Turnstile site key; rebuild after changing it                             |
| `RESEND_API_KEY`          | Worker secret                | Resend sending API key                                                           |
| `CONTACT_TO_EMAIL`        | Worker secret                | Private inbox, one bare email address                                            |
| `CONTACT_FROM_EMAIL`      | Worker secret                | One bare sender address on your verified sending domain                          |
| `TURNSTILE_SECRET_KEY`    | Worker secret                | Secret corresponding to the public widget                                        |
| `CONTACT_ALLOWED_ORIGIN`  | Worker runtime configuration | Exact canonical origin, e.g. `https://www.example.com`, without a trailing slash |
| `CONTACT_RATE_LIMIT_SALT` | Worker secret                | At least 32 random characters; generate with `openssl rand -hex 32`              |
| `CONTACT_RATE_LIMITER`    | Durable Object binding       | `ContactRateLimiter` class, declared in `wrangler.json`                          |

Never prefix private values with `VITE_`. Vite variables are public build inputs.
Secrets are read from Nitro's request-scoped `request.runtime.cloudflare.env`,
not bundled into JavaScript or read from a shared global. Missing configuration
or bindings fail closed. Without a public site key the form retains its
unavailable state; a site key alone cannot enable delivery.

## Setup after purchasing the domain

1. **Keep hosting separate from registration.** Buy the domain through Vercel if
   desired. Connect the website domain to the existing host using that host's
   domain instructions. Confirm which provider is authoritative for DNS. If
   Vercel nameservers are authoritative, manage records in Vercel's Domains DNS
   settings; otherwise edit them at the authoritative DNS provider. Registering
   a domain at Vercel does not require moving the app there.
   [Vercel DNS documentation](https://vercel.com/docs/domains/managing-dns-records)
2. **Create Resend and verify a sending domain.** Add your domain or a dedicated
   subdomain such as `contact.example.com` in Resend's Domains dashboard. In
   Vercel DNS, add the exact record types, names, values, TTLs and MX priorities
   shown by Resend, including its DKIM and SPF/return-path records. Do not guess
   record values or replace unrelated website or incoming-mail records. Wait
   until Resend reports the sending domain as verified. Receiving email through
   Resend is not required for this form.
   [Resend domain setup](https://resend.com/docs/dashboard/domains/introduction)
3. **Create a sending API key** scoped to the verified domain where available.
   Set it as `RESEND_API_KEY` in the actual hosting secret store. Set
   `CONTACT_FROM_EMAIL` to a verified-domain address such as
   `portfolio@contact.example.com`, and `CONTACT_TO_EMAIL` to your private inbox.
   The recipient need not be on the sending domain. Use bare addresses without
   display names, commas, or newlines. Do not use Resend's onboarding sender for
   production. No actual account, key, or recipient is included in the repo.
4. **Configure Turnstile.** Create a Managed widget for the exact published
   hostname. Set its public site key in the build environment and its secret
   key in the worker secret store. The component uses a dark, flexible-width,
   interaction-only widget with keyboard support. The server checks both the
   verified hostname and action `portfolio-contact`. Do not allow local/test
   hostnames or use dummy keys on the production widget.
   [Turnstile setup](https://developers.cloudflare.com/turnstile/get-started/)
5. **Configure worker secrets and durable storage.** Set the remaining values
   above in the actual host, including the exact canonical origin and a random
   rate-limit salt. Lovable manages its own secrets: use its supported secret
   configuration, not public client variables. The publishing pipeline must
   honor the `CONTACT_RATE_LIMITER` binding and the SQLite-class migration in
   `wrangler.json`. Nitro detects `exports.cloudflare.ts`, exports the class,
   and merges the binding into the generated worker configuration. The
   migration creates only counter storage; keep its tag on later deployments.
   Do not hand-edit `.output/server/wrangler.json`.
6. **Check hosting support before activation.** A host that does not support this
   Durable Object binding/migration cannot activate secure delivery with this
   implementation. Confirm support with the host; do not substitute an
   in-memory limiter. On a directly managed Cloudflare Worker, add secrets in
   Workers & Pages → your worker → Settings → Variables and Secrets, or use
   `npx --yes wrangler@4.159.0 secret put VARIABLE --config .output/server/wrangler.json`
   for each private variable after building. Configure the same bindings and
   secrets in each deployed environment. No hosting migration or deployment is
   performed by this PR.
   [Cloudflare secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
7. **Build and publish through the existing workflow.** Ensure the public site
   key is present during `npm run build`; runtime secrets alone cannot change
   an existing client bundle. Redirect alternate website hostnames to the
   configured canonical origin. Domain DNS changes do not deploy the app.
8. **Perform one real acceptance test yourself.** Submit from the published
   domain with a valid challenge. Confirm the success state, check Resend's
   delivery status, and verify actual receipt in your private inbox/spam folder.
   Reply and verify that Reply-To points to the visitor. No visitor confirmation
   email should arrive. Recheck missing-config, invalid-input, challenge failure,
   and rate-limit states in a nonproduction environment. Automated tests never
   send real email.

## Protections and operating limits

- Shared Zod validation, 100-character names, 255-character email addresses,
  3,000-character messages, 2,048-character challenge tokens, a 16 KiB streamed
  payload limit and a five-second body-read deadline. Only JSON POSTs from the
  configured origin are accepted; cross-origin requests receive no CORS grant.
- A hidden honeypot, mandatory server-side Turnstile verification, exact hostname
  and action matching, and ten-second external-service timeouts. Tokens are
  reset after every attempted delivery, so retries require fresh verification.
- Persistent atomic rate limits: five attempts per IP per ten-minute window and
  fifty verified delivery attempts globally per 24-hour window. These are windows
  starting on first use, not calendar days. The global budget includes provider
  failures/retries. Shared-IP visitors share an allowance. Limits can be tuned
  in `src/server/contact-rate-limiter.ts` after reviewing traffic and quotas.
- The Durable Object stores counters/expiry only, schedules deletion when a
  window expires, and uses HMAC-hashed IP object names. Its namespace and storage
  are additional Cloudflare infrastructure, within the same worker deployment.
  SQLite Durable Objects have a Workers Free allowance; paid-plan usage can
  incur compute/storage charges. No paid plan is enabled by this code. Review
  [current Durable Object pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
  before activation. The form fails closed if storage is unavailable.
- Synchronous submit locking prevents concurrent browser submissions. A stable
  UUID is reused while retrying unchanged content, and sent to Resend as an
  idempotency key. Resend retains these keys for 24 hours. Reloading the page
  starts a new form session; this is not an exactly-once message queue.
  [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys)
- Constant subject, validated single-line header addresses, and a plain-text
  body prevent visitor-supplied HTML or headers from being interpreted. Errors
  never include provider responses, credentials, recipient addresses, tokens,
  or message content. The contact handler does not log submissions. Review
  infrastructure logging settings too; Resend necessarily processes notification
  contents and Turnstile receives the challenge token and visitor IP.

## Development and verification

```sh
npm test
node node_modules/typescript/bin/tsc --noEmit
npm run build
npm run test:contact:runtime
npm run preview
```

`npm run dev` retains hot reload, but this Lovable version does not enable Nitro
bindings in its development server. Delivery there intentionally fails closed.
Test the production worker through the corrected Wrangler preview instead.
For local runtime configuration, create an ignored `.dev.vars` file containing
the runtime variables, and use `npm run preview -- --env-file .dev.vars`.
Configure a separate Turnstile widget with the local hostname and matching exact
origin for any intentional local acceptance test. Never use production keys or
send real emails in automated tests.

Unit/component tests mock all external services and cover validation, injection,
honeypot, missing configuration, verification failures, rate limits, provider
failures/receipts, duplicates, retained text and privacy. The durable-counter
tests also cover concurrency, recreation and expiry. Production smoke checks
in `npm run test:contact:runtime` use Wrangler's cached Miniflare runtime with
mocked outbound services and fake secrets. They exercise the built worker, actual
SQLite-backed counters, persistence across runtime restarts, concurrency, and
client-bundle privacy. This command downloads the same pinned Wrangler tool as
preview if it is not cached; it creates only ignored test counters under
`node_modules/.cache` and never sends email. General preview smoke checks
must verify the homepage, all six projects, real 404s, static assets, HTTP 503 on
an unconfigured contact POST, HTTP 405 on a contact GET, and no secrets in client
assets or HTML. A live inbox test remains a manual activation step.
