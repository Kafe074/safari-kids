import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/* ── animated counter hook ─────────────────── */
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let s = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      s = Math.min(s + step, target)
      setCount(s)
      if (s >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [start, target, duration])
  return count
}

/* ── intersection observer hook ─────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

/* ── floating particles ─────────────────────── */
const PARTICLES = ['🦁','🌿','✨','🌺','🦋','🌸','⭐','🍃','🌟','🎀']

function FloatingParticles() {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position:'absolute',
          left: `${(i * 11 + 5) % 95}%`,
          top: `${(i * 17 + 10) % 80}%`,
          fontSize: `${16 + (i % 3) * 8}px`,
          opacity: 0.12 + (i % 4) * 0.04,
          animation: `floatSlow ${5 + i * 0.7}s ease-in-out ${i * 0.4}s infinite`,
        }}>{p}</div>
      ))}
    </div>
  )
}

/* ── section wrapper ────────────────────────── */
function Section({ id, children, style = {} }) {
  const [ref, inView] = useInView()
  return (
    <section id={id} ref={ref} style={{ padding:'96px 24px', ...style }}>
      <div style={{ maxWidth:1160, margin:'0 auto', opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(40px)', transition:'all .8s ease' }}>
        {children}
      </div>
    </section>
  )
}

/* ── section title ──────────────────────────── */
function SectionTitle({ tag, title, sub, center=true, light=false }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 56 }}>
      <span className="section-tag" style={{ color: light ? 'rgba(255,255,255,.7)' : '#F57F17' }}>{tag}</span>
      <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:'clamp(32px,4vw,48px)', color: light ? '#fff' : '#1a2e1a', margin:'10px 0 14px', lineHeight:1.1 }}>{title}</h2>
      {sub && <p style={{ color: light ? 'rgba(255,255,255,.7)' : '#666', fontSize:17, maxWidth:560, margin:'0 auto', lineHeight:1.7 }}>{sub}</p>}
    </div>
  )
}

/* ══════════════════════════════════════════════
   DATA
══════════════════════════════════════════════ */
const TESTIMONIOS = [
  { nombre:'Mamá de Valeria', ciudad:'Huancayo', texto:'¡Mi hija llora cuando tiene que salir! Le encanta el ambiente de la jungla y las estilistas son súper pacientes con los niños.', stars:5, avatar:'👩' },
  { nombre:'Papá de Mateo', ciudad:'El Tambo', texto:'Antes era imposible llevar a mi hijo a la peluquería. Aquí juega con las sillas de animalitos y sale feliz con su nuevo corte.', stars:5, avatar:'👨' },
  { nombre:'Mamá de Luziana', ciudad:'Huancayo', texto:'Excelente atención, ambiente muy limpio y acogedor. Los precios son justos y la calidad del corte es increíble. ¡100% recomendado!', stars:5, avatar:'👩‍🦱' },
  { nombre:'Abuela de Thiago', ciudad:'Chilca', texto:'Llevo a mi nieto desde que tenía 2 años. Siempre salen felices. El personal es muy amable y profesional con los pequeños.', stars:5, avatar:'👵' },
  { nombre:'Mamá de Daniela', ciudad:'Huancayo', texto:'El primer corte de mi bebé fue aquí y fue mágico. Nos dieron un certificado especial del primer corte. ¡Recuerdo para toda la vida!', stars:5, avatar:'👩‍👧' },
  { nombre:'Papá de Renato', ciudad:'Huancavelica', texto:'Vinimos desde Huancavelica porque nos lo recomendaron y valió totalmente la pena. Safari Kids es único en la región.', stars:5, avatar:'👨‍👦' },
]

