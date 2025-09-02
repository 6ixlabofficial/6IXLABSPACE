import { cookies } from 'next/headers'

const COOKIE_NAME = 'discordUserId'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 วัน

export async function setDiscordUserId(id: string) {
  const store = await cookies()
  store.set({
    name: COOKIE_NAME,
    value: id,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function getDiscordUserId(): Promise<string | null> {
  const store = await cookies()
  const c = store.get(COOKIE_NAME)
  return c?.value ?? null
}

export async function clearDiscordUserId() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
