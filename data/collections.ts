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
    name: 'Classic Tee',
    images: [
      '/images/collections/tn1-sowhat.png',
      '/images/collections/classic-tee-2.svg',
      '/images/collections/fabric-detail.svg',
    ],
  },
  {
    id: 'item-02',
    name: 'Overshirt',
    images: [
      '/images/collections/overshirt-1.svg',
      '/images/collections/overshirt-2.svg',
    ],
  },
  {
    id: 'item-03',
    name: 'Silk Slip',
    images: [
      '/images/collections/silk-slip-1.svg',
      '/images/collections/silk-slip-2.svg',
    ],
  },
  {
    id: 'item-04',
    name: 'Wool Coat',
    images: [
      '/images/collections/wool-coat-1.svg',
      '/images/collections/wool-coat-2.svg',
    ],
  },
  // …เพิ่มชิ้นใหม่ได้เรื่อย ๆ
]
