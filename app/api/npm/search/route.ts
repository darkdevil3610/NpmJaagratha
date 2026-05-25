import { NextResponse } from 'next/server';

function parseSize(value: string | null) {
  const size = Number(value ?? '8');
  if (!Number.isFinite(size)) {
    return 8;
  }

  return Math.min(Math.max(Math.floor(size), 1), 20);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') ?? '').trim();
  const size = parseSize(url.searchParams.get('size'));

  if (!query) {
    return NextResponse.json({ objects: [], total: 0, time: new Date().toISOString() });
  }

  const upstreamUrl = new URL('https://npmscan.com/api/npm/search');
  upstreamUrl.searchParams.set('q', query);
  upstreamUrl.searchParams.set('size', String(size));

  const response = await fetch(upstreamUrl.toString(), {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return NextResponse.json({ objects: [], total: 0, time: new Date().toISOString() }, { status: response.status });
  }

  const payload = await response.json();
  return NextResponse.json(payload);
}