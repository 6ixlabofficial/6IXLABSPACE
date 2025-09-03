import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const GUILD_ID = process.env.DISCORD_GUILD_ID!

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ ok: false, error: 'MISSING_USER_ID' }, { status: 400 })

    const r = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
      cache: 'no-store',
    })

    if (r.status === 200) {
      const m = await r.json()
      const pending = Boolean(m.pending) // true = ยังไม่กดยอมรับกฎ (membership screening)
      return NextResponse.json({ ok: true, member: true, pending })
    }
    if (r.status === 404) return NextResponse.json({ ok: true, member: false })
    return NextResponse.json({ ok: false, error: 'DISCORD_ERROR', status: r.status }, { status: 502 })
  } catch {
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 })
  }
}
