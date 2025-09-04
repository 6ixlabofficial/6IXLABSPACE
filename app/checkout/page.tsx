'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart, type CartItem } from '@/components/CartContext'

// แก้เป็นลิงก์เชิญจริงของกิลด์คุณ
const INVITE_URL = 'https://discord.gg/yourInvite'

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

  // เชิญ + poll สถานะจนกว่าจะพร้อม (สูงสุด ~40s)
  function openInviteAndPoll() {
    window.open(INVITE_URL, '_blank')
    if (pollRef.current) clearInterval(pollRef.current)

    let ticks = 0
    pollRef.current = setInterval(async () => {
      await checkGuildOnce()
      ticks++
      setGuild((g) => {
        if (g.ready && pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
        return g
      })
      if (ticks > 10 && pollRef.current) { // 10 * 4s ≈ 40s
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }, 4000)
  }

  // รีเฟรชอัตโนมัติเมื่อโฟกัสหน้า/แท็บกลับมา visible
  useEffect(() => {
    const onFocus = () => {
      checkGuildOnce()
      if (discordUserId && !guild.ready) {
        if (pollRef.current) clearInterval(pollRef.current)
        let ticks = 0
        pollRef.current = setInterval(async () => {
          await checkGuildOnce()
          ticks++
          setGuild((g) => {
            if (g.ready && pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
            return g
          })
          if (ticks > 10 && pollRef.current) {
            clearInterval(pollRef.current)
            pollRef.current = null
          }
        }, 3000)
        // safety stop ที่ 30s
        setTimeout(() => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }, 30000)
      }
    }

    window.addEventListener('focus', onFocus)
    const onVis = () => { if (document.visibilityState === 'visible') onFocus() }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [discordUserId, guild.ready])

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

// ตัวอย่างเช็กอย่างง่าย
function validateFile(file: File) {
  const okType = /^image\//.test(file.type) || /pdf$|zip$/.test(file.type);
  if (!okType) throw new Error('รองรับเฉพาะรูป, PDF, ZIP');
  const max = 10 * 1024 * 1024; // 10MB
  if (file.size > max) throw new Error('ไฟล์ใหญ่เกิน 10MB');
}

    const payload = {
      items: items.map(({ id, name, qty, price, image }: CartItem) => ({
        id, name, qty, price,
        // ส่ง image เฉพาะกรณีเป็น URL เต็ม กัน INVALID_PAYLOAD
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
                      onClick={() => setQty(item.id, Math.max(1, item.qty - 1))}
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

      {/* ====== บรีฟงาน + แนบไฟล์ ====== */}
      <div className="rounded-lg border border-neutral-200 p-4 mb-6">
        <div className="mb-3 font-medium">บรีฟงาน</div>
        <textarea
          className="min-h-[140px] rounded-md border border-neutral-300 px-3 py-2 text-sm w-full disabled:bg-neutral-100 disabled:text-neutral-400"
          placeholder="กรุณาเชื่อมต่อ Discord ก่อนจึงจะสามารถพิมพ์บรีฟงานได้"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          disabled={!discordUserId} // ✅ ยังไม่เชื่อม Discord → พิมพ์บรีฟไม่ได้
        />
        <p className="mt-2 text-xs text-neutral-500">
          *คุณสามารถบรีฟงานเบื้องต้นในช่องนี้ และทีมงานจะคุยรายละเอียดเพิ่มเติมกับคุณต่อในห้อง Discord
        </p>

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
                <span className="text-neutral-500">เข้ากิลด์ก่อน แล้วค่อยสั่งซื้อ</span>
              </div>
            )}

            {guild.member && guild.pending && (
              <div className="text-amber-600">
                ยัง <b>pending</b> — โปรดกดยอมรับกฎใน Discord ก่อน
              </div>
            )}

            {guild.member && !guild.pending && (
              <div className="text-emerald-600">พร้อมสั่งซื้อแล้ว ✅</div>
            )}

            {/* ปุ่ม manual refresh */}
            {discordUserId && !guild.ready && (
              <div className="mt-2">
                <button
                  onClick={checkGuildOnce}
                  className="rounded-md border px-3 py-1.5 hover:bg-neutral-50 text-sm"
                >
                  ฉันเข้าร่วมแล้ว / รีเฟรชสถานะ
                </button>
                <p className="text-xs text-neutral-500 mt-1">
                  ถ้าเพิ่งกดยอมรับกฎใน Discord ให้กดปุ่มนี้เพื่ออัปเดตสถานะ
                </p>
              </div>
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
