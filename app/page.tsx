'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState, useEffect } from 'react'

type Color = { name: string; hex: string }
type Category = 'suit' | 'hood' | 'shirt' | 'polo' | 'armor' | 'other'
type Product = {
  id: string
  name: string
  thName: string
  price: number
  category: Category
  colors: Color[]
  sizes: string[]
  images: string[]
  description: string
  badges?: string[]
}

const PRODUCTS: Product[] = [
  {
    id: 'suit-classic',
    name: 'Suit Classic',
    thName: 'สูทคลาสิค',
    price: 200,
    category: 'suit',
    colors: [
      { name: 'Ivory', hex: '#f7f5f0' },
      { name: 'Black', hex: '#0a0a0a' },
      { name: 'Oat', hex: '#e9e4da' },
    ],
    sizes: ['XS','S','M','L','XL'],
    images: ['/images/suit-classic/suit-classic-thumbnail.png','/images/suit-classic/suit-classic-front.png','/images/suit-classic/suit-classic-back.png'],
    description: 'สามารถเปลี่ยนสีเสื้อ, ปกคอ, กระเป๋า, กระดุม, คัสต้อมลาย, เปลี่ยนโลโก้ ได้ตามที่ต้องการ',
    badges: ['Bestseller'],
  },
  {
    id: 'hood-classic',
    name: 'Hood Classic',
    thName: 'ฮู้ดคลาสสิค',
    price: 200,
    category: 'hood',
    colors: [
      { name: 'Sand', hex: '#d8cfc2' },
      { name: 'Charcoal', hex: '#2b2b2b' },
    ],
    sizes: ['S','M','L','XL'],
    images: ['/images/hood-classic/hood-classic-thumbnail.png','/images/hood-classic/hood-classic-front.png','/images/hood-classic/hood-classic-back.png'],
    description: 'สามารถเปลี่ยนสีเสื้อ, สีฮู้ดด้านหลัง, กระเป๋าหน้าท้อง, เชือก, คัสต้อมลาย, เปลี่ยนโลโก้ ได้ตามที่ต้องการ',
    badges: ['Bestseller'],
  },
  {
    id: 'shirt-classic',
    name: 'Shirt Classic',
    thName: 'เสื้อยืดคลาสสิค',
    price: 200,
    category: 'shirt',
    colors: [
      { name: 'Stone', hex: '#dcd7cf' },
      { name: 'Mocha', hex: '#b8a899' },
    ],
    sizes: ['28','30','32','34','36'],
    images: ['/images/shirt-classic/shirt-classic-thumbnail.png','/images/shirt-classic/shirt-classic-front.png','/images/shirt-classic/shirt-classic-back.png'],
    description: 'สามารถเปลี่ยนสีเสื้อ, สีคอเสื้อ, สีขอบแขนเสื้อ, คัสต้อมลาย, เปลี่ยนโลโก้ ได้ตามที่ต้องการ',
    badges: ['Bestseller'],
  },
  
]

const baht = (n:number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n)

function Badge({children}:{children: React.ReactNode}) {
  return <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-xs tracking-wide text-neutral-700 border-neutral-200 bg-white/60">{children}</span>
}

function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16 md:px-8 grid items-center gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-3xl md:text-5xl font-oswald leading-tight tracking-tight text-neutral-900">
            6IXLAB - Premium Clothing & Design
          </h1>
          <p className="mt-2 font-prompt thai-tight text-lg md:text-xl leading-8 text-neutral-700">
            รับออกแบบชุด, งานกราฟิก, โลโก้ต่างๆ สำหรับเกม FIVEM 
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#shop" className="rounded-md bg-neutral-900 px-5 py-3 text-sm text-white shadow hover:shadow-md">Shop</a>
            <Link href="/collections" className="rounded-md border border-neutral-300 px-5 py-3 text-sm text-neutral-800 hover:border-neutral-900">Collections</Link>
          </div>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200 bg-[radial-gradient(circle_at_30%_30%,rgba(0,0,0,0.08),transparent_60%)]">
          <Image src="/images/promotionbanner.png" alt="Campaign" width={1200} height={900} className="h-full w-full object-cover"/>
        </div>
      </div>
    </section>
  )
}

