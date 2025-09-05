// components/ProductDetail.tsx
'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '@/components/CartContext'

type ProductLike = {
  id: string
  name: string
  thName?: string
  price: number
  images: string[]
  description?: string
}

export default function ProductDetail({
  product,
  onClose,
}: {
  product: ProductLike
  onClose: () => void
}) {
  const { addItem } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const total = product.images.length
  const goPrev = () => setActiveImage((i) => (i - 1 + total) % total)
  const goNext = () => setActiveImage((i) => (i + 1) % total)

  // คีย์บอร์ด: Esc / ← / →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white p-4 sm:p-6 md:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="sticky top-0 ml-auto block rounded-sm border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50"
        >
          ✕ Close
        </button>

        {/* เลย์เอาต์ 2 คอลัมน์ */}
        <div className="grid gap-6 md:grid-cols-2 md:items-start">
          {/* ซ้าย: รูป + ปุ่มเลื่อน + แถบรูปย่อ */}
          <div>
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
              onTouchStart={(e) => (touchStartX.current = e.changedTouches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchStartX.current == null) return
                const dx = e.changedTouches[0].clientX - touchStartX.current
                if (Math.abs(dx) > 40) (dx < 0 ? goNext : goPrev)()
                touchStartX.current = null
              }}
            >
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                width={1200}
                height={1500}
                className="h-full w-full object-cover"
                sizes="(min-width:1024px) 50vw, 100vw"
                priority
              />

              {total > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full 
                    bg-white/30 text-black backdrop-blur px-3 py-2 text-lg shadow hover:bg-white/40"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>

                  <button
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full 
                    bg-white/30 text-black backdrop-blur px-3 py-2 text-lg shadow hover:bg-white/40"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {total > 1 && (
              <div className="mt-3 flex gap-2">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    className={`h-20 w-16 overflow-hidden rounded-md border ${
                      i === activeImage ? 'border-neutral-900' : 'border-neutral-200'
                    }`}
                    onClick={() => setActiveImage(i)}
                    title={`ภาพที่ ${i + 1}`}
                  >
                    <Image
                      src={src}
                      alt={`preview-${i}`}
                      width={120}
                      height={150}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ขวา: รายละเอียด */}
          <div className="md:sticky md:top-8">
            <h2 className="text-3xl md:text-4xl font-oswald tracking-tight text-neutral-900">
              {product.name}
            </h2>
            {product.thName && (
              <p className="mt-2 font-prompt text-lg md:text-xl text-neutral-700">
                {product.thName}
              </p>
            )}
            <p className="mt-2 text-xl md:text-2xl font-semibold text-neutral-900">
              {new Intl.NumberFormat('th-TH', {
                style: 'currency',
                currency: 'THB',
                maximumFractionDigits: 0,
              }).format(product.price)}
            </p>

            {product.description && (
              <p className="mt-4 font-prompt text-base md:text-lg leading-8 text-neutral-700 max-w-prose whitespace-pre-line">
                {product.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  addItem({
                    id: product.id,
                    name: product.thName || product.name,
                    price: product.price,
                    qty: 1,
                    image: product.images?.[0] || '', // ✅ เก็บรูปปกไปในตะกร้า
                  })
                }}
                className="inline-flex items-center rounded-md bg-neutral-900 px-6 py-3 text-base md:text-lg text-white shadow hover:bg-neutral-800"
              >
                + ใส่ตะกร้า
              </button>

              <a
                href="/checkout"
                className="inline-flex items-center rounded-md border border-neutral-300 px-6 py-3 text-base md:text-lg text-neutral-800 hover:border-neutral-900"
              >
                ไปหน้า Checkout
              </a>
            </div>

            <div className="pt-6 text-sm text-neutral-500 leading-6">
              <p>ติดต่อสอบถาม/คุยรายละเอียดงานได้ที่ดิสคอร์ด</p>
              <p>คิวปกติจะอยู่ที่ประมาณ 1–5 วันโดยประมาณ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
