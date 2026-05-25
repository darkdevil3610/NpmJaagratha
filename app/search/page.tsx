import type { Metadata } from 'next';

import { SearchPackagesPage } from '@/components/search-packages-page';

export const metadata: Metadata = {
  title: 'Search npm Packages | NpmJaagratha',
  description:
    'Real-time npm package search with metadata, package details, and dependency-focused intelligence.',
};

export default function SearchPage() {
  return <SearchPackagesPage />;
}