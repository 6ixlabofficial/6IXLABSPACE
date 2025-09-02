// app/api/order/close/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ratelimit } from '@/lib/ratelimit' // ใช้ตัวเดียวกับ /api/order
// ต้องมี env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

function getClientIp(req: NextRequest) {
  const xff = req.headers.get('x-forwarded-for');
  const ipFromXff = xff?.split(',')[0]?.trim();
  return ipFromXff ?? req.headers.get('x-real-ip') ?? 'unknown';
}

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const ADMIN_SECRET = process.env.ADMIN_SECRET!

const CloseSchema = z.object({
  channelId: z.string().regex(/^\d{17,20}$/),          // Discord snowflake
  action: z.enum(['close', 'delete']).default('close') // ปิดห้อง (rename + msg) หรือ ลบห้อง
})

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 15_000, ...rest } = init
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...rest, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

export async function POST(req: NextRequest) {
  try {
    // ── Guard: method + admin secret
    if (req.method !== 'POST') {
      return NextResponse.json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, { status: 405 })
    }
    if (!ADMIN_SECRET) {
      return NextResponse.json({ ok: false, error: 'MISSING_ADMIN_SECRET' }, { status: 500 })
    }
    const secret = req.headers.get('x-admin-secret')
    if (!secret || secret !== ADMIN_SECRET) {
      return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }

    // ── Rate limit (Upstash) — ต่อ IP ผู้เรียก
    const ip = getClientIp(req);
    const { success, limit, remaining, reset } = await ratelimit.limit(`close:${ip}`)
    if (!success) {
      return NextResponse.json(
        { ok: false, error: 'RATE_LIMITED' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(Math.max(0, remaining)),
            'X-RateLimit-Reset': String(reset),
          },
        }
      )
    }

    // ── Validate payload
    const payload = CloseSchema.parse(await req.json())

    if (payload.action === 'delete') {
      // ลบห้อง
      const r = await fetchWithTimeout(`https://discord.com/api/v10/channels/${payload.channelId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
        timeoutMs: 15_000,
      })
      if (!r.ok) {
        const t = await r.text().catch(() => '')
        console.error('[DISCORD] delete channel failed:', r.status, t)
        return NextResponse.json({ ok: false, error: 'DELETE_FAILED' }, { status: 502 })
      }
      return NextResponse.json({ ok: true })
    }

    // action === 'close' → เปลี่ยนชื่อ + ส่งข้อความสรุป
    const patch = await fetchWithTimeout(`https://discord.com/api/v10/channels/${payload.channelId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bot ${BOT_TOKEN}` },
      body: JSON.stringify({ name: `closed-${Date.now()}` }),
      timeoutMs: 15_000,
    })
    if (!patch.ok) {
      const t = await patch.text().catch(() => '')
      console.error('[DISCORD] patch channel failed:', patch.status, t)
      // ไม่ต้อง fail ทั้ง flow
    }

    await fetchWithTimeout(`https://discord.com/api/v10/channels/${payload.channelId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bot ${BOT_TOKEN}` },
      body: JSON.stringify({ content: '✅ งานนี้ปิดแล้ว ขอบคุณที่ใช้บริการ 6IXLAB' }),
      timeoutMs: 10_000,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ ok: false, error: 'INVALID_PAYLOAD', detail: err.issues }, { status: 400 })
    }
    console.error('[ORDER_CLOSE_API]', err)
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 })
  }
}
