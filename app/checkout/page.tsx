// app/checkout/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'                   // ✅ ใช้ next/image
import { useCart, type CartItem } from '@/components/CartContext'

export default function CheckoutPage() {
  const { items, setQty, remove, total, clear } = useCart()

  // ✅ ช่องบรีฟงาน (ใช้แทนข้อมูลลูกค้า)
  const [brief, setBrief] = useState('')

  // (ทางเลือก) ถ้า login ด้วย Discord แล้ว
  const [discordUserId, setDiscordUserId] = useState<string | null>(null)

  // ป้องกัน hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // โหลดสถานะล็อกอิน Discord (ถ้ามี)
  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : { discordUserId: null }))
      .then((d) => setDiscordUserId(d.discordUserId ?? null))
      .catch(() => setDiscordUserId(null))
  }, [])

  const loginWithDiscord = () => { window.location.href = '/api/discord/login' }

  const [loading, setLoading] = useState(false)

  async function placeOrder() {
    if (!brief.trim()) {
      alert('กรุณาพิมพ์บรีฟงานอย่างน้อย 1 บรรทัด')
      return
    }
    if (items.length === 0) {
      alert('ตะกร้าของคุณยังว่าง')
      return
    }

    setLoading(true)

    const payload = {
      // ไม่ต้องส่ง orderId ก็ได้ ให้ API gen เอง
      items: items.map(({ id, name, qty, price, image }: CartItem) => ({
        id, name, qty, price, image, // image ไม่มีได้
      })),
      customer: {
        brief: brief.trim(),                // ✅ ส่งบรีฟงาน
        discordUserId: discordUserId ?? undefined,
      },
    }

    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => r.json()).catch(() => ({ ok: false }))

    setLoading(false)

    if (!res.ok) {
      alert('สั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
      return
    }

    if (res.inviteUrl) {
      window.open(res.inviteUrl, '_blank') // เชิญเข้าห้องใน Discord
    }

    clear()
    alert('สร้างห้องใน Discord สำเร็จ! ทีมงานจะติดต่อคุณในห้องนั้น')
  }

  if (!mounted) {
    // กัน hydration mismatch ตอน initial render
    return null
  }

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-8 py-10">
      <h1 className="text-2xl md:text-3xl font-oswald mb-6">Checkout</h1>

      {/* ====== ตะกร้าสินค้า ====== */}
      <div className="rounded-lg border border-neutral-200 p-4 mb-6">
        <div className="mb-3 font-medium">ตะกร้าของคุณ</div>

        {items.length === 0 ? (
          <div className="flex items-center justify-between text-sm text-neutral-500">
            <span>ไม่มีสินค้าในตะกร้า</span>
            <Link
              href="/"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-neutral-800 hover:border-neutral-900"
            >
              เลือกสินค้าต่อ
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-3 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3">
                  {/* ซ้าย: รูป + ชื่อ/ราคา */}
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 md:h-16 md:w-16 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={120}
                          height={150}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                          no image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-neutral-500">
                        {item.price.toLocaleString('th-TH')} ฿ / ชิ้น
                      </div>
                    </div>
                  </div>

                  {/* ขวา: ปุ่มจำนวน + ลบ */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQty(item.id, Math.max(1, item.qty - 1))} // ✅ กันติด 0
                      className="rounded-md border px-2 hover:bg-neutral-50 disabled:opacity-40"
                      aria-label="ลดจำนวน"
                      disabled={loading}
                    >
                      −
                    </button>
                    <span className="tabular-nums w-6 text-center">{item.qty}</span>
                    <button
                      onClick={() => setQty(item.id, item.qty + 1)}
                      className="rounded-md border px-2 hover:bg-neutral-50 disabled:opacity-40"
                      aria-label="เพิ่มจำนวน"
                      disabled={loading}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => remove(item.id)}
                    className="text-red-600 hover:underline disabled:opacity-40"
                    disabled={loading}
                  >
                    ลบ
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between font-medium">
              <span>รวมทั้งหมด</span>
              <span>{total.toLocaleString('th-TH')} ฿</span>
            </div>
          </>
        )}
      </div>

      {/* ====== บรีฟงาน ====== */}
      <div className="rounded-lg border border-neutral-200 p-4 mb-6">
        <div className="mb-3 font-medium">บรีฟงาน</div>
        <textarea
          className="min-h-[140px] rounded-md border border-neutral-300 px-3 py-2 text-sm w-full"
          placeholder="อธิบายรายละเอียดที่ต้องการ เช่น ประเภทเสื้อ/สี/ลาย/โลโก้/ขนาด ฯลฯ"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
        />
        <p className="mt-2 text-xs text-neutral-500">
          *คุณสามารถบรีฟงานเบื้องต้นในช่องนี้ และทีมงานจะดำเนินการพูดคุยรายละเอียดเพิ่มเติมกับท่านต่อในห้อง Discord
        </p>
      </div>

      {/* ====== เชื่อมต่อ Discord (ทางเลือก) ====== */}
      <div className="rounded-lg border border-neutral-200 p-4 mb-6">
        <div className="mb-3 font-medium">เชื่อมต่อ Discord (ทางเลือก)</div>
        {discordUserId ? (
          <div className="flex items-center justify-between text-sm">
            <span>
              เชื่อมต่อแล้ว:{' '}
              <code className="px-1 rounded bg-neutral-100">{discordUserId}</code>
            </span>
            <span className="text-xs text-neutral-500">
              *เมื่อยืนยันสั่งซื้อเรียบร้อย จะเปิดห้องพูดคุยใน Discord ให้คุณโดยอัตโนมัติ
            </span>
          </div>
        ) : (
          <button
            onClick={loginWithDiscord}
            className="rounded-md bg-[#5865F2] text-white px-4 py-2 text-sm hover:opacity-90"
          >
            Login with Discord
          </button>
        )}
      </div>

      {/* ====== ปุ่มยืนยันสั่งซื้อ ====== */}
      <div className="flex items-center gap-3">
        <button
          onClick={placeOrder}
          disabled={loading}
          className="rounded-md bg-neutral-900 text-white px-5 py-3 hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? 'กำลังสร้างห้อง…' : 'ยืนยันสั่งซื้อ'}
        </button>

        <Link
          href="/"
          className="rounded-md border border-neutral-300 px-5 py-3 text-neutral-800 hover:border-neutral-900"
        >
          เลือกสินค้าต่อ
        </Link>
      </div>
    </main>
  )
}
