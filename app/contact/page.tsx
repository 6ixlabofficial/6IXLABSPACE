import Link from 'next/link'

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 md:px-8 py-12">
      <h1 className="text-2xl md:text-3xl font-oswald mb-4">Contact</h1>
      <p className="text-neutral-700 leading-7">
        สนใจสั่งทำ/สอบถามราคา/งานด่วน ติดต่อเราได้ที่ช่องทางด้านล่าง เราพร้อมตอบกลับโดยเร็วที่สุด
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {/* 👇 เปลี่ยนลิงก์ให้เป็นของจริงของคุณ */}
        <a
          href="https://discord.gg/ZAPXTwUYmW"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-neutral-900 px-5 py-3 text-sm text-white shadow hover:shadow-md"
        >
          Discord
        </a>
        <a
          href="https://www.facebook.com/sixlab.design/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-neutral-300 px-5 py-3 text-sm text-neutral-800 hover:border-neutral-900"
        >
          FACEBOOK
        </a>
        <a
          href="https://line.me/R/ti/p/your-id"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-neutral-300 px-5 py-3 text-sm text-neutral-800 hover:border-neutral-900"
        >
          LINE
        </a>
      </div>

      <div className="mt-8 text-sm text-neutral-500">
        เวลาทำการ: 10:00–00:00 (จันทร์–อาทิตย์)
      </div>
    </main>
  )
}