function ProductCard({
  product,
  onOpen,
}: {
  product: Product
  onOpen: (p: Product) => void
}) {
  const [hovered, setHovered] = useState(false)
  const cover = product.images?.[0]

  return (
    <div
      className="group relative cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(product)}
    >
      <div className="aspect-[4/5] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
        {cover ? (
          <Image
            alt={product.name}
            src={cover}
            width={1200}
            height={1500}
            className={`h-full w-full object-cover transition-transform duration-700 ${
              hovered ? 'scale-[1.03]' : 'scale-100'
            }`}
            sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            No Image
          </div>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm md:text-base font-medium text-neutral-900 tracking-wide">
            {product.name}
          </h3>
          <p className="mt-1 font-prompt thai-tight text-sm md:text-base text-neutral-600">
            {product.thName}
          </p>
        </div>
        <p className="text-sm md:text-base text-neutral-800">
          {new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            maximumFractionDigits: 0,
          }).format(product.price)}
        </p>
      </div>

      {/* ✅ badges ยังอยู่ ถ้าอยากลบ badges ด้วยบอกได้ครับ */}
      {product.badges?.length ? (
        <div className="mt-2 flex gap-1.5">
          {product.badges.map((b) => (
            <span
              key={`${product.id}-badge-${b}`}
              className="inline-flex items-center rounded-md border px-2.5 py-1 text-xs tracking-wide text-neutral-700 border-neutral-200 bg-white/60"
            >
              {b}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ColorDot({ hex, selected, onClick }:{hex:string, selected:boolean, onClick:()=>void}) {
  return <button onClick={onClick} title={hex} className={`h-5 w-5 rounded-sm border transition-all ${selected ? 'scale-110 border-neutral-900' : 'border-neutral-300 hover:scale-105'}`} style={{backgroundColor: hex}}/>
}

function ProductDetail({ product, onClose }:{product: Product, onClose: ()=>void}) {
  const [activeImage, setActiveImage] = useState(0)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      {/* กล่องโมดอล: เลื่อนภายในกล่องเอง ไม่ล้นจอ */}
      <div
        className="relative w-full max-w-6xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white p-4 sm:p-6 md:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ปุ่มปิดติดเพดาน */}
        <button
          onClick={onClose}
          className="sticky top-0 ml-auto block rounded-sm border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50"
        >
          ✕ Close
        </button>

        {/* ✅ จัดเลย์เอาต์ 2 คอลัมน์ตั้งแต่ md ขึ้นไป */}
        <div className="grid gap-6 md:grid-cols-2 md:items-start">
          {/* ซ้าย: รูป + แกลเลอรี */}
          <div>
            <div className="aspect-[4/5] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                width={1200}
                height={1500}
                className="h-full w-full object-cover"
                sizes="(min-width:1024px) 50vw, 100vw"
              />
            </div>

            {product.images.length > 1 && (
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

          {/* ขวา: รายละเอียดสินค้า */}
          <div className="md:sticky md:top-8">
            <h2 className="text-3xl md:text-4xl font-oswald tracking-tight text-neutral-900">
              {product.name}
            </h2>
            <p className="mt-2 text-lg text-neutral-700">{product.thName}</p>
            <p className="mt-2 text-xl md:text-2xl font-semibold text-neutral-900">
              {baht(product.price)}
            </p>

            <p className="mt-4 text-base leading-7 text-neutral-700 max-w-prose">
              {product.description}
            </p>

            {/* ปุ่มไป Discord ตรง ๆ (เปลี่ยนลิงก์จริงของคุณ) */}
            <div className="mt-6">
              <a
                href="https://discord.gg/ZAPXTwUYmW"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md bg-neutral-900 px-6 py-3 text-base text-white shadow hover:shadow-md"
              >
                Contact • สอบถาม/สั่งทำ
              </a>
            </div>

            <div className="pt-6 text-sm text-neutral-500 leading-6">
              <p>ติดต่อสอบถาม/คุยรายละเอียดงานได้ที่ดิสคอร์ด</p>
              <p>คิวปกติจะอยู่ที่ประมาณ 1-5 วันโดยประมาณ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Filters({ value, onChange }:{
  value:{category:string; priceMax:number; query:string},
  onChange:(v:any)=>void
}) {
  const { category, priceMax, query } = value
  const CATS = [
    { key: 'all',   label: 'ทั้งหมด / All' },
    { key: 'suit',  label: 'สูท / Suit' },
    { key: 'hood',  label: 'ฮู้ด / Hood' },
    { key: 'shirt', label: 'เสื้อยืด / Shirt' },
    { key: 'polo',  label: 'เสื้อโปโล / Polo' },
    { key: 'armor', label: 'เกราะ / Armor' },
    { key: 'other', label: 'ชุดอื่นๆ / Other' },
  ]
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {CATS.map(c => (
            <button
              key={c.key}
              onClick={()=>onChange({ ...value, category: c.key })}
              className={`rounded-md border px-4 py-2 text-sm transition ${category===c.key ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-700">
            <span>ราคาสูงสุด</span>
            <input type="range" min={100} max={500} step={50} value={priceMax} onChange={(e)=>onChange({ ...value, priceMax: Number((e.target as HTMLInputElement).value) })} />
            <span className="tabular-nums">{baht(priceMax)}</span>
          </div>
          <input value={query} onChange={(e)=>onChange({ ...value, query: (e.target as HTMLInputElement).value })} placeholder="ค้นหาชื่อสินค้า…" className="h-10 w-full md:w-64 rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900" />
        </div>
      </div>
    </div>
  )
}

function ProductGrid({
  onOpen,
  filters,
}: {
  onOpen: (p: Product) => void
  filters: { category: string; priceMax: number; query: string }
}) {
  const { category, priceMax, query } = filters

  // กรองรายการตามเงื่อนไข
  const list = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (category === 'all' || p.category === category) &&
          p.price <= priceMax &&
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.thName.includes(query))
      ),
    [category, priceMax, query]
  )

  // แสดงทีละ 8 ชิ้น
  const PER_PAGE = 8
  const [visible, setVisible] = useState(PER_PAGE)

  // เมื่อมีการเปลี่ยนฟิลเตอร์ ให้รีเซ็ตจำนวนที่เห็นกลับเป็น 8
  useEffect(() => {
    setVisible(PER_PAGE)
  }, [category, priceMax, query])

  const show = list.slice(0, visible)

  return (
    <section id="shop" className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {show.map((p) => (
          <ProductCard key={p.id} product={p} onOpen={onOpen} />
        ))}
      </div>

      {/* สถานะ + ปุ่มโหลดเพิ่ม */}
      {list.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-neutral-600">
          <span>
            กำลังแสดง <span className="tabular-nums">{show.length}</span> จาก{' '}
            <span className="tabular-nums">{list.length}</span> รายการ
          </span>
          {visible < list.length && (
            <button
              onClick={() => setVisible((v) => Math.min(v + PER_PAGE, list.length))}
              className="ml-2 rounded-md border border-neutral-300 px-4 py-2 text-neutral-800 hover:border-neutral-900"
            >
              Load More
            </button>
          )}
        </div>
      )}

      {/* ไม่มีผลลัพธ์ */}
      {list.length === 0 && (
        <div className="py-20 text-center text-neutral-500">
          ไม่พบสินค้าที่ตรงเงื่อนไขการค้นหา
        </div>
      )}
    </section>
  )
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200/70">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-lg font-oswald text-neutral-900">6IXLAB.</div>
            <p className="mt-2 max-w-sm text-sm text-neutral-600">Honored to Serve, Grateful for Your Trust. — เป็นเกียรติที่ได้ให้บริการ และขอบคุณที่ไว้วางใจเรา</p>
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-900">Help</div>
            <ul className="mt-2 space-y-1 text-sm text-neutral-600">
              <li>Term & Conditions</li>
              <li>How to Order</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-900">Follow</div>
            <ul className="mt-2 space-y-1 text-sm text-neutral-600">
              <li>Instagram</li>
              <li>TikTok</li>
              <li>LINE</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 text-xs text-neutral-400">© {new Date().getFullYear()} 6ixlab. All rights reserved.</div>
      </div>
    </footer>
  )
}

export default function Page() {
  const [filters, setFilters] = useState({ category: 'all', priceMax: 500, query: '' })
  const [selected, setSelected] = useState<Product | null>(null)

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Hero />
      <section className="py-8">
        <Filters value={filters} onChange={setFilters} />
        <ProductGrid filters={filters} onOpen={setSelected} />
      </section>
      <Footer />
      {selected && <ProductDetail product={selected} onClose={()=>setSelected(null)} />}
      <div className="h-8" />
    </div>
  )
}