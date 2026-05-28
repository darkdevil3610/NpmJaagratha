import { NextResponse } from 'next/server';
import {
  collectDependenciesFromPackageJson,
  detectSensitiveFile,
  getLockfileKind,
  isPackageManifestPath,
  normalizePackageName,
  parseGitHubRepoUrl,
  summarizeManifest,
  type PackageDependencyRecord,
  type PackageSecurityFinding,
  type RepositoryDashboardScanResponse,
} from '@/lib/repository-dashboard';

export const runtime = 'nodejs';

type OsvBatchItem = {
  ecosystem: 'npm';
  name: string;
  version?: string;
};

type RepositoryEntry = {
  kind: 'blob' | 'tree';
  branch: string;
  path: string;
};

function toPackageQuery(name: string, version?: string): OsvBatchItem {
  return version ? { ecosystem: 'npm', name, version } : { ecosystem: 'npm', name };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildHeaders() {
  return {
    Accept: 'text/html,application/xhtml+xml',
    'User-Agent': 'NpmJaagratha',
  };
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: buildHeaders(),
    cache: 'no-store',
  });

  const body = await response.text().catch(() => '');
  return { response, body };
}

async function fetchRawFile(owner: string, repo: string, branch: string, path: string) {
  const encodedPath = path.split('/').map((segment) => encodeURIComponent(segment)).join('/');
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${encodedPath}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'NpmJaagratha' }, cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Unable to read repository file');
  }

  return response.text();
}

function parseRepositoryEntries(html: string, owner: string, repo: string) {
  const linkRegex = new RegExp(
    `href=["']\/${escapeRegExp(owner)}\/${escapeRegExp(repo)}\/(tree|blob)\/([^"'#?]+)["']`,
    'g',
  );

  const entries: RepositoryEntry[] = [];
  let match: RegExpExecArray | null = null;

  while ((match = linkRegex.exec(html)) !== null) {
    const kind = match[1] === 'tree' ? 'tree' : 'blob';
    const rawPath = decodeURIComponent(match[2]).replace(/&amp;/g, '&');
    const segments = rawPath.split('/').filter(Boolean);
    const branch = segments.shift();

    if (!branch) {
      continue;
    }

    entries.push({
      kind,
      branch,
      path: segments.join('/'),
    });
  }

  return entries;
}

function findBranchCandidate(entries: RepositoryEntry[], fallback = 'main') {
  return entries.find((entry) => entry.branch)?.branch ?? fallback;
}

function normalizeRepositoryEntry(entry: RepositoryEntry) {
  return `${entry.branch}:${entry.path}`;
}

async function crawlRepository(owner: string, repo: string) {
  const rootUrl = `https://github.com/${owner}/${repo}`;
  const root = await fetchHtml(rootUrl);

  if (!root.response.ok) {
    const status = root.response.status === 404 ? 404 : 502;
    throw new Error(status === 404 ? 'Repository not found or not publicly accessible.' : 'Unable to access the repository page.');
  }

  const discovered = new Map<string, RepositoryEntry>();
  const queue: RepositoryEntry[] = [];

  for (const entry of parseRepositoryEntries(root.body, owner, repo)) {
    const key = normalizeRepositoryEntry(entry);
    if (!discovered.has(key)) {
      discovered.set(key, entry);
      if (entry.kind === 'tree' && entry.path) {
        queue.push(entry);
      }
    }
  }

  let branch = findBranchCandidate(Array.from(discovered.values()), 'main');

  const visitedTrees = new Set<string>();
  const maxTrees = 120;
  const maxFiles = 900;

  while (queue.length > 0 && visitedTrees.size < maxTrees && discovered.size < maxFiles) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const treeKey = normalizeRepositoryEntry(current);
    if (visitedTrees.has(treeKey)) {
      continue;
    }
    visitedTrees.add(treeKey);

    branch = current.branch || branch;
    const encodedPath = current.path ? `/${current.path.split('/').map((segment) => encodeURIComponent(segment)).join('/')}` : '';
    const treeUrl = `https://github.com/${owner}/${repo}/tree/${encodeURIComponent(branch)}${encodedPath}`;
    const treePage = await fetchHtml(treeUrl);

    if (!treePage.response.ok) {
      continue;
    }

    for (const entry of parseRepositoryEntries(treePage.body, owner, repo)) {
      if (entry.branch !== branch && entry.path) {
        branch = entry.branch;
      }

      const key = normalizeRepositoryEntry(entry);
      if (!discovered.has(key)) {
        discovered.set(key, entry);
        if (entry.kind === 'tree' && entry.path) {
          queue.push(entry);
        }
      }
    }
  }

  return { branch, entries: Array.from(discovered.values()) };
}

async function fetchLatestVersion(packageName: string) {
  const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    return undefined;
  }

  const payload = await response.json().catch(() => null);
  const latest = payload && typeof payload === 'object' && !Array.isArray(payload)
    ? (payload as { ['dist-tags']?: { latest?: unknown } })['dist-tags']?.latest
    : undefined;

  return typeof latest === 'string' ? latest : undefined;
}

