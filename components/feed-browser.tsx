"use client";

import { useEffect, useMemo, useState } from 'react';

import { Button, Panel, SectionLabel } from '@/components/ui';
import type { FeedItem } from '@/components/landing-page';
import type { AdvisorySeverity } from '@/lib/advisories';

const categories = [
  { key: 'all', label: '⬡ all' },
  { key: 'critical', label: 'critical' },
  { key: 'high', label: 'high' },
  { key: 'medium', label: 'medium' },
  { key: 'low', label: 'low' },
] as const;

type FeedBrowserProps = {
  initialItems?: FeedItem[];
  initialLastUpdated?: string;
};

function normalizeSeverity(severity: string) {
  return severity.trim().toLowerCase();
}

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

export function FeedBrowser({ initialItems = [], initialLastUpdated }: FeedBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<AdvisorySeverity>('all');
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(initialLastUpdated);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') {
      return items;
    }

    return items.filter((item) => normalizeSeverity(item.severity) === activeCategory);
  }, [activeCategory, items]);

  const visibleItems = filteredItems;

  useEffect(() => {
    let ignore = false;

    async function loadPage(nextPage: number, append: boolean) {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/advisories?page=${nextPage}&severity=${activeCategory}`);
        if (!response.ok) {
          throw new Error('Failed to load advisories');
        }

        const payload = (await response.json()) as {
          advisories?: FeedItem[];
          lastUpdated?: string;
        };

        if (ignore) {
          return;
        }

        setItems((currentItems) => (append ? [...currentItems, ...(payload.advisories ?? [])] : payload.advisories ?? []));
        setLastUpdated(payload.lastUpdated);
        setPage(nextPage);
        setHasMore((payload.advisories?.length ?? 0) > 0);
      } catch {
        if (!ignore) {
          setHasMore(false);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadPage(1, false);

    return () => {
      ignore = true;
    };
  }, [activeCategory]);

  return (
    <Panel className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <SectionLabel>Live Feed</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">LATEST NPM VULNERABILITIES</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            Real-time feed of reviewed security advisories affecting the npm ecosystem, sourced from the GitHub Advisory Database.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-100">
          Source: <a className="underline decoration-emerald-300/40 underline-offset-4" href="https://npmscan.com/api/advisories/latest" target="_blank" rel="noreferrer">npmscan.com/api/advisories/latest</a>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const isActive = activeCategory === category.key;

          return (
            <button
              key={category.key}
              type="button"
              onClick={() => {
                setActiveCategory(category.key);
                setItems([]);
                setPage(1);
                setHasMore(true);
              }}
              className={[
                'rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] transition',
                isActive
                  ? 'border-emerald-400/25 bg-emerald-400/15 text-emerald-100'
                  : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:border-emerald-400/20 hover:text-zinc-200',
              ].join(' ')}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {visibleItems.map((item, index) => {
            const key = `${item.href ?? item.title ?? 'feed-item'}-${index}`;

            return (
              <a
                key={key}
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
            );
          })}

          {hasMore ? (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                onClick={async () => {
                  const nextPage = page + 1;
                  setIsLoading(true);

                  try {
                    const response = await fetch(`/api/advisories?page=${nextPage}&severity=${activeCategory}`);
                    if (!response.ok) {
                      throw new Error('Failed to load advisories');
                    }

                    const payload = (await response.json()) as { advisories?: FeedItem[]; lastUpdated?: string };
                    const nextItems = payload.advisories ?? [];
                    setItems((currentItems) => [...currentItems, ...nextItems]);
                    setLastUpdated(payload.lastUpdated);
                    setPage(nextPage);
                    setHasMore(nextItems.length > 0);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          ) : null}

          {visibleItems.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 text-sm text-zinc-400">
              No advisories match this category yet.
            </div>
          ) : null}
        </div>

        <div className="space-y-4 rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">Feed status</span>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">
              Live
            </span>
          </div>
          <div className="space-y-3 text-sm leading-7 text-zinc-300">
            <p>Reviewed advisories are streamed from NPMSCan’s advisories API and can be surfaced inside the product feed view.</p>
            <p>Use this section for high-signal alerts, release notes, and the latest ecosystem-wide risk changes.</p>
            {lastUpdated ? <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Last updated: {lastUpdated}</p> : null}
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Showing {visibleItems.length} advisories
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 font-mono text-[12px] leading-6 text-zinc-300">
            <div className="text-emerald-200">api://latest-advisories</div>
            <div>refresh: 60s</div>
            <div>source: npmscan.com/api/advisories/latest</div>
          </div>
        </div>
      </div>
    </Panel>
  );
}