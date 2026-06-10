import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { serviciosApi } from '../../api/servicios'
import {
  LuScissors, LuPalette, LuSparkles, LuFlower, LuStar,
  LuClock, LuSearch, LuArrowRight, LuCalendar,
} from 'react-icons/lu'

const CATEGORIAS = ['Todos', 'Cortes', 'Color & Tintes', 'Tratamientos', 'Peinados', 'Packs']

const CAT_COLORS = {
  'Cortes':        { bg:'#FF4F95', light:'#FFD1E0', Icon: LuScissors },
  'Color & Tintes':{ bg:'#A855F7', light:'#F3E8FF', Icon: LuPalette  },
  'Tratamientos':  { bg:'#38BDF8', light:'#E0F5FF', Icon: LuSparkles },
  'Peinados':      { bg:'#FF6F3C', light:'#FFE5D9', Icon: LuFlower   },
  'Packs':         { bg:'#FFC42E', light:'#FFF8E1', Icon: LuStar      },
  'default':       { bg:'#1B7A3E', light:'#D4EDDA', Icon: LuScissors },
}

function getCategoria(nombre = '', descripcion = '') {
  const txt = (nombre + ' ' + descripcion).toLowerCase()
  if (txt.includes('tinte') || txt.includes('color') || txt.includes('aclarado')) return 'Color & Tintes'
  if (txt.includes('tratamiento') || txt.includes('hidrat') || txt.includes('frizz') || txt.includes('spa')) return 'Tratamientos'
  if (txt.includes('peinado') || txt.includes('gala') || txt.includes('trenza') || txt.includes('moño')) return 'Peinados'
  if (txt.includes('pack') || txt.includes('completo') || txt.includes('aventur') || txt.includes('primera vez')) return 'Packs'
  return 'Cortes'
}

