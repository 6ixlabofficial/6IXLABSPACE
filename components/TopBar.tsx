'use client'
import Link from 'next/link'
import Image from 'next/image'
import CartButton from '@/components/CartButton'
import { useCart } from '@/components/CartContext'

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="inline-flex items-center" aria-label="Go to home">
            {/* 🔁 ใช้โลโก้แทนข้อความ 6ixlab */}
            <Image
              src="/images/logo.png"   // ← ใส่ไฟล์จริงของคุณ
              alt="6ixlab"
              width={32}
              height={32}
              priority
              className="block"
            />
            <span className="sr-only">6ixlab</span>
          </Link>

          <nav className="hidden gap-6 md:flex">
            <Link className="text-sm text-neutral-700 hover:text-neutral-900" href="/collections">Collections</Link>
            <Link className="text-sm text-neutral-700 hover:text-neutral-900" href="/contact">Contact</Link>
            <Link className="text-sm text-neutral-700 hover:text-neutral-900" href="/about">About</Link>
          </nav>
        </div>
   {/* ขวา: ปุ่ม Cart */}
        <div className="flex items-center gap-3">
          <CartButton />  {/* ✅ เพิ่มปุ่มตะกร้า */}
        </div>
      </div>
    </header>
  )
}