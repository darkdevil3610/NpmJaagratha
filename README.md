# NpmJaagratha

NpmJaagratha is a modern cybersecurity dashboard for npm projects. It combines a polished landing page with live package search, advisory feeds, and a no-login analyzer for scanning `package.json` content.

## What it does

- **Landing page:** product overview, CTA flow, and security-focused marketing UI
- **Search:** live npm package search backed by the `/api/npm/search` proxy
- **Feed:** latest vulnerability feed powered by NPMSCan advisories
- **Analyzer:** paste a package name or `package.json` and review vulnerability results
- **API routes:** server-side proxies for search, advisories, and analysis

## Tech stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

## Pages

- `/` — home / landing page
- `/search` — package search
- `/feed` — vulnerability feed
- `/analyze` — project analyzer

## API routes

- `/api/npm/search` — npm search proxy
- `/api/advisories` — advisories feed proxy
- `/api/analyze` — package and `package.json` analysis proxy

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the app in your browser at the local Next.js URL.

## Available scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — run the production server

## Project structure

- `app/layout.tsx` — root layout and metadata
- `app/page.tsx` — landing page entry
- `app/search/page.tsx` — search page
- `app/feed/page.tsx` — feed page
- `app/analyze/page.tsx` — analyzer page
- `app/api/npm/search/route.ts` — search proxy
- `app/api/advisories/route.ts` — advisories proxy
- `app/api/analyze/route.ts` — analyzer proxy
- `components/landing-page.tsx` — homepage composition
- `components/search-packages-page.tsx` — search UI
- `components/feed-browser.tsx` — feed UI
- `components/ui.tsx` — shared UI primitives
- `lib/advisories.ts` — advisory data helpers

## Notes

- The analyzer is designed for a no-login workflow.
- Vulnerability results are displayed as readable cards and linked out to OSV.
- The UI uses a dark, high-contrast security theme.
