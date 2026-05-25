import { NextResponse } from 'next/server';

type OsvBatchItem = {
  ecosystem: 'npm';
  name: string;
};

function toPackageQuery(name: string): OsvBatchItem {
  return { ecosystem: 'npm', name };
}

function normalizePackageName(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
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

  let packages: string[] = [];
  if (typeof body.package === 'string') {
    packages = [body.package];
  } else if (Array.isArray(body.packages)) {
    packages = body.packages.filter((p) => typeof p === 'string');
  } else if (typeof body.packageJson === 'string') {
    try {
      const parsed = JSON.parse(body.packageJson);
      const deps = Object.assign({}, parsed.dependencies ?? {}, parsed.devDependencies ?? {});
      packages = Object.keys(deps);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid packageJson' }, { status: 400 });
    }
  }

  if (packages.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const unique = Array.from(new Set(packages.map(normalizePackageName).filter(Boolean))).slice(0, 60);
  const query = unique.map(toPackageQuery);
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
