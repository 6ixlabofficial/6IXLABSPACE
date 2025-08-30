'use client'

export default function TestOrderPage() {
  async function placeOrder() {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: '2025-0001',
        items: [{ id: 'tee-classic', name: 'Classic Tee', qty: 1, price: 450 }],
        customer: { name: 'คุณลูกค้า', contact: 'LINE: @yourline' },
      }),
    }).then((r) => r.json())

    console.log(res)
    if (res.ok) {
      alert('สร้างห้องเรียบร้อย! ลองดูใน Discord')
      if (res.inviteUrl) window.open(res.inviteUrl, '_blank')
    } else {
      alert('มีข้อผิดพลาด: ' + res.error)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-10">
      <h1 className="mb-6 text-2xl font-semibold">หน้าทดสอบสั่งซื้อ</h1>
      <button
        onClick={placeOrder}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        ทดสอบสั่งซื้อ
      </button>
    </main>
  )
}
