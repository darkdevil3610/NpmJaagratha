import { NextResponse } from 'next/server';

type OsvBatchItem = {
  ecosystem: 'npm';
  name: string;
  version?: string;
};

function toPackageQuery(name: string, version?: string): OsvBatchItem {
  return version ? { ecosystem: 'npm', name, version } : { ecosystem: 'npm', name };
}

function normalizePackageName(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeVersion(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const raw = value.trim();
  if (!raw) {
    return undefined;
  }

  if (
    raw.startsWith('workspace:')
    || raw.startsWith('file:')
    || raw.startsWith('link:')
    || raw.startsWith('git+')
    || raw.startsWith('github:')
    || raw.startsWith('http://')
    || raw.startsWith('https://')
  ) {
    return undefined;
  }

  const npmAliasMatch = raw.match(/^npm:[^@]+@(.+)$/);
  const candidate = npmAliasMatch ? npmAliasMatch[1] : raw;

  const semverMatch = candidate.match(/\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?/);
  return semverMatch?.[0];
}

function collectDependenciesWithVersions(parsed: Record<string, unknown>) {
  const dependencySections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
  const entries = new Map<string, string | undefined>();

  for (const section of dependencySections) {
    const block = parsed[section];
    if (!block || typeof block !== 'object' || Array.isArray(block)) {
      continue;
    }

    for (const [name, versionRange] of Object.entries(block)) {
      const normalizedName = normalizePackageName(name);
      if (!normalizedName) {
        continue;
      }

      const normalizedVersion = normalizeVersion(versionRange);
      if (!entries.has(normalizedName) || normalizedVersion) {
        entries.set(normalizedName, normalizedVersion);
      }
    }
  }

  return Array.from(entries.entries()).map(([name, version]) => ({ name, version }));
}

async function fetchVulnerabilities(packages: OsvBatchItem[]) {
  const upstream = 'https://npmscan.com/api/osv/batch';

  try {
    const res = await fetch(upstream, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packages }),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { ok: false, status: res.status, error: 'Failed to query vulnerabilities' };
    }

    const payload = await res.json();
    const results = Array.isArray(payload.results) ? payload.results : [];

    return {
      ok: true,
      results: results.map((entry: { vulns?: Array<{ id?: string; modified?: string }> }, index: number) => ({
        package: packages[index]?.name ?? `package-${index + 1}`,
        ok: true,
        vulns: Array.isArray(entry.vulns)
          ? entry.vulns
              .filter((vuln): vuln is { id: string; modified?: string } => typeof vuln?.id === 'string')
              .map((vuln) => ({ id: vuln.id, modified: vuln.modified }))
          : [],
      })),
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  let packageQueries: OsvBatchItem[] = [];

  if (typeof body.packageJson === 'string') {
    try {
      const parsed = JSON.parse(body.packageJson);

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return NextResponse.json({ error: 'Invalid packageJson' }, { status: 400 });
      }

      const deps = collectDependenciesWithVersions(parsed as Record<string, unknown>);
      packageQueries = deps
        .slice(0, 80)
        .map(({ name, version }) => toPackageQuery(name, version));
    } catch (e) {
      return NextResponse.json({ error: 'Invalid packageJson' }, { status: 400 });
    }
  } else if (typeof body.package === 'string') {
    packageQueries = [toPackageQuery(body.package)];
  } else if (Array.isArray(body.packages)) {
    packageQueries = body.packages
      .filter((p) => typeof p === 'string')
      .map((name) => toPackageQuery(name));
  }

  if (packageQueries.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const deduped = new Map<string, OsvBatchItem>();
  for (const item of packageQueries) {
    const name = normalizePackageName(item.name);
    if (!name) {
      continue;
    }

    const dedupeKey = item.version ? `${name}@${item.version}` : name;
    if (!deduped.has(dedupeKey)) {
      deduped.set(dedupeKey, toPackageQuery(name, item.version));
    }
  }

  const query = Array.from(deduped.values()).slice(0, 80);
  const response = await fetchVulnerabilities(query);

  if (!response.ok) {
    return NextResponse.json({ results: [], error: response.error }, { status: response.status ?? 500 });
  }

  return NextResponse.json({ results: response.results, scannedAt: new Date().toISOString() });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pkg = url.searchParams.get('package') ?? url.searchParams.get('pkg');
  if (!pkg) {
    return NextResponse.json({ error: 'missing package query' }, { status: 400 });
  }

  const response = await fetchVulnerabilities([toPackageQuery(pkg)]);
  if (!response.ok) {
    return NextResponse.json({ results: [], error: response.error }, { status: response.status ?? 500 });
  }

  return NextResponse.json({ results: response.results, scannedAt: new Date().toISOString() });
}
