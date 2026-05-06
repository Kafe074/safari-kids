import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const CATEGORIAS = ['Todos','Cortes','Color & Tintes','Tratamientos','Peinados','Packs']

const SERVICIOS = [
  { emoji:'✂️', nombre:'Corte Infantil Clásico',   desc:'El corte perfecto para cada niño. Adaptado a su tipo de cabello y personalidad.', precio:25, duracion:30, cat:'Cortes', popular:true },
  { emoji:'🎨', nombre:'Tinte Kids Seguro',         desc:'Colores vibrantes con fórmulas 100% seguras y sin amoníaco para niños.', precio:45, duracion:60, cat:'Color & Tintes', popular:false },
  { emoji:'💆', nombre:'Lavado & Peinado Mágico',   desc:'Ritual completo: lavado, acondicionador, secado y peinado a elección.', precio:20, duracion:25, cat:'Peinados', popular:false },
  { emoji:'✨', nombre:'Tratamiento Hidratante',     desc:'Mascarilla nutritiva + sérum para un cabello brillante, suave y saludable.', precio:35, duracion:45, cat:'Tratamientos', popular:false },
  { emoji:'🌸', nombre:'Peinados de Fantasía',      desc:'Trenzas, moños, coletas y peinados para fiestas, cumpleaños y ocasiones especiales.', precio:30, duracion:40, cat:'Peinados', popular:true },
  { emoji:'🧴', nombre:'Spa Capilar Infantil',      desc:'Experiencia spa completa: masaje de cuero cabelludo + tratamiento + peinado.', precio:40, duracion:50, cat:'Tratamientos', popular:false },
  { emoji:'🌟', nombre:'Pack Aventurero',           desc:'Corte + lavado + peinado completo. El pack más elegido por los papás.', precio:70, duracion:90, cat:'Packs', popular:true },
  { emoji:'🎀', nombre:'Primera Vez Especial',       desc:'El primer corte de tu bebé. Incluye certificado, foto y mechón de recuerdo.', precio:35, duracion:35, cat:'Packs', popular:true },
  { emoji:'💇', nombre:'Corte Escolar Rápido',      desc:'Corte preciso y cómodo. Ideal para el regreso a clases. Rápido y eficiente.', precio:20, duracion:20, cat:'Cortes', popular:false },
  { emoji:'🌺', nombre:'Aclarado Natural',           desc:'Aclarado gradual y suave con productos naturales sin dañar el cabello.', precio:55, duracion:75, cat:'Color & Tintes', popular:false },
  { emoji:'🎭', nombre:'Peinado de Gala',            desc:'Peinado elaborado para eventos, recitales, quinceañeros o fotosesiones especiales.', precio:50, duracion:60, cat:'Peinados', popular:false },
  { emoji:'🧖', nombre:'Tratamiento Anti-Frizz',    desc:'Solución profesional para cabello esponjado. Resultado desde la primera sesión.', precio:45, duracion:55, cat:'Tratamientos', popular:false },
]

