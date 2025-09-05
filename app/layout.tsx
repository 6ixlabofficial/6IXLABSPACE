// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Oswald, Prompt } from 'next/font/google'
import TopBar from '@/components/TopBar'
import { CartProvider } from '@/components/CartContext'  // ✅ เพิ่มบรรทัดนี้
import { Analytics } from "@vercel/analytics/next"

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400','700'],
  variable: '--font-oswald'
})

const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['400','500','600','700'],
  variable: '--font-prompt',
})

export const metadata: Metadata = {
  title: '6IXLAB - Premium Clothing & Design',
  description: 'รับออกแบบชุด, งานกราฟิก, โลโก้ต่างๆ สำหรับเกม FIVEM และงานกราฟฟิกทั่วไป',
icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${oswald.variable} ${prompt.variable} font-oswald bg-white text-neutral-900`}>
        {/* ✅ ครอบทั้งเว็บด้วย CartProvider */}
        <CartProvider>
          <TopBar />
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