export default function ServiciosPublic() {
  const navigate = useNavigate()
  const { user }  = useAuth()
  const [catActiva, setCatActiva] = useState('Todos')
  const [search, setSearch]       = useState('')
  const [servicios, setServicios] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    serviciosApi.getAll()
      .then(res => {
        const data = res.data?.data ?? res.data ?? []
        setServicios(
          data
            .filter(s => s.estado === 'Disponible')
            .map((s, i) => ({ ...s, cat: getCategoria(s.nombre, s.descripcion), popular: i < 3 }))
        )
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = servicios.filter(s =>
    (catActiva === 'Todos' || s.cat === catActiva) &&
    (s.nombre.toLowerCase().includes(search.toLowerCase()) ||
     (s.descripcion ?? '').toLowerCase().includes(search.toLowerCase()))
  )

  const handleReservar = (nombre) => {
    if (user?.rol?.toUpperCase() === 'CLIENTE') navigate('/reservar', { state: { servicio: nombre } })
    else navigate('/login', { state: { intent:'reservar', message:`Inicia sesión para reservar: ${nombre}` } })
  }

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif", background:'var(--paper)', minHeight:'100vh' }}>

      {/* ── Hero ── */}
      <div style={{ background:'var(--ink)', padding:'120px 24px 80px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div className="spin-slow" style={{ position:'absolute', top:-60, right:-60, fontSize:220, opacity:.04 }}>✂️</div>
        <div className="spin-r" style={{ position:'absolute', bottom:-40, left:-40, fontSize:160, opacity:.05 }}>🌿</div>

        <Reveal>
          <span className="section-tag" style={{ background:'var(--yellow)', marginBottom:20, display:'inline-block' }}>Catálogo</span>
          <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:'clamp(36px,5vw,64px)', color:'#fff', margin:'0 0 16px', lineHeight:1.1 }}>
            Nuestros <span className="squiggle squiggle--pink" style={{ color:'var(--pink)' }}>Servicios</span> 🦁
          </h1>
          <p style={{ color:'rgba(255,255,255,.8)', fontSize:17, maxWidth:500, margin:'0 auto 36px', lineHeight:1.7 }}>
            Servicios especializados con productos 100% seguros para el cabello de tu pequeño aventurero
          </p>
        </Reveal>

        {/* Search bar */}
        <div style={{ maxWidth:440, margin:'0 auto', position:'relative' }}>
          <LuSearch size={18} style={{ position:'absolute', left:18, top:'50%', transform:'translateY(-50%)', color:'#888' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar un servicio..."
            style={{ width:'100%', padding:'16px 20px 16px 48px', borderRadius:999, border:'4px solid var(--ink)', fontSize:15, outline:'none', fontFamily:'inherit', background:'#fff', boxSizing:'border-box', boxShadow:'6px 6px 0 var(--yellow)' }}
          />
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'48px 24px 80px' }}>

        {/* ── Category pills ── */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:48, justifyContent:'center' }}>
          {CATEGORIAS.map(cat => {
            const cfg = CAT_COLORS[cat] || CAT_COLORS.default
            const active = catActiva === cat
            return (
              <button key={cat} onClick={() => setCatActiva(cat)} style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'10px 22px', borderRadius:999,
                border: `3px solid ${active ? 'var(--ink)' : '#ddd'}`,
                background: active ? cfg.bg : '#fff',
                color: active ? '#fff' : '#555',
                fontFamily:"'Fredoka One',cursive", fontSize:16,
                boxShadow: active ? '4px 4px 0 var(--ink)' : 'none',
                cursor:'pointer', transition:'all .15s',
                transform: active ? 'translate(-2px,-2px)' : 'none',
              }}>
                {cat !== 'Todos' && <cfg.Icon size={16} />}
                {cat}
              </button>
            )
          })}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign:'center', padding:60 }}>
            <div style={{ display:'inline-block', width:48, height:48, border:'4px solid var(--green)', borderTopColor:'transparent', borderRadius:'50%', animation:'spinSlow 0.8s linear infinite' }} />
            <p style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:'var(--ink)', marginTop:16 }}>Cargando servicios...</p>
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && (
          <>
            <p style={{ color:'#888', fontSize:13, marginBottom:28, textAlign:'center', fontWeight:700 }}>
              {filtered.length} servicio{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
            </p>

            {filtered.length === 0 ? (
              <div className="card-chunky" style={{ textAlign:'center', padding:'60px 40px', background:'#fff' }}>
                <LuSearch size={48} style={{ color:'#ccc', marginBottom:16 }} />
                <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:24, color:'var(--ink)' }}>No encontramos ese servicio</h3>
                <p style={{ color:'#aaa', marginTop:8 }}>Prueba con otra búsqueda o categoría</p>
              </div>
            ) : (
              <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:28 }}>
                {filtered.map((s, i) => {
                  const cfg = CAT_COLORS[s.cat] || CAT_COLORS.default
                  const rotate = [-2,1,-1,2,0,-1,1,-2][i % 8]
                  return (
                    <div key={s.idServicio} className="card-chunky" style={{ background:'#fff', padding:0, position:'relative', transform:`rotate(${rotate}deg)`, transition:'transform .2s, box-shadow .2s' }}
                      onMouseOver={e => { e.currentTarget.style.transform='translate(-4px,-4px) rotate(0deg)'; e.currentTarget.style.boxShadow='14px 14px 0 var(--ink)' }}
                      onMouseOut={e  => { e.currentTarget.style.transform=`rotate(${rotate}deg)`;               e.currentTarget.style.boxShadow='8px 8px 0 var(--ink)'  }}>

                      {/* Popular badge */}
                      {s.popular && (
                        <div style={{ position:'absolute', top:14, right:14, zIndex:2, background:'var(--yellow)', color:'var(--ink)', fontFamily:"'Permanent Marker',cursive", fontSize:12, padding:'4px 10px', borderRadius:999, border:'3px solid var(--ink)', transform:'rotate(6deg)' }}>
                          ⭐ Popular
                        </div>
                      )}

                      {/* Color header */}
                      <div style={{ background:cfg.bg, height:140, display:'flex', alignItems:'center', justifyContent:'center', borderBottom:'4px solid var(--ink)', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', inset:0, opacity:.15 }} className="dotted-bg" />
                        <div style={{ width:80, height:80, borderRadius:24, background:'rgba(255,255,255,.25)', border:'4px solid #fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <cfg.Icon size={42} color="#fff" strokeWidth={1.8} />
                        </div>
                      </div>

                      {/* Body */}
                      <div style={{ padding:'22px 22px 24px' }}>
                        <div style={{ display:'inline-block', background:cfg.light, color:cfg.bg, padding:'3px 12px', borderRadius:999, fontSize:12, fontWeight:800, marginBottom:10, border:`2px solid ${cfg.bg}` }}>{s.cat}</div>
                        <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:'var(--ink)', margin:'0 0 8px', lineHeight:1.2 }}>{s.nombre}</h3>
                        <p style={{ color:'#666', fontSize:13, lineHeight:1.7, marginBottom:20, minHeight:60 }}>{s.descripcion}</p>

                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, padding:'12px 14px', background:'#f9f9f9', borderRadius:12, border:'2px solid #eee' }}>
                          <div>
                            <div style={{ fontSize:11, color:'#888', fontWeight:800, textTransform:'uppercase', letterSpacing:1 }}>Desde</div>
                            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:28, color:'var(--green)', lineHeight:1 }}>S/ {Number(s.precio).toFixed(2)}</div>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:6, background:cfg.light, border:`2px solid ${cfg.bg}`, borderRadius:999, padding:'6px 14px' }}>
                            <LuClock size={14} color={cfg.bg} />
                            <span style={{ fontSize:13, fontWeight:800, color:cfg.bg }}>{s.duracion} min</span>
                          </div>
                        </div>

                        <button onClick={() => handleReservar(s.nombre)} className="btn btn-g" style={{ width:'100%', justifyContent:'center', fontSize:15, padding:'13px' }}>
                          <LuCalendar size={16} />
                          Reservar este servicio
                          <LuArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Reveal({ children, delay = 0 }) {
  return <div className="reveal in" style={{ transitionDelay:`${delay}ms` }}>{children}</div>
}
