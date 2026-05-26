"use client";

import { useState } from 'react';
import { AlertTriangle, FileJson2, ShieldCheck, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui';

type AnalyzeResult = {
  package: string;
  ok: boolean;
  status?: number;
  error?: string;
  vulns?: Array<{
    id: string;
    modified?: string;
  }>;
};

type PackageSummary = {
  package: string;
  vulnerabilityCount: number;
  topVulnerabilities: Array<{ id: string; modified?: string }>;
};

function formatModified(value?: string) {
  if (!value) {
    return 'Updated recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Updated recently';
  }

  return `Updated ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeJsonInput(raw: string) {
  const trimmed = raw.trim();

  if (!trimmed) {
    return '';
  }

  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const unwrapped = fencedMatch ? fencedMatch[1].trim() : trimmed;

  const firstBrace = unwrapped.indexOf('{');
  const lastBrace = unwrapped.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return unwrapped.slice(firstBrace, lastBrace + 1);
  }

  return unwrapped;
}

function getPackageSummary(result: AnalyzeResult): PackageSummary {
  const vulns = Array.isArray(result.vulns) ? result.vulns.filter((vuln) => typeof vuln.id === 'string') : [];

  return {
    package: result.package,
    vulnerabilityCount: vulns.length,
    topVulnerabilities: vulns.slice(0, 3),
  };
}

function getRiskLabel(count: number) {
  if (count === 0) {
    return { tone: 'safe', label: 'SAFE' };
  }

  if (count <= 2) {
    return { tone: 'low', label: 'LOW' };
  }

  if (count <= 5) {
    return { tone: 'medium', label: 'MEDIUM' };
  }

  return { tone: 'high', label: 'HIGH' };
}

export default function AnalyzerPage() {
  const [pkg, setPkg] = useState('react');
  const [packageJson, setPackageJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalyzeResult[] | null>(null);

  async function scanPackage(name: string) {
    setLoading(true);
    setResults(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: name }),
      });

      const payload = await res.json();
      setResults((payload.results ?? []).map((result: AnalyzeResult) => ({ ...result, package: result.package ?? name })));
    } catch (err) {
      setResults([{ package: name, ok: false, error: String(err) }]);
    } finally {
      setLoading(false);
    }
  }

  async function scanPackageJson(raw: string) {
    setLoading(true);
    setResults(null);

    try {
      const normalized = normalizeJsonInput(raw);
      let parsed: Record<string, unknown> = {};
      try {
        const parsedJson = JSON.parse(normalized);
        if (isRecord(parsedJson)) {
          parsed = parsedJson;
        } else {
          setResults([{ package: 'package.json', ok: false, error: 'package.json must be a JSON object' }]);
          return;
        }
      } catch (e) {
        setResults([{ package: 'package.json', ok: false, error: 'Invalid JSON' }]);
        return;
      }

      const dependencies = isRecord(parsed.dependencies) ? parsed.dependencies : {};
      const devDependencies = isRecord(parsed.devDependencies) ? parsed.devDependencies : {};
      const names = Array.from(new Set([...Object.keys(dependencies), ...Object.keys(devDependencies)]));

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages: names, packageJson: normalized }),
      });

      const payload = await res.json();
      setResults((payload.results ?? []) as AnalyzeResult[]);
    } catch (err) {
      setResults([{ package: 'package.json', ok: false, error: String(err) }]);
    } finally {
      setLoading(false);
    }
  }

  const successfulResults = results?.filter((result) => result.ok) ?? [];
  const failedResults = results?.filter((result) => !result.ok) ?? [];
  const hasResults = Boolean(results && results.length > 0);
  const totalVulns = results?.reduce((count, result) => count + (result.ok ? (result.vulns?.length ?? 0) : 0), 0) ?? 0;
  const overallRisk = getRiskLabel(totalVulns);

  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.16),_transparent_42%),linear-gradient(180deg,#050508_0%,#04070d_100%)]">
      <div className="absolute inset-0 opacity-35 grid-overlay" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-red-500/20 bg-black/30 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.32em] text-red-200/80">Analyzer</div>
              <h1 className="mt-3 text-4xl font-semibold uppercase tracking-[0.08em] text-white sm:text-5xl">ANALYZE YOUR PROJECT</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
                Scan your package.json for known vulnerabilities. Get instant analysis of CVEs and security advisories.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button href="/" variant="ghost">Home</Button>
              <Button href="/search" variant="ghost">Search</Button>
              <Button href="/feed" variant="ghost">Feed</Button>
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-red-500/20 bg-[#071021]/90 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <label className="text-xs uppercase tracking-[0.28em] text-zinc-500">Package name</label>
              <div className="mt-3 flex gap-2">
                <input
                  value={pkg}
                  onChange={(e) => setPkg(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-zinc-600"
                  placeholder="react"
                />
                <Button onClick={() => scanPackage(pkg)} disabled={loading}>
                  {loading ? 'Scanning...' : 'Scan package'}
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-red-500/20 bg-[#071021]/90 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs uppercase tracking-[0.28em] text-zinc-500">Package.json content</label>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-zinc-300">
                  <FileJson2 className="h-3.5 w-3.5" /> json
                </div>
              </div>
              <textarea
                value={packageJson}
                onChange={(e) => setPackageJson(e.target.value)}
                rows={14}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-black/35 p-4 font-mono text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
                placeholder='Paste your package.json or package-lock.json here...'
              />
              <div className="mt-3 flex justify-end">
                <Button onClick={() => scanPackageJson(packageJson)} disabled={loading}>
                  {loading ? 'Scanning...' : 'Scan package.json'}
                </Button>
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-[#071021]/80 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 p-2 text-black">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-white">PACKAGE.JSON TIPS</div>
                    <div className="mt-1 text-xs text-zinc-400">Simple package.json hygiene tips to reduce risk and improve determinism.</div>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="rounded-lg border border-white/6 bg-black/40 p-4">
                    <div className="text-sm font-semibold text-emerald-200">Use Overrides for Safety</div>
                    <div className="mt-2 text-xs text-zinc-400">Force specific versions of dependencies to avoid compatibility issues and security vulnerabilities:</div>
                    <pre className="mt-3 overflow-auto rounded-md border border-white/6 bg-black/30 p-3 font-mono text-xs text-zinc-200">{`{
  "overrides": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}`}</pre>
                    <div className="mt-2 text-xs text-zinc-500">Ensures all packages use the same React version, preventing version conflicts.</div>
                  </div>

                  <div className="rounded-lg border border-white/6 bg-black/40 p-4">
                    <div className="text-sm font-semibold text-emerald-200">Pin Your Package Manager</div>
                    <div className="mt-2 text-xs text-zinc-400">Lock your team to the same package manager version to avoid resolver changes:</div>
                    <pre className="mt-3 overflow-auto rounded-md border border-white/6 bg-black/30 p-3 font-mono text-xs text-zinc-200">{`{
  "packageManager": "npm@10.8.1"
}`}</pre>
                  </div>

                  <div className="rounded-lg border border-white/6 bg-black/40 p-4">
                    <div className="text-sm font-semibold text-emerald-200">Declare Runtime Versions</div>
                    <div className="mt-2 text-xs text-zinc-400">Signal supported Node and npm versions:</div>
                    <pre className="mt-3 overflow-auto rounded-md border border-white/6 bg-black/30 p-3 font-mono text-xs text-zinc-200">{`{
  "engines": {
    "node": ">=18.18 <21",
    "npm": "^10"
  }
}`}</pre>
                  </div>

                  <div className="rounded-lg border border-white/6 bg-black/40 p-4">
                    <div className="text-sm font-semibold text-emerald-200">Prevent Accidental Publish</div>
                    <div className="mt-2 text-xs text-zinc-400">Mark non-library apps as private to block npm publish:</div>
                    <pre className="mt-3 overflow-auto rounded-md border border-white/6 bg-black/30 p-3 font-mono text-xs text-zinc-200">{`{
  "private": true
}`}</pre>
                  </div>

                  <div className="rounded-lg border border-white/6 bg-black/40 p-4">
                    <div className="text-sm font-semibold text-emerald-200">Semver Ranges: Know Your Risk</div>
                    <div className="mt-2 text-xs text-zinc-400">Prefer exact or tilde ranges for critical deps; caret ranges can pull in unexpected minor versions.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-red-500/20 bg-[#071021]/90 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-500/30 bg-slate-500/10 text-slate-200">
                  {hasResults && failedResults.length === 0 ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">{hasResults && failedResults.length === 0 ? 'Scan complete' : 'Ready to scan'}</div>
                  <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.06em] text-white">
                    {hasResults && failedResults.length === 0 ? 'PACKAGE ANALYSIS' : 'PACKAGE ANALYSIS'}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-zinc-400">
                    {hasResults
                      ? 'The analyzer now uses the OSV batch endpoint and shows vulnerability IDs for each package.'
                      : 'Click a scan button to populate the results panel with readable vulnerability cards for each package.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Total packages</div>
                  <div className="mt-2 text-3xl font-semibold text-white">{results?.length ?? 0}</div>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-emerald-100/70">Vulnerabilities</div>
                  <div className="mt-2 text-3xl font-semibold text-emerald-100">{totalVulns}</div>
                </div>
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-red-100/80">Errors</div>
                  <div className="mt-2 text-3xl font-semibold text-red-100">{failedResults.length}</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-red-500/20 bg-[#071021]/90 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold uppercase tracking-[0.08em] text-white">Package analysis</h3>
                  <p className="mt-1 text-sm text-zinc-500">Each package card now shows human-readable vulnerability rows and quick status badges.</p>
                </div>
                <div className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-red-100">
                  vuln view
                </div>
              </div>

              {!hasResults ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400">
                  No results yet. Run a scan to see package vulnerability cards here.
                </div>
              ) : (
                <div className="max-h-[680px] space-y-4 overflow-auto pr-1">
                  {results?.map((result) => {
                    if (!result.ok) {
                      return (
                        <div key={result.package} className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm uppercase tracking-[0.24em] text-red-100/80">{result.package}</div>
                              <div className="mt-1 text-xs text-red-100/60">Analysis failed</div>
                            </div>
                            <div className="rounded-full border border-red-400/20 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.24em] text-red-100">
                              error
                            </div>
                          </div>
                          <pre className="mt-4 overflow-auto rounded-2xl border border-white/10 bg-black/35 p-4 text-xs leading-6 text-red-50/90">
{JSON.stringify(
  {
    package: result.package,
    ok: result.ok,
    status: result.status,
    error: result.error,
  },
  null,
  2,
)}
                          </pre>
                        </div>
                      );
                    }

                    const summary = getPackageSummary(result);
                    const risk = getRiskLabel(summary.vulnerabilityCount);
                    const visibleVulns = summary.topVulnerabilities;
                    const remainingCount = Math.max(0, summary.vulnerabilityCount - visibleVulns.length);

                    return (
                      <div key={result.package} className="rounded-2xl border border-[#24408a] bg-[linear-gradient(180deg,rgba(28,44,76,0.95),rgba(11,17,29,0.96))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="text-2xl font-semibold uppercase tracking-[0.06em] text-white">{summary.package}</div>
                            <div className="mt-2 text-xs uppercase tracking-[0.28em] text-zinc-500">{summary.vulnerabilityCount} vulnerabilities detected</div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white ${risk.tone === 'safe' ? 'bg-emerald-500' : risk.tone === 'low' ? 'bg-blue-500' : risk.tone === 'medium' ? 'bg-orange-500' : 'bg-red-500'}`}>
                              {risk.label}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                          <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100">
                              {summary.vulnerabilityCount} findings
                            </div>
                            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">OSV batch</div>
                          </div>

                          <div className="space-y-3">
                            {visibleVulns.map((vuln) => (
                              <a
                                key={vuln.id}
                                href={`https://osv.dev/vulnerability/${encodeURIComponent(vuln.id)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#111827] px-3 py-3 transition hover:border-red-400/40 hover:bg-[#141d2f]"
                              >
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                                  <div>
                                    <div className="font-mono text-sm font-semibold text-zinc-100">{vuln.id}</div>
                                    <div className="mt-1 text-xs text-zinc-500">{formatModified(vuln.modified)}</div>
                                  </div>
                                </div>
                                <div className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] text-red-100">
                                  View
                                </div>
                              </a>
                            ))}
                          </div>

                          {remainingCount > 0 ? (
                            <div className="mt-4 text-center text-sm uppercase tracking-[0.24em] text-zinc-500">
                              + {remainingCount} more vulnerabilities
                            </div>
                          ) : null}

                          {summary.vulnerabilityCount === 0 ? (
                            <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                              <ShieldCheck className="h-4 w-4" /> No known vulnerabilities
                            </div>
                          ) : null}

                          {summary.vulnerabilityCount > 0 ? (
                            <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                              <AlertTriangle className="h-4 w-4" /> {summary.vulnerabilityCount} vulnerabilities detected
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
