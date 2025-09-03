'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart, type CartItem } from '@/components/CartContext'

const INVITE_URL = 'https://discord.gg/ZAPXTwUYmW' // แก้เป็น invite ของกิลด์คุณ

type GuildState = { member: boolean; pending: boolean; ready: boolean }

export default function CheckoutPage() {
  const router = useRouter()
  const { items, setQty, remove, total, clear } = useCart()

  const [brief, setBrief] = useState('')
  const [discordUserId, setDiscordUserId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)

  // ✅ สถานะกิลด์สำหรับ Gate (A)
  const [guild, setGuild] = useState<GuildState>({ member: false, pending: false, ready: false })
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // ✅ เก็บ channelId หลังสั่งซื้อ เพื่อกด “ตรวจสิทธิ์อีกครั้ง” (B)
  const [lastChannelId, setLastChannelId] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  // โหลดสถานะล็อกอิน Discord
  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : { discordUserId: null }))
      .then((d) => setDiscordUserId(d.discordUserId ?? null))
      .catch(() => setDiscordUserId(null))
  }, [])

  const loginWithDiscord = () => { window.location.href = '/api/discord/login' }

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    setDiscordUserId(null)
    router.refresh()
  }

  // ====== เช็ก membership (A) ======
  async function checkGuildOnce() {
    if (!discordUserId) { setGuild({ member: false, pending: false, ready: false }); return }
    const r = await fetch(`/api/discord/membership?userId=${discordUserId}`, { cache: 'no-store' }).then(res => res.json())
    if (!r.ok) { setGuild({ member: false, pending: false, ready: false }); return }
    if (!r.member) setGuild({ member: false, pending: false, ready: false })
    else if (r.pending) setGuild({ member: true, pending: true, ready: false })
    else setGuild({ member: true, pending: false, ready: true })
  }

  useEffect(() => { checkGuildOnce() }, [discordUserId])

  function openInviteAndPoll() {
    window.open(INVITE_URL, '_blank')
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      await checkGuildOnce()
      setGuild((g) => {
        if (g.ready && pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
        return g
      })
    }, 4000)
  }

  // ====== สั่งซื้อ ======
  async function placeOrder() {
    if (!brief.trim()) { alert('กรุณาพิมพ์บรีฟงาน'); return }
    if (items.length === 0) { alert('ตะกร้าของคุณยังว่าง'); return }
    if (!discordUserId) { alert('กรุณา Login ด้วย Discord ก่อน'); return }
    if (!guild.ready) {
      if (!guild.member) alert('กรุณาเข้าร่วม Discord Server ก่อน')
      else if (guild.pending) alert('กรุณากดยอมรับกฎ (Rules) ใน Discord ก่อน')
      return
    }

    setLoading(true)

    const payload = {
      items: items.map(({ id, name, qty, price, image }: CartItem) => ({
        id, name, qty, price,
        image: (image && /^https?:\/\//i.test(image)) ? image : undefined,
      })),
      customer: { brief: brief.trim(), discordUserId }
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

    setLastChannelId(res.channelId ?? null)

    if (res.inviteUrl) {
      window.open(res.inviteUrl, '_blank')
    }

    clear()
    alert('สร้างห้องใน Discord สำเร็จ! ถ้ามองไม่เห็น ให้กดยอมรับกฎ หรือกด “ตรวจสิทธิ์อีกครั้ง”.')
  }

  // ====== ตรวจสิทธิ์อีกครั้ง (B) ======
  async function grantAgain() {
    if (!lastChannelId || !discordUserId) return alert('ยังไม่มีข้อมูลห้องหรือผู้ใช้')
    const r = await fetch('/api/order/grant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId: lastChannelId, customerDiscordId: discordUserId }),
    }).then(res => res.json())
    if (r?.ok) alert('สิทธิ์ถูกอัปเดตแล้ว ลองเข้าไปที่ห้องอีกครั้ง')
    else alert('อัปเดตสิทธิ์ไม่สำเร็จ โปรดติดต่อแอดมิน')
  }

  if (!mounted) return null

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-8 py-10">
      <h1 className="text-2xl md:text-3xl font-oswald mb-6">Checkout</h1>

      {/* ====== ตะกร้า ====== */}
      {/* ... โค้ดตะกร้าเดิมของคุณ ... */}

      {/* ====== บรีฟงาน ====== */}
      {/* ... โค้ดบรีฟเดิมของคุณ ... */}

      {/* ====== เชื่อมต่อ Discord ====== */}
      <div className="rounded-lg border border-neutral-200 p-4 mb-6">
        <div className="mb-3 font-medium">เชื่อมต่อ Discord</div>
        {!discordUserId ? (
          <button
            onClick={loginWithDiscord}
            className="rounded-md bg-[#5865F2] text-white px-4 py-2 text-sm hover:opacity-90"
          >
            Login with Discord
          </button>
        ) : (
          <div className="space-y-2 text-sm">
            <div>เชื่อมต่อแล้ว: <code className="px-1 rounded bg-neutral-100">{discordUserId}</code></div>

            {!guild.member && (
              <div className="flex items-center gap-2">
                <button onClick={openInviteAndPoll}
                        className="rounded-md bg-neutral-900 text-white px-3 py-1.5 hover:bg-neutral-800">
                  Join Discord Server
                </button>
                <span className="text-neutral-500">รบกวนลูกค้าต้องเข้า Discord ก่อนสั่งซื้อสินค้า</span>
              </div>
            )}

            {guild.member && guild.pending && (
              <div className="text-amber-600">
                ยัง <b>pending</b> — โปรดกดยอมรับกฎใน Discord ก่อน
              </div>
            )}

            {guild.ready && (
              <div className="text-emerald-600">พร้อมสั่งซื้อแล้ว ✅</div>
            )}

            <button onClick={logout}
                    className="rounded-md bg-red-600 text-white px-3 py-1.5 hover:bg-red-700">
              Logout
            </button>
          </div>
        )}
      </div>

      {/* ====== ปุ่มสั่งซื้อ ====== */}
      <div className="flex items-center gap-3">
        <button
          onClick={placeOrder}
          disabled={loading || !discordUserId || !guild.ready}
          className="rounded-md bg-neutral-900 text-white px-5 py-3 hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? 'กำลังสร้างห้อง…' : 'ยืนยันสั่งซื้อ'}
        </button>

        <Link href="/" className="rounded-md border border-neutral-300 px-5 py-3 text-neutral-800 hover:border-neutral-900">
          เลือกสินค้าต่อ
        </Link>
      </div>

      {/* ====== ปุ่มตรวจสิทธิ์อีกครั้ง (B) ====== */}
      {lastChannelId && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <button onClick={grantAgain}
                  className="rounded-md border px-3 py-1.5 hover:bg-neutral-50">
            ตรวจสิทธิ์เข้าห้องอีกครั้ง
          </button>
          <span className="text-neutral-500">ใช้เมื่อเพิ่ง join Discord หรือเพิ่งกดยอมรับกฎ</span>
        </div>
      )}
    </main>
  )
}
