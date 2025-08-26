// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Oswald } from 'next/font/google'
import TopBar from '@/components/TopBar'  // ✅ เพิ่มบรรทัดนี้

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
      {/* ✅ คงการตั้งฟอนต์ไว้เหมือนเดิม และเพิ่มสไตล์พื้นฐานได้ตามต้องการ */}
      <body className={`${oswald.variable} font-oswald bg-white text-neutral-900`}>
        <TopBar />        {/* ✅ แสดง TopBar ทุกหน้า */}
        {children}
      </body>
    </html>
  )
}
