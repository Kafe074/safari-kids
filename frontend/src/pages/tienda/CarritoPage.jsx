import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { ventasApi } from '../../api/ventas'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function CarritoPage() {
  const { items, remove, updateQty, clear, total } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (items.length === 0) return
    setLoading(true)
    try {
      await ventasApi.checkout(items.map(i => ({ idProducto: i.idProducto, cantidad: i.cantidad })))
      clear()
      toast.success('¡Compra realizada con éxito! 🎉')
      navigate('/mi-cuenta')
    } catch {
      toast.error('Error al procesar la compra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', paddingTop: 90, fontFamily: "'Nunito',sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1b5e20,#2E7D32)', padding: '50px 24px 40px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(28px,4vw,44px)', color: '#fff', margin: '0 0 8px' }}>
          Mi Carrito 🛒
        </h1>
        <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 15, margin: 0 }}>
          {items.length === 0 ? 'Tu carrito está vacío' : `${items.length} producto${items.length > 1 ? 's' : ''} seleccionado${items.length > 1 ? 's' : ''}`}
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
            <p style={{ color: '#888', fontSize: 16, marginBottom: 24 }}>No tienes productos en tu carrito</p>
            <button onClick={() => navigate('/tienda')} style={{
              background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 12,
              padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Ir a la tienda
            </button>
          </div>
        ) : (
          <>
            {/* Item list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {items.map(item => (
                <div key={item.idProducto} style={{
                  background: '#fff', borderRadius: 16, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                  boxShadow: '0 2px 10px rgba(0,0,0,.06)', border: '1px solid #f0f0f0',
                }}>
                  <div style={{ fontSize: 40, flexShrink: 0 }}>📦</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: 15, color: '#1a2e1a', margin: '0 0 2px' }}>{item.nombre}</p>
                    {item.categoria && (
                      <span style={{ fontSize: 11, color: '#2E7D32', fontWeight: 700, textTransform: 'uppercase' }}>{item.categoria.nombre}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => updateQty(item.idProducto, item.cantidad - 1)} style={qtyBtn}>−</button>
                    <span style={{ width: 28, textAlign: 'center', fontWeight: 800, fontSize: 15 }}>{item.cantidad}</span>
                    <button onClick={() => updateQty(item.idProducto, item.cantidad + 1)} style={qtyBtn}>+</button>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 80 }}>
                    <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#2E7D32', margin: 0 }}>
                      S/ {(Number(item.precioVenta) * item.cantidad).toFixed(2)}
                    </p>
                    <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>S/ {Number(item.precioVenta).toFixed(2)} c/u</p>
                  </div>
                  <button onClick={() => remove(item.idProducto)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#e57373', fontSize: 18, flexShrink: 0, padding: 4,
                  }}>✕</button>
                </div>
              ))}
            </div>

            {/* Summary card */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: '24px 28px',
              boxShadow: '0 4px 20px rgba(0,0,0,.08)', border: '1px solid #f0f0f0',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#555' }}>Total a pagar</span>
                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: '#2E7D32' }}>
                  S/ {total.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => navigate('/tienda')} style={{
                  flex: 1, background: '#f5f5f5', color: '#555', border: 'none', borderRadius: 12,
                  padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  ← Seguir comprando
                </button>
                <button onClick={handleCheckout} disabled={loading} style={{
                  flex: 2, background: loading ? '#aaa' : '#F9A825', color: '#fff', border: 'none', borderRadius: 12,
                  padding: '13px', fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  transition: 'background .15s',
                }}>
                  {loading ? 'Procesando...' : '✓ Confirmar compra'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const qtyBtn = {
  width: 30, height: 30, borderRadius: 8, border: '1.5px solid #e0e0e0',
  background: '#f9f9f9', fontSize: 16, fontWeight: 800, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
}
