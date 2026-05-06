import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const CAT_ICONS  = { 'Shampoo & Acondicionador':'🧴', 'Estilizado':'💇', 'Tratamientos':'✨', 'Accesorios':'🎀' }
const CAT_COLORS = { 'Shampoo & Acondicionador':'#e3f2fd', 'Estilizado':'#f3e5f5', 'Tratamientos':'#e8f5e9', 'Accesorios':'#fff8e1' }

export default function TiendaPage() {
  const { user } = useAuth()
  const { add, count } = useCart()
  const navigate = useNavigate()
  const [catActiva, setCatActiva] = useState('Todos')
  const [search, setSearch] = useState('')

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
    <div style={{ minHeight:'100vh', background:'#f5f0e8', paddingTop:90, fontFamily:"'Nunito',sans-serif" }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1b5e20,#2E7D32)', padding:'60px 24px 50px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        {['🧴','✨','🎀','💇','🌿','⭐'].map((e,i) => (
          <div key={i} style={{ position:'absolute', left:`${i*18+5}%`, top:`${20+i*10}%`, fontSize:24, opacity:.1, animation:`floatSlow ${5+i}s ease-in-out ${i*.4}s infinite` }}>{e}</div>
        ))}
        <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:'clamp(32px,5vw,52px)', color:'#fff', margin:'0 0 12px' }}>
          Tienda Safari Kids 🛍️
        </h1>
        <p style={{ color:'rgba(255,255,255,.85)', fontSize:16, maxWidth:480, margin:'0 auto 28px' }}>
          Productos seleccionados para el cabello de tu peque
        </p>
        <div style={{ maxWidth:380, margin:'0 auto', display:'flex', gap:12, alignItems:'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar producto..."
            style={{ flex:1, padding:'12px 18px', borderRadius:12, border:'none', fontSize:14, outline:'none', fontFamily:'inherit' }} />
          {count > 0 && (
            <button onClick={() => navigate('/carrito')} style={{
              background:'#F9A825', color:'#fff', border:'none', borderRadius:12,
              padding:'12px 18px', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit',
              display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap',
            }}>
              🛒 {count}
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 24px' }}>

        {/* Filtros */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:32 }}>
          {['Todos', ...categorias.map(c => c.nombre)].map(cat => (
            <button key={cat} onClick={() => setCatActiva(cat)} style={{
              padding:'8px 20px', borderRadius:24, border:'1.5px solid', fontSize:14, fontWeight:700, cursor:'pointer', transition:'all .2s',
              background: catActiva===cat ? '#2E7D32' : '#fff',
              color: catActiva===cat ? '#fff' : '#2E7D32', borderColor:'#2E7D32',
            }}>
              {CAT_ICONS[cat] || '🌿'} {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ textAlign:'center', padding:60, color:'#aaa' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🦁</div>
            <p>Cargando productos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:60, color:'#aaa' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:20 }}>
            {filtered.map(p => {
              const bg = CAT_COLORS[p.categoria?.nombre] || '#f0f7f0'
              const icon = CAT_ICONS[p.categoria?.nombre] || '📦'
              return (
                <div key={p.idProducto} style={{
                  background:'#fff', borderRadius:20, overflow:'hidden',
                  boxShadow:'0 2px 12px rgba(0,0,0,.06)', border:'1px solid #f0f0f0',
                  display:'flex', flexDirection:'column', transition:'transform .2s, box-shadow .2s',
                }}
                onMouseOver={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 10px 32px rgba(0,0,0,.12)' }}
                onMouseOut={e  => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.06)' }}>
                  <div style={{ background:bg, height:140, display:'flex', alignItems:'center', justifyContent:'center', fontSize:60 }}>
                    {icon}
                  </div>
                  <div style={{ padding:'18px 20px', flex:1, display:'flex', flexDirection:'column' }}>
                    {p.categoria && (
                      <span style={{ fontSize:11, fontWeight:700, color:'#2E7D32', textTransform:'uppercase', letterSpacing:.5, marginBottom:6 }}>
                        {p.categoria.nombre}
                      </span>
                    )}
                    <p style={{ fontWeight:800, fontSize:15, color:'#1a2e1a', margin:'0 0 6px', lineHeight:1.3 }}>{p.nombre}</p>
                    {p.descripcion && <p style={{ fontSize:12, color:'#888', margin:'0 0 14px', lineHeight:1.5, flex:1 }}>{p.descripcion}</p>}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto' }}>
                      <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:'#2E7D32' }}>
                        S/ {Number(p.precioVenta).toFixed(2)}
                      </span>
                      <button onClick={() => handleAgregar(p)} style={{
                        background:'#2E7D32', color:'#fff', border:'none', borderRadius:10,
                        padding:'9px 16px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                        transition:'background .15s',
                      }}
                      onMouseOver={e => e.currentTarget.style.background='#1b5e20'}
                      onMouseOut={e  => e.currentTarget.style.background='#2E7D32'}>
                        + Agregar
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
