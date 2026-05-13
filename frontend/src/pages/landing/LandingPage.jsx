import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LuScissors, LuSparkles, LuShield, LuHeart, LuZap, LuStar,
  LuLeaf, LuTrophy, LuMapPin, LuPhone, LuClock, LuCalendar,
  LuCamera, LuSmile, LuArrowRight,
} from 'react-icons/lu'

/* ── helpers ─────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); o.disconnect() } }, { threshold })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [threshold])
  return [ref, seen]
}

function useCounter(target, ms = 1600, start = false) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!start) return
    const step = Math.max(1, Math.ceil(target / (ms / 16)))
    let v = 0
    const t = setInterval(() => { v = Math.min(v + step, target); setN(v); if (v >= target) clearInterval(t) }, 16)
    return () => clearInterval(t)
  }, [start, target, ms])
  return n
}

function Reveal({ children, delay = 0 }) {
  const [ref, seen] = useInView()
  return (
    <div ref={ref} className={`reveal ${seen ? 'in' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function Leaves({ count = 10, items = ['🍃','🌿','🌸','✨'] }) {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:1 }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{
          position:'absolute', fontSize: `${16 + (i % 4) * 6}px`,
          left:`${(i * 89) % 100}%`, top:`-${(i * 31) % 40}%`,
          animation:`leafFall ${10 + (i % 5) * 3}s linear ${(i * 0.7) % 6}s infinite`,
          opacity:0.7, pointerEvents:'none',
        }}>{items[i % items.length]}</span>
      ))}
    </div>
  )
}

/* ── data ─────────────────────────────────────── */
const SERVICES = [
  { emoji:'✂️', titulo:'Corte Aventurero', desc:'Cortes divertidos en sillas de animales. Para niños de 1 a 12 años.', color:'#FF4F95', shade:'#C42E72', from:'S/ 35', tag:'Más popular' },
  { emoji:'🎨', titulo:'Tintes de Fantasía', desc:'Mechas pastel, colores wash-out 100% seguros para piel delicada.', color:'#A855F7', shade:'#7C3AED', from:'S/ 80', tag:'Lavables' },
  { emoji:'🛁', titulo:'Spa Selva Mágica', desc:'Lavado, masaje craneal y peinado con esencias naturales de la selva.', color:'#38BDF8', shade:'#0284C7', from:'S/ 45', tag:'Relajante' },
  { emoji:'🎂', titulo:'Fiesta Safari', desc:'Celebra el cumple en la peluquería. Cortes + maquillaje + fotos.', color:'#FF6F3C', shade:'#E04E1B', from:'S/ 250', tag:'¡Inolvidable!' },
]

const VALORES = [
  { Icon: LuShield,   titulo:'100% Seguro',       desc:'Solo usamos productos dermatológicamente probados y aprobados para piel infantil delicada.', stat:'+200 productos testeados', color:'#1B7A3E' },
  { Icon: LuHeart,    titulo:'Con mucho amor',     desc:'Cada niño es especial. Nuestras estilistas están certificadas en atención pediátrica y trabajan con paciencia infinita.', stat:'0 llantos, 500 sonrisas', color:'#FF4F95' },
  { Icon: LuZap,      titulo:'Pura diversión',     desc:'Sillas de jirafa, elefante y cebra. Música safari y juegos. El corte de cabello se convierte en una aventura.', stat:'Ambiente temático único', color:'#FF6F3C' },
  { Icon: LuStar,     titulo:'Calidad premium',    desc:'Estilistas con certificación profesional y especialización en cabello infantil. Resultados que duran semanas.', stat:'4.9★ valoración promedio', color:'#FFC42E' },
  { Icon: LuLeaf,     titulo:'Eco-conscientes',    desc:'Productos biodegradables, packaging reciclable y compromiso con el medio ambiente para las generaciones que vienen.', stat:'100% ecológico', color:'#38BDF8' },
  { Icon: LuTrophy,   titulo:'Los #1 de Huancayo', desc:'Más de 500 familias nos eligen cada mes. Reconocidos por la comunidad como la mejor peluquería infantil de la región.', stat:'+500 familias · 3 sedes', color:'#A855F7' },
]

const TESTIMONIOS = [
  { nombre:'Mamá de Valeria', ciudad:'Huancayo', texto:'¡Mi hija llora cuando tiene que SALIR! Le encanta el ambiente y las estilistas son súper pacientes.', avatar:'👩', color:'#FF4F95' },
  { nombre:'Papá de Mateo', ciudad:'El Tambo', texto:'Antes era imposible llevarlo. Aquí juega con las sillas-animales y sale feliz con corte nuevo.', avatar:'👨', color:'#38BDF8' },
  { nombre:'Mamá de Luziana', ciudad:'Huancayo', texto:'Atención excelente, ambiente limpio y precios justos. La calidad del corte es increíble.', avatar:'👩‍🦱', color:'#FFC42E' },
  { nombre:'Abuela de Thiago', ciudad:'Chilca', texto:'Llevo a mi nieto desde los 2 años. Siempre sale feliz. ¡Personal muy amable y profesional!', avatar:'👵', color:'#A855F7' },
  { nombre:'Mamá de Daniela', ciudad:'Huancayo', texto:'El primer corte de mi bebé fue mágico. Nos dieron un certificado especial. ¡Recuerdo para siempre!', avatar:'👩‍👧', color:'#FF6F3C' },
  { nombre:'Papá de Renato', ciudad:'Huancavelica', texto:'Vinimos desde Huancavelica porque nos lo recomendaron y valió la pena. Es único en la región.', avatar:'👨‍👦', color:'#1B7A3E' },
]

