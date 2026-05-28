"use client";

import { type PropsWithChildren, useState } from 'react';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Bot,
  CheckCircle2,
  GitPullRequest,
  LockKeyhole,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Workflow,
  Menu,
  X,
} from 'lucide-react';

import { Button, Metric, Panel, SectionLabel } from '@/components/ui';

const trustCards = [
  { title: 'Vulnerability Scanning', icon: ShieldAlert, text: 'Track known CVEs across every dependency update.' },
  { title: 'Secret Detection', icon: LockKeyhole, text: 'Catch exposed API keys, tokens, and env leaks early.' },
  { title: 'Supply Chain Protection', icon: Workflow, text: 'Spot compromised packages and risky maintainer paths.' },
  { title: 'Malware Package Detection', icon: Bot, text: 'Flag suspicious install scripts and malicious payloads.' },
  { title: 'Dependency Risk Scoring', icon: BadgeCheck, text: 'Rank packages by trust signals and exploitability.' },
  { title: 'GitHub PR Security Checks', icon: GitPullRequest, text: 'Comment on pull requests with precise remediation.' },
];

const steps = [
  { step: '01', title: 'Paste package.json', description: 'Drop in a package.json file or snippet and start the scan instantly.' },
  { step: '02', title: 'Push code', description: 'Every push, PR, and lockfile change becomes a security checkpoint.' },
  { step: '03', title: 'Automatic scans run', description: 'NpmJaagratha checks dependencies, scripts, and secrets in real time.' },
  { step: '04', title: 'Get instant alerts and fixes', description: 'Receive actionable comments, dashboards, and risk scores.' },
];

const features = [
  'package.json scanning',
  'package-lock.json analysis',
  'npm malware detection',
  'typo-squatting detection',
  'suspicious install scripts',
  'exposed API key detection',
  'maintainer trust analysis',
  'dependency graph visualization',
  'PR comments and GitHub checks',
];

const alerts = [
  { tone: 'amber', title: '⚠️ Jaagratha! Risky dependency detected.', text: 'event-stream-like behavior flagged in the latest tree update.' },
  { tone: 'rose', title: '🛑 Visham detected in package tree.', text: 'A newly introduced package has an unusual install script and low trust signals.' },
  { tone: 'emerald', title: '🔍 Package sookshikkanam.', text: 'Lockfile diff reviewed. No secret leaks and no suspicious postinstall scripts.' },
];

export type FeedItem = {
  title: string;
  subtitle: string;
  severity: string;
  packageName: string;
  href?: string;
  pubDate?: string;
};

const defaultFeedItems: FeedItem[] = [
  {
    title: 'GHSA-38m6-82c8-4xfm',
    subtitle: 'Parse Server pre-authentication denial of service via client version header regex backtracking',
    severity: 'High',
    packageName: 'parse-server',
  },
  {
    title: 'GHSA-q8mj-m7cp-5q26',
    subtitle: 'qs stringify crash on null and undefined entries in comma-format arrays',
    severity: 'Medium',
    packageName: 'qs',
  },
  {
    title: 'GHSA-j3vx-cx2r-pvg8',
    subtitle: 'Network-AI unauthenticated cross-origin MCP tool invocation via empty default secret',
    severity: 'High',
    packageName: 'network-ai',
  },
  {
    title: 'GHSA-f396-4rp4-7v2j',
    subtitle: 'Boxlite path traversal leading to arbitrary file write on the host',
    severity: 'Critical',
    packageName: '@boxlite-ai/boxlite',
  },
];

const footerLinks = [
  { label: 'GitHub', href: 'https://github.com/darkdevil3610/NpmJaagratha' },
  { label: 'Repo Dashboard', href: '/repository-dashboard' },
  { label: 'Security', href: '/security' },
  { label: 'Contact', href: '/contact' },
];

type LiveFeedProps = {
  items?: FeedItem[];
  lastUpdated?: string;
};

