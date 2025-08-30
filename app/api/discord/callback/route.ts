import { NextRequest, NextResponse } from 'next/server'
import { setDiscordUserId } from '@/lib/session'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.redirect(new URL('/checkout?error=missing_code', req.url))

  // แลก token
  const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/checkout?error=token_failed', req.url))
  }
  const token = await tokenRes.json() as { access_token: string; token_type: string }

  // ดึงข้อมูล user
  const meRes = await fetch('https://discord.com/api/v10/users/@me', {
    headers: { Authorization: `${token.token_type} ${token.access_token}` },
  })
  if (!meRes.ok) {
    return NextResponse.redirect(new URL('/checkout?error=me_failed', req.url))
  }
  const me = await meRes.json() as { id: string; username: string; discriminator?: string }

  // เก็บ user id ลงคุกกี้
  setDiscordUserId(me.id)

  // กลับไปหน้า checkout
  return NextResponse.redirect(new URL('/checkout?login=success', req.url))
}
