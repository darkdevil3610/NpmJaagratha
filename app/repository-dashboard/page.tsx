"use client";

import { FormEvent, useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, FolderSearch, GitBranch, KeyRound, PackageSearch, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button, Metric, Panel, SectionLabel } from '@/components/ui';
import type { RepositoryDashboardScanResponse } from '@/lib/repository-dashboard';

function toRepoLabel(value: RepositoryDashboardScanResponse['repository']) {
  return `${value.owner}/${value.name}`;
}

function formatListCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default function RepositoryDashboardPage() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/vercel/next.js');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RepositoryDashboardScanResponse | null>(null);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' },
    { label: 'Feed', href: '/feed' },
    { label: 'Analyzer', href: '/analyze' },

  ];

  async function scanRepository(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/repository-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? 'Repository scan failed.');
        return;
      }

      setResult(payload as RepositoryDashboardScanResponse);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'Unable to scan repository.');
    } finally {
      setLoading(false);
    }
  }

  const summaryCards = useMemo(() => {
    if (!result) {
      return [];
    }

    return [
      { label: 'Package manifests', value: String(result.summary.manifestCount), tone: 'emerald' as const },
      { label: 'Lockfiles', value: String(result.summary.lockfileCount), tone: 'cyan' as const },
      { label: 'Sensitive files', value: String(result.summary.sensitiveFileCount), tone: 'amber' as const },
      { label: 'Vulnerable deps', value: String(result.summary.vulnerableDependencyCount), tone: 'rose' as const },
    ];
  }, [result]);

  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_42%),linear-gradient(180deg,#050608_0%,#04070c_100%)]">
      <div className="absolute inset-0 opacity-35 grid-overlay" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-white/[0.08] bg-black/30 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Repository Dashboard</div>
          <nav className="flex flex-wrap gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  link.href === '/repository-dashboard'
                    ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
                    : 'border-white/10 bg-white/5 text-zinc-200 hover:border-emerald-300/25 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <Panel className="mb-8 border-emerald-400/15 bg-black/30 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel>Repository Dashboard</SectionLabel>
              <h1 className="mt-4 text-4xl font-semibold uppercase tracking-[0.08em] text-white sm:text-5xl">
                View and scan GitHub repositories.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
                Paste a public GitHub repository URL and the dashboard will inspect the tree for package manifests,
                lockfiles, sensitive files like <span className="text-emerald-200">.env</span>, and dependency vulnerabilities.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
              Public repos only. Sensitive file contents are not displayed.
            </div>
          </div>
        </Panel>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel className="space-y-5 border-emerald-400/15 bg-[#071021]/90">
            <form onSubmit={scanRepository} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.28em] text-zinc-500">GitHub repository URL</label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={repoUrl}
                    onChange={(event) => setRepoUrl(event.target.value)}
                    className="flex-1 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none placeholder:text-zinc-600"
                    placeholder="https://github.com/vercel/next.js"
                  />
                  <Button type="submit" disabled={loading}>
                    <FolderSearch className="h-4 w-4" />
                    {loading ? 'Scanning...' : 'Scan repository'}
                  </Button>
                </div>
                <p className="mt-3 text-sm leading-7 text-zinc-500">
                  Try a repo like https://github.com/vercel/next.js or any public GitHub repository.
                </p>
              </div>
            </form>

            {error ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  Scan failed
                </div>
                <div className="mt-2 text-rose-50/90">{error}</div>
              </div>
            ) : null}

            {result ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                  <Metric key={card.label} label={card.label} value={card.value} tone={card.tone} />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label="Package manifests" value="0" tone="emerald" />
                <Metric label="Lockfiles" value="0" tone="cyan" />
                <Metric label="Sensitive files" value="0" tone="amber" />
                <Metric label="Vulnerable deps" value="0" tone="rose" />
              </div>
            )}

            {result ? (
              <div className="rounded-3xl border border-white/[0.08] bg-black/20 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-emerald-200">Scan summary</div>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{toRepoLabel(result.repository)}</h2>
                  </div>
                  <a
                    href={result.repository.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-emerald-100"
                  >
                    Open repository <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <GitBranch className="h-4 w-4 text-emerald-300" />
                      Default branch
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">{result.repository.defaultBranch}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.24em] text-zinc-500">{result.repository.visibility ?? 'public'}</div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <PackageSearch className="h-4 w-4 text-cyan-300" />
                      Package files
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">{formatListCount(result.summary.manifestCount, 'manifest', 'manifests')}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.24em] text-zinc-500">{formatListCount(result.summary.dependencyCount, 'dependency', 'dependencies')}</div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <ShieldAlert className="h-4 w-4 text-amber-300" />
                      Risk
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">{result.summary.vulnerableDependencyCount > 0 ? 'Attention required' : 'No known vulnerability hits'}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.24em] text-zinc-500">{result.summary.outdatedDependencyCount} potentially outdated</div>
                  </div>
                </div>

                {result.warnings.length > 0 ? (
                  <div className="mt-5 space-y-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                    {result.warnings.map((warning) => (
                      <div key={warning} className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </Panel>

          <div className="space-y-6">
            <Panel className="border-white/[0.08] bg-white/[0.04]">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-zinc-500">
                <KeyRound className="h-4 w-4 text-rose-300" />
                Sensitive file checks
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                <p>Flags filenames like <span className="text-white">.env</span>, <span className="text-white">.npmrc</span>, private keys, and credential stores.</p>
                <p>Only the path and risk reason are shown. File contents are never rendered in the dashboard.</p>
              </div>
            </Panel>

            <Panel className="space-y-4 border-white/[0.08] bg-white/[0.04]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-zinc-500">Detected files</div>
                  <h3 className="mt-2 text-xl font-semibold text-white">Manifest and sensitive paths</h3>
                </div>
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </div>

              {result ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-white">Package manifests</div>
                    <div className="mt-3 space-y-2">
                      {result.manifests.length > 0 ? result.manifests.map((manifest) => (
                        <div key={manifest.path} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-zinc-300">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-white">{manifest.path}</span>
                            <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">{manifest.name ?? 'Unnamed'}</span>
                          </div>
                          <div className="mt-2 grid gap-2 text-xs text-zinc-500 sm:grid-cols-3">
                            <span>{manifest.dependencyCount} deps</span>
                            <span>{manifest.devDependencyCount} dev deps</span>
                            <span>{manifest.scriptsCount} scripts</span>
                          </div>
                        </div>
                      )) : <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-zinc-500">No package.json files found.</div>}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-white">Sensitive files</div>
                    <div className="mt-3 space-y-2">
                      {result.sensitiveFiles.length > 0 ? result.sensitiveFiles.map((finding) => (
                        <div key={finding.path} className="rounded-2xl border border-rose-500/15 bg-rose-500/8 p-4 text-sm text-zinc-300">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-white">{finding.path}</span>
                            <span className="text-xs uppercase tracking-[0.24em] text-rose-200">{finding.category}</span>
                          </div>
                          <div className="mt-2 text-zinc-400">{finding.reason}</div>
                        </div>
                      )) : <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-zinc-500">No sensitive file paths were flagged.</div>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-zinc-500">
                  Scan a repository to list manifests, lockfiles, and sensitive file paths here.
                </div>
              )}
            </Panel>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Panel className="border-white/[0.08] bg-white/[0.04]">
            <div className="text-xs uppercase tracking-[0.26em] text-zinc-500">Lockfiles</div>
            <h3 className="mt-2 text-xl font-semibold text-white">Build provenance</h3>
            <div className="mt-4 space-y-2 text-sm text-zinc-300">
              {result ? (
                result.lockfiles.length > 0 ? result.lockfiles.map((lockfile) => (
                  <div key={lockfile.path} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                    <div className="font-medium text-white">{lockfile.path}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.24em] text-zinc-500">{lockfile.kind} lockfile</div>
                  </div>
                )) : <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-zinc-500">No lockfiles found.</div>
              ) : <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-zinc-500">Lockfiles will appear here after a scan.</div>}
            </div>
          </Panel>

          <Panel className="border-white/[0.08] bg-white/[0.04]">
            <div className="text-xs uppercase tracking-[0.26em] text-zinc-500">Dependency security</div>
            <h3 className="mt-2 text-xl font-semibold text-white">Known vulnerability and outdated dependency check</h3>
            <div className="mt-4 space-y-3">
              {result ? (
                result.packageSecurity.length > 0 ? result.packageSecurity.slice(0, 12).map((dependency) => (
                  <div key={`${dependency.name}-${dependency.version ?? 'latest'}`} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="font-medium text-white">{dependency.name}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.24em] text-zinc-500">
                          {dependency.version ?? 'version not pinned'}
                          {dependency.latestVersion ? ` • latest ${dependency.latestVersion}` : ''}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em]">
                        {dependency.vulnerabilityCount > 0 ? <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-rose-100">{dependency.vulnerabilityCount} vulns</span> : <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-100">No vulns</span>}
                        {dependency.outdated ? <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-100">Outdated</span> : null}
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-zinc-400">
                      {dependency.sourcePaths.join(', ')}
                    </div>
                    {dependency.vulnerabilities.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-300">
                        {dependency.vulnerabilities.slice(0, 4).map((vulnerability) => (
                          <span key={vulnerability.id} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1">{vulnerability.id}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )) : <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-zinc-500">No dependencies found in scanned manifests.</div>
              ) : <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-zinc-500">Run a scan to see dependency security findings here.</div>}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}
