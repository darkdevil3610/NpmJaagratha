import type { FeedItem } from '@/components/landing-page';

export type AdvisorySeverity = 'all' | 'critical' | 'high' | 'medium' | 'low';

export type AdvisoriesApiResponse = {
  advisories?: Array<{
    id?: string;
    cve?: string | null;
    ghsaUrl?: string;
    summary?: string;
    severity?: string;
    publishedAt?: string;
    updatedAt?: string;
    packages?: Array<{
      name?: string;
      affectedRange?: string;
      patchedVersion?: string | null;
    }>;
  }>;
};

export function formatApiDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toUTCString();
}

export function mapAdvisoriesToFeedItems(payload: AdvisoriesApiResponse): FeedItem[] {
  return (payload.advisories ?? []).map((advisory) => {
    const packageNames = advisory.packages?.map((entry) => entry.name).filter(Boolean) ?? [];
    const headline = advisory.summary || advisory.id || 'Reviewed npm advisory';

    return {
      title: [advisory.id, advisory.cve].filter(Boolean).join(' ') || headline,
      href: advisory.ghsaUrl,
      pubDate: advisory.publishedAt,
      severity: advisory.severity?.trim().replace(/^[a-z]/, (character) => character.toUpperCase()) ?? 'Unknown',
      packageName: packageNames.slice(0, 3).join(', ') || 'npm',
      subtitle: headline,
    } satisfies FeedItem;
  });
}

export function getAdvisoriesApiUrl(page: number, severity: AdvisorySeverity) {
  const searchParams = new URLSearchParams({ page: String(page) });

  if (severity !== 'all') {
    searchParams.set('severity', severity);
  }

  return `https://npmscan.com/api/advisories/latest?${searchParams.toString()}`;
}