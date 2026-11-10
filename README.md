# Engineering Portfolio

Ardian Agoes's personal engineering portfolio. I am an Electrical Engineering student at Brown University, expected to graduate in May 2030.

- [Live portfolio](https://portfolio-umber-seven-96.vercel.app/)
- [GitHub](https://github.com/ardianagoes)
- [LinkedIn](https://www.linkedin.com/in/ardianagoes/)

## About

This site documents my engineering projects, experience, and the tools I have used. My technical interests include embedded systems, robotics, digital hardware, semiconductors, and low-latency computing. These interests include areas I am still exploring; the project descriptions and skills list distinguish them from hands-on experience.

## Featured projects

| Project         | Work documented in the portfolio                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O2NYC           | Designed and assembled 15+ NodeMCU air-quality monitors using BME280 and laser particulate sensors, reducing per-unit hardware costs from approximately $240 to $30. |
| Furney          | An app for AI-assisted furniture discovery and arranging furniture in a 3D model of a room.                                                                          |
| Deadline Desk   | A deadline tracker that imports calendars and extracts deadlines from screenshots using AI.                                                                          |
| CubeSat FlatSat | Python code that monitors three-axis IMU acceleration and triggers Raspberry Pi camera captures using Adafruit libraries and Picamera2.                              |
| FIRST Robotics  | Autonomous routines and command-based subsystems in Java with WPILib, PathPlanner, PID control, motor controllers, and sensors.                                      |
| Snoozeless      | An ESP32 silent-alarm prototype with a vibration motor, tactile buttons, and clasp-triggered inputs, tested through serial monitoring and hardware debugging.        |

Project facts are maintained in [`src/components/portfolio/data.ts`](src/components/portfolio/data.ts). Technologies used in those projects are separate from the website's stack below.

## Technology stack

- **Application:** React 19, TypeScript, TanStack Start and TanStack Router for server rendering and file-based routing.
- **Interface:** Tailwind CSS 4, Radix UI/shadcn components, and Lucide icons. The contact form uses a shared Zod validation schema.
- **Development:** Vite 8, the Lovable Vite configuration wrapper, Nitro build adapters, Bun's lockfile, ESLint, and Prettier.
- **Testing:** Vitest, Testing Library, and jsdom.
- **Hosting and workflow:** Vercel Hobby, GitHub, and Codex; the project originated in Lovable.

## Features

- Responsive homepage with projects, about, experience, skills, and contact sections.
- Six project detail routes, with optional case-study sections shown only when content exists.
- A fixed section navigation rail on wide desktops (1536px and above), with scroll position highlighting and standard section links.
- A back-to-top button after the hero, with instant scrolling. It temporarily hides if it would cover a contact control.
- Keyboard focus indicators and reduced-motion support.
- Contact form validation and explicit feedback that delivery is unavailable. **Production email delivery is inactive.**

The résumé download is pending. Project illustrations are symbolic SVGs, not photographs of finished hardware or screenshots of the apps.

## Local development

Prerequisites: Git, Node.js 22.12+ (Node 24 is supported), npm for the pinned Wrangler preview command, and Bun. Use the committed `bun.lock`; do not generate a second lockfile.

```sh
git clone https://github.com/ardianagoes/portfolio.git
cd portfolio
bun install --frozen-lockfile
bun run dev
```

Open the URL printed by Vite. No credentials or environment variables are required for the current portfolio and inactive contact form.

```sh
bun run test
bunx tsc --noEmit
bun run build
bun run preview
```

The default local build produces a Cloudflare module in `.output/server/`. Preview runs pinned Wrangler locally using `.output/server/wrangler.json`; open the loopback URL it prints (normally `http://127.0.0.1:8787`). It does not deploy or require a Cloudflare account. The first preview run needs network access to download Wrangler.

Run `bun run lint` for the repository lint check. Some existing files have formatting lint violations; avoid reformatting unrelated files when making focused changes. `bun run test:watch` is available during development.

## Project structure

```text
src/
  components/
    portfolio/        # Project data, visuals, forms, detail views, navigation
    ui/               # Reusable interface primitives
  hooks/              # Shared React hooks
  lib/                # Utilities and error reporting
  routes/
    __root.tsx        # Document shell and shared metadata
    index.tsx         # Homepage presentation
    projects.$projectId.tsx
  test/               # Test setup and route coverage
  router.tsx          # Router creation
  server.ts           # Server-rendering error wrapper
  styles.css          # Color system, typography, and global styles
public/               # Static files
vite.config.ts        # Lovable-compatible application/build configuration
vitest.config.ts      # Test configuration
```

Update project content in `data.ts`, reusable portfolio components in `src/components/portfolio/`, and homepage layout in `src/routes/index.tsx`. TanStack generates `src/routeTree.gen.ts`; do not edit it manually.

## Deployment

The production website is hosted on **Vercel's free Hobby plan**. It originated in Lovable and is maintained through GitHub and Codex; Lovable's project metadata and configuration remain in place for synchronization.

The Lovable configuration wrapper gives Nitro a **Cloudflare module fallback for local builds**. Outside Lovable, Nitro can detect the deployment provider and select its adapter, including Vercel. Local Wrangler preview tests the Cloudflare output; it does not reproduce Vercel's runtime. The production hosting choice is independent of this local fallback. This repository does not contain a custom Vercel configuration or a deployment workflow, and dashboard settings are managed separately.

Keep secrets out of source control and browser-exposed `VITE_*` variables. The unmerged Cloudflare contact-backend work is separate from `main` and is not required to run this version of the site.

## Development status

Upcoming work includes more detailed project case studies, authentic project photographs and screenshots, résumé integration, and secure contact-form delivery compatible with the production host.

## Source and licensing

This repository is available for review. No open-source license has been selected; public visibility does not grant a general license to reuse the portfolio's code, writing, or assets. See the [public repository review](docs/public-repository-review.md) for audit scope and outstanding privacy and asset-provenance checks.
