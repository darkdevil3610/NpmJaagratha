 # NpmJaagratha

 NpmJaagratha is a modern cybersecurity SaaS for Node.js and npm projects. It scans repositories for vulnerable dependencies, malicious npm packages, leaked secrets, supply chain attacks, suspicious install scripts, and dependency risk signals.

It also supports a lightweight, no-login package.json paste flow for instant risk summaries.

 > **Every commit. Every push. Every dependency change.**
 >
 > **You ship code. We make sure it’s clean.**

 ## What this repository contains

 This workspace currently focuses on the marketing site and landing page experience for NpmJaagratha.

 - Dark-mode SaaS landing page with cybersecurity styling
 - Animated hero visual and scan preview panels
 - Trusted security monitoring, workflow, feature, pricing, and footer sections
 - Responsive layout with reusable UI primitives
 - Next.js App Router, Tailwind CSS, and Framer Motion setup

 ## Product Overview

 NpmJaagratha helps Node.js teams monitor security risks across GitHub repositories and npm dependency changes.

 It is designed to detect:

 - vulnerable dependencies
 - malware or protestware packages
 - drainer-style package behavior
 - leaked secrets and API keys
 - typosquatting and suspicious package names
 - risky install and postinstall scripts
 - supply chain threats
 - low-trust maintainers or suspicious dependency shifts

 ## Frontend Stack

 - Next.js
 - Tailwind CSS
 - Framer Motion
 - Lucide React icons

 ## Key Screens

 The landing page includes:

 - hero section with primary CTA buttons
 - no-login package.json risk summary strip
 - security monitoring feature cards
 - how-it-works flow
 - detailed security feature grid
 - live scan preview dashboard
 - Malayalam/Kerala-styled alert examples
 - pricing cards
 - footer links

 ## Project Structure

 - [app/layout.tsx](app/layout.tsx) - root metadata and app shell
 - [app/page.tsx](app/page.tsx) - landing page entry point
 - [app/globals.css](app/globals.css) - global styles and visual system
 - [components/landing-page.tsx](components/landing-page.tsx) - full homepage composition
 - [components/ui.tsx](components/ui.tsx) - reusable buttons, panels, labels, and metrics

 ## Getting Started

 1. Install dependencies:

 ```bash
 npm install
 ```

 2. Start the development server:

 ```bash
 npm run dev
 ```

 3. Open the site in your browser at the local Next.js URL.

 ## Available Scripts

 - `npm run dev` - start the local development server
 - `npm run build` - create a production build
 - `npm run start` - run the production server

 ## Design Direction

 The interface uses:

 - dark black and charcoal backgrounds
 - neon green security accents
 - terminal-inspired panels
 - glassmorphism cards
 - grid overlays and glow effects
 - smooth Framer Motion transitions

 ## Notes

 - The landing page is built to feel premium, dev-focused, and trustworthy.
 - The cultural touch is intentionally subtle and limited to a few alert examples and copy cues.
 - The current product direction includes a no-login package.json paste experience before any GitHub integration.
 - No backend scanner is implemented yet; the current scope is the marketing and product presentation layer.