const GALLERY = [
  { img:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop&auto=format', caption:'¡Primer corte!' },
  { img:'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400&h=400&fit=crop&auto=format', caption:'Nuestro salón' },
  { img:'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&auto=format', caption:'Sonrisa perfecta' },
  { img:'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop&auto=format', caption:'Corte con amor' },
  { img:'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=400&fit=crop&auto=format', caption:'Aventura safari' },
  { img:'https://images.unsplash.com/photo-1582564286939-400a311013a2?w=400&h=400&fit=crop&auto=format', caption:'Estilo único' },
  { img:'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=400&fit=crop&auto=format', caption:'Todos felices' },
  { img:'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop&auto=format', caption:'Manos mágicas' },
]

const SEDES = [
  { nombre:'Sede Principal', zona:'Huancayo Centro', direccion:'Jr. Ayacucho 456', telefono:'(064) 234-567', horario:'Lun–Sáb · 9am – 7pm', emoji:'🦁', color:'#1B7A3E', tag:'6 sillas temáticas' },
  { nombre:'El Tambo', zona:'El Tambo', direccion:'Av. Ferrocarril 789', telefono:'(064) 345-678', horario:'Mar–Sáb · 9am – 6pm', emoji:'🐘', color:'#38BDF8', tag:'Experta en cabello rizado' },
  { nombre:'Chilca', zona:'Chilca', direccion:'Calle Real 234', telefono:'(064) 456-789', horario:'Lun–Sáb · 10am – 6pm', emoji:'🦒', color:'#FF6F3C', tag:'Quinceañeras y eventos' },
]

const MARQUEE_ITEMS = [
  '⭐ 4.9/5 EN GOOGLE','🦁 +500 FAMILIAS','🎨 SIN LÁGRIMAS, GARANTIZADO',
  '✂️ 3 SEDES EN HUANCAYO','🎉 ZONA DE JUEGOS','🌿 PRODUCTOS NATURALES',
  '🎂 FIESTAS TEMÁTICAS','🏆 4 AÑOS DE EXPERIENCIA','💚 +98% REGRESAN',
]

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function LandingPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [statsRef, statsInView] = useInView(0.3)
  const [rawr, setRawr] = useState(false)

  const c1 = useCounter(500, 2000, statsInView)
  const c2 = useCounter(98,  2000, statsInView)
  const c3 = useCounter(3,   1200, statsInView)
  const c4 = useCounter(4,   1200, statsInView)

  const handleReservar = () => {
    if (user?.rol?.toUpperCase() === 'CLIENTE') navigate('/reservar')
    else navigate('/login', { state: { intent:'reservar' } })
  }

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif", overflowX:'hidden', background:'var(--paper)' }}>

      {/* ═══════ HERO ═══════════════════════════════════════════════════════ */}
      <section style={{ minHeight:'100vh', position:'relative', overflow:'hidden' }} className="hero-bg">
        {/* Sun */}
        <div className="spin-slow" style={{
          position:'absolute', top:'8%', right:'6%', zIndex:1,
          width:160, height:160, borderRadius:'50%',
          background:'radial-gradient(circle at 35% 35%,#FFF59D,#FFC42E 65%,#FF6F3C)',
          boxShadow:'0 0 80px rgba(255,196,46,.7)',
        }} />

        {/* Clouds drifting */}
        <div style={{ position:'absolute', top:'12%', left:0, width:'100%', pointerEvents:'none', zIndex:1 }}>
          <div style={{ position:'absolute', top:0, animation:'drift 50s linear infinite', fontSize:80 }}>☁️</div>
          <div style={{ position:'absolute', top:30, animation:'drift 80s linear infinite', fontSize:56, animationDelay:'-20s' }}>☁️</div>
          <div style={{ position:'absolute', top:10, animation:'drift 65s linear infinite', fontSize:64, animationDelay:'-40s' }}>☁️</div>
        </div>

        <Leaves count={14} />

        {/* Mountain silhouettes */}
        <svg viewBox="0 0 1440 300" preserveAspectRatio="none" style={{ position:'absolute', bottom:200, left:0, width:'100%', height:220, zIndex:1 }}>
          <path d="M0 220 L160 80 L300 180 L460 60 L640 200 L820 100 L1000 180 L1180 80 L1340 200 L1440 140 L1440 300 L0 300 Z" fill="#A0D8A8" opacity=".6" />
        </svg>
        <svg viewBox="0 0 1440 300" preserveAspectRatio="none" style={{ position:'absolute', bottom:160, left:0, width:'100%', height:200, zIndex:1 }}>
          <path d="M0 250 L200 120 L380 200 L560 100 L760 220 L960 140 L1180 220 L1380 120 L1440 180 L1440 300 L0 300 Z" fill="#7BC487" opacity=".75" />
        </svg>

        {/* Grass */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:200, zIndex:2, background:'linear-gradient(180deg,#5BA869 0%,#3B8C4E 100%)' }} />
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ position:'absolute', bottom:195, left:0, width:'100%', height:50, zIndex:3 }}>
          <path d="M0 40 Q 40 0 80 30 T 160 20 T 240 30 T 320 10 T 400 30 T 480 15 T 560 35 T 640 5 T 720 30 T 800 20 T 880 35 T 960 10 T 1040 30 T 1120 5 T 1200 30 T 1280 20 T 1360 35 T 1440 15 L 1440 40 Z" fill="#3B8C4E" />
        </svg>

        {/* Ground animals */}
        <div style={{ position:'absolute', bottom:70, left:0, right:0, zIndex:4, display:'flex', justifyContent:'space-around', alignItems:'flex-end', pointerEvents:'none' }}>
          {[['🐘',70],['🦒',80],['🦓',60],['🐵',56],['🦛',64]].map(([a,s],i) => (
            <div key={i} style={{ fontSize:s, animation:`bob ${2.5+i*.3}s ease-in-out ${-i*.5}s infinite`, filter:'drop-shadow(4px 4px 0 rgba(0,0,0,.15))' }}>{a}</div>
          ))}
        </div>

        {/* Hero content */}
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'140px 24px 320px', position:'relative', zIndex:5, display:'grid', gridTemplateColumns:'1.1fr .9fr', gap:48, alignItems:'center' }} className="hero-grid">
          {/* Left */}
          <div>
            <div className="pop" style={{ marginBottom:24 }}>
              <span className="stamp">¡La aventura empieza aquí!</span>
            </div>
            <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:'clamp(48px,7vw,88px)', lineHeight:.95, color:'var(--ink)', marginBottom:24, letterSpacing:'-1px' }}>
              ¡Cortes que{' '}
              <span className="squiggle squiggle--pink" style={{ color:'var(--pink)' }}>rugen</span>
              {' '}de{' '}
              <span style={{ color:'var(--orange-d)', display:'inline-block', transform:'rotate(-3deg)' }}>diversión!</span>
              <span
                onClick={() => setRawr(true)}
                onAnimationEnd={() => setRawr(false)}
                style={{ display:'inline-block', marginLeft:12, fontSize:'.7em', cursor:'pointer', animation: rawr ? 'roar .6s ease-in-out' : 'none' }}>🦁</span>
            </h1>
            <p style={{ fontSize:19, color:'#34423D', maxWidth:480, lineHeight:1.6, marginBottom:36, fontWeight:700 }}>
              La <strong style={{ color:'var(--green-d)' }}>peluquería temática</strong> que tu peque va a pedir visitar.
              Sillas-animales, música safari y estilistas que adoran a los niños. 💚
            </p>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:36 }}>
              <button onClick={handleReservar} className="btn btn-p" style={{ animation:'pulseRing 2s infinite' }}>
                🗓 Reservar mi safari
              </button>
              <Link to="/servicios" className="btn btn-w" style={{ textDecoration:'none' }}>
                Ver servicios →
              </Link>
            </div>
            {/* Social proof */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:12, padding:'16px 20px', background:'rgba(255,255,255,.8)', borderRadius:20, border:'3px solid var(--ink)', boxShadow:'4px 4px 0 var(--ink)' }}>
              <div style={{ display:'flex' }}>
                {['😊','👶','🧒','👧','🤗'].map((e,i)=>(
                  <span key={i} style={{ width:32,height:32,borderRadius:'50%',background:['#FFC42E','#FF4F95','#38BDF8','#A855F7','#FF6F3C'][i],border:'3px solid var(--ink)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,marginLeft:i?-10:0 }}>{e}</span>
                ))}
              </div>
              <div>
                <p style={{ fontFamily:"'Fredoka One',cursive", fontSize:15, color:'var(--ink)', margin:0 }}>⭐⭐⭐⭐⭐ 4.9/5</p>
                <p style={{ fontSize:11, color:'#666', margin:0 }}>+500 familias</p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ position:'relative', height:480 }}>
            <div className="float-l" style={{ position:'absolute', top:10, left:'15%', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle at 30% 30%,#FFD955,#FFC42E 65%,#FF6F3C)', border:'6px solid var(--ink)', boxShadow:'10px 10px 0 var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:170, zIndex:2 }}>🦁</div>
            {[
              { e:'✂️', t:'Cortes creativos',  pos:{ top:0, right:20 },      color:'#FF4F95', r:6  },
              { e:'🎨', t:'Tintes seguros',    pos:{ top:'38%', right:0 },   color:'#38BDF8', r:-6 },
              { e:'🎂', t:'¡Fiestas!',         pos:{ bottom:'15%', right:'15%' }, color:'#A855F7', r:8  },
              { e:'🌿', t:'100% seguro',       pos:{ bottom:30, left:10 },   color:'#1B7A3E', r:-8 },
              { e:'🎁', t:'Regalo 1er corte',  pos:{ top:'40%', left:0 },    color:'#FF6F3C', r:4  },
            ].map((s,i)=>(
              <div key={i} className="float" style={{ position:'absolute', ...s.pos, transform:`rotate(${s.r}deg)`, '--r':`${s.r}deg`, animationDelay:`${i*.3}s`, background:'#fff', border:'4px solid var(--ink)', borderRadius:18, boxShadow:'5px 5px 0 var(--ink)', padding:'10px 14px', display:'flex', alignItems:'center', gap:10, zIndex:3, minWidth:130 }}>
                <span style={{ fontSize:22, width:38, height:38, borderRadius:10, background:s.color, display:'inline-flex', alignItems:'center', justifyContent:'center', border:'3px solid var(--ink)' }}>{s.e}</span>
                <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:13, color:'var(--ink)' }}>{s.t}</span>
              </div>
            ))}
            <div className="spin-r" style={{ position:'absolute', bottom:-20, left:-10, width:110, height:110, borderRadius:'50%', background:'var(--yellow)', border:'4px solid var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'6px 6px 0 var(--ink)', zIndex:4 }}>
              <span style={{ fontFamily:"'Permanent Marker',cursive", fontSize:12, color:'var(--ink)', textAlign:'center', lineHeight:1.1 }}>¡PRIMERA<br/>CITA<br/>-10%!</span>
            </div>
          </div>
        </div>

        <div style={{ position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)', zIndex:5 }}>
          <div className="float" style={{ fontFamily:"'Caveat',cursive", fontSize:20, color:'var(--ink)', fontWeight:700 }}>baja para ver la magia ↓</div>
        </div>
      </section>

      {/* ═══════ MARQUEE ═══════════════════════════════════════════════════ */}
      <div className="marquee-wrap" style={{ marginTop:0 }}>
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((it, i) => (
            <div key={i} className="marquee-item">
              <span>{it}</span>
              <span className="dot" />
            </div>
          ))}
        </div>
      </div>

      {/* ═══════ SERVICIOS ══════════════════════════════════════════════════ */}
      <section id="servicios" style={{ padding:'120px 24px 96px', background:'var(--paper)', position:'relative' }}>
        <div className="dotted-bg" style={{ position:'absolute', inset:0, opacity:.12, pointerEvents:'none' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:60 }}>
              <span className="section-tag">Nuestros servicios</span>
              <h2 className="section-title">Elige tu <span className="squiggle" style={{ color:'var(--orange-d)' }}>aventura</span></h2>
              <p style={{ color:'#555', fontSize:17, maxWidth:560, margin:'0 auto', lineHeight:1.7 }}>Cuatro maneras de hacer del corte una experiencia que tu peque va a pedir repetir.</p>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:28 }}>
            {SERVICES.map((s, i) => (
              <Reveal key={s.titulo} delay={i * 80}>
                <div className="card-chunky" style={{ background:s.color, color:'#fff', padding:0, height:'100%', cursor:'pointer', position:'relative' }}>
                  <div style={{ position:'absolute', top:14, right:14, zIndex:2, background:'#fff', color:'var(--ink)', fontFamily:"'Permanent Marker',cursive", fontSize:12, padding:'4px 10px', borderRadius:999, border:'3px solid var(--ink)', transform:'rotate(6deg)' }}>{s.tag}</div>
                  <div style={{ height:180, background:`radial-gradient(circle at 50% 70%,${s.shade},transparent 60%)`, display:'flex', alignItems:'flex-end', justifyContent:'center', borderBottom:'4px solid var(--ink)', position:'relative', overflow:'hidden' }}>
                    <span style={{ position:'absolute', top:20, left:24, fontSize:18 }}>✨</span>
                    <span style={{ position:'absolute', top:40, right:30, fontSize:14 }}>⭐</span>
                    <span style={{ fontSize:130, marginBottom:-10, display:'inline-block', filter:'drop-shadow(4px 4px 0 rgba(0,0,0,.25))' }}>{s.emoji}</span>
                  </div>
                  <div style={{ padding:'24px 22px 28px' }}>
                    <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:24, marginBottom:8 }}>{s.titulo}</h3>
                    <p style={{ fontSize:14, lineHeight:1.6, opacity:.92, marginBottom:18 }}>{s.desc}</p>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontSize:11, opacity:.8, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Desde</div>
                        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:28 }}>{s.from}</div>
                      </div>
                      <button onClick={handleReservar} style={{ background:'var(--ink)', color:'#fff', padding:'10px 16px', borderRadius:999, border:'none', cursor:'pointer', fontWeight:800, fontSize:13, fontFamily:'inherit' }}>Reservar →</button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ NOSOTROS ══════════════════════════════════════════════════ */}
      <section id="nosotros" style={{ padding:'96px 24px', background:'#FFE8B0', position:'relative', overflow:'hidden' }}>
        <Leaves count={8} items={['🌿','🌸','🦋']} />
        <div style={{ maxWidth:1160, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center', position:'relative', zIndex:2 }} className="two-col">
          <Reveal>
            <div style={{ position:'relative', height:500 }}>
              <div className="blob-anim" style={{ position:'absolute', top:30, left:30, width:380, height:380, background:'linear-gradient(135deg,#FF4F95,#A855F7)', border:'5px solid var(--ink)', boxShadow:'10px 10px 0 var(--ink)' }} />
              {[
                { emoji:'🦒', caption:'¡La silla jirafa!', style:{ top:0, left:0, width:200, transform:'rotate(-8deg)' }, bg:'linear-gradient(135deg,#FFC42E,#FF6F3C)' },
                { emoji:'🐘', caption:'¡Listos!', style:{ top:50, right:30, width:180, transform:'rotate(6deg)' }, bg:'linear-gradient(135deg,#38BDF8,#A855F7)' },
                { emoji:'👧', caption:'Primer corte de Vale 💕', style:{ bottom:0, left:70, width:220, transform:'rotate(4deg)' }, bg:'linear-gradient(135deg,#FF4F95,#FFC42E)' },
              ].map((p,i) => (
                <div key={i} className="polaroid" style={{ position:'absolute', ...p.style }}>
                  <div style={{ width:'100%', aspectRatio:'1', borderRadius:4, background:p.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:90 }}>{p.emoji}</div>
                  <div style={{ fontFamily:"'Caveat',cursive", fontSize:18, textAlign:'center', color:'var(--ink)' }}>{p.caption}</div>
                </div>
              ))}
              <div className="spin-slow" style={{ position:'absolute', top:'38%', right:-10, width:90, height:90, borderRadius:'50%', background:'var(--yellow)', border:'4px solid var(--ink)', boxShadow:'5px 5px 0 var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Permanent Marker',cursive", fontSize:11, lineHeight:1.1, color:'var(--ink)', textAlign:'center', zIndex:5 }}>
                DESDE<br/>2020
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <span className="section-tag">Conócenos</span>
              <h2 className="section-title">Somos más que <br/>una <span className="squiggle squiggle--sky" style={{ color:'var(--sky-d)' }}>peluquería</span></h2>
              <p style={{ fontSize:17, lineHeight:1.75, color:'#34423D', marginBottom:18 }}>
                <strong>Safari Kids</strong> nació en 2020 para cambiar el momento del corte de pelo: de ser un "trámite con miedo" a una aventura que los peques piden repetir.
              </p>
              <p style={{ fontSize:17, lineHeight:1.75, color:'#34423D', marginBottom:28 }}>
                Sillas en forma de jirafa, elefante y cebra, música safari, libros, juegos, y un equipo de estilistas con paciencia y cariño infinito.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:28 }}>
                {[['👩‍🎓','Estilistas certificadas'],['🌿','Productos naturales'],['🎭','Ambiente temático'],['🏆','+4 años de magia']].map(([e,t])=>(
                  <div key={t} className="sticker" style={{ fontSize:13, padding:'10px 14px', boxShadow:'4px 4px 0 var(--ink)' }}>
                    <span style={{ fontSize:22 }}>{e}</span><span>{t}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleReservar} className="btn btn-g">🦁 Reservar ahora</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ VALORES ══════════════════════════════════════════════════ */}
      <section style={{ padding:'120px 24px', background:'var(--ink)', color:'#fff', position:'relative', overflow:'hidden' }}>
        <div className="spin-slow" style={{ position:'absolute', top:-60, right:-60, fontSize:280, opacity:.05 }}>🦁</div>
        <div className="spin-r" style={{ position:'absolute', bottom:-80, left:-80, fontSize:320, opacity:.04 }}>🌿</div>
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <span className="section-tag" style={{ background:'var(--yellow)' }}>Por qué elegirnos</span>
              <h2 className="section-title" style={{ color:'#fff' }}>La experiencia <span className="squiggle squiggle--pink" style={{ color:'var(--yellow)' }}>Safari Kids</span></h2>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:24 }}>
            {VALORES.map((v, i) => (
              <Reveal key={v.titulo} delay={i * 60}>
                <div className="card-chunky" style={{ padding:'32px 24px 28px', background:v.color, color:'#fff', border:'4px solid #000', boxShadow:'8px 8px 0 #000', height:'100%', transform:`rotate(${(i%2===0?-1:1)*1}deg)` }}>
                  <div style={{ width:70, height:70, borderRadius:18, background:'#fff', color:v.color, border:'4px solid var(--ink)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:18, boxShadow:'4px 4px 0 var(--ink)' }}>
                    <v.Icon size={36} strokeWidth={2} />
                  </div>
                  <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:24, marginBottom:8 }}>{v.titulo}</h3>
                  <p style={{ fontSize:14, lineHeight:1.6, opacity:.95, marginBottom:12 }}>{v.desc}</p>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.2)', borderRadius:999, padding:'4px 12px', fontSize:12, fontWeight:800 }}>
                    <LuStar size={12} />{v.stat}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PROCESO ═══════════════════════════════════════════════════ */}
      <section style={{ padding:'120px 24px', background:'#FFF8E1', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:64 }}>
              <span className="section-tag">3 pasos. Listo.</span>
              <h2 className="section-title">Reservar es <span className="squiggle" style={{ color:'var(--orange-d)' }}>facilísimo</span></h2>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:32, position:'relative', zIndex:1 }}>
            {[
              { n:1, emoji:'📱', title:'Regístrate', desc:'En 30 segundos con tu correo. ¡Súper rápido!', color:'#FF4F95' },
              { n:2, emoji:'✂️', title:'Elige tu servicio', desc:'Mira el menú y escoge la aventura.', color:'#38BDF8' },
              { n:3, emoji:'🗓', title:'Reserva tu cita', desc:'Día, hora y sede. ¡A vivir la magia!', color:'#FFC42E' },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 150}>
                <div style={{ background:'#fff', border:'4px solid var(--ink)', borderRadius:24, boxShadow:'8px 8px 0 var(--ink)', padding:28, textAlign:'center', position:'relative', transform:`rotate(${(i-1)*2}deg)` }}>
                  <div style={{ position:'absolute', top:-30, left:'50%', transform:'translateX(-50%) rotate(-5deg)', width:64, height:64, borderRadius:16, background:s.color, color:'var(--ink)', border:'4px solid var(--ink)', boxShadow:'5px 5px 0 var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Fredoka One',cursive", fontSize:32 }}>{s.n}</div>
                  <div style={{ fontSize:56, marginTop:22, marginBottom:14 }}>{s.emoji}</div>
                  <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:'var(--ink)', marginBottom:8 }}>{s.title}</h3>
                  <p style={{ color:'#555', fontSize:14, lineHeight:1.6 }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={400}>
            <div style={{ textAlign:'center', marginTop:56 }}>
              <button onClick={handleReservar} className="btn btn-p" style={{ animation:'pulseRing 2s infinite' }}>
                🦁 ¡Quiero reservar mi cita!
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ CONTADORES ════════════════════════════════════════════════ */}
      <div ref={statsRef} style={{ background:'var(--ink)', padding:'60px 24px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:24 }}>
          {[
            { n:c1, s:'+', label:'Familias felices', emoji:'👨‍👧', color:'#FF4F95' },
            { n:c4, s:'', label:'Años de magia', emoji:'⭐', color:'#FFC42E' },
            { n:c3, s:'', label:'Sedes en Huancayo', emoji:'📍', color:'#38BDF8' },
            { n:c2, s:'%', label:'Clientes que repiten', emoji:'💚', color:'#A855F7' },
          ].map((s,i) => (
            <div key={s.label} style={{ textAlign:'center', padding:28, background:'rgba(255,255,255,.05)', border:`3px solid ${s.color}`, borderRadius:20, boxShadow:`6px 6px 0 ${s.color}` }}>
              <div style={{ fontSize:36, marginBottom:8 }}>{s.emoji}</div>
              <p style={{ fontFamily:"'Fredoka One',cursive", fontSize:52, color:s.color, margin:0, lineHeight:1 }}>{s.n}{s.s}</p>
              <p style={{ color:'rgba(255,255,255,.7)', fontSize:13, marginTop:8, fontWeight:700 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════ TESTIMONIOS ═══════════════════════════════════════════════ */}
      <section id="testimonios" style={{ padding:'120px 24px', background:'var(--paper)', position:'relative', overflow:'hidden' }}>
        <div className="grid-bg" style={{ position:'absolute', inset:0, opacity:.8, pointerEvents:'none' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:64 }}>
              <span className="section-tag">Lo que dicen las familias</span>
              <h2 className="section-title">Más de 500 familias <br/>nos <span className="squiggle squiggle--pink" style={{ color:'var(--pink)' }}>recomiendan</span> 💚</h2>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:40 }}>
            {TESTIMONIOS.map((t, i) => {
              const rotate = [-2,1.5,-1,2,-1.5,1][i%6]
              return (
                <Reveal key={i} delay={i * 60}>
                  <div style={{ position:'relative', paddingTop:14 }}>
                    <div className="speech" style={{ '--tail':'54px', transform:`rotate(${rotate}deg)` }}>
                      <div style={{ display:'flex', gap:2, marginBottom:10 }}>
                        {'★★★★★'.split('').map((_,j)=><span key={j} style={{ color:'#FFC42E', fontSize:18 }}>★</span>)}
                      </div>
                      <p style={{ color:'var(--ink)', fontSize:15, lineHeight:1.7, fontWeight:700 }}>"{t.texto}"</p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:14, marginLeft:18, marginTop:32 }}>
                      <div style={{ width:56, height:56, borderRadius:'50%', background:t.color, border:'4px solid var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, boxShadow:'4px 4px 0 var(--ink)' }}>{t.avatar}</div>
                      <div>
                        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:16, color:'var(--ink)' }}>{t.nombre}</div>
                        <div style={{ fontFamily:"'Caveat',cursive", fontSize:16, color:'#666' }}>📍 {t.ciudad}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════ GALERÍA ════════════════════════════════════════════════════ */}
      <section id="galeria" style={{ padding:'120px 24px', background:'#FFE8B0', position:'relative', overflow:'hidden' }}>
        <Leaves count={6} items={['🌸','🦋','✨','🍃']} />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:2 }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:64 }}>
              <span className="section-tag">Galería</span>
              <h2 className="section-title">Momentos <span className="squiggle squiggle--sky" style={{ color:'var(--sky-d)' }}>mágicos</span></h2>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:28 }}>
            {GALLERY.map((p,i) => {
              const rotations = [-6,4,-3,5,-5,3,-4,6]
              return (
                <Reveal key={i} delay={i * 50}>
                  <div className="polaroid tilt" style={{ transform:`rotate(${rotations[i%8]}deg)`, position:'relative' }}>
                    <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%) rotate(-3deg)', width:60, height:22, background:'rgba(255,196,46,.7)', border:'1px dashed rgba(0,0,0,.2)' }} />
                    <div style={{ width:'100%', aspectRatio:'1', borderRadius:4, overflow:'hidden', background:'#e8f5e9' }}>
                      <img src={p.img} alt={p.caption} loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                        onError={e => { e.currentTarget.style.display='none'; e.currentTarget.parentElement.style.display='flex'; e.currentTarget.parentElement.style.alignItems='center'; e.currentTarget.parentElement.style.justifyContent='center'; e.currentTarget.parentElement.innerHTML='<span style="font-size:60px">🦁</span>' }} />
                    </div>
                    <div style={{ fontFamily:"'Caveat',cursive", fontSize:22, color:'var(--ink)', textAlign:'center', marginTop:8 }}>{p.caption}</div>
                  </div>
                </Reveal>
              )
            })}
          </div>
          <Reveal delay={300}>
            <div style={{ textAlign:'center', marginTop:56 }}>
              <div className="sticker" style={{ display:'inline-flex' }}>
                <span style={{ fontSize:24 }}>📸</span>
                <span>Síguenos en <strong style={{ color:'var(--pink)' }}>@safarikids.huancayo</strong></span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ SEDES ══════════════════════════════════════════════════════ */}
      <section id="sedes" style={{ padding:'120px 24px', background:'var(--paper)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:64 }}>
              <span className="section-tag">Nuestras sedes</span>
              <h2 className="section-title">Encuéntranos en <br/><span className="squiggle" style={{ color:'var(--orange-d)' }}>Huancayo</span> 🗺️</h2>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:28 }}>
            {SEDES.map((s, i) => (
              <Reveal key={s.nombre} delay={i * 100}>
                <div className="card-chunky tilt" style={{ overflow:'visible', transform:`rotate(${(i-1)*1.5}deg)` }}>
                  <div style={{ background:s.color, color:'#fff', padding:'28px 24px 80px', textAlign:'center', position:'relative', borderBottom:'4px solid var(--ink)', overflow:'hidden' }}>
                    <div style={{ position:'absolute', top:40, left:'50%', transform:'translateX(-50%)', width:110, height:110, borderRadius:'50%', background:'rgba(255,255,255,.2)', border:'4px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:64 }}>{s.emoji}</div>
                    <div style={{ marginTop:130 }}>
                      <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:22 }}>Safari Kids · {s.nombre}</h3>
                      <div style={{ display:'inline-block', background:'rgba(255,255,255,.25)', padding:'4px 14px', borderRadius:999, fontSize:12, fontWeight:800, letterSpacing:1, marginTop:6 }}>{s.zona.toUpperCase()}</div>
                    </div>
                  </div>
                  <div style={{ position:'absolute', top:212, left:'50%', transform:'translateX(-50%) rotate(45deg)', width:36, height:36, background:s.color, border:'4px solid var(--ink)', borderTop:'none', borderLeft:'none', zIndex:2 }} />
                  <div style={{ padding:'40px 24px 24px', background:'#fff' }}>
                    <div style={{ background:'#FFF8E1', padding:'8px 14px', borderRadius:999, fontFamily:"'Caveat',cursive", fontSize:16, color:'var(--ink)', border:`2px dashed ${s.color}`, textAlign:'center', marginBottom:18 }}>✨ {s.tag}</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {[['📍',s.direccion],['📞',s.telefono],['🕐',s.horario]].map(([ico,val])=>(
                        <div key={val} style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ width:32, height:32, borderRadius:8, background:s.color, color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0, border:'2px solid var(--ink)' }}>{ico}</span>
                          <span style={{ fontSize:14, color:'var(--ink)', fontWeight:700 }}>{val}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleReservar} style={{ display:'block', width:'100%', textAlign:'center', marginTop:20, background:s.color, color:'#fff', padding:'14px', borderRadius:12, fontFamily:"'Fredoka One',cursive", fontSize:16, border:'3px solid var(--ink)', boxShadow:'4px 4px 0 var(--ink)', cursor:'pointer' }}>
                      🗓 Reservar en esta sede
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA FINAL ══════════════════════════════════════════════════ */}
      <section id="reservar" style={{ padding:'100px 24px 120px', background:'linear-gradient(135deg,#FF4F95 0%,#FF6F3C 50%,#FFC42E 100%)', position:'relative', overflow:'hidden', textAlign:'center' }}>
        <div className="spin-r" style={{ position:'absolute', top:40, left:40, fontSize:80, opacity:.3 }}>🌟</div>
        <div className="spin-slow" style={{ position:'absolute', top:80, right:60, fontSize:64, opacity:.3 }}>✨</div>
        <div className="float" style={{ position:'absolute', bottom:40, left:'15%', fontSize:70, opacity:.4 }}>🎈</div>
        <div className="float-l" style={{ position:'absolute', bottom:80, right:'12%', fontSize:80, opacity:.4 }}>🎉</div>
        <div style={{ maxWidth:800, margin:'0 auto', position:'relative', zIndex:2 }}>
          <Reveal>
            <div className="roar" style={{ fontSize:120, marginBottom:12, display:'inline-block', filter:'drop-shadow(6px 6px 0 rgba(0,0,0,.2))' }}>🦁</div>
            <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:'clamp(40px,6vw,72px)', color:'#fff', lineHeight:1, marginBottom:18, textShadow:'4px 4px 0 var(--ink)' }}>
              ¡La aventura te <br/>está esperando!
            </h2>
            <p style={{ color:'#fff', fontSize:19, marginBottom:36, fontWeight:700, maxWidth:540, margin:'0 auto 36px' }}>
              Reserva hoy y tu peque vive la magia.{' '}
              <span className="stamp" style={{ marginTop:12, background:'#fff' }}>🎁 Primera cita con 10% OFF</span>
            </p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={handleReservar} className="btn btn-y" style={{ fontSize:22, padding:'20px 40px' }}>🗓 Reservar gratis →</button>
              <Link to="/servicios" className="btn btn-w" style={{ textDecoration:'none' }}>Ver todos los servicios</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ FOOTER ══════════════════════════════════════════════════════ */}
      <footer id="contacto" style={{ background:'var(--ink)', color:'rgba(255,255,255,.7)', padding:'60px 24px 30px', position:'relative', overflow:'hidden' }}>
        <div className="spin-slow" style={{ position:'absolute', top:-40, right:-40, fontSize:220, opacity:.04 }}>🌿</div>
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:40 }} className="two-col">
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <span style={{ fontSize:40 }} className="roar">🦁</span>
                <div>
                  <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:24, color:'#fff' }}>Safari<span style={{ color:'var(--pink)' }}>Kids</span></div>
                  <div style={{ fontFamily:"'Caveat',cursive", fontSize:16, color:'var(--yellow)' }}>¡cortes con magia!</div>
                </div>
              </div>
              <p style={{ fontSize:13, lineHeight:1.7, maxWidth:280 }}>Peluquería especializada en niños. Hacemos de cada corte una aventura inolvidable. Huancayo · Perú.</p>
              <div style={{ display:'flex', gap:8, marginTop:18 }}>
                {[['📘','Facebook'],['📸','Instagram'],['🎵','TikTok'],['🎬','YouTube']].map(([e,l])=>(
                  <a key={l} href="#" title={l} style={{ width:40,height:40,borderRadius:12,background:'rgba(255,255,255,.08)',border:'2px solid rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',fontSize:18,transition:'all .15s' }}
                    onMouseOver={e2=>{e2.currentTarget.style.background='var(--pink)';e2.currentTarget.style.transform='rotate(-6deg) scale(1.08)'}}
                    onMouseOut={e2=>{e2.currentTarget.style.background='rgba(255,255,255,.08)';e2.currentTarget.style.transform='none'}}>{e}</a>
                ))}
              </div>
            </div>
            {[
              { title:'Servicios', items:['Corte Aventurero','Tintes de Fantasía','Spa Selva Mágica','Fiesta Safari'] },
              { title:'Empresa', items:['Quiénes somos','Sucursales','Trabaja con nosotros','Blog'] },
              { title:'Contacto', items:['(064) 234-567','hola@safarikids.com','WhatsApp: 964 123 456','Jr. Ayacucho 456'] },
            ].map(col=>(
              <div key={col.title}>
                <h4 style={{ color:'var(--yellow)', fontFamily:"'Fredoka One',cursive", fontSize:18, marginBottom:14 }}>{col.title}</h4>
                {col.items.map(it=>(
                  <a key={it} href="#" style={{ display:'block',fontSize:13,marginBottom:8,color:'rgba(255,255,255,.7)',textDecoration:'none',transition:'all .15s' }}
                    onMouseOver={e=>{e.currentTarget.style.color='var(--yellow)';e.currentTarget.style.transform='translateX(4px)'}}
                    onMouseOut={e=>{e.currentTarget.style.color='rgba(255,255,255,.7)';e.currentTarget.style.transform='none'}}>{it}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'2px dashed rgba(255,255,255,.15)', paddingTop:22, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, alignItems:'center' }}>
            <span style={{ fontSize:12 }}>© 2026 Safari Kids · Hecho con 💚 en Huancayo</span>
            <span style={{ fontFamily:"'Caveat',cursive", fontSize:18, color:'var(--yellow)' }}>¡Gracias por elegirnos! 🦁</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
