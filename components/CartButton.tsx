// components/CartButton.tsx
'use client'
import Link from 'next/link'
import { useCart } from '@/components/CartContext'

export default function CartButton() {
  const { count } = useCart()
  return (
    <Link
      href="/checkout"
      className="relative rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50"
    >
      Cart
      {count > 0 && (
        <span className="absolute -right-2 -top-2 rounded-full bg-neutral-900 text-white text-xs px-1.5">
          {count}
        </span>
      )}
    </Link>
  )
}