export default function ServiciosPublic() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [catActiva, setCatActiva] = useState('Todos')
  const [search, setSearch] = useState('')

  const filtered = SERVICIOS.filter(s =>
    (catActiva === 'Todos' || s.cat === catActiva) &&
    (s.nombre.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase()))
  )

  const handleReservar = (nombre) => {
    if (user?.rol?.toUpperCase() === 'CLIENTE') navigate('/reservar', { state: { servicio: nombre } })
    else navigate('/login', { state: { intent: 'reservar', message: `Inicia sesión para reservar: ${nombre}` } })
  }

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif" }}>
      {/* Header */}
      <div style={{
        background:'linear-gradient(135deg,#1b5e20,#2E7D32,#33691e)',
        padding:'120px 24px 80px', textAlign:'center', position:'relative', overflow:'hidden',
      }}>
        {[...Array(8)].map((_,i)=>(
          <div key={i} style={{ position:'absolute', left:`${i*14}%`, top:`${20+i*10}%`, fontSize:24, opacity:.08, animation:`floatSlow ${5+i}s ease-in-out ${i*.5}s infinite` }}>
            {['🌿','✨','🌺','⭐','🦋','🌸','🍃','🌟'][i]}
          </div>
        ))}
        <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:'clamp(36px,5vw,60px)', color:'#fff', margin:'0 0 16px' }}>
          Nuestros Servicios 🦁
        </h1>
        <p style={{ color:'rgba(255,255,255,.8)', fontSize:17, maxWidth:500, margin:'0 auto 32px', lineHeight:1.7 }}>
          Servicios especializados con productos 100% seguros para el cabello de tu hijo
        </p>
        {/* Search */}
        <div style={{ maxWidth:400, margin:'0 auto', position:'relative' }}>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍 Buscar un servicio..."
            style={{ width:'100%', padding:'14px 20px', borderRadius:50, border:'none', fontSize:15, outline:'none', fontFamily:'inherit', boxShadow:'0 8px 32px rgba(0,0,0,.15)' }}
          />
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 24px 80px' }}>
        {/* Category filter */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:40, justifyContent:'center' }}>
          {CATEGORIAS.map(cat => (
            <button key={cat} onClick={()=>setCatActiva(cat)} style={{
              padding:'10px 22px', borderRadius:50, border:'none', cursor:'pointer',
              background: catActiva===cat ? '#2E7D32' : '#fff',
              color: catActiva===cat ? '#fff' : '#555',
              fontWeight: catActiva===cat ? 800 : 600,
              fontFamily:"'Fredoka One',cursive", fontSize:15,
              boxShadow: catActiva===cat ? '0 4px 12px rgba(46,125,50,.3)' : '0 2px 8px rgba(0,0,0,.06)',
              transition:'all .2s',
              transform: catActiva===cat ? 'scale(1.05)' : 'scale(1)',
            }}>{cat}</button>
          ))}
        </div>

        {/* Count */}
        <p style={{ color:'#888', fontSize:13, marginBottom:24, textAlign:'center' }}>{filtered.length} servicio(s) encontrado(s)</p>

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:24 }}>
          {filtered.map((s, i) => (
            <div key={s.nombre} className="card-fun" style={{ padding:'28px 24px', position:'relative', animationDelay:`${i*.05}s` }}>
              {s.popular && (
                <div style={{ position:'absolute', top:16, right:16, background:'#F9A825', color:'#1b2a1b', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:800, fontFamily:"'Fredoka One',cursive" }}>
                  ⭐ Popular
                </div>
              )}
              <div style={{ fontSize:44, marginBottom:14 }}>{s.emoji}</div>
              <div style={{ display:'inline-block', background:`hsl(${i*30},60%,92%)`, color:`hsl(${i*30},50%,35%)`, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, marginBottom:10 }}>{s.cat}</div>
              <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:19, color:'#1a2e1a', margin:'0 0 8px' }}>{s.nombre}</h3>
              <p style={{ color:'#777', fontSize:13, lineHeight:1.7, marginBottom:20 }}>{s.desc}</p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:26, color:'#2E7D32' }}>S/ {s.precio}</span>
                <span style={{ background:'#e8f5e9', color:'#2E7D32', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>⏱ {s.duracion} min</span>
              </div>
              <button onClick={()=>handleReservar(s.nombre)} className="btn-jungle btn-jungle-green" style={{ width:'100%', justifyContent:'center', fontSize:15, padding:'12px' }}>
                🗓 Reservar este servicio
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 24px' }}>
            <div style={{ fontSize:64, marginBottom:16 }}>🔍</div>
            <p style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:'#888' }}>No encontramos ese servicio</p>
            <p style={{ color:'#aaa', fontSize:14 }}>Prueba con otra búsqueda o categoría</p>
          </div>
        )}
      </div>
    </div>
  )
}
