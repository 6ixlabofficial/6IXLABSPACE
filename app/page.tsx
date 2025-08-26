'use client'
import Image from 'next/image'
import { useMemo, useState } from 'react'

type Color = { name: string; hex: string }
type Product = {
  id: string
  name: string
  thName: string
  price: number
  colors: Color[]
  sizes: string[]
  images: string[]
  description: string
  badges?: string[]
}

const PRODUCTS: Product[] = [
  {
    id: 'tee-classic',
    name: 'Classic Tee',
    thName: 'เสื้อยืดคลาสสิก',
    price: 790,
    colors: [
      { name: 'Ivory', hex: '#f7f5f0' },
      { name: 'Black', hex: '#0a0a0a' },
      { name: 'Oat', hex: '#e9e4da' },
    ],
    sizes: ['XS','S','M','L','XL'],
    images: ['/images/classic-tee-1.svg','/images/classic-tee-2.svg','/images/fabric-detail.svg'],
    description: 'Combed cotton, 220 GSM. Minimal stitching, relaxed fit. ผ้าคอตตอนหวี เส้นใยเนียนนุ่ม ซักแล้วไม่ย้วย',
    badges: ['New','Bestseller'],
  },
  {
    id: 'overshirt',
    name: 'Structured Overshirt',
    thName: 'โอเวอร์เชิ้ตทรงสวย',
    price: 1890,
    colors: [
      { name: 'Sand', hex: '#d8cfc2' },
      { name: 'Charcoal', hex: '#2b2b2b' },
    ],
    sizes: ['S','M','L','XL'],
    images: ['/images/overshirt-1.svg','/images/overshirt-2.svg'],
    description: 'Brushed twill with hidden placket. เหมาะกับเลเยอร์ลุคมินิมอล',
    badges: ['Limited'],
  },
  {
    id: 'linen-pants',
    name: 'Linen Blend Trousers',
    thName: 'กางเกงลินินผสม',
    price: 1590,
    colors: [
      { name: 'Stone', hex: '#dcd7cf' },
      { name: 'Mocha', hex: '#b8a899' },
    ],
    sizes: ['28','30','32','34','36'],
    images: ['/images/linen-trousers.svg'],
    description: 'Breathable and crisp. ระบายอากาศดี ใส่สบาย',
  },
  {
    id: 'slip-dress',
    name: 'Silk Slip Dress',
    thName: 'เดรสซิลค์',
    price: 3290,
    colors: [
      { name: 'Champagne', hex: '#f5e9d9' },
      { name: 'Ink', hex: '#111113' },
    ],
    sizes: ['XS','S','M','L'],
    images: ['/images/silk-slip-1.svg','/images/silk-slip-2.svg'],
    description: 'Bias-cut silk for a fluid silhouette. เงางาม ดูแพง',
    badges: ['Restock'],
  },
  {
    id: 'crew-sweat',
    name: 'Heavy Crew Sweat',
    thName: 'สเวตเตอร์ผ้าหนา',
    price: 1490,
    colors: [
      { name: 'Fog', hex: '#dfe1e5' },
      { name: 'Navy', hex: '#0f1a2e' },
    ],
    sizes: ['S','M','L','XL'],
    images: ['/images/crew-sweat.svg'],
    description: 'French terry 400 GSM. โครงสวยอยู่ทรง',
  },
  {
    id: 'wide-denim',
    name: 'Wide Denim',
    thName: 'ยีนส์ขาบาน',
    price: 1790,
    colors: [
      { name: 'Mid', hex: '#50627a' },
      { name: 'Deep', hex: '#263142' },
    ],
    sizes: ['28','30','32','34'],
    images: ['/images/wide-denim.svg'],
    description: 'Vintage wash. ผ้ายืดนิดๆ ใส่สบาย',
    badges: ['Online Only'],
  },
  {
    id: 'polo-knit',
    name: 'Knitted Polo',
    thName: 'โปโลนิต',
    price: 1290,
    colors: [
      { name: 'Cream', hex: '#efe7da' },
      { name: 'Forest', hex: '#315244' },
    ],
    sizes: ['S','M','L'],
    images: ['/images/knit-polo.svg'],
    description: 'Open collar, breathable knit. เรียบแต่ดูแพง',
  },
  {
    id: 'coat-wool',
    name: 'Double-Faced Wool Coat',
    thName: 'โค้ทวูล',
    price: 4590,
    colors: [
      { name: 'Camel', hex: '#caa874' },
      { name: 'Ash', hex: '#c1c2c6' },
    ],
    sizes: ['S','M','L','XL'],
    images: ['/images/wool-coat-1.svg','/images/wool-coat-2.svg'],
    description: 'Soft-structured, hand-finished seams. งานประณีต',
    badges: ['Signature'],
  },
]

