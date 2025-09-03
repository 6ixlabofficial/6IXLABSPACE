// app/api/blob/upload/route.ts
import { handleUpload } from '@vercel/blob/client';

// ต้องส่งอ็อบเจ็กต์ (จะว่าง ๆ ก็ได้) เข้าไป 1 ตัว
export const POST = handleUpload({});
