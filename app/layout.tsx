import './globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NpmJaagratha',
  description:
    'Security monitoring for Node.js and npm projects with dependency scanning, secret detection, and supply chain protection.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}