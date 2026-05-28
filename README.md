# NpmJaagratha

NpmJaagratha is a lightweight, no-login security dashboard for npm projects. Paste a `package.json` or search packages to get actionable vulnerability and supply-chain insights.

---

## Key features

- Fast, privacy-first analysis: paste `package.json` content locally (no account required) and receive a version-aware vulnerability summary.
- Live vulnerability feed: curated advisories from NPMSCan/GitHub Advisory Database.
- Package search: explore npm packages and view risk signals.
- Readable results: human-friendly vulnerability cards with OSV links and remediation context.

## Tech stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS for styling
- Framer Motion for subtle UI motion
- Lucide React for icons

## Pages

- `/` — Landing page and product overview
- `/search` — Package search UI
- `/feed` — Live vulnerability feed
- `/analyze` — Paste a `package.json` or package name to scan
- `/repository-dashboard` — Scan a public GitHub repository for manifests, sensitive files, and dependency issues
- `/contact` — Contact / LinkedIn
- `/security` — Security reporting guidance

## Server APIs

- `GET /api/npm/search` — npm search proxy
- `GET /api/advisories` — advisories feed proxy
- `POST /api/analyze` — package and `package.json` analysis proxy (server-side)
- `POST /api/repository-dashboard` — public GitHub repository scan proxy

## Quick start

1. Install dependencies

```bash
npm install
```

2. Run the development server

```bash
npm run dev
```

3. Open your browser at the local Next.js URL printed by the dev server.

## Development scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — start production server

## Contributing

Contributions are welcome. For code changes, please open a PR against the `main` branch with a clear description of the change. Keep commits small and focused.

If you plan to work on security-sensitive areas (analyzer, OSV queries, or proxy routes), please open an issue first to discuss the design.

## Security reporting

If you discover a vulnerability in this project or the analyzer results, please report it privately via the `/security` page or connect on LinkedIn: https://www.linkedin.com/in/gourav-suresh/.

## Project layout (high level)

- `app/` — Next.js App Router pages and API routes (`/app/*`)
- `components/` — UI components and layout pieces
- `lib/` — helper utilities

## License

This repository is provided under the terms of the LICENSE file in the project root.

---

