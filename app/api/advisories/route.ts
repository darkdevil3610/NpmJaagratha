import { NextResponse } from 'next/server';

import { getAdvisoriesApiUrl, mapAdvisoriesToFeedItems, type AdvisorySeverity } from '@/lib/advisories';

function parsePage(value: string | null) {
  const page = Number(value ?? '1');
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function parseSeverity(value: string | null): AdvisorySeverity {
  const normalized = (value ?? 'all').toLowerCase();
  if (normalized === 'critical' || normalized === 'high' || normalized === 'medium' || normalized === 'low') {
    return normalized;
  }

  return 'all';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parsePage(url.searchParams.get('page'));
  const severity = parseSeverity(url.searchParams.get('severity'));
  const sourceUrl = getAdvisoriesApiUrl(page, severity);

  const response = await fetch(sourceUrl, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return NextResponse.json({ advisories: [], lastUpdated: undefined, page, severity }, { status: response.status });
  }

  const payload = (await response.json()) as Parameters<typeof mapAdvisoriesToFeedItems>[0];
  const advisories = mapAdvisoriesToFeedItems(payload);
  const lastUpdated = payload.advisories?.[0]?.updatedAt || payload.advisories?.[0]?.publishedAt || undefined;

  return NextResponse.json({ advisories, lastUpdated, page, severity });
}