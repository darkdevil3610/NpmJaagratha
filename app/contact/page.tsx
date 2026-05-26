import React from 'react'

export default function ContactPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white/5 backdrop-blur rounded-lg p-8 shadow">
        <h1 className="text-3xl font-bold mb-4">Contact</h1>
        <p className="mb-6">Connect with the project maintainer on LinkedIn.</p>
        <a
          href="https://www.linkedin.com/in/gourav-suresh/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          Connect on LinkedIn
        </a>
      </div>
    </main>
  )
}
