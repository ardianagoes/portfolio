# Security, privacy, and usage-cost review

Reviewed November 10, 2026, starting from `main` at `ba21dc4d15447dc5460c60c198572e7d3ce4d756`.

**Public-repository assessment: Ready after fixes and owner review.** No exposed credential or functioning email endpoint was identified. Existing dependency advisories, historical email attribution, asset provenance, and production settings remain open. The repository is already public according to GitHub; this work did not change its visibility.

## Evidence and limits

- Refreshed accessible branches/tags; the repository is not shallow. Scanned all 36 pre-existing reachable commits, including deleted content, PR #2's closed/unmerged branch, and PR #3's open branch. Inspected 164 distinct blobs: 161 text blobs and three image/icon blobs. Gitleaks 8.30.1 scanned 29 non-merge commits with full redaction and found no leaks. Supplementary checks covered credential assignments, authenticated URLs, keys, personal contacts, historical filenames, commit metadata, and image metadata.
- Reviewed all application routes, the server entry, middleware, contact schema/form, configuration, lockfile, and workflow paths. No `.github` workflow file exists in current main, either relevant remote branch, or reachable history. The connector cannot read the Actions settings/workflow-list endpoint; repository-level Actions permissions and secret-scanning alerts were not verified.
- Made a small number of production HTTP requests, not a load test. The supplied URL redirects to `https://ardianagoes.vercel.app/`. The homepage and sampled project pages return 200; an unknown project returns 404. Both GET and an empty JSON POST to `/api/contact` return HTML 404, without an acceptance receipt. The homepage states that sending is unavailable.
- Downloaded the homepage's three referenced JavaScript files and stylesheet. Their content and HTML passed a redacted secret scan; no email addresses, contact API path, Resend/Turnstile configuration, or source-map references were identified in those inspected files. The locally built Vercel public output also passed a redacted scan. This does not establish that every historical deployment, unreferenced asset, or opaque credential is harmless.
- Built the current code for the default Cloudflare fallback and Vercel adapter. The Vercel output contains a catch-all SSR function, static assets, and an empty application server-function manifest. Local calls into the actual generated Vercel `fetch` handler rendered all seven portfolio pages, rejected the contact path, and made zero outbound `fetch` calls under a fail-on-network test harness.
- Private Vercel dashboard settings, deployment SHA/production-branch mapping, runtime environment values, billing records, old deployment aliases, external integrations, and Cloudflare/Resend accounts were not accessible through the connected tools. Live HTTP observations corroborate inactive contact behavior but are not a complete account or infrastructure audit. Unavailable Git refs, forks, caches, and unreachable objects are outside the history scan.

## Findings ranked by severity

### Critical advisory: development command dependency remains vulnerable

