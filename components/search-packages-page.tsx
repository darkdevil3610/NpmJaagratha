"use client";

import { useEffect, useMemo, useState } from 'react';

import { ArrowLeft, Search } from 'lucide-react';

import { Button } from '@/components/ui';

type PackageSearchResult = {
  package: {
    name: string;
    version?: string;
    description?: string;
    links?: {
      npm?: string;
    };
  };
  downloads?: {
    weekly?: number;
  };
};

type SearchResponse = {
  objects?: PackageSearchResult[];
  total?: number;
  time?: string;
};

type PopularCard = {
  name: string;
  description: string;
  weeklyDownloads: number;
  npmUrl: string | undefined;
};

const popularQueries = ['react','lodash','express','axios','typeScript','vue','nuxt', 'next', 'react-router', 'vite', 'prisma', 'jsonwebtoken'];

function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function estimateHourlySearches(weeklyDownloads: number) {
  return Math.max(120, Math.round(weeklyDownloads / 280));
}

export function SearchPackagesPage() {
  const [query, setQuery] = useState('');
  const [liveResults, setLiveResults] = useState<PackageSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [popularCards, setPopularCards] = useState<PopularCard[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadPopular() {
      setPopularLoading(true);

      try {
        const responses = await Promise.all(
          popularQueries.map(async (term) => {
            const response = await fetch(`/api/npm/search?q=${encodeURIComponent(term)}&size=1`);
            if (!response.ok) {
              return null;
            }

            const payload = (await response.json()) as SearchResponse;
            const first = payload.objects?.[0];
            if (!first) {
              return null;
            }

            return {
              name: first.package.name,
              description: first.package.description ?? 'No package description available.',
              weeklyDownloads: first.downloads?.weekly ?? 0,
              npmUrl: first.package.links?.npm,
            } satisfies PopularCard;
          }),
        );

        if (!ignore) {
          setPopularCards(responses.filter((entry): entry is PopularCard => Boolean(entry)));
        }
      } finally {
        if (!ignore) {
          setPopularLoading(false);
        }
      }
    }

    loadPopular();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setLiveResults([]);
      setSearchLoading(false);
      return;
    }

    let ignore = false;
    const timer = setTimeout(async () => {
      setSearchLoading(true);

      try {
        const response = await fetch(`/api/npm/search?q=${encodeURIComponent(trimmed)}&size=8`);
        if (!response.ok) {
          throw new Error('Failed search request');
        }

        const payload = (await response.json()) as SearchResponse;
        if (!ignore) {
          setLiveResults(payload.objects ?? []);
        }
      } catch {
        if (!ignore) {
          setLiveResults([]);
        }
      } finally {
        if (!ignore) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query]);

  const showLiveResults = query.trim().length > 0;

  const cardsToRender = useMemo(() => {
    if (showLiveResults) {
      return liveResults.map((result) => ({
        name: result.package.name,
        description: result.package.description ?? 'No package description available.',
        weeklyDownloads: result.downloads?.weekly ?? 0,
        npmUrl: result.package.links?.npm,
      }));
    }

    return popularCards;
  }, [showLiveResults, liveResults, popularCards]);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-30" />
      <div className="absolute left-1/2 top-0 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-red-500/[0.12] blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-red-500/[0.2] bg-black/30 px-4 py-3 backdrop-blur-xl">
          <div>
            <div className="text-sm font-semibold text-white">NpmJaagratha</div>
            <div className="text-xs text-zinc-400">Live npm package intelligence</div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" href="/">
              <ArrowLeft className="h-4 w-4" /> Home
            </Button>
            <Button variant="secondary" href="/feed">Feed</Button>
          </div>
        </header>

        <section className="pb-16 pt-12">
          <h1 className="text-4xl font-semibold uppercase tracking-[0.08em] text-white sm:text-5xl">
            Search npm packages
          </h1>
          <p className="mt-5 max-w-4xl text-2xl leading-8 text-zinc-400">
            Start typing to search npm packages in real-time. View package details, dependencies, and metadata.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 rounded-xl border border-red-500/[0.2] bg-[#101b2f] px-4 py-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Start typing to search (e.g., react, express, lodash)..."
                className="w-full bg-transparent text-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-600 px-6 py-3 text-lg font-medium text-white shadow-[0_0_28px_rgba(239,68,68,0.35)] transition hover:bg-red-500"
            >
              <Search className="h-5 w-5" /> Search
            </button>
          </div>
        </section>

        <section className="pb-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg uppercase tracking-[0.24em] text-zinc-100">
              {showLiveResults ? 'Search results' : 'Popular packages'}
            </h2>
            <div className="text-sm uppercase tracking-[0.2em] text-zinc-500">
              {showLiveResults ? 'Live query' : 'Quick picks'}
            </div>
          </div>

          {searchLoading || popularLoading ? (
            <div className="rounded-2xl border border-red-500/[0.2] bg-black/30 p-6 text-zinc-400">Loading packages...</div>
          ) : null}

          {!searchLoading && !popularLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cardsToRender.map((card) => (
                <article key={card.name} className="rounded-2xl border border-red-500/[0.2] bg-[linear-gradient(115deg,rgba(25,37,56,0.95),rgba(16,24,38,0.92))] p-6">
                  <h3 className="text-4xl font-semibold uppercase text-zinc-100">{card.name}</h3>
                  <div className="mt-3 inline-flex items-center rounded-full border border-red-500/[0.35] bg-red-500/[0.12] px-3 py-1 text-sm text-rose-200">
                    {formatCount(estimateHourlySearches(card.weeklyDownloads))} searches in the last hour
                  </div>
                  <p className="mt-4 text-2xl leading-8 text-zinc-400">{card.description}</p>
                  <a
                    href={card.npmUrl ?? '#'}
                    target={card.npmUrl ? '_blank' : undefined}
                    rel={card.npmUrl ? 'noreferrer' : undefined}
                    className="mt-8 inline-flex items-center gap-2 text-xl text-rose-200 transition hover:text-rose-100"
                  >
                    View details
                    <span aria-hidden>{'>'}</span>
                  </a>
                </article>
              ))}
            </div>
          ) : null}

          {!searchLoading && showLiveResults && cardsToRender.length === 0 ? (
            <div className="rounded-2xl border border-red-500/[0.2] bg-black/30 p-6 text-zinc-400">
              No packages matched your search. Try another keyword.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}