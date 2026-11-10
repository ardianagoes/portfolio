# Ardian Engineering Portfolio

Build a modern personal engineering portfolio website.

I want the website to combine two specific references:

1. Use the COLOR SCHEME and overall visual palette inspired by this website:
https://land-book.com/websites/43258-metacell-world-leaders-in-software-for-life-science

2. Use the LAYOUT, structure, and general portfolio feel inspired by this website:
https://land-book.com/websites/80938-devsync-a-developer-portfolio-template-for-framer

Important: Do NOT include pictures of me or any personal portrait photography.

Design goals:
- Clean, premium, modern portfolio
- Dark or dark-leaning polished aesthetic if it fits the reference palette
- Strong typography
- Smooth spacing and strong visual hierarchy
- Professional and minimal, not cluttered
- Feels like a polished portfolio for a technical student / engineer
- No cheesy startup clichés, no fake metrics, no unnecessary gradients, no excessive animations

Structure to include:
1. Hero section
   - Name: Ardian Agoes
   - Brown University Electrical Engineering student
   - Interests: FPGA, ASICs, semiconductors, embedded systems, low-latency hardware, robotics
   - CTA buttons for Projects, Resume, GitHub, LinkedIn, Contact

2. Featured Projects
   - O2NYC: low-cost air-quality monitoring hardware
   - Furney: AI furniture discovery and 3D room-planning app
   - Deadline Desk: deadline tracker with calendar imports and AI screenshot extraction
   - CubeSat FlatSat: Raspberry Pi + IMU triggered image capture
   - FIRST Robotics: programming, control systems, and hardware integration

3. About section
   - Short technical introduction focused on building things, curiosity, and engineering interests

4. Experience / Activities
   - Brown Formula Racing
   - OIT Student Technician
   - Mypy Coding Senior Volunteer Tutor
   - Other engineering/research interests
   - If details are missing, use placeholders rather than inventing fake achievements

5. Skills
   - Group into hardware, programming, tools, and engineering areas

6. Contact section
   - GitHub
   - LinkedIn
   - Email

Design instructions:
- The composition and portfolio structure should feel similar to Devsync
- The colors, atmosphere, and aesthetic palette should feel inspired by the Metacell reference
- Do not use personal photos
- Instead of portrait images, use clean abstract shapes, subtle technical/graphic elements, or project preview cards
- Use reusable components and a responsive layout
- Make project cards visually strong
- Prioritize homepage polish first

For this first version, generate a high-quality visual prototype and clean component structure.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/503259f8-ac20-4243-8c92-d0c5ee3e1739).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Use Node.js 22.12 or newer (Node.js 24 was tested), npm, and Bun. Install the
application dependencies from the committed Bun lockfile:

```sh
git clone https://github.com/ardianagoes/portfolio.git
cd portfolio
bun install --frozen-lockfile
npm run dev
```

Open the local URL printed by Vite. This development server includes hot reload
and uses the existing Lovable Vite configuration. If Bun is not installed, run
`npm exec --yes --package=bun@1.4.4 -- bun install --frozen-lockfile` instead of the
`bun install` command above. Do not generate a competing npm lockfile.

### Test and preview the production build

```sh
npm test
node node_modules/typescript/bin/tsc --noEmit
npm run build
npm run preview
```

Open [http://127.0.0.1:8787](http://127.0.0.1:8787). To use a different port:

```sh
npm run preview -- --port 4173
```

The build uses the existing Lovable/TanStack Start/Nitro integration and its
`cloudflare-module` target. Nitro generates the worker under `.output/server`,
static assets under `.output/public`, and the preview configuration at
`.output/server/wrangler.json`. Build before previewing, and rebuild after source
changes; preview serves the compiled application, not the Vite development server.
Do not edit or commit the generated output or Wrangler configuration.

`npm run preview` runs a pinned version of Cloudflare's Wrangler CLI through npx.
Its first run downloads the CLI and local Workers runtime into npm's cache and
requires network access. It adds no project dependency or lockfile. The worker
and its generated asset binding run locally, bind to `127.0.0.1`, and require no
Cloudflare login or deployment. Stop the server with Ctrl+C. Local preview does
not verify production account configuration or remote service bindings.

Plain `vite preview` is not supported by this build: TanStack's generic preview
handler looks for `dist/server/server.js`, while Nitro emits the Cloudflare
worker elsewhere. Use the package preview script so Wrangler loads the generated
worker, compatibility settings, and assets together. See Cloudflare's
[Wrangler local development documentation](https://developers.cloudflare.com/workers/wrangler/commands/workers/#dev).

With preview running, smoke-test:

- `/` and `/projects/01` through `/projects/06`: HTTP 200, correct page titles,
  project content, and working project/back links.
- `/projects/missing` and `/missing`: HTTP 404 with the existing not-found page.
- `/robots.txt`, `/favicon.ico`, and the `/assets/` CSS/JavaScript URLs referenced
  by the page: HTTP 200 with the correct content types.
- The contact form: validation still works, and unconfigured delivery never
  claims that a message was sent.

### Lovable synchronization

Keep the existing `vite.config.ts` integration and build target. Work on a branch
and open a pull request into `main`; merge only after review. Changes merged into
the connected branch sync back to Lovable. Do not rewrite published Git history,
and follow `AGENTS.md` for generated files and Lovable-managed resources.