The lockfile contains `shell-quote` 1.10.0, affected by a [critical command-injection advisory](https://github.com/advisories/GHSA-pqg4-j6r4-53mv). Its confirmed dependency path is Lovable's Vite configuration → TanStack devtools → `launch-editor` → `shell-quote`. It is development tooling, not an application email endpoint. No production exploit was demonstrated.

Prioritize a focused, compatible security patch, including the affected editor chain; the advisory identifies 1.11.0 as a patched shell-quote version. Keep development servers on loopback and do not expose editor/debug tooling to untrusted traffic. Dependencies were not upgraded within this README/contact-privacy change, and this finding is not resolved by a passing build.

### High and moderate dependency advisories remain

`bun audit --json` exits 1 and flags 11 package names. These are existing dependencies, not additions in this PR:

| Package           | Locked version(s) flagged | Highest reported severity |
| ----------------- | ------------------------- | ------------------------- |
| `shell-quote`     | 1.10.0                    | Critical                  |
| `launch-editor`   | 2.14.1                    | High                      |
| `brace-expansion` | 1.1.16, 5.0.8             | High                      |
| `js-yaml`         | 4.3.0                     | High                      |
| `nanoid`          | 3.3.16                    | High                      |
| `source-map-js`   | 1.2.1                     | High                      |
| `vite`            | 8.1.5                     | High                      |
| `zod`             | 3.25.76, 4.6.5            | High                      |
| `seroval`         | 1.6.8                     | Moderate                  |
| `minimatch`       | 10.2.6                    | Moderate                  |
| `@vitest/mocker`  | 4.1.11                    | Moderate                  |

Seroval is a TanStack Router/Start runtime dependency, including the [typed-array constructor issue](https://github.com/advisories/GHSA-f86p-h4j2-7qgj) and [RegExp serialization issue](https://github.com/advisories/GHSA-9wx9-5pv9-3349). The generated application server-function manifest is empty, and function lookup precedes RPC payload deserialization in the inspected framework handler. That limits one possible input path; it does not prove the dependency safe in every context. Prioritize a compatible serializer patch and regression tests before enabling server functions.

The [Zod resource-consumption advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) concerns collection validation. The current contact schema is an object of bounded strings, with no exposed server endpoint. Do not equate registry severity with a demonstrated exploit of this particular form. Review the remaining parser/glob/tooling call sites and patch compatible versions in a dedicated dependency-security PR, with Lovable and both build targets tested.

### Medium: public SSR traffic can consume hosting allowances

The generated Vercel routes send non-static paths to `/__server`; no application-level request limiter, prerendered portfolio HTML, cron job, upload handler, database route, image optimizer, or paid API handler is configured in source. Production homepage headers showed `cache-control: public, must-revalidate, max-age=0` and `x-vercel-cache: MISS`. Direct page requests and even 404 requests can therefore consume function/CPU/request/transfer allowances. A 404 contact path does not eliminate ordinary hosting usage.

No load test or request flood was performed. Confirm actual cache/function metrics and included firewall protections in Vercel. If traffic becomes a concern, evaluate prerendering the seven public pages or a compatible public-HTML caching policy in a separate change. Preserve content/design and verify framework compatibility before changing rendering behavior.

### Medium privacy issue: native form fallback used GET — fixed in this PR

The form originally omitted `method`. If JavaScript was disabled or hydration failed, clicking its submit button could encode name, email, and message in a GET URL, exposing them through history, shared URLs, or request logs. This PR adds `method="post"` without changing appearance or enabling delivery.

Regression tests verify POST fallback and zero network calls when a valid form is submitted without a delivery adapter. The generated Vercel handler also accepts a native form POST to `/` as a page render with zero outbound calls; it does not deliver email or return an acceptance receipt. This fix reaches production only after an approved merge and the existing deployment workflow.

### Medium privacy review: historical contact information

An old university email in `src/components/portfolio/data.ts` was introduced in `136bf14` and removed in `1b92a76`. A personal email remains in author/committer metadata for `e26742a`, `f2ec3d5`, and `144b148`. No actual address values are reproduced here. Current portfolio content and the inspected public entry bundles contain no email address or phone number; the broad Providence location and professional identity remain intentional portfolio content.

Decide whether those historical addresses may remain public. They are contact/attribution data, not credentials, so credential rotation does not address this finding. Use GitHub's verified noreply identity for future commits. No published history was rewritten; any removal plan needs explicit approval and coordination with Lovable, PR refs, and existing copies.

### Medium repository protection review

GitHub reports `protected: false` for `main`, and the repository rulesets endpoint returns an empty list. This is not anonymous write access, but it leaves trusted write access without a branch review gate. Review branch rules and collaborator/app permissions while accounting for Lovable's synchronization workflow. No repository setting was changed.

### Low: browser security-header hardening

The live homepage has HTTPS/HSTS. The sampled response did not include Content-Security-Policy, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, or Permissions-Policy. These are defense-in-depth opportunities, not proof of an active XSS vulnerability. Test a compatible policy against TanStack's inline bootstrap scripts and the existing Google Fonts before enforcing CSP; do not break hydration with a blanket policy.

Project text and route IDs come from local data; route parameters select known project IDs. No SQL/shell execution, user-controlled file path, application `eval`, or active user-input HTML sink was found. React renders form errors and content as text; public error pages use generic messages. The inherited, unused chart primitive builds CSS with `dangerouslySetInnerHTML`; it is not imported by the portfolio and must not receive untrusted configuration if used later. Server errors are logged, so future backend work must continue to sanitize secrets and visitor data before logging.

## Contact delivery and unexpected charges

**Confirmed in main:** the homepage renders `<ContactForm />` without `onSend`. Valid submissions stop at an explicit unavailable message. No `/api/contact` dispatcher, `createServerFn` application export, provider request, AI call, database integration, or Cloudflare Durable Object binding/migration is present. Portfolio data is local; Google Fonts is the only explicitly configured external content service and does not require an API key or paid account. Optional Lovable error-reporting hooks do not themselves configure a paid production service.

**Historical PR #2:** its branch adds `/api/contact`, Turnstile verification, Resend delivery, and `CONTACT_RATE_LIMITER` with a SQLite migration. Its handler checks configuration/binding availability before provider calls and is Cloudflare-specific. None of that code/configuration is introduced by this PR. Do not port it by deleting the limiter or bypassing verification. Future delivery requires a separately reviewed Vercel-compatible design with server validation, shared rate limits, a global sending budget, secret isolation, provider idempotency and safe error handling.

**Cost conclusion:** no functioning paid third-party operation was found that a visitor can repeatedly trigger on the reviewed main application. Repeated traffic can still consume Vercel allowances and affect availability. Under the documented [Hobby policy](https://vercel.com/docs/plans/hobby), usage beyond limits generally restricts availability rather than buying extra usage; this is conditional on the actual project/account remaining Hobby. Hobby does not offer Pro Spend Management. Separate paid integrations, domain renewals, a trial, or a different account plan cannot be ruled out from source code. No purchase, plan change, activation, deployment or new infrastructure was performed.

## Production and GitHub settings for the owner to verify

These are recommendations, not claims that the dashboard is already configured correctly:

1. **Vercel account/project:** confirm the project belongs to the intended Hobby account, with no unintended trial, paid integration or add-on. Review Usage and Billing and available notifications. Do not upgrade simply to add a spend-management feature.
2. **Production mapping:** verify Git integration, production branch `main`, root directory, build/install settings and current deployed commit. Compare the approved source commit with deployment details; a successful local build does not prove those settings.
3. **Environment variables:** review Production, Preview and Development scopes and integrations. Current main needs no API credential. Remove unused provider credentials after confirming they are unused elsewhere. Never put secrets in `VITE_*`; the Lovable wrapper exposes that prefix to client code. No private environment values were inspected or printed.
4. **Previews and old branches:** review deployments from PR #2 and other obsolete previews; closing a PR does not necessarily delete deployed URLs. Use included [Vercel Authentication with Standard Protection](https://vercel.com/docs/deployment-protection) for preview/deployment URLs while keeping the portfolio's production domain public. Review protection bypass links/exceptions. No paid password-protection add-on is needed for this recommendation.
5. **Traffic:** review function/cache metrics and included firewall/DDoS protections. No application limiter protects general SSR traffic. Consider free included controls before buying services or changing hosting; caching/prerendering is a possible later optimization, not part of this PR.
6. **GitHub:** review Security alerts, [secret scanning](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning), push protection, dependency alerts, collaborator/app permissions and main-branch rules. No workflow exists in inspected history; if workflows are introduced, start with read-only token permissions and require approval before untrusted PR code can use secrets. Organization/account Actions settings and installed app grants remain unverified.

## Repository cleanup and documentation

- Replaced the truncated README with a 221-word overview, excluding essential commands. It identifies the actual stack and Vercel hosting, uses the verified canonical live URL, and keeps contact delivery/résumé status explicit.
- Added `.env` / `.env.*` exclusions with `.env.example` allowed, `.dev.vars.*`, `.vercel/`, and `coverage/`. No tracked credential file was found. Rules prevent future accidental additions; they do not erase history.
- Removed unused `src/assets/forest-islands.jpg` and `src/assets/island-coast.jpg` after confirming no source references and a successful build without them. Their historical blobs remain. The JPEGs have JFIF metadata only, with no EXIF/GPS data; their source/redistribution rights are not recorded. Resolve provenance for historical copies and the retained template favicon before claiming all assets are cleared for redistribution. No infringement determination was made.
- Retained Lovable metadata/generated instructions, the useful roadmap, route guide, generated route tree and reusable UI scaffold. No generated file or published history was edited by hand.
- GitHub description is empty. Suggested description: “Personal engineering portfolio of Ardian Agoes, an Electrical Engineering student at Brown University.” The current homepage metadata URL works but redirects; the canonical website URL is `https://ardianagoes.vercel.app/`. Metadata settings were reviewed, not changed.
- No repository license exists or was added. A public repository is not automatically generally licensed for reuse; [GitHub documents the distinction](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository). Retaining copyright is reasonable for a personal portfolio; choose an open-source code license only if reuse is intended, after separately treating personal content/assets and upstream obligations.
- PR #3 remains open and also edits the README/ignore rules. Decide merge order explicitly: this shorter README is the current requested replacement. This branch does not include PR #3's navigation implementation or alter existing main navigation.

## Verification

- Frozen Bun 1.4.4 install: unchanged lockfile/dependencies.
- Automated tests: 28 passed in four files, including two new contact-security regression tests.
- TypeScript: passed (`tsc --noEmit`, including the README's Bun invocation).
- New test file: full ESLint passed. Modified form: semantic ESLint passed; full formatter lint retains the same 16 baseline findings, with no formatting sweep.
- Default production build: passed (`cloudflare-module`). Vercel provider-detection build: passed, producing Build Output API v3 and a Node.js 24 function. No hosting configuration changed.
- Generated Vercel runtime smoke checks: all seven pages return 200; unknown project and GET/POST contact paths return 404; native form POST returns a page without sending; zero outbound `fetch` calls observed with outbound networking replaced by a failing stub. This is a local artifact test, not a Vercel-dashboard or edge-platform test.
- Live HTTP and downloaded-public-bundle checks are described above. No abusive traffic, real contact message, credential transmission or third-party activation was used.

Review the historical privacy/provenance decisions and prioritize the dependency-security follow-up before giving an unconditional public-release clearance. No exposed credential was identified that currently calls for rotation or an automated history rewrite.
