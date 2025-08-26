'use client'
import Image from 'next/image'

const IMAGES = [
  '/images/classic-tee-1.svg',
  '/images/classic-tee-2.svg',
  '/images/fabric-detail.svg',
  '/images/overshirt-1.svg',
  '/images/overshirt-2.svg',
  '/images/linen-trousers.svg',
  '/images/silk-slip-1.svg',
  '/images/silk-slip-2.svg',
  '/images/crew-sweat.svg',
  '/images/wide-denim.svg',
  '/images/knit-polo.svg',
  '/images/wool-coat-1.svg',
  '/images/wool-coat-2.svg',
]

export default function CollectionsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-10">
      <h1 className="text-2xl md:text-3xl font-oswald mb-6">Collections</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {IMAGES.map((src) => (
          <div key={src} className="aspect-[4/5] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
            <Image src={src} alt="collection" width={1200} height={1500} className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </main>
  )
}