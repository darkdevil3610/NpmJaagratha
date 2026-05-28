export type GitHubRepositoryRef = {
  owner: string;
  repo: string;
};

export type PackageManifestSummary = {
  path: string;
  name?: string;
  dependencyCount: number;
  devDependencyCount: number;
  scriptsCount: number;
};

export type PackageDependencyRecord = {
  name: string;
  version?: string;
  sourcePath: string;
  scope: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';
};

export type SensitiveFileFinding = {
  path: string;
  category: string;
  reason: string;
};

export type PackageSecurityFinding = {
  name: string;
  version?: string;
  latestVersion?: string;
  outdated: boolean;
  sourcePaths: string[];
  vulnerabilityCount: number;
  vulnerabilities: Array<{ id: string; modified?: string }>;
};

export type RepositoryDashboardScanResponse = {
  repository: {
    owner: string;
    name: string;
    fullName: string;
    url: string;
    defaultBranch: string;
    description?: string;
    visibility?: string;
  };
  manifests: PackageManifestSummary[];
  lockfiles: Array<{ path: string; kind: string }>;
  sensitiveFiles: SensitiveFileFinding[];
  packageSecurity: PackageSecurityFinding[];
  summary: {
    manifestCount: number;
    lockfileCount: number;
    sensitiveFileCount: number;
    dependencyCount: number;
    vulnerableDependencyCount: number;
    outdatedDependencyCount: number;
  };
  warnings: string[];
  scannedAt: string;
};

export function parseGitHubRepoUrl(input: string): GitHubRepositoryRef | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const prefixed = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(prefixed);

    if (!/(^|\.)github\.com$/i.test(url.hostname)) {
      return null;
    }

    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length < 2) {
      return null;
    }

    const owner = decodeURIComponent(segments[0]).replace(/\.$/, '');
    const repo = decodeURIComponent(segments[1]).replace(/\.git$/i, '');

    if (!owner || !repo) {
      return null;
    }

    return { owner, repo };
  } catch {
    return null;
  }
}

export function normalizePackageName(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeVersion(value: unknown) {
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

export function isPackageManifestPath(path: string) {
  return path === 'package.json' || path.endsWith('/package.json');
}

export function getLockfileKind(path: string) {
  if (path === 'package-lock.json' || path.endsWith('/package-lock.json')) {
    return 'npm';
  }

  if (path === 'pnpm-lock.yaml' || path.endsWith('/pnpm-lock.yaml')) {
    return 'pnpm';
  }

  if (path === 'yarn.lock' || path.endsWith('/yarn.lock')) {
    return 'yarn';
  }

  if (path === 'bun.lockb' || path.endsWith('/bun.lockb') || path === 'bun.lock' || path.endsWith('/bun.lock')) {
    return 'bun';
  }

  return null;
}

export function detectSensitiveFile(path: string): SensitiveFileFinding | null {
  const normalized = path.replace(/\\/g, '/');

  const patterns: Array<{ test: RegExp; category: string; reason: string }> = [
    {
      test: /(^|\/)(\.env(?:\.[^/]+)?|\.envrc)$/i,
      category: 'environment file',
      reason: 'Environment files can contain secrets, API keys, or private configuration.',
    },
    {
      test: /(^|\/)(\.npmrc|\.yarnrc(?:\.yml)?|\.git-credentials|\.netrc)$/i,
      category: 'tooling credentials',
      reason: 'Package manager and git config files can store registry or auth tokens.',
    },
    {
      test: /(^|\/)(id_rsa|id_ed25519|.*\.(?:pem|key|pfx|p12|crt|cer|der|jks|keystore))$/i,
      category: 'private key or certificate',
      reason: 'Key and certificate files may expose secrets or signing material.',
    },
    {
      test: /(^|\/)(aws\/credentials|\.aws\/credentials|credentials\.[^/]+|secrets\.[^/]+)$/i,
      category: 'credential store',
      reason: 'Credential or secrets files should not be committed publicly.',
    },
    {
      test: /(^|\/)(docker\/config\.json|\.docker\/config\.json)$/i,
      category: 'container credentials',
      reason: 'Docker config files may include registry authentication data.',
    },
  ];

  for (const pattern of patterns) {
    if (pattern.test.test(normalized)) {
      return {
        path,
        category: pattern.category,
        reason: pattern.reason,
      };
    }
  }

  return null;
}

export function collectDependenciesFromPackageJson(parsed: Record<string, unknown>, sourcePath: string) {
  const dependencySections: Array<PackageDependencyRecord['scope']> = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ];

  const entries: PackageDependencyRecord[] = [];

  for (const scope of dependencySections) {
    const block = parsed[scope];
    if (!block || typeof block !== 'object' || Array.isArray(block)) {
      continue;
    }

    for (const [name, versionRange] of Object.entries(block)) {
      const normalizedName = normalizePackageName(name);
      if (!normalizedName) {
        continue;
      }

      entries.push({
        name: normalizedName,
        version: normalizeVersion(versionRange),
        sourcePath,
        scope,
      });
    }
  }

  return entries;
}

export function summarizeManifest(parsed: Record<string, unknown>, sourcePath: string): PackageManifestSummary {
  const dependencies = parsed.dependencies;
  const devDependencies = parsed.devDependencies;
  const scripts = parsed.scripts;

  return {
    path: sourcePath,
    name: typeof parsed.name === 'string' ? parsed.name : undefined,
    dependencyCount: dependencies && typeof dependencies === 'object' && !Array.isArray(dependencies) ? Object.keys(dependencies).length : 0,
    devDependencyCount: devDependencies && typeof devDependencies === 'object' && !Array.isArray(devDependencies) ? Object.keys(devDependencies).length : 0,
    scriptsCount: scripts && typeof scripts === 'object' && !Array.isArray(scripts) ? Object.keys(scripts).length : 0,
  };
}