const baht = (n:number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n)

function Badge({children}:{children: React.ReactNode}) {
  return <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs tracking-wide text-neutral-700 border-neutral-200 bg-white/60 backdrop-blur">{children}</span>
}

function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs uppercase tracking-widest text-neutral-700">
            6ixlab
          </span>
          <nav className="hidden gap-6 md:flex">
            <a className="text-sm text-neutral-700 hover:text-neutral-900" href="#collections">Collections</a>
            <a className="text-sm text-neutral-700 hover:text-neutral-900" href="#about">About</a>
            <a className="text-sm text-neutral-700 hover:text-neutral-900" href="#contact">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16 md:px-8 grid items-center gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif leading-tight tracking-tight text-neutral-900">
            Minimal pieces, {'\n'}quiet luxury.
          </h1>
          <p className="mt-4 max-w-prose text-neutral-600">
            เสื้อผ้ามินิมอลที่ใส่ใจรายละเอียด เนื้อผ้าดี ทรงสวย โทนสีสุภาพ — ออกแบบให้ดูแพงโดยไม่ต้องพยายาม
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#shop" className="rounded-full bg-neutral-900 px-5 py-3 text-sm text-white shadow hover:shadow-md">Shop</a>
            <a href="#about" className="rounded-full border border-neutral-300 px-5 py-3 text-sm text-neutral-800 hover:border-neutral-900">Lookbook</a>
          </div>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-neutral-200 bg-[radial-gradient(circle_at_30%_30%,rgba(0,0,0,0.08),transparent_60%)]">
          <Image src="/images/campaign.svg" alt="Campaign" width={1200} height={900} className="h-full w-full object-cover"/>
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product, onOpen }:{product: Product, onOpen: (p:Product)=>void}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="group relative cursor-pointer" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onClick={()=>onOpen(product)}>
      <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
        <Image alt={product.name} src={product.images[0]} width={1200} height={1500} className={`h-full w-full object-cover transition-transform duration-700 ${hovered ? 'scale-[1.03]':'scale-100'}`} />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm md:text-base font-medium text-neutral-900 tracking-wide">{product.name}</h3>
          <p className="mt-1 text-xs text-neutral-500">{product.thName}</p>
        </div>
        <p className="text-sm md:text-base text-neutral-800">{baht(product.price)}</p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        {product.colors?.slice(0,4).map(c => <span key={c.hex} className="h-3.5 w-3.5 rounded-full border border-neutral-300" style={{backgroundColor: c.hex}}/>)}
        {product.badges?.length ? <div className="ml-auto flex gap-1.5">{product.badges.map(b => <Badge key={b}>{b}</Badge>)}</div> : null}
      </div>
    </div>
  )
}

function ColorDot({ hex, selected, onClick }:{hex:string, selected:boolean, onClick:()=>void}) {
  return <button onClick={onClick} title={hex} className={`h-5 w-5 rounded-full border transition-all ${selected ? 'scale-110 border-neutral-900' : 'border-neutral-300 hover:scale-105'}`} style={{backgroundColor: hex}}/>
}

