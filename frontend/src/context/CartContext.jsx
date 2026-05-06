import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('safari_cart') || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('safari_cart', JSON.stringify(items))
  }, [items])

  const add = (producto, cantidad = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.idProducto === producto.idProducto)
      if (existing) return prev.map(i => i.idProducto === producto.idProducto ? { ...i, cantidad: i.cantidad + cantidad } : i)
      return [...prev, { ...producto, cantidad }]
    })
  }

  const remove = (idProducto) => setItems(prev => prev.filter(i => i.idProducto !== idProducto))

  const updateQty = (idProducto, cantidad) => {
    if (cantidad < 1) { remove(idProducto); return }
    setItems(prev => prev.map(i => i.idProducto === idProducto ? { ...i, cantidad } : i))
  }

  const clear = () => setItems([])

  const total    = items.reduce((s, i) => s + Number(i.precioVenta) * i.cantidad, 0)
  const count    = items.reduce((s, i) => s + i.cantidad, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
