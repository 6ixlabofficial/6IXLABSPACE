// components/CartContext.tsx
'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  image?: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (i: CartItem) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  count: number
  total: number
}

const CartCtx = createContext<CartContextType | null>(null)

// ใช้คีย์เวอร์ชันใหม่ + migrate จากคีย์เก่าอัตโนมัติ
const CART_KEY = 'cart.v1'
const OLD_KEY = 'cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // 1) โหลดครั้งเดียวตอน mount + migrate คีย์เก่า
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      let raw = localStorage.getItem(CART_KEY)
      if (!raw) {
        // migrate จากคีย์เก่า (ถ้ามี)
        const oldRaw = localStorage.getItem(OLD_KEY)
        if (oldRaw) {
          localStorage.setItem(CART_KEY, oldRaw)
          localStorage.removeItem(OLD_KEY)
          raw = oldRaw
        }
      }
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setItems(parsed.filter(Boolean))
        }
      }
    } catch {
      // ถ้า parse พัง ให้เริ่มตะกร้าใหม่
      setItems([])
    }
  }, [])

  // 2) บันทึกลง LocalStorage ทุกครั้งที่ตะกร้าเปลี่ยน
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch {
      // พื้นที่เต็ม/โหมดพิเศษ → ข้ามได้
    }
  }, [items])

  // 3) sync ข้ามแท็บ/หน้าต่าง
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed)) setItems(parsed)
        } catch {}
      }
      if (e.key === CART_KEY && e.newValue === null) {
        setItems([])
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // ===== actions =====
  const addItem = (i: CartItem) => {
    setItems(prev => {
      const idx = prev.findIndex(p => p.id === i.id)
      if (idx > -1) {
        const copy = [...prev]
        const old = copy[idx]
        copy[idx] = {
          ...old,
          // อัปเดตข้อมูลล่าสุด (ชื่อ/ราคา/รูป) เผื่อรายการเปลี่ยนแปลง
          name: i.name ?? old.name,
          price: i.price ?? old.price,
          image: i.image ?? old.image,
          qty: Math.min(999, old.qty + Math.max(1, i.qty || 1)),
        }
        return copy
      }
      return [...prev, { ...i, qty: Math.max(1, Math.min(999, i.qty || 1)) }]
    })
  }

  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const setQty = (id: string, qty: number) => {
    setItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, qty: Math.max(1, Math.min(999, Math.floor(qty || 1))) } : i
      )
    )
  }

  const clear = () => setItems([])

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items])
  const total = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items])

  const value = useMemo<CartContextType>(
    () => ({ items, addItem, remove, setQty, clear, count, total }),
    [items, count, total]
  )

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