function ProductDetail({ product, onClose }:{product: Product, onClose: ()=>void}) {
  const [activeImage, setActiveImage] = useState(0)
  const [color, setColor] = useState(product.colors?.[0]?.hex)
  const [size, setSize] = useState(product.sizes?.[0] ?? '')

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div className="relative grid w-full max-w-6xl grid-cols-1 gap-6 rounded-3xl bg-white p-6 md:grid-cols-2 md:p-8 shadow-2xl" onClick={(e)=>e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50">✕ Close</button>
        <div>
          <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
            <Image src={product.images[activeImage]} alt={product.name} width={1200} height={1500} className="h-full w-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((src, i) => (
                <button key={i} className={`h-20 w-16 overflow-hidden rounded-xl border ${i===activeImage ? 'border-neutral-900':'border-neutral-200'}`} onClick={()=>setActiveImage(i)}>
                  <Image src={src} alt={`preview-${i}`} width={120} height={150} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif tracking-tight text-neutral-900">{product.name}</h2>
              <p className="mt-1 text-sm text-neutral-500">{product.thName}</p>
            </div>
            <div className="text-xl md:text-2xl font-medium text-neutral-900">{baht(product.price)}</div>
          </div>
          <p className="mt-4 text-sm leading-6 text-neutral-700 max-w-prose">{product.description}</p>
          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 text-xs uppercase tracking-wider text-neutral-500">Color</div>
              <div className="flex items-center gap-3">
                {product.colors?.map(c => <ColorDot key={c.hex} hex={c.hex} selected={color===c.hex} onClick={()=>setColor(c.hex)} />)}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs uppercase tracking-wider text-neutral-500">Size</div>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map(s => (
                  <button key={s} onClick={()=>setSize(s)} className={`rounded-xl border px-3 py-2 text-sm transition ${size===s ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 bg-white hover:border-neutral-900'}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Filters({ value, onChange }:{value:{category:string; priceMax:number; query:string}, onChange:(v:any)=>void}) {
  const { category, priceMax, query } = value
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: 'ทั้งหมด / All' },
            { key: 'tops', label: 'ท่อนบน / Tops' },
            { key: 'bottoms', label: 'ท่อนล่าง / Bottoms' },
            { key: 'outer', label: 'เสื้อคลุม / Outer' },
            { key: 'dresses', label: 'เดรส / Dresses' },
          ].map(c => (
            <button key={c.key} onClick={()=>onChange({ ...value, category: c.key })}
              className={`rounded-full border px-4 py-2 text-sm transition ${category===c.key ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900'}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-700">
            <span>ราคาสูงสุด</span>
            <input type="range" min={500} max={5000} step={100} value={priceMax} onChange={(e)=>onChange({ ...value, priceMax: Number((e.target as HTMLInputElement).value) })} />
            <span className="tabular-nums">{baht(priceMax)}</span>
          </div>
          <input value={query} onChange={(e)=>onChange({ ...value, query: (e.target as HTMLInputElement).value })} placeholder="ค้นหาชื่อสินค้า…" className="h-10 w-full md:w-64 rounded-xl border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900" />
        </div>
      </div>
    </div>
  )
}

function ProductGrid({ onOpen, filters }:{onOpen:(p:Product)=>void, filters:{priceMax:number, query:string}}) {
  const { priceMax, query } = filters
  const list = useMemo(()=> PRODUCTS.filter(p => p.price <= priceMax && (p.name.toLowerCase().includes(query.toLowerCase()) || p.thName.includes(query))), [priceMax, query])
  return (
    <section id="shop" className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {list.map(p => <ProductCard key={p.id} product={p} onOpen={onOpen}/>)}
      </div>
      {list.length===0 && <div className="py-20 text-center text-neutral-500">ไม่พบสินค้าที่ตรงเงื่อนไขการค้นหา</div>}
    </section>
  )
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200/70">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-lg font-serif text-neutral-900">6ixlab Studio</div>
            <p className="mt-2 max-w-sm text-sm text-neutral-600">Refined essentials. Designed in Thailand. ส่งมอบความมินิมอลที่พอดี — วัสดุดี รายละเอียดเนี้ยบ</p>
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-900">Help</div>
            <ul className="mt-2 space-y-1 text-sm text-neutral-600">
              <li>Shipping & Returns</li>
              <li>Size Guide</li>
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
  const [filters, setFilters] = useState({ category: 'all', priceMax: 5000, query: '' })
  const [selected, setSelected] = useState<Product | null>(null)

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <TopBar />
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