function formatRelativeTime(pubDate?: string) {
  if (!pubDate) {
    return 'recent';
  }

  const publishedAt = new Date(pubDate).getTime();
  if (Number.isNaN(publishedAt)) {
    return 'recent';
  }

  const deltaMinutes = Math.max(1, Math.round((Date.now() - publishedAt) / 60000));
  if (deltaMinutes < 60) {
    return `${deltaMinutes}m ago`;
  }

  const deltaHours = Math.round(deltaMinutes / 60);
  if (deltaHours < 48) {
    return `${deltaHours}h ago`;
  }

  const deltaDays = Math.round(deltaHours / 24);
  return `${deltaDays}d ago`;
}

type RevealSectionProps = PropsWithChildren<{
  className?: string;
  id?: string;
  delay?: number;
}>;

function RevealSection({ children, className, id, delay = 0 }: RevealSectionProps) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay }}
    >
      {children}
    </motion.section>
  );
}

function HeroVisual() {
  return (
    <Panel className="relative overflow-hidden p-0">
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="absolute inset-0 grid-overlay opacity-40" />
      <div className="relative grid gap-4 p-5 sm:p-6">
        <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-black/30 px-4 py-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
          </div>
          <div className="font-mono text-[11px] tracking-[0.28em] text-emerald-200">npmjaagratha scan --live</div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="terminal-panel noise relative overflow-hidden rounded-3xl p-5">
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4 text-sm text-zinc-300">
              <TerminalSquare className="h-4 w-4 text-emerald-300" />
              <span>Live dependency sweep</span>
            </div>
            <div className="mt-4 space-y-3 font-mono text-[12px] leading-6 text-zinc-300">
              <p><span className="text-emerald-300">[scan]</span> repo connected from GitHub App</p>
              <p><span className="text-emerald-300">[scan]</span> package-lock parsed, 42 dependencies mapped</p>
              <p><span className="text-emerald-300">[alert]</span> 1 suspicious install script isolated</p>
              <p><span className="text-emerald-300">[alert]</span> exposed token signature matched entropy rule</p>
              <p><span className="text-emerald-300">[result]</span> risk score adjusted to 73/100</p>
            </div>
            <div className="scan-line animate-scan" />
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-4">
              <div className="flex items-center justify-between text-sm text-zinc-300">
                <span>Risk score</span>
                <span className="text-emerald-200">Danger</span>
              </div>
              <div className="mt-3 flex items-end gap-3">
                <div className="text-5xl font-semibold tracking-tight text-white">73</div>
                <div className="pb-1 text-sm text-zinc-400">/100</div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-300"
                  initial={{ width: '32%' }}
                  animate={{ width: '73%' }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Metric label="Vulnerable packages" value="4" tone="amber" />
              <Metric label="Safe packages" value="38" tone="emerald" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Malware hits" value="1" tone="amber" />
          <Metric label="Secrets exposed" value="2" tone="rose" />
          <Metric label="PR checks passed" value="17" tone="cyan" />
        </div>
      </div>
    </Panel>
  );
}

function QuickProofStrip() {
  const items = [
    'No install, no login, no API keys',
    'Paste package.json, get instant risk summary',
    'Built to catch drainers & supply-chain attacks',
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-100"
        >
          {item}
        </div>
      ))}
    </div>
  );
}

