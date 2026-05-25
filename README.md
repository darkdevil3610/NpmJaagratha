# NpmJaagratha

> **Every commit. Every push. Every dependency change.**  
> Automatically scanned for vulnerabilities, secrets, supply chain attacks, and security loopholes.

**Tagline:**  
**You ship code. We make sure it’s clean.**

---

## Core MVP Idea

NpmJaagratha is a GitHub-integrated security scanner focused on npm and `package.json` security.

User connects a GitHub repository, then NpmJaagratha scans:

- dependencies
- lockfiles
- commits
- pull requests
- secrets
- malicious install scripts
- typo-squatting packages

Then reports:

- risk score
- alerts
- safe/unsafe badge
- fix suggestions

---

## MVP Features (v1)

### 1) GitHub Login

- GitHub OAuth sign-in
- User flow:
  1. Login with GitHub
  2. Select repository
  3. Install GitHub App

### 2) Automatic Repository Scanning

Scans trigger on:

- push
- pull request
- `package.json` changes
- `package-lock.json` changes

Detects:

- known CVEs
- malicious packages
- suspicious scripts
- abandoned packages
- typo-squatting
- leaked secrets

### 3) Dependency Security Scanner

Inputs:

- `package.json`
- `package-lock.json`

Data sources / engines:

- npm audit API
- OSV.dev
- Snyk vulnerability database
- Socket.dev signals

Checks:

- vulnerable versions
- install/postinstall scripts
- obfuscated code
- crypto miners
- protestware
- malware packages

### 4) Secret Scanner

Detects:

- API keys
- AWS secrets
- JWT secrets
- private tokens
- `.env` leaks

Methods:

- regex scanning
- entropy detection

### 5) Risk Score

| Score  | Status  |
| ------ | ------- |
| 0-20   | Safe    |
| 21-50  | Warning |
| 51-100 | Danger  |

Example scoring:

- vulnerable dependency: `+20`
- exposed secret: `+40`
- malicious install script: `+50`

### 6) PR Comments (Important MVP Feature)

Example bot comment:

```txt
⚠️ NpmJaagratha Report

2 risky packages detected:
- event-stream@3.3.6
- flatmap-stream@0.1.1

1 exposed API key found.

Risk Score: 72/100
```

### 7) Dashboard

Repo Overview:

- total packages
- vulnerabilities
- secrets found
- suspicious packages
- security score

Dependency Graph:

- simple tree view

---

## Tech Stack

### Frontend

- Next.js
- Tailwind CSS
- shadcn/ui

### Backend

- Node.js
- Express or NestJS

### Database

- PostgreSQL

### Queue

- BullMQ + Redis

### Scanning Engine

- npm audit
- osv-scanner
- semgrep
- trufflehog
- custom heuristics

### Hosting

- Vercel (frontend)
- Railway / Fly.io / Render (backend)

---

## MVP Architecture

```txt
GitHub Webhook
      ↓
NpmJaagratha API
      ↓
Queue Worker
      ↓
Security Scanners
      ↓
Risk Engine
      ↓
Dashboard + PR Comments
```

---

## Post-MVP Ideas (v2)

### AI Security Explainer

Explain vulnerabilities in simple English, for example:

> This package can execute malicious code during install.

### Malware Behavior Detection

Detect suspicious behavior patterns such as:

- `eval()`
- `child_process` abuse
- network beacons
- crypto miners

### Trust Score

Analyze:

- maintainer reputation
- package age
- download anomalies
- sudden ownership changes

### Kerala Branding Touch

```txt
⚠️ Jaagratha!
Ithu risky dependency aanu.
```

```txt
🛑 Visham detected in dependency tree.
```

---

## Landing Page Copy

### Hero

# NpmJaagratha

### Every commit. Every push. Every dependency change.

Automatically scan your Node.js projects for:

- vulnerable dependencies
- malware packages
- leaked secrets
- supply chain attacks

**You ship code. We make sure it’s clean.**

[ Connect GitHub ]

### What Makes This Special

Most tools only check CVEs. NpmJaagratha focuses on:

- npm malware
- supply chain attacks
- malicious install scripts
- suspicious maintainer behavior
- developer-friendly UX