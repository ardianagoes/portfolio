# Engineering Portfolio

Ardian Agoes's personal engineering portfolio. I am an Electrical Engineering student at Brown University, with an expected graduation date of May 2030.

[View the live portfolio](https://ardianagoes.vercel.app/)

## Overview

The site presents my work in embedded systems, environmental monitoring, robotics, and software development. Featured projects include O2NYC, Furney, Deadline Desk, CubeSat FlatSat, FIRST Robotics, and Snoozeless. Each has a dedicated page with the project information currently available.

My interests also include digital hardware, semiconductors, and low-latency computing. The portfolio distinguishes these interests from the technologies I have used in projects.

The application uses React, TypeScript, TanStack Start and Router, Tailwind CSS, Vite, and Nitro. Tests use Vitest and Testing Library. Project content is maintained in `src/components/portfolio/data.ts`, with reusable presentation components alongside it.

## Local development

Install Git, Node.js 22.12+ with npm, and Bun. Use the committed lockfile:

```sh
git clone https://github.com/ardianagoes/portfolio.git
cd portfolio
bun install --frozen-lockfile
bun run dev
```

Open the URL printed by Vite. To test and preview a production build:

```sh
bun run test
bunx tsc --noEmit
bun run build
bun run preview
```

## Deployment and status

Production runs on Vercel Hobby. The project originated in Lovable and is maintained through GitHub and Codex. The default local build uses a Cloudflare module fallback; preview runs it locally through Wrangler, without deploying.

Portfolio content requires no paid API or credentials. Email delivery is disabled, and the résumé download is pending.
