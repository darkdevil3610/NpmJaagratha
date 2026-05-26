import React from 'react'

export default function SecurityPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-3xl w-full bg-white/5 backdrop-blur rounded-lg p-8 shadow">
        <h1 className="text-3xl font-bold mb-4">Security</h1>

        <p className="mb-4">
          NpmJaagratha takes security seriously. If you discover a vulnerability or
          security issue, please report it privately so we can triage and remediate it.
        </p>

        <h2 className="text-xl font-semibold mt-4 mb-2">How to report</h2>
        <ol className="list-decimal list-inside mb-4">
          <li>Describe the issue with steps to reproduce.</li>
          <li>Include affected package name and version (if applicable).</li>
          <li>Provide any PoC code or logs that help reproduce the problem.</li>
        </ol>

        <h2 className="text-xl font-semibold mt-4 mb-2">Contact</h2>
        <p className="mb-4">Connect securely via LinkedIn or use the contact page:</p>
        <div className="flex gap-3">
          <a
            href="https://www.linkedin.com/in/gourav-suresh/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            LinkedIn
          </a>
          <a
            href="/contact"
            className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
          >
            Contact page
          </a>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Policy</h2>
        <p className="text-sm text-muted-foreground">
          We aim to acknowledge reports within 3 business days and coordinate fixes.
        </p>
      </div>
    </main>
  )
}
