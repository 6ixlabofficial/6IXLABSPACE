import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const GUILD_ID = process.env.DISCORD_GUILD_ID!
const STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID
const ALLOW = '93184' // VIEW+SEND+READ_HISTORY+ATTACH+EMBED

export async function POST(req: NextRequest) {
  try {
    const { channelId, customerDiscordId } = await req.json()
    if (!channelId || !customerDiscordId) {
      return NextResponse.json({ ok: false, error: 'MISSING_PARAMS' }, { status: 400 })
    }

    const r = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bot ${BOT_TOKEN}` },
      body: JSON.stringify({
        permission_overwrites: [
          { id: GUILD_ID, type: 0, deny: '1024' },                // deny @everyone (VIEW)
          ...(STAFF_ROLE_ID ? [{ id: STAFF_ROLE_ID, type: 0, allow: ALLOW }] : []),
          { id: customerDiscordId, type: 1, allow: ALLOW },        // allow ลูกค้า
        ],
      }),
    })

    if (!r.ok) {
      const t = await r.text().catch(()=>'')
      return NextResponse.json({ ok:false, error:'DISCORD_PATCH_FAILED', detail: t.slice(0,500) }, { status:502 })
    }
    return NextResponse.json({ ok:true })
  } catch {
    return NextResponse.json({ ok:false, error:'SERVER_ERROR' }, { status:500 })
  }
}