async function fetchVulnerabilities(packages: OsvBatchItem[]) {
  if (packages.length === 0) {
    return [];
  }

  const response = await fetch('https://npmscan.com/api/osv/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packages }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to query vulnerability database');
  }

  const payload = await response.json();
  const results = Array.isArray(payload.results) ? payload.results : [];

  return results.map((entry: { vulns?: Array<{ id?: string; modified?: string }> }, index: number) => ({
    package: packages[index]?.name ?? `package-${index + 1}`,
    version: packages[index]?.version,
    vulnerabilities: Array.isArray(entry.vulns)
      ? entry.vulns
          .filter((vuln): vuln is { id: string; modified?: string } => typeof vuln?.id === 'string')
          .map((vuln) => ({ id: vuln.id, modified: vuln.modified }))
      : [],
  }));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const repoUrl = typeof body.repoUrl === 'string' ? body.repoUrl : '';
  const repoRef = parseGitHubRepoUrl(repoUrl);

  if (!repoRef) {
    return NextResponse.json({ error: 'Provide a valid public GitHub repository URL.' }, { status: 400 });
  }

  try {
    const { branch, entries } = await crawlRepository(repoRef.owner, repoRef.repo);
    const allPaths = entries.map((entry) => entry.path).filter(Boolean);

    const packageJsonPaths = allPaths.filter(isPackageManifestPath).sort((left, right) => {
      if (left === 'package.json') {
        return -1;
      }

      if (right === 'package.json') {
        return 1;
      }

      return left.localeCompare(right);
    }).slice(0, 5);

    const lockfiles = allPaths
      .map((path) => ({ path, kind: getLockfileKind(path) }))
      .filter((entry): entry is { path: string; kind: string } => Boolean(entry.kind));

    const sensitiveFiles = allPaths
      .map((path) => detectSensitiveFile(path))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

    const manifests = [] as Array<{ summary: ReturnType<typeof summarizeManifest>; dependencies: PackageDependencyRecord[] }>;

    for (const path of packageJsonPaths) {
      try {
        const raw = await fetchRawFile(repoRef.owner, repoRef.repo, branch, path);
        const parsed = JSON.parse(raw);

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          continue;
        }

        const manifest = parsed as Record<string, unknown>;
        manifests.push({
          summary: summarizeManifest(manifest, path),
          dependencies: collectDependenciesFromPackageJson(manifest, path),
        });
      } catch {
        continue;
      }
    }

    const dependencyMap = new Map<string, PackageDependencyRecord & { sourcePaths: Set<string> }>();
    for (const manifest of manifests) {
      for (const dependency of manifest.dependencies) {
        const key = dependency.version ? `${dependency.name}@${dependency.version}` : dependency.name;
        const existing = dependencyMap.get(key);

        if (!existing) {
          dependencyMap.set(key, { ...dependency, sourcePaths: new Set([dependency.sourcePath]) });
        } else {
          existing.sourcePaths.add(dependency.sourcePath);
          if (!existing.version && dependency.version) {
            existing.version = dependency.version;
          }
        }
      }
    }

    const dependencyRecords = Array.from(dependencyMap.values()).slice(0, 60);
    const latestVersionMap = new Map<string, string | undefined>();
    const packageNames = Array.from(new Set(dependencyRecords.map((entry) => normalizePackageName(entry.name)))).filter(Boolean).slice(0, 30);

    await Promise.all(
      packageNames.map(async (name) => {
        latestVersionMap.set(name, await fetchLatestVersion(name));
      }),
    );

    const vulnerabilityResults = await fetchVulnerabilities(
      dependencyRecords.map((entry) => toPackageQuery(entry.name, entry.version)),
    );

    const packageSecurity: PackageSecurityFinding[] = dependencyRecords.map((entry, index) => {
      const latestVersion = latestVersionMap.get(entry.name);
      const vulnerabilityResult = vulnerabilityResults[index];
      const sources = Array.from(entry.sourcePaths);
      const normalizedVersion = entry.version;

      return {
        name: entry.name,
        version: normalizedVersion,
        latestVersion,
        outdated: Boolean(normalizedVersion && latestVersion && normalizedVersion !== latestVersion),
        sourcePaths: sources,
        vulnerabilityCount: vulnerabilityResult?.vulnerabilities.length ?? 0,
        vulnerabilities: vulnerabilityResult?.vulnerabilities ?? [],
      };
    }).sort((left, right) => {
      if (right.vulnerabilityCount !== left.vulnerabilityCount) {
        return right.vulnerabilityCount - left.vulnerabilityCount;
      }

      if (right.outdated !== left.outdated) {
        return Number(right.outdated) - Number(left.outdated);
      }

      return left.name.localeCompare(right.name);
    });

    const response: RepositoryDashboardScanResponse = {
      repository: {
        owner: repoRef.owner,
        name: repoRef.repo,
        fullName: `${repoRef.owner}/${repoRef.repo}`,
        url: `https://github.com/${repoRef.owner}/${repoRef.repo}`,
        defaultBranch: branch,
        visibility: 'public',
      },
      manifests: manifests.map((manifest) => manifest.summary),
      lockfiles,
      sensitiveFiles,
      packageSecurity,
      summary: {
        manifestCount: manifests.length,
        lockfileCount: lockfiles.length,
        sensitiveFileCount: sensitiveFiles.length,
        dependencyCount: packageSecurity.length,
        vulnerableDependencyCount: packageSecurity.filter((entry) => entry.vulnerabilityCount > 0).length,
        outdatedDependencyCount: packageSecurity.filter((entry) => entry.outdated).length,
      },
      warnings: [
        manifests.length === 0 ? 'No package.json files were found in the scanned repository.' : '',
        sensitiveFiles.length > 0 ? 'Sensitive file paths were detected. Review access controls before publishing secrets.' : '',
        dependencyRecords.length >= 60 ? 'Dependency analysis was capped to the first 60 discovered packages.' : '',
      ].filter(Boolean),
      scannedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to scan repository.' },
      { status: 500 },
    );
  }
}
