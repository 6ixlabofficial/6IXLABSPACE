// app/api/blob/upload/route.ts
import { handleUpload } from '@vercel/blob/client';

/**
 * Compat shim: รองรับ @vercel/blob หลายเวอร์ชัน
 * - บางเวอร์ชันต้องเรียกแบบ handleUpload({ request })
 * - บางเวอร์ชันต้องเรียกแบบ handleUpload(request)
 */
export async function POST(request: Request) {
  try {
    // รูปแบบใหม่: รับ options object ที่มี request
    // @ts-ignore: รองรับ type ของบางเวอร์ชัน
    return await handleUpload({ request });
  } catch {
    // รูปแบบเก่า: รับ request เป็นอาร์กิวเมนต์แรก
    // @ts-ignore: รองรับ type ของบางเวอร์ชัน
    return await handleUpload(request);
  }
}
