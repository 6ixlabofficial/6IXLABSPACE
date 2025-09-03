// app/api/logout/route.ts
import { NextResponse } from "next/server"
import { clearDiscordUserId } from "@/lib/session"

export async function POST() {
  await clearDiscordUserId()
  return NextResponse.json({ ok: true })
}
