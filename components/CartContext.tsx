'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type CartItem = { id:string; name:string; price:number; qty:number }
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem('cart')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  useEffect(() => {
    try { localStorage.setItem('cart', JSON.stringify(items)) } catch {}
  }, [items])

  const addItem = (i: CartItem) =>
    setItems(prev => {
      const idx = prev.findIndex(p => p.id === i.id)
      if (idx > -1) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + i.qty }
        return copy
      }
      return [...prev, i]
    })

  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const setQty = (id: string, qty: number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
  const clear = () => setItems([])

  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => s + i.qty * i.price, 0)

  return (
    <CartCtx.Provider value={{ items, addItem, remove, setQty, clear, count, total }}>
      {children}
    </CartCtx.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
