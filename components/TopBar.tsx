// components/TopBar.tsx
'use client'
import Link from 'next/link'

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="inline-flex items-center">
            <span className="px-2 py-1 rounded-md border border-neutral-300 text-xs uppercase tracking-widest text-neutral-700">
              6ixlab
            </span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link className="text-sm text-neutral-700 hover:text-neutral-900" href="/collections">Collections</Link>
            <Link className="text-sm text-neutral-700 hover:text-neutral-900" href="/contact">Contact</Link>
            <Link className="text-sm text-neutral-700 hover:text-neutral-900" href="/about">About</Link>
          </nav>
        </div>
      </div>
    </header>
  )
}