import type { Metadata } from 'next';

import { ArrowLeft, ExternalLink } from 'lucide-react';

import { FeedBrowser } from '@/components/feed-browser';
import { Button, Panel, SectionLabel } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Live Feed | NpmJaagratha',
  description:
    'Latest npm vulnerabilities and reviewed security advisories from the GitHub Advisory Database.',
};

export default async function FeedPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-40" />
      <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-400/[0.08] blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/[0.08] bg-black/25 px-4 py-3 backdrop-blur-xl">
          <div>
            <div className="text-sm font-semibold text-white">NpmJaagratha</div>
            <div className="text-xs text-zinc-400">Live npm vulnerability feed</div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" href="/">Home</Button>
            <Button variant="secondary" href="https://npmscan.com/api/advisories/latest" target="_blank" rel="noreferrer">
              API <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <section className="pb-16 pt-16">
          <Panel className="space-y-4">
            <SectionLabel>Feed</SectionLabel>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Live Feed</h1>
            <p className="max-w-3xl text-sm leading-7 text-zinc-400">
              LATEST NPM VULNERABILITIES. Real-time feed of reviewed security advisories affecting the npm ecosystem,
              sourced from the GitHub Advisory Database.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="/" variant="primary">
                <ArrowLeft className="h-4 w-4" /> Back to home
              </Button>
              <Button href="#live-feed" variant="secondary">
                Jump to feed
              </Button>
            </div>
          </Panel>
        </section>

        <section id="live-feed" className="pb-10">
          <FeedBrowser />
        </section>
      </div>
    </main>
  );
}