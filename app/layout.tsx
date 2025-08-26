import type { Metadata } from 'next'
import './globals.css'
import { Oswald } from 'next/font/google'

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400'], // เลือกน้ำหนักที่อยากใช้
  variable: '--font-oswald'
})

export const metadata: Metadata = {
  title: '6ixlab — Minimal Shop',
  description: 'Quiet luxury essentials. Thailand.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${oswald.variable} font-oswald`}>{children}</body>
    </html>
  )
}