export function LiveFeed({ items = defaultFeedItems, lastUpdated }: LiveFeedProps) {
  return (
    <Panel className="space-y-6" id="feed">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <SectionLabel>Live Feed</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">LATEST NPM VULNERABILITIES</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            Real-time feed of reviewed security advisories affecting the npm ecosystem, sourced from the GitHub Advisory Database.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-100">
          Source: <a className="underline decoration-emerald-300/40 underline-offset-4" href="https://npmscan.com/latest-vulnerabilities/rss.xml" target="_blank" rel="noreferrer">npmscan.com/latest-vulnerabilities/rss.xml</a>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <a
              key={item.title}
              href={item.href ?? '#'}
              target={item.href ? '_blank' : undefined}
              rel={item.href ? 'noreferrer' : undefined}
              className="block rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-emerald-400/20 hover:bg-white/[0.06]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-emerald-200">{item.severity}</div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">{item.subtitle}</p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <div className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.24em] text-zinc-300">
                    {item.packageName}
                  </div>
                  {item.pubDate ? (
                    <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">{formatRelativeTime(item.pubDate)}</div>
                  ) : null}
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="space-y-4 rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">Feed status</span>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">
              Live
            </span>
          </div>
          <div className="space-y-3 text-sm leading-7 text-zinc-300">
            <p>Reviewed advisories are streamed from NPMSCan’s RSS feed and can be surfaced inside the product feed view.</p>
            <p>Use this section for high-signal alerts, release notes, and the latest ecosystem-wide risk changes.</p>
            {lastUpdated ? <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Last updated: {lastUpdated}</p> : null}
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 font-mono text-[12px] leading-6 text-zinc-300">
            <div className="text-emerald-200">rss://latest-vulnerabilities</div>
            <div>refresh: 60s</div>
            <div>source: GitHub Advisory Database</div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ScanTimeline() {
  const bars = [38, 56, 72, 44, 84, 66, 94, 70];

  return (
    <Panel className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-emerald-200">Live Scan Preview</div>
          <h3 className="mt-2 text-2xl font-semibold text-white">Risk moves with every commit.</h3>
        </div>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
          Active scan
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4 rounded-3xl border border-white/[0.06] bg-black/20 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Recent alerts</span>
            <BellRing className="h-4 w-4 text-emerald-300" />
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4">
                <div className="text-sm font-medium text-white">{alert.title}</div>
                <div className="mt-1 text-sm text-zinc-400">{alert.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/[0.06] bg-black/20 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Scan timeline</span>
            <ScanSearch className="h-4 w-4 text-cyan-300" />
          </div>
          <div className="flex h-48 items-end gap-2 rounded-2xl border border-white/[0.06] bg-[linear-gradient(180deg,rgba(124,255,107,0.06),transparent)] p-4">
            {bars.map((height, index) => (
              <motion.div
                key={index}
                className="relative flex-1 overflow-hidden rounded-t-xl bg-white/[0.08]"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: index * 0.05, ease: 'easeOut' }}
              >
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-300 via-cyan-300 to-transparent" />
              </motion.div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3 text-sm text-zinc-300">
              package.json diff
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3 text-sm text-zinc-300">
              lockfile review
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3 text-sm text-zinc-300">
              secret sweep
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Search', href: '/search' },
    { label: 'FEED', href: '/feed' },
    { label: 'Repo Dashboard', href: '/repository-dashboard' },
    { label: 'Features', href: '#features' },
  ];

  return (
    <main className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <header className="relative flex items-center justify-between rounded-[2rem] border border-emerald-400/15 bg-[linear-gradient(120deg,rgba(5,22,14,0.9),rgba(4,9,14,0.92))] px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200 shadow-[0_0_28px_rgba(124,255,107,0.18)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">NpmJaagratha</div>
              <div className="text-xs text-zinc-400">Node.js security, built with jaagratha.</div>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center gap-2 rounded-full p-2 text-zinc-200 hover:bg-white/5 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {mobileMenuOpen ? (
            <div id="mobile-nav" className="absolute right-4 top-full mt-3 w-56 rounded-2xl border border-white/[0.06] bg-black/80 p-3 backdrop-blur-md md:hidden">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <a key={link.label} href={link.href} className="rounded px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/5">
                    {link.label}
                  </a>
                ))}
                <a href="/analyze" className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-300 px-3 py-2 text-sm font-semibold text-black">Analyzer</a>
              </nav>
            </div>
          ) : null}

          <div className="hidden items-center gap-3 md:flex">
            <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-black/25 p-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <Button
              variant="secondary"
              href="/analyze"
              className="border-emerald-300/25 bg-emerald-300/10 text-emerald-100 hover:border-emerald-200/40 hover:bg-emerald-300/15"
            >
              Analyzer
            </Button>
          </div>
        </header>

        <motion.section
          className="grid gap-14 pb-24 pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pt-24"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="max-w-2xl">
            <SectionLabel>Security monitoring for npm</SectionLabel>
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              Every commit. Every push. Every dependency change.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300 sm:text-xl">
              Automatically scan your Node.js projects for vulnerabilities, malware packages, leaked secrets,
              and supply chain attacks. Paste package.json to get an instant risk summary without login.
            </p>
            <p className="mt-4 text-base text-emerald-200/90">
              You ship code. We make sure it’s clean.
            </p>

            <div className="mt-6 rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.06] p-5">
              <div className="text-xs uppercase tracking-[0.28em] text-emerald-200">No login required</div>
              <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-300">
                Different tools solve different security problems. NpmJaagratha focuses on malware-like behavior, drainers,
                obfuscation, sketchy scripts, and supply-chain risks, not just known CVEs.
              </p>
            </div>

            <div className="mt-6">
              <QuickProofStrip />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/analyze" variant="primary">
                Paste package.json <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="#scan-preview" variant="secondary">
                View Demo
              </Button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Coverage</div>
                <div className="mt-2 text-lg font-semibold text-white">Dependencies, secrets, PRs</div>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Latency</div>
                <div className="mt-2 text-lg font-semibold text-white">Scans in seconds</div>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Tone</div>
                <div className="mt-2 text-lg font-semibold text-white">Clear, calm, and actionable</div>
              </div>
            </div>
          </div>

          <HeroVisual />
        </motion.section>

        <RevealSection className="pb-24" id="features" delay={0.05}>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel>Trusted Security Monitoring</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Built for developers who want a fast, no-login risk check.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-zinc-400">
              A premium security layer for npm projects, tuned for developers who want strong signals without noise and a clean paste-in workflow.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trustCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Panel key={card.title} className="group p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/20 hover:bg-white/[0.06]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/10 text-emerald-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{card.text}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm text-emerald-200">
                    <Sparkles className="h-4 w-4" />
                    <span>Signal {index + 1}</span>
                  </div>
                </Panel>
              );
            })}
          </div>
        </RevealSection>

        <RevealSection className="pb-24" delay={0.08}>
          <Panel className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <SectionLabel>How It Works</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">A clean flow from pasted package.json to instant protection.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">
                The flow stays simple. The signal stays strong. Your team gets security context where it matters most.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {steps.map((step) => (
                <div key={step.step} className="rounded-3xl border border-white/[0.08] bg-black/20 p-5">
                  <div className="text-xs font-medium uppercase tracking-[0.26em] text-emerald-200">{step.step}</div>
                  <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">{step.description}</p>
                </div>
              ))}
            </div>
          </Panel>
        </RevealSection>

        <RevealSection className="pb-24" delay={0.1}>
          <div className="mb-8">
            <SectionLabel>Security Features</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Deep checks for every package move.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/10 text-emerald-200">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium text-white">{feature}</div>
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="pb-24" id="scan-preview" delay={0.12}>
          <ScanTimeline />
        </RevealSection>

        <RevealSection className="pb-24" delay={0.14}>
          <LiveFeed />
        </RevealSection>

        <RevealSection className="pb-24" delay={0.16}>
          <div className="mb-8">
            <SectionLabel>Malayalam Alerts</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Subtle cultural touch. Premium security tone.</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {alerts.map((alert) => (
              <div
                key={alert.title}
                className="rounded-3xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6"
              >
                <div className="text-sm font-semibold text-white">{alert.title}</div>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{alert.text}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection id="package-json-scan" className="pb-10" delay={0.18}>
          <Panel className="flex flex-col gap-8 overflow-hidden lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <SectionLabel>Get Started</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Paste a package.json and get a risk summary in seconds.</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                No install, no login, no API keys. Start with a package.json snippet or file, and NpmJaagratha flags vulnerable dependencies,
                drainers, suspicious scripts, and supply-chain attacks immediately.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/analyze" variant="primary">
                View risk summary <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="#scan-preview" variant="secondary">
                View Demo
              </Button>
            </div>
          </Panel>
        </RevealSection>

        <footer className="border-t border-white/[0.08] py-8 text-sm text-zinc-400">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-white">NpmJaagratha</div>
              <div className="mt-1">Cybersecurity monitoring for Node.js and npm projects.</div>
            </div>
            <div className="flex flex-wrap gap-5">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition hover:text-emerald-200"
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}