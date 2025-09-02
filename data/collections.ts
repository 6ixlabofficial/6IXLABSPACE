// data/collections.ts
export type CollectionItem = {
  id: string
  name: string
  images: string[]          // ← รูปหลายรูปของ "ชิ้นนั้น"
}

// ตัวอย่าง: เปลี่ยนพาธรูปให้ตรงไฟล์จริงของคุณใน public/images/collections/
export const COLLECTIONS: CollectionItem[] = [
  {
    id: 'item-01',
    name: 'SoWhat',
    images: [
      '/images/collections/sowhat/sowhat-1.png',
      '/images/collections/sowhat/sowhat-2.png',
    ],
  },

  // …เพิ่มชิ้นใหม่ได้เรื่อย ๆ
]