const SUCURSALES = [
  {
    nombre:'Safari Kids - Sede Principal', zona:'Huancayo Centro',
    direccion:'Jr. Ayacucho 456, Huancayo', telefono:'(064) 234-567',
    horario:'Lun–Sáb: 9am – 7pm  |  Dom: 10am – 5pm',
    emoji:'🦁', color:'#2E7D32', bg:'#e8f5e9',
    especialidad:'Sede principal con 6 sillas temáticas',
    maps:'https://maps.google.com/?q=Huancayo+Peru',
  },
  {
    nombre:'Safari Kids - El Tambo', zona:'El Tambo',
    direccion:'Av. Ferrocarril 789, El Tambo', telefono:'(064) 345-678',
    horario:'Mar–Sáb: 9am – 6pm  |  Dom: 10am – 4pm',
    emoji:'🐘', color:'#1565c0', bg:'#e3f2fd',
    especialidad:'Especialistas en cabello rizado y afro',
    maps:'https://maps.google.com/?q=El+Tambo+Huancayo',
  },
  {
    nombre:'Safari Kids - Chilca', zona:'Chilca',
    direccion:'Calle Real 234, Chilca', telefono:'(064) 456-789',
    horario:'Lun–Sáb: 10am – 6pm',
    emoji:'🦒', color:'#e65100', bg:'#fff3e0',
    especialidad:'Especialistas en quinceañeras y eventos',
    maps:'https://maps.google.com/?q=Chilca+Huancayo',
  },
]

const VALORES = [
  { emoji:'🌿', titulo:'100% Seguros', desc:'Solo usamos productos dermatológicamente probados y seguros para piel infantil.' },
  { emoji:'❤️', titulo:'Con Amor', desc:'Cada niño es especial. Nuestro equipo está capacitado para atender con paciencia y cariño.' },
  { emoji:'🎉', titulo:'Diversión Total', desc:'Transformamos el corte en una aventura. Sillas temáticas, música y ambiente mágico.' },
  { emoji:'⭐', titulo:'Calidad Premium', desc:'Estilistas especializados en cabello infantil con años de experiencia y pasión.' },
  { emoji:'💚', titulo:'Ecológicos', desc:'Comprometidos con el medio ambiente. Productos biodegradables y packaging reciclable.' },
  { emoji:'🏅', titulo:'Los Mejores', desc:'+500 familias nos eligen. Reconocidos como la mejor peluquería infantil de la región.' },
]

