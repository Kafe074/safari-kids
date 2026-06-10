import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  LuShoppingCart, LuPackage, LuSearch, LuArrowLeft, LuPlus, LuTag,
} from 'react-icons/lu'

const CAT_ICONS   = { 'Shampoo & Acondicionador':'🧴', 'Estilizado':'💇', 'Tratamientos':'✨', 'Accesorios':'🎀' }
const CAT_ACCENT  = {
  'Shampoo & Acondicionador': 'var(--sky)',
  'Estilizado':                'var(--purple)',
  'Tratamientos':              'var(--green)',
  'Accesorios':                'var(--pink)',
  'Todos':                     'var(--yellow)',
}
const CAT_BG = {
  'Shampoo & Acondicionador': '#e0f2fe',
  'Estilizado':                '#f3e8ff',
  'Tratamientos':              '#dcfce7',
  'Accesorios':                '#ffe4f0',
}

export default function TiendaPage() {
  const { user }           = useAuth()
  const { add, count }     = useCart()
  const navigate           = useNavigate()
  const [catActiva, setCatActiva] = useState('Todos')
  const [search, setSearch]       = useState('')

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos-public'],
    queryFn: () => api.get('/productos').then(r => r.data.data ?? []),
  })
  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias-public'],
    queryFn: () => api.get('/categoria-productos').then(r => r.data.data ?? []),
  })

  const activos  = productos.filter(p => p.estado === 'Activo')
  const filtered = activos
    .filter(p => catActiva === 'Todos' || p.categoria?.nombre === catActiva)
    .filter(p => !search || p.nombre.toLowerCase().includes(search.toLowerCase()))

  const handleAgregar = (producto) => {
    const rol = user?.rol?.toUpperCase()
    if (!user || rol !== 'CLIENTE') {
      navigate('/login', { state: { intent: 'reservar', message: 'Inicia sesión para comprar productos' } })
      return
    }
    add(producto)
    toast.success(`${producto.nombre} agregado al carrito 🛒`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', paddingTop: 90, fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--ink)',
        padding: '56px 24px 48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative dots */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 18, height: 18,
            borderRadius: '50%',
            background: ['var(--yellow)','var(--pink)','var(--sky)','var(--purple)','var(--orange)','var(--green)'][i],
            left: `${i * 18 + 4}%`,
            top: `${15 + (i % 3) * 25}%`,
            opacity: 0.35,
          }} />
        ))}

        {/* back button */}
        <button
          onClick={() => navigate('/')}
          className="btn btn-y"
          style={{
            position: 'absolute', top: 20, left: 20,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', fontSize: 13,
          }}
        >
          <LuArrowLeft size={16} /> Inicio
        </button>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span className="sticker" style={{ background: 'var(--yellow)', fontSize: 13 }}>🛍️ Tienda</span>
        </div>

        <h1 style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: 'clamp(30px, 5vw, 52px)',
          color: '#fff',
          margin: '0 0 10px',
          lineHeight: 1.1,
        }}>
          Tienda Safari Kids
        </h1>
        <p style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 22,
          color: 'var(--yellow)',
          margin: '0 0 28px',
        }}>
          Productos seleccionados para el cabello de tu peque ✨
        </p>

        {/* search + cart row */}
        <div style={{ maxWidth: 440, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            flex: 1,
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff',
            border: '4px solid var(--ink)',
            borderRadius: 16,
            padding: '10px 16px',
            boxShadow: '4px 4px 0 var(--yellow)',
          }}>
            <LuSearch size={18} color="var(--ink)" style={{ flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontSize: 14, fontFamily: 'inherit', background: 'transparent',
                color: 'var(--ink)',
              }}
            />
          </div>

          <button
            onClick={() => navigate('/carrito')}
            className="btn btn-y"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', flexShrink: 0, position: 'relative' }}
          >
            <LuShoppingCart size={20} />
            {count > 0 && (
              <span style={{
                background: 'var(--pink)', color: '#fff',
                borderRadius: '50%', width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800,
                border: '2px solid var(--ink)',
              }}>
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
          {['Todos', ...categorias.map(c => c.nombre)].map(cat => {
            const isActive = catActiva === cat
            const accent   = CAT_ACCENT[cat] || 'var(--green)'
            return (
              <button
                key={cat}
                onClick={() => setCatActiva(cat)}
                style={{
                  padding: '9px 22px',
                  borderRadius: 50,
                  border: `4px solid var(--ink)`,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all .15s',
                  fontFamily: 'inherit',
                  background: isActive ? accent : '#fff',
                  color: isActive ? (cat === 'Accesorios' || cat === 'Todos' ? 'var(--ink)' : '#fff') : 'var(--ink)',
                  boxShadow: isActive ? '3px 3px 0 var(--ink)' : 'none',
                  transform: isActive ? 'translate(-1px,-1px)' : 'none',
                }}
              >
                {CAT_ICONS[cat] || '🌿'} {cat}
              </button>
            )
          })}
        </div>

        {/* States */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 28, border: '4px solid #ECF3EC', overflow: 'hidden' }}>
                <div className="skel" style={{ height: 140, borderRadius: 0, animationDelay: `${i * 0.08}s` }} />
                <div style={{ padding: '18px 20px' }}>
                  <div className="skel" style={{ height: 12, width: '40%', marginBottom: 10, animationDelay: `${i * 0.08}s` }} />
                  <div className="skel" style={{ height: 18, width: '80%', marginBottom: 14, animationDelay: `${i * 0.08}s` }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="skel" style={{ height: 24, width: 70, animationDelay: `${i * 0.08}s` }} />
                    <div className="skel" style={{ height: 32, width: 90, borderRadius: 999, animationDelay: `${i * 0.08}s` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div className="card-chunky anim-pop-in" style={{ display: 'inline-block', padding: '40px 60px', background: '#fff' }}>
              <LuPackage size={56} color="var(--orange)" style={{ marginBottom: 16 }} className="float" />
              <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: 'var(--ink)', margin: '0 0 8px' }}>
                No se encontraron productos
              </p>
              <p style={{ fontSize: 14, color: '#888', margin: '0 0 18px' }}>
                {search ? `Sin resultados para "${search}"` : 'Prueba con otra categoría'}
              </p>
              {(search || catActiva !== 'Todos') && (
                <button className="btn btn-y" style={{ padding: '10px 22px', fontSize: 14 }}
                  onClick={() => { setSearch(''); setCatActiva('Todos') }}>
                  Ver todos los productos
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
            {filtered.map(p => {
              const topBg  = CAT_BG[p.categoria?.nombre] || '#f0fdf4'
              const icon   = CAT_ICONS[p.categoria?.nombre] || '📦'
              return (
                <div
                  key={p.idProducto}
                  className="card-chunky"
                  style={{
                    background: '#fff',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    cursor: 'default',
                  }}
                >
                  {/* colored top */}
                  <div style={{
                    background: topBg,
                    height: 140,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 60,
                    borderBottom: '4px solid var(--ink)',
                  }}>
                    {icon}
                  </div>

                  <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {p.categoria && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                        <LuTag size={11} color="var(--green)" />
                        <span style={{
                          fontSize: 10, fontWeight: 800, color: 'var(--green)',
                          textTransform: 'uppercase', letterSpacing: 0.8,
                        }}>
                          {p.categoria.nombre}
                        </span>
                      </div>
                    )}

                    <p style={{
                      fontFamily: "'Fredoka One', cursive",
                      fontSize: 17, color: 'var(--ink)',
                      margin: '0 0 6px', lineHeight: 1.25,
                    }}>
                      {p.nombre}
                    </p>

                    {p.descripcion && (
                      <p style={{ fontSize: 12, color: '#666', margin: '0 0 14px', lineHeight: 1.5, flex: 1 }}>
                        {p.descripcion}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{
                        fontFamily: "'Fredoka One', cursive",
                        fontSize: 24, color: 'var(--green)',
                      }}>
                        S/ {Number(p.precioVenta).toFixed(2)}
                      </span>

                      <button
                        onClick={() => handleAgregar(p)}
                        className="btn btn-g"
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', fontSize: 13 }}
                      >
                        <LuPlus size={14} /> Agregar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
