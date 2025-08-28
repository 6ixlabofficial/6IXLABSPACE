'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const SLIDES = [
  '/hero/slide-1.png',
  '/hero/slide-2.png',
] as const

const INTERVAL_MS = 6000
const SWIPE_THRESHOLD = 40 // ปัดเกิน ~40px ถึงจะเลื่อน

export default function Hero() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<NodeJS.Timeout | null>(null)
  const touchStartX = useRef<number | null>(null)

  // autoplay
  useEffect(() => {
    if (paused) return
    timer.current && clearInterval(timer.current)
    timer.current = setInterval(() => {
      setIndex(i => (i + 1) % SLIDES.length)
    }, INTERVAL_MS)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [paused])

  const goTo   = (i: number) => setIndex(i)
  const goNext = () => setIndex(i => (i + 1) % SLIDES.length)
  const goPrev = () => setIndex(i => (i - 1 + SLIDES.length) % SLIDES.length)

  // touch gesture (มือถือ/แท็บเล็ต)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > SWIPE_THRESHOLD) dx < 0 ? goNext() : goPrev()
    touchStartX.current = null
  }

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 pt-10 pb-6 md:pt-16 md:pb-10">
      <div className="grid items-center gap-8 md:grid-cols-2">
        {/* ซ้าย: ข้อความ (ลดไซส์หัวข้อเล็กน้อย) */}
        <div>
          {/* เดิม text-4xl md:text-6xl → ลดเป็น text-3xl md:text-5xl */}
          <h1 className="font-oswald text-3xl md:text-5xl leading-tight">
            6IXLAB - Premium Clothing & Design
          </h1>
          <p className="mt-3 font-prompt text-lg md:text-xl thai-tight text-neutral-700">
            รับออกแบบชุด, งานกราฟิก, โลโก้ต่างๆ สำหรับเกม FIVEM
          </p>

          <div className="mt-6 flex gap-3">
            <a href="#shop" className="rounded-md bg-neutral-900 px-5 py-3 text-white">
              Shop
            </a>
            <Link
              href="/collections"
              className="rounded-md border border-neutral-300 bg-white px-5 py-3 text-neutral-800 hover:border-neutral-900"
            >
              Collections
            </Link>
          </div>
        </div>

        {/* ขวา: สไลด์ + gesture */}
        <div
          className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl bg-neutral-900/80 text-white shadow-xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* เฟดสไลด์ */}
          {SLIDES.map((src, i) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={src}
                alt={`slide-${i + 1}`}
                fill
                className="object-cover"
                sizes="(min-width:1024px) 640px, 100vw"
                priority={i === 0}
              />
            </div>
          ))}

          {/* ลูกศรโปร่งใส */}
          {SLIDES.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/1 text-white backdrop-blur px-3 py-2 text-lg hover:bg-white/30"
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/1 text-white backdrop-blur px-3 py-2 text-lg hover:bg-white/30"
                aria-label="Next"
              >
                ›
              </button>
            </>
          )}

          {/* จุดบอกสไลด์ */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  i === index ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}