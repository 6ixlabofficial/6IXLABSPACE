// components/CartButton.tsx
'use client'

import Link from 'next/link'
import { useCart } from '@/components/CartContext'
import { useEffect, useState } from 'react'

export default function CartButton() {
  const { items } = useCart()

  // ให้ client render รอบแรกเหมือน SSR (0) เพื่อลด hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const count = items?.reduce((n, i) => n + (i.qty ?? 1), 0) ?? 0
  const display = mounted ? count : 0  // รอบแรก = 0, mount แล้วค่อยเป็นค่าจริง

  return (
    <Link
      href="/checkout"
      aria-label="Open cart / Checkout"
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border
                 border-neutral-300 bg-white/70 hover:bg-white transition"
    >
      {/* ไอคอนรถเข็น */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-neutral-800"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L22 7H6"></path>
      </svg>

      {/* แสดง badge เสมอ แต่ซ่อนถ้า 0; ใช้ display ที่เท่ากับ 0 ก่อน hydrate */}
      <span
        suppressHydrationWarning
        aria-hidden={display === 0}
        className={`absolute -top-1.5 -right-1.5 min-w-[1rem] h-4 px-1 rounded-full
                    text-[10px] flex items-center justify-center
                    ${display === 0 ? 'invisible' : 'bg-neutral-900 text-white'}`}
      >
        {display}
      </span>
    </Link>
  )
}
