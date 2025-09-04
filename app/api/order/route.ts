// app/api/order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ratelimit } from '@/lib/ratelimit'
import { redis } from '@/lib/redis'

function extractUrls(text: string): string[] {
  const re = /(https?:\/\/[^\s<>()]+[^.,\s<>()])/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) && out.length < 5) out.push(m[0]);
  return out;
}

// --- Helper: get client IP safely from headers (works on Vercel/Edge) ---
function getClientIp(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for");
  const ipFromXff = xff?.split(",")[0]?.trim();
  return ipFromXff ?? req.headers.get("x-real-ip") ?? "unknown";
}

/* ========= ENV ========= */
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const GUILD_ID = process.env.DISCORD_GUILD_ID!
const CATEGORY_ID = process.env.DISCORD_CATEGORY_ID!
const STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID // optional

/* ========= CONST ========= */
const ALLOW_PERMS = '93184' // VIEW+SEND+READ_HISTORY+ATTACH+EMBED
const snowflake = z.string().regex(/^\d{17,20}$/, 'invalid discord id')

/* ========= SCHEMA ========= */
// ✅ รองรับ customer.fileUrl (ลิงก์ไฟล์จาก Vercel Blob)
const OrderSchema = z.object({
  orderId: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string().min(1).max(64),
      name: z.string().min(1).max(200),
      qty: z.number().int().min(1).max(999),
      price: z.number().int().min(0).max(1_000_000),
      image: z.string().url().optional(), // ถ้าเป็น URL เต็มเท่านั้น
    })
  ).min(1).max(50),
  customer: z.object({
    brief: z.string().min(1).max(2000),
    name: z.string().max(200).optional(),
    contact: z.string().max(300).optional(),
    discordUserId: snowflake.optional(),
    fileUrl: z.string().url().optional(), // ✅ เพิ่มฟิลด์นี้
  }),
})

/* ========= ORDER ID GENERATOR ========= */
async function nextOrderId() {
  const n = await redis.incr('order:counter')
  return `ORD-${String(n).padStart(6, '0')}`
}

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

function buildEmbed(order: z.infer<typeof OrderSchema>, total: number, imageUrl?: string) {
  const list =
    order.items.map(i => `• ${i.name} × ${i.qty} — ${i.price.toLocaleString('th-TH')}฿`).join('\n') || '-';

    return {
    title: `รายละเอียดออเดอร์ #${order.orderId}`,
    color: 0x111827,
    fields: [
      ...(order.customer.name ? [{ name: 'ลูกค้า', value: order.customer.name, inline: true }] : []),
      ...(order.customer.contact ? [{ name: 'ติดต่อ', value: order.customer.contact, inline: true }] : []),
      ...(order.customer.discordUserId
        ? [{ name: 'Discord', value: `<@${order.customer.discordUserId}>`, inline: true }]
        : []),
      { name: 'บรีฟงาน', value: order.customer.brief.slice(0, 1024) },
      { name: 'รายการ', value: list.slice(0, 1024) },
      { name: 'รวม', value: `**${total.toLocaleString('th-TH')}฿**`, inline: true },
    ],
    ...(imageUrl ? { image: { url: imageUrl } } : {}), // ✅ ถ้ามีรูป ให้แสดงเป็นภาพใน embed
    footer: { text: '6IXLAB Orders' },
    timestamp: new Date().toISOString(),
  };
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

    const ct = req.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'UNSUPPORTED_MEDIA_TYPE' }, { status: 415 })
    }

    // --- Rate limit (Upstash) ---
    const ip = getClientIp(req)
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
    const raw = await req.json()
    const parsed = OrderSchema.parse(raw)

    // gen order id ถ้าไม่ส่งมา
    const orderId = parsed.orderId ?? await nextOrderId()

    // Topic แสดงบรีฟสั้น ๆ + ชื่อ/ติดต่อ (ถ้ามี)
    const topicParts = [
      `Order #${orderId}`,
      parsed.customer.name ? `• ${parsed.customer.name}` : null,
      parsed.customer.contact ? `• ${parsed.customer.contact}` : null,
      `• ${parsed.customer.brief}`,
    ].filter(Boolean)

    const topic = topicParts.join(' ').slice(0, 1024)

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
          name: normalizeChannelName(`order-${orderId}`),
          type: 0,
          parent_id: CATEGORY_ID,
          topic,
          permission_overwrites: buildOverwrites({
            guildId: GUILD_ID,
            staffRoleId: STAFF_ROLE_ID,
            customerUserId: parsed.customer.discordUserId,
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

    // 2) โพสต์ Embed
const total = parsed.items.reduce((s, i) => s + i.price * i.qty, 0);

// ✅ ดึงลิงก์จากบรีฟ (สูงสุด 3 ลิงก์)
const urls = extractUrls(parsed.customer.brief).slice(0, 3);

// ✅ ถ้าเจอลิงก์รูป ใช้เป็นภาพหลักของ embed
const imageUrl = urls.find(u => /\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(u));

// ✅ ใส่ลิงก์ไว้ใน content เพื่อให้ Discord unfurl/กดได้สะดวก
const linksBlock = urls.length
  ? `\n\n🔗 **อ้างอิง**\n${urls.join('\n')}`
  : '';

await fetchWithTimeout(
  `https://discord.com/api/v10/channels/${channel.id}/messages`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bot ${BOT_TOKEN}` },
    body: JSON.stringify({
      content: `🛒 **Order #${orderId}**${linksBlock}`, // ← ลิงก์มาอยู่ที่ content
      embeds: [buildEmbed({ ...parsed, orderId }, total, imageUrl)], // ← แนบรูปถ้ามี
    }),
    timeoutMs: 15_000,
  }
);

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

    return NextResponse.json({ ok: true, orderId, channelId: channel.id, inviteUrl })
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ ok: false, error: 'INVALID_PAYLOAD', detail: err.issues }, { status: 400 })
    }
    console.error('[ORDER_API]', err)
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 })
  }
}
