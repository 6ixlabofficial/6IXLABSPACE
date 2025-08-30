// app/api/order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ratelimit } from '@/lib/ratelimit'

/* ========= ENV ========= */
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const GUILD_ID = process.env.DISCORD_GUILD_ID!
const CATEGORY_ID = process.env.DISCORD_CATEGORY_ID!
const STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID // optional

/* ========= CONST ========= */
// VIEW + SEND + READ_HISTORY + ATTACH + EMBED
const ALLOW_PERMS = '93184' // 1024 + 2048 + 65536 + 8192 + 16384

// Discord snowflake: 17–20 หลัก
const snowflake = z.string().regex(/^\d{17,20}$/, 'invalid discord id')

// Payload schema
const OrderSchema = z.object({
  orderId: z.string().min(1).max(64),
  items: z.array(
    z.object({
      id: z.string().min(1).max(64),
      name: z.string().min(1).max(200),
      qty: z.number().int().min(1).max(999),
      price: z.number().int().min(0).max(1_000_000),
    })
  ).min(1).max(50),
  customer: z.object({
    name: z.string().min(1).max(200),
    contact: z.string().min(1).max(300),
    discordUserId: snowflake.optional(),
  }),
})

/* ========= HELPERS ========= */
function assertEnv() {
  if (!BOT_TOKEN || !GUILD_ID || !CATEGORY_ID) {
    throw new Error('Missing required env: DISCORD_BOT_TOKEN / DISCORD_GUILD_ID / DISCORD_CATEGORY_ID')
  }
}

function normalizeChannelName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90)
}

function buildOverwrites({
  guildId,
  staffRoleId,
  customerUserId,
}: {
  guildId: string
  staffRoleId?: string | null
  customerUserId?: string
}) {
  const overwrites: Array<{ id: string; type: 0 | 1; allow?: string; deny?: string }> = []
  // ❌ ปิด @everyone
  overwrites.push({ id: guildId, type: 0, deny: '1024' /* VIEW_CHANNEL */ })
  // ✅ staff
  if (staffRoleId) overwrites.push({ id: staffRoleId, type: 0, allow: ALLOW_PERMS })
  // ✅ ลูกค้า
  if (customerUserId) overwrites.push({ id: customerUserId, type: 1, allow: ALLOW_PERMS })
  return overwrites
}

function buildEmbed(order: z.infer<typeof OrderSchema>, total: number) {
  return {
    title: `รายละเอียดออเดอร์ #${order.orderId}`,
    color: 0x111827,
    fields: [
      { name: 'ลูกค้า', value: order.customer.name, inline: true },
      { name: 'ติดต่อ', value: order.customer.contact, inline: true },
      ...(order.customer.discordUserId
        ? [{ name: 'Discord', value: `<@${order.customer.discordUserId}>`, inline: true }]
        : []),
      {
        name: 'รายการ',
        value:
          order.items.map(i => `• ${i.name} × ${i.qty} — ${i.price.toLocaleString('th-TH')}฿`).join('\n') || '-',
      },
      { name: 'รวม', value: `**${total.toLocaleString('th-TH')}฿**`, inline: true },
    ],
    footer: { text: '6IXLAB Orders' },
    timestamp: new Date().toISOString(),
  }
}

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

/* ========= HANDLER ========= */
export async function POST(req: NextRequest) {
  try {
    assertEnv()

    // Method / Content-Type guard
    if (req.method !== 'POST') {
      return NextResponse.json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, { status: 405 })
    }
    const ct = req.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'UNSUPPORTED_MEDIA_TYPE' }, { status: 415 })
    }

    // --- Rate limit ตาม IP (Upstash) ---
    const ip =
      req.ip ??
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'

    const { success, limit, remaining, reset } = await ratelimit.limit(`order:${ip}`)
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

    // Parse & validate
    const bodyRaw = await req.json()
    const body = OrderSchema.parse(bodyRaw)

    // 1) สร้าง channel
    const createChannelRes = await fetchWithTimeout(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/channels`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${BOT_TOKEN}`,
        },
        body: JSON.stringify({
          name: normalizeChannelName(`order-${body.orderId}`),
          type: 0, // GUILD_TEXT
          parent_id: CATEGORY_ID,
          topic: `Order #${body.orderId} • ${body.customer.name} • ${body.customer.contact}`,
          permission_overwrites: buildOverwrites({
            guildId: GUILD_ID,
            staffRoleId: STAFF_ROLE_ID,
            customerUserId: body.customer.discordUserId,
          }),
        }),
        timeoutMs: 15_000,
      }
    )

    if (!createChannelRes.ok) {
      const t = await createChannelRes.text().catch(() => '')
      console.error('[DISCORD] create channel failed:', createChannelRes.status, t)
      return NextResponse.json({ ok: false, error: 'DISCORD_CREATE_CHANNEL_FAILED' }, { status: 502 })
    }

    const channel = (await createChannelRes.json()) as { id: string }

    // 2) โพสต์ Embed + content
    const total = body.items.reduce((s, i) => s + i.price * i.qty, 0)
    const postMsg = await fetchWithTimeout(
      `https://discord.com/api/v10/channels/${channel.id}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bot ${BOT_TOKEN}` },
        body: JSON.stringify({
          content: `🛒 **Order #${body.orderId}**`,
          embeds: [buildEmbed(body, total)],
        }),
        timeoutMs: 15_000,
      }
    )
    if (!postMsg.ok) {
      const t = await postMsg.text().catch(() => '')
      console.error('[DISCORD] post message failed:', postMsg.status, t)
    }

    // 3) สร้าง invite (optional)
    let inviteUrl: string | undefined
    const inviteRes = await fetchWithTimeout(
      `https://discord.com/api/v10/channels/${channel.id}/invites`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bot ${BOT_TOKEN}` },
        body: JSON.stringify({ max_age: 86400, max_uses: 1, temporary: false }),
        timeoutMs: 10_000,
      }
    )
    if (inviteRes.ok) {
      const invite = (await inviteRes.json()) as { code: string }
      inviteUrl = `https://discord.gg/${invite.code}`
    }

    // 4) DM ลูกค้า (ถ้ามี id)
    if (body.customer.discordUserId) {
      try {
        const dmRes = await fetchWithTimeout('https://discord.com/api/v10/users/@me/channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bot ${BOT_TOKEN}` },
          body: JSON.stringify({ recipient_id: body.customer.discordUserId }),
          timeoutMs: 10_000,
        })
        if (dmRes.ok) {
          const dm = (await dmRes.json()) as { id: string }
          await fetchWithTimeout(`https://discord.com/api/v10/channels/${dm.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bot ${BOT_TOKEN}` },
            body: JSON.stringify({
              content: `เราเปิดห้องคุยออเดอร์ของคุณแล้ว: https://discord.com/channels/${GUILD_ID}/${channel.id}`,
            }),
            timeoutMs: 10_000,
          })
        }
      } catch {
        // ผู้ใช้บางรายปิด DM — ข้ามได้
      }
    }

    return NextResponse.json({ ok: true, channelId: channel.id, inviteUrl })
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ ok: false, error: 'INVALID_PAYLOAD', detail: err.issues }, { status: 400 })
    }
    console.error('[ORDER_API]', err)
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 })
  }
}
