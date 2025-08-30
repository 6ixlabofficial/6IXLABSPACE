// app/checkout/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/components/CartContext'

export default function CheckoutPage() {
  // ✓ ใช้ตะกร้าจริงจาก Context
  const { items, setQty, remove, total, clear } = useCart()

  // ฟอร์มลูกค้า
  const [customerName, setCustomerName] = useState('')
  const [contact, setContact] = useState('')

  // Discord (optional)
  const [discordUserId, setDiscordUserId] = useState<string | null>(null)

  // สถานะส่งออเดอร์
  const [loading, setLoading] = useState(false)

  // โหลดสถานะล็อกอิน Discord ถ้ามี endpoint /api/me
  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.ok ? r.json() : { discordUserId: null })
      .then((d) => setDiscordUserId(d.discordUserId ?? null))
      .catch(() => setDiscordUserId(null))
  }, [])

  const loginWithDiscord = () => { window.location.href = '/api/discord/login' }

  async function placeOrder() {
    if (!customerName || !contact) {
      alert('กรุณากรอกชื่อและช่องทางติดต่อ')
      return
    }
    if (items.length === 0) {
      alert('ตะกร้าของคุณยังว่าง')
      return
    }

    setLoading(true)

    const payload = {
      orderId: `OD-${Date.now()}`,
      items: items.map(({ id, name, qty, price }) => ({ id, name, qty, price })),
      customer: {
        name: customerName,
        contact,
        discordUserId: discordUserId ?? undefined,
      },
    }

    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false }))

    setLoading(false)

    if (!res.ok) {
      alert('สั่งซื้อไม่สำเร็จ กรุณาลองใหม่')
      return
    }

    if (res.inviteUrl) {
      // ถ้าลูกค้ายังไม่ได้อยู่ในเซิร์ฟเวอร์ ให้ใช้ลิงก์นี้เข้าร้าน
      window.open(res.inviteUrl, '_blank')
    }

    clear() // เคลียร์ตะกร้าหลังสั่งซื้อสำเร็จ
    alert('สร้างห้องใน Discord สำเร็จ! ทีมงานจะคุยกับคุณในห้องนั้น')
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
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-neutral-500">
                      {item.price.toLocaleString('th-TH')} ฿ / ชิ้น
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQty(item.id, item.qty - 1)}
                      className="rounded-md border px-2 hover:bg-neutral-50"
                      aria-label="ลดจำนวน"
                    >
                      −
                    </button>
                    <span className="tabular-nums w-6 text-center">{item.qty}</span>
                    <button
                      onClick={() => setQty(item.id, item.qty + 1)}
                      className="rounded-md border px-2 hover:bg-neutral-50"
                      aria-label="เพิ่มจำนวน"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => remove(item.id)}
                    className="text-red-600 hover:underline"
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

      {/* ====== ข้อมูลลูกค้า ====== */}
      <div className="rounded-lg border border-neutral-200 p-4 mb-6">
        <div className="mb-3 font-medium">ข้อมูลลูกค้า</div>
        <div className="grid gap-3">
          <input
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="ชื่อของคุณ"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="ช่องทางติดต่อ (LINE/อีเมล/โทร)"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>
      </div>

      {/* ====== เชื่อมต่อ Discord (ทางเลือก) ====== */}
      <div className="rounded-lg border border-neutral-200 p-4 mb-6">
        <div className="mb-3 font-medium">เชื่อมต่อ Discord (ทางเลือก)</div>
        {discordUserId ? (
          <div className="flex items-center justify-between">
            <span className="text-sm">
              เชื่อมต่อแล้ว:{" "}
              <code className="px-1 rounded bg-neutral-100">{discordUserId}</code>
            </span>
            <span className="text-xs text-neutral-500">
              *จะเปิดห้องเฉพาะให้คุณโดยอัตโนมัติ
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
          disabled={loading}
          onClick={placeOrder}
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
