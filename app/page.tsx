'use client'
import Image from 'next/image'
import Link from 'next/link'
import Hero from '@/components/Hero'
import { useCart } from '@/components/CartContext'
import ProductDetail from '@/components/ProductDetail'
import { useMemo, useState, useRef, useEffect } from 'react'

type Category = 'suit' | 'hood' | 'shirt' | 'polo' | 'armor' | 'other' | 'promotion'
type Product = {
  id: string
  name: string
  thName: string
  price: number
  category: Category
  images: string[]
  description: string
  badges?: string[]
}

const PRODUCTS: Product[] = [
  {
    id: 'starterpack',
    name: 'Starter Pack',
    thName: 'สตาร์ทเตอร์แพ็ค',
    price: 499,
    category: 'promotion',
    images: ['/images/starter-pack/starterpack.png'],
    description: 'สามารถเปลี่ยนสีเสื้อ, custom ลายเสื้อ, เปลี่ยนโลโก้ ได้ตามที่ต้องการ',
    badges: ['Promotion'],
  },
    {
    id: 'familypack',
    name: 'Family Pack',
    thName: 'แฟมิลี่แพ็ค',
    price: 399,
    category: 'promotion',
    images: ['/images/family-pack/familypack.png'],
    description: 'สามารถเปลี่ยนสีเสื้อ, custom ลายเสื้อ, เปลี่ยนโลโก้ ได้ตามที่ต้องการ',
    badges: ['Promotion'],
  },
  {
    id: 'suit-classic',
    name: 'Suit Classic',
    thName: 'สูทคลาสิค',
    price: 200,
    category: 'suit',
    images: ['/images/suit-classic/suit-classic-thumbnail.png','/images/suit-classic/suit-classic-front.png','/images/suit-classic/suit-classic-back.png'],
    description: 'สามารถเปลี่ยนสีเสื้อ, ปกคอ, กระเป๋า, กระดุม, custom ลายเสื้อ, เปลี่ยนโลโก้ ได้ตามที่ต้องการ',
    badges: ['Bestseller'],
  },
  {
    id: 'hood-classic',
    name: 'Hood Classic',
    thName: 'ฮู้ดคลาสสิค',
    price: 200,
    category: 'hood',
    images: ['/images/hood-classic/hood-classic-thumbnail.png','/images/hood-classic/hood-classic-front.png','/images/hood-classic/hood-classic-back.png'],
    description: 'สามารถเปลี่ยนสีเสื้อ, สีฮู้ดด้านหลัง, กระเป๋าหน้าท้อง, เชือก, custom ลายเสื้อ, เปลี่ยนโลโก้ ได้ตามที่ต้องการ',
    badges: ['Bestseller'],
  },
  {
    id: 'shirt-classic',
    name: 'Shirt Classic',
    thName: 'เสื้อยืดคลาสสิค',
    price: 200,
    category: 'shirt',
    images: ['/images/shirt-classic/shirt-classic-thumbnail.png','/images/shirt-classic/shirt-classic-front.png','/images/shirt-classic/shirt-classic-back.png'],
    description: 'สามารถเปลี่ยนเกราะ, เชือกด้านหลัง, สีตัวล็อคบนไหล่, custom ลายเกราะ, เปลี่ยนโลโก้ ได้ตามที่ต้องการ',
    badges: ['Bestseller'],
  },
  {
    id: 'polo-classic',
    name: 'Polo Classic',
    thName: 'โปโลคลาสสิค',
    price: 200,
    category: 'polo',
    images: ['/images/polo-classic/polo-classic-thumbnail.png','/images/polo-classic/polo-classic-front.png','/images/polo-classic/polo-classic-back.png'],
    description: 'สามารถเปลี่ยนเกราะ, เชือกด้านหลัง, สีตัวล็อคบนไหล่, custom ลายเกราะ, เปลี่ยนโลโก้ ได้ตามที่ต้องการ',
    badges: ['Bestseller'],
  },
  {
    id: 'armor',
    name: 'Armor',
    thName: 'เกราะ',
    price: 200,
    category: 'armor',
    images: ['/images/armor/armor-thumbnail.png','/images/armor/armor-front.png','/images/armor/armor-back.png'],
    description: 'สามารถเปลี่ยนเกราะ, เชือกด้านหลัง, สีตัวล็อคบนไหล่, custom ลายเกราะ, เปลี่ยนโลโก้ ได้ตามที่ต้องการ',
    badges: ['Bestseller'],
  },
  
]

const baht = (n:number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n)

function Badge({children}:{children: React.ReactNode}) {
  return <span className="inline-flex items-center rounded-md border px-2.5 py-1 text-xs tracking-wide text-neutral-700 border-neutral-200 bg-white/60">{children}</span>
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

function Filters({ value, onChange }:{
  value:{category:string; priceMax:number; query:string},
  onChange:(v:any)=>void
}) {
  const { category, priceMax, query } = value
  const CATS = [
    { key: 'all',   label: 'ทั้งหมด / All' },
    { key: 'promotion',   label: 'โปรโมชั่น / Promotion' },
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