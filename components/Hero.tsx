'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

/** กำหนดสไลด์ที่นี่: รองรับ video/mp4, video/webm และ image/gif/png/jpg */
type Slide =
  | { type: 'video'; srcMp4?: string; srcWebm?: string; poster?: string; url: string }
  | { type: 'image' | 'gif'; src: string; url: string }

const SLIDES: Slide[] = [
  // วิดีโอ (แนะนำ: เบากว่า GIF, ลื่นกว่า)
  {
    type: 'image',
    src: '/hero/slide-1.png',
    url: '/#shop',
  },
  // รูป/GIF (ยังใช้ได้)
  { type: 'gif', src: '/hero/slide-2-gif.gif', url: 'https://discord.gg/eYGJRr44qj' },
]

const INTERVAL_MS = 6000
const SWIPE_THRESHOLD = 40

function isExternal(url: string) {
  return /^https?:\/\//i.test(url)
}

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

  // swipe บนมือถือ/แท็บเล็ต
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
        {/* ซ้าย: ข้อความ */}
        <div>
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

        {/* ขวา: สไลด์ (รองรับ video + image/gif) */}
        <div
          className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl bg-neutral-900/80 text-white shadow-xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {SLIDES.map((slide, i) => {
            const external = isExternal(slide.url)
            return (
              <Link
                key={i}
                href={slide.url}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                prefetch={false}
                className={`absolute inset-0 block transition-opacity duration-700 ${
                  i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                aria-label={`Open slide ${i + 1}`}
              >
                {slide.type === 'video' ? (
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={slide.poster}
                  >
                    {slide.srcWebm && <source src={slide.srcWebm} type="video/webm" />}
                    {slide.srcMp4 && <source src={slide.srcMp4} type="video/mp4" />}
                    {/* fallback */}
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={slide.src}
                    alt={`slide-${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </Link>
            )
          })}

          {/* ปุ่มเลื่อน */}
          {SLIDES.length > 1 && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); goPrev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white backdrop-blur px-3 py-2 text-lg hover:bg-white/30"
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); goNext() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white backdrop-blur px-3 py-2 text-lg hover:bg-white/30"
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
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(i) }}
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
