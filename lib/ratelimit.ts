// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
// ตัวอย่าง: 10 req / 60s ต่อคีย์ (เช่น IP)
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true, // optional
  prefix: 'rl:order', // กันชนกับคีย์อื่น
})
