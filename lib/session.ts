import { cookies } from 'next/headers'

const COOKIE_NAME = 'discordUserId'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 วัน

export function setDiscordUserId(id: string) {
  cookies().set({
    name: COOKIE_NAME,
    value: id,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export function getDiscordUserId(): string | null {
  const c = cookies().get(COOKIE_NAME)
  return c?.value ?? null
}

export function clearDiscordUserId() {
  cookies().delete(COOKIE_NAME)
}
