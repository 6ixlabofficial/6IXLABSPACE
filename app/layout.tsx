import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '6ixlab — Minimal Shop',
  description: 'Quiet luxury essentials. Thailand.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
