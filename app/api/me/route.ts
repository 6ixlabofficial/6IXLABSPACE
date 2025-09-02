import { NextResponse } from 'next/server'
import { getDiscordUserId, clearDiscordUserId } from '@/lib/session'

export async function GET() {
  const id = await getDiscordUserId()
  return Response.json({ discordUserId: id })
}

export async function DELETE() {
  clearDiscordUserId()
  return NextResponse.json({ ok: true })
}
