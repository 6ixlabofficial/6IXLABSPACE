'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { COLLECTIONS } from '@/data/collections'

export default function CollectionsPage() {
  // index ของ "ชิ้น" ที่กำลังเปิด และ index ของ "รูป" ภายในชิ้นนั้น
  const [activeItem, setActiveItem] = useState<number | null>(null)
  const [activeImg, setActiveImg] = useState<number>(0)
  const thumbStripRef = useRef<HTMLDivElement>(null)

  // เปิดโมดอลจากการคลิก thumbnail ชิ้น
  const openItem = (idx: number) => {
    setActiveItem(idx)
    setActiveImg(0) // เริ่มที่รูปแรกของชิ้นนั้น
  }

  const closeModal = () => {
    setActiveItem(null)
    setActiveImg(0)
  }

  // ปุ่มซ้าย/ขวา (เลื่อนเฉพาะรูปภายใน "ชิ้นเดียวกัน")
  const goPrev = () => {
    if (activeItem === null) return
    const total = COLLECTIONS[activeItem].images.length
    setActiveImg(i => (i - 1 + total) % total)
  }
  const goNext = () => {
    if (activeItem === null) return
    const total = COLLECTIONS[activeItem].images.length
    setActiveImg(i => (i + 1) % total)
  }

  // คีย์บอร์ด: Esc / ← / →
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (activeItem === null) return
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowLeft')  goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeItem])

  // เลื่อนแถบ thumbnail ให้รูปที่เลือกอยู่กลาง ๆ
  useEffect(() => {
    if (activeItem === null || !thumbStripRef.current) return
    const el = thumbStripRef.current.querySelector<HTMLButtonElement>(`[data-idx="${activeImg}"]`)
    if (!el) return
    const container = thumbStripRef.current
    const left = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2
    container.scrollTo({ left, behavior: 'smooth' })
  }, [activeItem, activeImg])

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-10">
      <h1 className="text-2xl md:text-3xl font-oswald mb-6">Collections</h1>

      {/* กริด: แต่ละ thumbnail = ชิ้นหนึ่ง */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {COLLECTIONS.map((item, idx) => {
          const cover = item.images[0]
          return (
            <button
              key={item.id}
              onClick={() => openItem(idx)}
              className="aspect-[4/5] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400"
              title={item.name}
            >
              {cover ? (
                <Image
                  src={cover}
                  alt={item.name}
                  width={1200}
                  height={1500}
                  className="h-full w-full object-cover"
                  sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-400">No Image</div>
              )}
            </button>
          )
        })}
      </div>

      {/* โมดอลต่อชิ้น: เลื่อนเฉพาะรูปของชิ้นนั้น */}
      {activeItem !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={closeModal}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative w-full max-w-6xl max-h-[92vh] rounded-xl bg-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ปุ่มปิด */}
            <button
              onClick={closeModal}
              className="absolute right-3 top-3 z-10 rounded-md bg-white/90 px-3 py-1 text-sm text-neutral-800 shadow hover:bg-white"
            >
              ✕ Close
            </button>

            {/* ปุ่ม Prev / Next */}
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm shadow hover:bg-white"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm shadow hover:bg-white"
              aria-label="Next image"
            >
              ›
            </button>

            {/* รูปใหญ่ของ "ชิ้นที่เลือก" */}
            <div className="flex items-center justify-center px-3 pt-10 pb-3 sm:px-6">
              <img
                src={COLLECTIONS[activeItem].images[activeImg]}
                alt={`${COLLECTIONS[activeItem].name} — ${activeImg + 1}`}
                className="max-h-[70vh] w-auto object-contain rounded-lg bg-white/5"
              />
            </div>

            {/* แถบ Thumbnail: เฉพาะรูปของ "ชิ้นนี้" */}
            <div className="px-3 sm:px-6 pb-4">
              <div
                ref={thumbStripRef}
                className="flex gap-2 overflow-x-auto rounded-md border border-white/20 bg-black/20 p-2 scrollbar-thin scrollbar-thumb-white/30"
              >
                {COLLECTIONS[activeItem].images.map((src, idx) => {
                  const isActive = idx === activeImg
                  return (
                    <button
                      key={src}
                      data-idx={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md border transition
                        ${isActive ? 'border-white ring-2 ring-white' : 'border-white/40 hover:border-white'}`}
                      title={`${COLLECTIONS[activeItem].name} — ${idx + 1}`}
                    >
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  )
                })}
              </div>

              {/* ชื่อ + ดัชนี */}
              <div className="mt-2 text-center text-xs text-white/80">
                {COLLECTIONS[activeItem].name} ({activeImg + 1}/{COLLECTIONS[activeItem].images.length})
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
