// components/HowToOrder.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

type Step = {
  title: string
  detail: string
}

const STEPS: Step[] = [
  {
    title: 'ล็อกอินด้วย Discord',
    detail:
      'กดปุ่ม “Login with Discord” เพื่อเชื่อมบัญชีของคุณกับระบบสั่งซื้อ',
  },
  {
    title: 'เข้าร่วม Discord Server',
    detail:
      'ถ้ายังไม่ได้เข้าดิสคอร์ด ให้กด “Join Discord Server” แล้วเปิดลิงก์เชิญ',
  },
  {
    title: 'กรอกบรีฟงาน',
    detail:
      'อธิบายความต้องการ เช่น ประเภท/สี/ลาย/โลโก้/ขนาด/ตัวอย่างภาพอ้างอิงให้ละเอียด',
  },
  {
    title: 'ตรวจตะกร้าและยืนยันสั่งซื้อ',
    detail:
      'ตรวจรายการสินค้าและยอดรวม จากนั้นกด “ยืนยันสั่งซื้อ” ระบบจะสร้างห้อง Order ให้คุณอัตโนมัติ',
  },
  {
    title: 'หากไม่เห็นห้อง',
    detail:
      'ให้กดปุ่ม “ตรวจสิทธิ์เข้าห้องอีกครั้ง” หรือกลับไปยืนยันกฎใน Discord ให้เรียบร้อย',
  },
]

export default function HowToOrder({
  showMini = false,             // true = โหมดสั้น (หัวข้อ+สรุป)
  className = '',
}: { showMini?: boolean; className?: string }) {
  const [open, setOpen] = useState(false)

  if (showMini) {
    return (
      <div className={`rounded-lg border border-neutral-200 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium">วิธีสั่งซื้อโดยย่อ</h3>
        </div>
        <ol className="mt-3 list-decimal pl-5 space-y-1 text-sm text-neutral-700">
          <li>Login ด้วย Discord </li>
          <li>เข้า Discord ของร้าน</li>
          <li>กรอกบรีฟงาน → ตรวจตะกร้า → ยืนยันสั่งซื้อ</li>
          <li>ไม่เห็นห้อง? ใช้ปุ่ม “ตรวจสิทธิ์อีกครั้ง”</li>
        </ol>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border border-neutral-200 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between"
        aria-expanded={open}
      >
        <span className="font-medium">วิธีสั่งซื้อ (Step-by-step)</span>
        <span className="text-neutral-500">{open ? 'ซ่อน' : 'แสดง'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4">
          <ol className="list-decimal pl-5 space-y-3 text-sm text-neutral-800">
            {STEPS.map((s, i) => (
              <li key={i}>
                <div className="font-medium">{s.title}</div>
                <p className="text-neutral-600">{s.detail}</p>
              </li>
            ))}
          </ol>

          {/* ลิงก์ช่วยเหลือเพิ่มเติม (ถ้ามีหน้า /help หรือ /contact) */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <Link href="/contact" className="underline underline-offset-2 hover:text-neutral-900">
              ติดต่อทีมงาน
            </Link>
            <Link href="/about" className="underline underline-offset-2 hover:text-neutral-900">
              เกี่ยวกับเรา
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