const GALERIA = [
  { url:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=480&h=480&fit=crop&auto=format', alt:'Estilizado infantil' },
  { url:'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=480&h=480&fit=crop&auto=format', alt:'Niño feliz' },
  { url:'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=480&h=480&fit=crop&auto=format', alt:'Niña sonriendo' },
  { url:'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=480&h=480&fit=crop&auto=format', alt:'Niños felices' },
  { url:'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=480&h=480&fit=crop&auto=format', alt:'Corte de cabello' },
  { url:'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=480&h=480&fit=crop&auto=format', alt:'Salón de belleza' },
  { url:'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=480&h=480&fit=crop&auto=format', alt:'Estilista profesional' },
  { url:'https://images.unsplash.com/photo-1582564286939-400a311013a2?w=480&h=480&fit=crop&auto=format', alt:'Peinado creativo' },
]

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [statsRef, statsInView] = useInView(0.3)
  const [activeTestimonio, setActiveTestimonio] = useState(0)

  const c1 = useCounter(500, 2000, statsInView)
  const c2 = useCounter(5,   1500, statsInView)
  const c3 = useCounter(3,   1200, statsInView)
  const c4 = useCounter(98,  2000, statsInView)

  const handleReservar = () => {
    if (user?.rol?.toUpperCase() === 'CLIENTE') navigate('/reservar')
    else navigate('/login', { state: { intent:'reservar', message:'¡Reserva tu cita en Safari Kids!' } })
  }

  // Auto-rotate testimonios
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonio(p => (p + 1) % TESTIMONIOS.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif", overflowX:'hidden' }}>

      {/* ═══════ HERO ════════════════════════════════════════════════════════ */}
      <section style={{
        minHeight:'100vh', position:'relative', overflow:'hidden',
        background:'linear-gradient(160deg, #0d3b0f 0%, #1b5e20 35%, #2E7D32 65%, #33691e 100%)',
        display:'flex', alignItems:'center',
      }}>
        <FloatingParticles />

        {/* Decorative blobs */}
        <div style={{ position:'absolute', top:-120, right:-100, width:500, height:500, borderRadius:'50%', background:'rgba(249,168,37,.08)' }} className="anim-float-slow" />
        <div style={{ position:'absolute', bottom:-80, left:-80, width:350, height:350, borderRadius:'60% 40% 70% 30%/50% 60% 40% 70%', background:'rgba(255,255,255,.04)' }} />
        <div style={{ position:'absolute', top:'30%', right:'8%', width:180, height:180, borderRadius:'40% 60% 30% 70%/70% 30% 60% 40%', background:'rgba(249,168,37,.1)' }} className="anim-float" />

        <div style={{ maxWidth:1160, margin:'0 auto', padding:'120px 24px 80px', position:'relative', zIndex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
          {/* Left */}
          <div>
            <div className="anim-slide-up delay-0" style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'rgba(249,168,37,.15)', border:'1px solid rgba(249,168,37,.3)',
              borderRadius:50, padding:'8px 18px', marginBottom:24,
            }}>
              <span>✦</span>
              <span style={{ fontFamily:"'Fredoka One',cursive", color:'#F9A825', fontSize:13, letterSpacing:1.5, textTransform:'uppercase' }}>Peluquería infantil en Huancayo</span>
              <span>✦</span>
            </div>

            <h1 className="anim-slide-up delay-1" style={{ fontFamily:"'Fredoka One',cursive", fontSize:'clamp(42px,5.5vw,68px)', color:'#fff', lineHeight:1.05, marginBottom:20 }}>
              Donde los<br />
              <span style={{ color:'#F9A825', position:'relative', display:'inline-block' }}>
                pequeños
                <div style={{ position:'absolute', bottom:-4, left:0, right:0, height:4, background:'#F9A825', borderRadius:4, opacity:.4 }} />
              </span>
              <br />brillan ✨
            </h1>

            <p className="anim-slide-up delay-2" style={{ color:'rgba(255,255,255,.8)', fontSize:18, lineHeight:1.75, maxWidth:480, marginBottom:36 }}>
              Cortes divertidos, ambiente mágico de selva y estilistas que adoran a los niños.
              La experiencia que tu hijo va a recordar para siempre.
            </p>

            <div className="anim-slide-up delay-3" style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:48 }}>
              <button onClick={handleReservar} className="btn-jungle btn-jungle-yellow anim-pulse-glow">
                🗓 Reservar mi cita
              </button>
              <Link to="/servicios" className="btn-jungle btn-jungle-white" style={{ textDecoration:'none' }}>
                Ver servicios →
              </Link>
            </div>

            {/* Mini stats */}
            <div className="anim-slide-up delay-4" style={{ display:'flex', gap:32, paddingTop:32, borderTop:'1px solid rgba(255,255,255,.15)' }}>
              {[['500+','Familias felices'],['5★','Valoración media'],['3','Sucursales']].map(([n,l]) => (
                <div key={l}>
                  <p style={{ fontFamily:"'Fredoka One',cursive", fontSize:28, color:'#F9A825', margin:0 }}>{n}</p>
                  <p style={{ color:'rgba(255,255,255,.6)', fontSize:12, margin:'2px 0 0' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Hero visual */}
          <div className="anim-slide-right delay-2" style={{ textAlign:'center', position:'relative' }}>
            {/* Main circle */}
            <div className="anim-float" style={{
              width:320, height:320, borderRadius:'50%',
              background:'rgba(249,168,37,.12)', border:'3px solid rgba(249,168,37,.25)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 24px', fontSize:160,
              boxShadow:'0 0 80px rgba(249,168,37,.2)',
            }}>🦁</div>

            {/* Floating badges */}
            {[
              { emoji:'✂️', label:'Cortes creativos', pos:{ top:'5%', left:'-5%' }, color:'#e8f5e9' },
              { emoji:'🎨', label:'Tintes seguros',   pos:{ top:'15%', right:'-8%' }, color:'#fff8e1' },
              { emoji:'⭐', label:'¡El mejor!',       pos:{ bottom:'20%', left:'-10%' }, color:'#e3f2fd' },
              { emoji:'🌺', label:'Ambiente mágico',  pos:{ bottom:'10%', right:'-5%' }, color:'#fce4ec' },
            ].map(b => (
              <div key={b.label} className="anim-bounce-in" style={{
                position:'absolute', ...b.pos,
                background:b.color, borderRadius:16, padding:'10px 14px',
                boxShadow:'0 4px 16px rgba(0,0,0,.12)',
                display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap',
              }}>
                <span style={{ fontSize:22 }}>{b.emoji}</span>
                <span style={{ fontWeight:800, fontSize:13, color:'#1a2e1a' }}>{b.label}</span>
              </div>
            ))}

            {/* Next slot card */}
            <div style={{
              background:'rgba(255,255,255,.12)', backdropFilter:'blur(12px)',
              border:'1px solid rgba(255,255,255,.2)', borderRadius:20, padding:'16px 24px',
              display:'inline-flex', alignItems:'center', gap:12,
            }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'#F9A825', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🗓</div>
              <div style={{ textAlign:'left' }}>
                <p style={{ color:'#fff', fontWeight:800, fontSize:14, margin:0 }}>Agenda disponible hoy</p>
                <p style={{ color:'rgba(255,255,255,.65)', fontSize:12, margin:'2px 0 0' }}>Lun–Sáb · 9am a 7pm · 3 sedes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div style={{ position:'absolute', bottom:-1, left:0, right:0 }}>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#fafaf7"/>
          </svg>
        </div>
      </section>

      {/* ═══════ COUNTERS ════════════════════════════════════════════════════ */}
      <section ref={statsRef} style={{ background:'linear-gradient(135deg,#1b5e20,#2E7D32)', padding:'64px 24px', position:'relative', overflow:'hidden' }}>
        <FloatingParticles />
        <div style={{ maxWidth:1000, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:24, position:'relative', zIndex:1 }}>
          {[
            { num: c1, suffix:'+', label:'Familias satisfechas', emoji:'👨‍👧' },
            { num: c2, suffix:'★', label:'Estrellas de valoración', emoji:'⭐' },
            { num: c3, suffix:'', label:'Sucursales en Huancayo', emoji:'📍' },
            { num: c4, suffix:'%', label:'Clientes que repiten', emoji:'💚' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center', padding:'28px 16px', background:'rgba(255,255,255,.1)', backdropFilter:'blur(8px)', borderRadius:24, border:'2px solid rgba(255,255,255,.15)', transition:'transform .2s' }}
              onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
              <div style={{ fontSize:36, marginBottom:8 }}>{s.emoji}</div>
              <p className="counter-num">{s.num}{s.suffix}</p>
              <p style={{ color:'rgba(255,255,255,.75)', fontSize:13, marginTop:8, fontWeight:600 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ QUIÉNES SOMOS ══════════════════════════════════════════════ */}
      <Section id="nosotros" style={{ background:'#fff' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
          {/* Visual */}
          <div style={{ position:'relative' }}>
            <div style={{
              width:'100%', aspectRatio:'1', maxWidth:420,
              background:'linear-gradient(135deg,#e8f5e9,#c8e6c9)',
              borderRadius:'60% 40% 70% 30%/50% 60% 40% 70%',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:140,
            }} className="anim-float-slow">🦁</div>

            {/* Floating cards */}
            {[
              { t:'Fundada en 2020', emoji:'🏆', pos:{ top:'5%', right:'-5%' }, bg:'#fff8e1' },
              { t:'Huancayo, Perú', emoji:'📍', pos:{ bottom:'10%', left:'-5%' }, bg:'#e3f2fd' },
            ].map(c => (
              <div key={c.t} style={{ position:'absolute', ...c.pos, background:c.bg, borderRadius:16, padding:'12px 18px', boxShadow:'0 8px 24px rgba(0,0,0,.1)', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:24 }}>{c.emoji}</span>
                <span style={{ fontWeight:800, fontSize:14, color:'#1a2e1a' }}>{c.t}</span>
              </div>
            ))}
          </div>

          {/* Text */}
          <div>
            <SectionTitle tag="Conócenos" title="Somos más que una peluquería" sub="" center={false} />
            <p style={{ color:'#555', fontSize:16, lineHeight:1.85, marginBottom:20 }}>
              <strong style={{ color:'#2E7D32' }}>Safari Kids</strong> nació en 2020 con una misión clara: transformar el momento del corte de cabello en una <strong>aventura divertida y mágica</strong> para cada niño y niña de Huancayo.
            </p>
            <p style={{ color:'#555', fontSize:16, lineHeight:1.85, marginBottom:32 }}>
              Sabemos que muchos niños le tienen miedo a las tijeras. Por eso creamos un ambiente temático de selva africana, con sillas en forma de animales, música alegre y un equipo de estilistas <strong>especialmente capacitados</strong> para trabajar con paciencia, amor y profesionalismo con los más pequeños.
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:32 }}>
              {[['👩‍🎓','Estilistas certificadas'],['🌿','Productos naturales'],['🎭','Ambiente temático'],['🏅','+4 años de experiencia']].map(([e,t]) => (
                <div key={t} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'#f9fdf9', borderRadius:12, border:'1px solid #e8f5e9' }}>
                  <span style={{ fontSize:22 }}>{e}</span>
                  <span style={{ fontWeight:700, fontSize:13, color:'#1a2e1a' }}>{t}</span>
                </div>
              ))}
            </div>

            <button onClick={handleReservar} className="btn-jungle btn-jungle-green">
              🗓 Reserva ahora
            </button>
          </div>
        </div>
      </Section>

      {/* ═══════ POR QUÉ ELEGIRNOS ══════════════════════════════════════════ */}
      <Section style={{ background:'#fafaf7' }} className="paw-pattern">
        <SectionTitle tag="Por qué elegirnos" title="La experiencia Safari Kids" sub="No somos una peluquería común. Somos una aventura para tu hijo." />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
          {VALORES.map((v, i) => (
            <div key={v.titulo} className="card-fun" style={{ padding:'28px 24px', animationDelay:`${i * .1}s` }}>
              <div style={{ fontSize:40, marginBottom:14 }}>{v.emoji}</div>
              <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:'#1a2e1a', marginBottom:8 }}>{v.titulo}</h3>
              <p style={{ color:'#777', fontSize:14, lineHeight:1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════ CÓMO FUNCIONA ══════════════════════════════════════════════ */}
      <Section style={{ background:'#fff' }}>
        <SectionTitle tag="Proceso simple" title="Reserva en 3 pasos" sub="Agendar tu cita en Safari Kids es muy fácil. ¡Solo toma 2 minutos!" />
        <div style={{ maxWidth:680, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>
          {[
            { n:'1', emoji:'📱', title:'Créate una cuenta', desc:'Regístrate gratis con tu correo electrónico. Solo toma 30 segundos.' },
            { n:'2', emoji:'✂️', title:'Elige tu servicio',  desc:'Explora nuestro catálogo de servicios y selecciona el que más te guste.' },
            { n:'3', emoji:'🗓', title:'Reserva tu turno',  desc:'Elige la fecha, hora y sede que más te convenga. ¡Listo!' },
          ].map(s => (
            <div key={s.n} className="step-card">
              <div className="step-num">{s.n}</div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:22 }}>{s.emoji}</span>
                  <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:19, color:'#1a2e1a' }}>{s.title}</h3>
                </div>
                <p style={{ color:'#777', fontSize:14, lineHeight:1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:40 }}>
          <button onClick={handleReservar} className="btn-jungle btn-jungle-green anim-pulse-glow">
            🦁 ¡Quiero reservar mi cita!
          </button>
        </div>
      </Section>

      {/* ═══════ TESTIMONIOS ════════════════════════════════════════════════ */}
      <Section style={{ background:'linear-gradient(160deg,#1b5e20,#2E7D32)' }}>
        <SectionTitle tag="Lo que dicen las familias" title="Más de 500 familias nos recomiendan" sub="Lee las experiencias reales de nuestros clientes más pequeños y sus papás." light />

        {/* Featured */}
        <div style={{ background:'rgba(255,255,255,.08)', backdropFilter:'blur(12px)', border:'2px solid rgba(255,255,255,.15)', borderRadius:28, padding:'36px', marginBottom:24, transition:'all .5s' }}>
          <div style={{ display:'flex', gap:6, marginBottom:16 }}>
            {'★★★★★'.split('').map((s,i) => <span key={i} style={{ color:'#F9A825', fontSize:20 }}>{s}</span>)}
          </div>
          <p style={{ color:'rgba(255,255,255,.9)', fontSize:18, lineHeight:1.8, marginBottom:20, fontStyle:'italic' }}>
            "{TESTIMONIOS[activeTestimonio].texto}"
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
              {TESTIMONIOS[activeTestimonio].avatar}
            </div>
            <div>
              <p style={{ color:'#fff', fontWeight:800, margin:0 }}>{TESTIMONIOS[activeTestimonio].nombre}</p>
              <p style={{ color:'rgba(255,255,255,.6)', fontSize:13, margin:0 }}>📍 {TESTIMONIOS[activeTestimonio].ciudad}</p>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:40 }}>
          {TESTIMONIOS.map((_,i) => (
            <button key={i} onClick={() => setActiveTestimonio(i)} style={{ width: i===activeTestimonio?24:8, height:8, borderRadius:4, border:'none', cursor:'pointer', background: i===activeTestimonio ? '#F9A825':'rgba(255,255,255,.3)', transition:'all .3s' }} />
          ))}
        </div>

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
          {TESTIMONIOS.slice(0,3).map((t, i) => (
            <div key={i} className="testimonial-card" style={{ cursor:'pointer' }} onClick={() => setActiveTestimonio(i)}>
              <div style={{ display:'flex', gap:4, marginBottom:12, marginTop:16 }}>
                {'★★★★★'.split('').map((s,j)=><span key={j} style={{ color:'#F9A825', fontSize:14 }}>{s}</span>)}
              </div>
              <p style={{ color:'#555', fontSize:13, lineHeight:1.7, marginBottom:16 }}>"{t.texto.substring(0,100)}..."</p>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:22 }}>{t.avatar}</span>
                <div>
                  <p style={{ fontWeight:700, fontSize:13, color:'#1a2e1a', margin:0 }}>{t.nombre}</p>
                  <p style={{ fontSize:11, color:'#888', margin:0 }}>{t.ciudad}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════ GALERÍA ════════════════════════════════════════════════════ */}
      <Section id="galeria" style={{ background:'#fafaf7' }}>
        <SectionTitle tag="Galería" title="Momentos mágicos en Safari Kids" sub="Cada visita es una nueva aventura llena de sonrisas y colores." />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}>
          {GALERIA.map((item, i) => (
            <div key={i} style={{
              aspectRatio:'1', borderRadius:20, overflow:'hidden',
              cursor:'pointer', transition:'all .28s',
              boxShadow:'0 4px 16px rgba(0,0,0,.10)',
              border:'3px solid transparent',
            }}
            onMouseOver={e=>{e.currentTarget.style.transform='scale(1.04)';e.currentTarget.style.borderColor='#F9A825';e.currentTarget.style.boxShadow='0 10px 32px rgba(0,0,0,.18)';}}
            onMouseOut={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.borderColor='transparent';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.10)';}}>
              <img
                src={item.url}
                alt={item.alt}
                loading="lazy"
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                onError={e => { e.currentTarget.style.display='none'; e.currentTarget.parentElement.style.background='#e8f5e9'; e.currentTarget.parentElement.innerHTML+='<div style="height:100%;display:flex;align-items:center;justify-content:center;font-size:48px">🦁</div>' }}
              />
            </div>
          ))}
        </div>
        <p style={{ textAlign:'center', color:'#888', fontSize:13, marginTop:24 }}>
          📸 Síguenos en Instagram <strong>@safarikids.huancayo</strong> para más momentos especiales
        </p>
      </Section>

      {/* ═══════ SUCURSALES ═════════════════════════════════════════════════ */}
      <Section id="sucursales" style={{ background:'#fff' }}>
        <SectionTitle tag="Nuestras sedes" title="Encuéntranos en Huancayo" sub="3 sucursales para que siempre tengas una sede cerca de ti." />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:24 }}>
          {SUCURSALES.map((s, i) => (
            <div key={s.nombre} className="sucursal-card">
              <div style={{ background:`linear-gradient(135deg,${s.color},${s.color}cc)`, padding:'28px', textAlign:'center' }}>
                <div style={{ fontSize:56, marginBottom:8 }}>{s.emoji}</div>
                <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:'#fff', margin:'0 0 4px' }}>{s.nombre.replace('Safari Kids - ','')}</h3>
                <span style={{ background:'rgba(255,255,255,.2)', color:'#fff', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>{s.zona}</span>
              </div>
              <div style={{ padding:'24px' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[['📍',s.direccion],['📞',s.telefono],['🕐',s.horario],['⭐',s.especialidad]].map(([ico,val])=>(
                    <div key={val} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>{ico}</span>
                      <span style={{ fontSize:13, color:'#555', lineHeight:1.5 }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:10, marginTop:20 }}>
                  <a href={s.maps} target="_blank" rel="noopener noreferrer" style={{
                    flex:1, background:s.bg, color:s.color, textDecoration:'none',
                    borderRadius:10, padding:'10px', textAlign:'center',
                    fontWeight:700, fontSize:13, border:`1.5px solid ${s.color}33`,
                  }}>📍 Ver mapa</a>
                  <button onClick={handleReservar} style={{
                    flex:1, background:s.color, color:'#fff', border:'none',
                    borderRadius:10, padding:'10px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit',
                  }}>🗓 Reservar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════ CONTACTO ═══════════════════════════════════════════════════ */}
      <Section id="contacto" style={{ background:'linear-gradient(135deg,#1b5e20,#2E7D32)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
          <div>
            <SectionTitle tag="Contacto" title="¿Tienes alguna duda?" light center={false} />
            <p style={{ color:'rgba(255,255,255,.8)', fontSize:16, lineHeight:1.8, marginBottom:32 }}>
              Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios y te responderemos lo antes posible.
            </p>
            {[
              ['📞','Teléfono principal','(064) 234-567'],
              ['📧','Correo electrónico','hola@safarikids.com'],
              ['📱','WhatsApp','964 123 456'],
              ['📍','Sede principal','Jr. Ayacucho 456, Huancayo'],
            ].map(([e,l,v]) => (
              <div key={l} style={{ display:'flex', gap:14, alignItems:'center', padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,.1)' }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{e}</div>
                <div>
                  <p style={{ color:'rgba(255,255,255,.6)', fontSize:11, margin:0, textTransform:'uppercase', letterSpacing:1 }}>{l}</p>
                  <p style={{ color:'#fff', fontWeight:700, fontSize:15, margin:0 }}>{v}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:'rgba(255,255,255,.08)', backdropFilter:'blur(12px)', borderRadius:28, padding:36, border:'2px solid rgba(255,255,255,.15)' }}>
            <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:24, color:'#F9A825', marginBottom:24 }}>Envíanos un mensaje</h3>
            {['Tu nombre completo','Tu correo electrónico','Tu teléfono (opcional)'].map(p => (
              <input key={p} placeholder={p} style={{ width:'100%', background:'rgba(255,255,255,.1)', border:'1.5px solid rgba(255,255,255,.2)', borderRadius:12, padding:'12px 16px', color:'#fff', fontSize:14, marginBottom:12, outline:'none', fontFamily:'inherit' }} />
            ))}
            <textarea placeholder="Tu mensaje..." rows={4} style={{ width:'100%', background:'rgba(255,255,255,.1)', border:'1.5px solid rgba(255,255,255,.2)', borderRadius:12, padding:'12px 16px', color:'#fff', fontSize:14, marginBottom:16, outline:'none', resize:'vertical', fontFamily:'inherit' }} />
            <button className="btn-jungle btn-jungle-yellow" style={{ width:'100%', justifyContent:'center' }}>
              📨 Enviar mensaje
            </button>
          </div>
        </div>
      </Section>

      {/* ═══════ CTA FINAL ══════════════════════════════════════════════════ */}
      <section style={{ background:'#F9A825', padding:'80px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <FloatingParticles />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:72, marginBottom:16 }} className="anim-roar">🦁</div>
          <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:'clamp(32px,4vw,52px)', color:'#1b2a1b', margin:'0 0 16px', letterSpacing:'-0.5px' }}>
            ¡Tu hijo merece la mejor aventura!
          </h2>
          <p style={{ color:'rgba(27,42,27,.7)', fontSize:17, maxWidth:500, margin:'0 auto 36px', lineHeight:1.7 }}>
            Reserva su cita hoy y que viva la magia de Safari Kids. ¡Primera cita con 10% de descuento!
          </p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={handleReservar} className="btn-jungle btn-jungle-green" style={{ fontSize:20 }}>
              🗓 Reservar ahora — ¡Es gratis!
            </button>
            <Link to="/servicios" className="btn-jungle" style={{ background:'rgba(27,42,27,.1)', color:'#1b2a1b', textDecoration:'none' }}>
              Ver todos los servicios
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═════════════════════════════════════════════════════ */}
      <footer style={{ background:'#0d2a0f', color:'rgba(255,255,255,.65)', padding:'56px 24px 32px' }}>
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:48, marginBottom:48 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <span style={{ fontSize:32 }}>🦁</span>
                <div>
                  <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:'#F9A825' }}>Safari</span>
                  <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:'#fff' }}>Kids</span>
                </div>
              </div>
              <p style={{ fontSize:13, lineHeight:1.8, maxWidth:240 }}>Peluquería especializada en niños. Hacemos de cada corte una aventura mágica.</p>
            </div>
            {[
              { title:'Servicios', links:['Corte Infantil','Tinte & Color','Lavado & Peinado','Spa Capilar','Paquete Primera Vez'] },
              { title:'La Empresa', links:['Quiénes somos','Nuestro equipo','Sucursales','Trabaja con nosotros'] },
              { title:'Contacto', links:['(064) 234-567','hola@safarikids.com','WhatsApp: 964 123 456','Jr. Ayacucho 456'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ color:'#fff', fontWeight:800, marginBottom:14, fontSize:14 }}>{col.title}</h4>
                {col.links.map(l => <p key={l} style={{ fontSize:13, marginBottom:6, cursor:'pointer', transition:'color .2s' }} onMouseOver={e=>e.target.style.color='#F9A825'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,.65)'}>{l}</p>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,.1)', paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <p style={{ fontSize:12 }}>© 2024 Safari Kids · Todos los derechos reservados · Huancayo, Perú</p>
            <div style={{ display:'flex', gap:12 }}>
              {['📘 Facebook','📸 Instagram','🎵 TikTok'].map(s => <span key={s} style={{ fontSize:12, cursor:'pointer', transition:'color .2s' }} onMouseOver={e=>e.target.style.color='#F9A825'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,.65)'}>{s}</span>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

