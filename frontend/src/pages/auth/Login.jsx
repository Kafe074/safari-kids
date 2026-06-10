import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { LuCalendar, LuClipboardList, LuShield, LuCircleCheck } from 'react-icons/lu'

const INTENT_CONFIG = {
  reservar:  { icon: <LuCalendar size={40} color="#fff" />,      title:'Reserva tu cita',         subtitle:'Inicia sesión para agendar tu turno safari',     color:'#1B7A3E', shadow:'#0F5527', redirect:'/reservar'  },
  historial: { icon: <LuClipboardList size={40} color="#fff" />, title:'Tu historial',             subtitle:'Inicia sesión para ver tus citas y compras',    color:'#38BDF8', shadow:'#0284C7', redirect:'/mi-cuenta'  },
  admin:     { icon: <LuShield size={40} color="#fff" />,        title:'Panel administrativo',     subtitle:'Acceso para administradores y empleados',       color:'#A855F7', shadow:'#7C3AED', redirect:'/dashboard' },
  default:   { icon: '🦁',                                        title:'¡Bienvenido de vuelta!',  subtitle:'Inicia sesión en tu cuenta Safari Kids',        color:'#FF4F95', shadow:'#C42E72', redirect:null         },
}

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const state     = location.state || {}
  const intent    = state.intent || 'default'
  const cfg       = INTENT_CONFIG[intent] || INTENT_CONFIG.default
  const [form, setForm]           = useState({ correo: '', contrasena: '' })
  const [loading, setLoading]     = useState(false)
  const [focused, setFocused]     = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const userData = await login(form.correo, form.contrasena)
      toast.success('¡Bienvenido, ' + userData.nombreCompleto.split(' ')[0] + '! 🦁')
      const role = userData.rol?.toUpperCase()
      if (cfg.redirect && intent !== 'default') {
        if (intent === 'admin' && !['ADMINISTRADOR','EMPLEADO'].includes(role)) { toast.error('Sin permisos de admin'); navigate('/'); return }
        if ((intent === 'reservar' || intent === 'historial') && role !== 'CLIENTE') { navigate('/dashboard'); return }
        navigate(cfg.redirect)
      } else {
        navigate(role === 'CLIENTE' ? '/mi-cuenta' : '/dashboard')
      }
    } catch { toast.error('Correo o contraseña incorrectos') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--paper)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Nunito',sans-serif", position:'relative', overflow:'hidden' }}>
      {/* BG decoration */}
      <div style={{ position:'absolute', top:-60, right:-60, fontSize:200, opacity:.04, animation:'spinSlow 30s linear infinite' }}>🦁</div>
      <div style={{ position:'absolute', bottom:-40, left:-40, fontSize:160, opacity:.05, animation:'spinR 25s linear infinite' }}>🌿</div>

      <div className="anim-slide-up" style={{ width:'100%', maxWidth:440, position:'relative' }}>
        {/* Header card */}
        <div style={{
          background: `linear-gradient(135deg, ${cfg.color}, ${cfg.shadow})`,
          border: '4px solid var(--ink)',
          borderRadius: '24px 24px 0 0',
          padding: '36px 36px 28px',
          textAlign: 'center', color: '#fff',
          boxShadow: '8px 0 0 var(--ink)',
        }}>
          <div style={{ fontSize: 56, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="anim-roar">{cfg.icon}</div>
          <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize: 28, margin: '0 0 8px' }}>{cfg.title}</h1>
          <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            {state.message || cfg.subtitle}
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: '#fff',
          border: '4px solid var(--ink)', borderTop: 'none',
          borderRadius: '0 0 24px 24px',
          padding: '32px 36px 36px',
          boxShadow: '8px 8px 0 var(--ink)',
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display:'block', fontFamily:"'Permanent Marker',cursive", fontSize: 12, color: '#555', marginBottom: 6, letterSpacing: 1 }}>
                CORREO ELECTRÓNICO
              </label>
              <input type="email" required placeholder="tu@correo.com" value={form.correo}
                onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
                onFocus={() => setFocused('correo')} onBlur={() => setFocused(null)}
                style={{
                  width:'100%', border: `3px solid ${focused==='correo' ? cfg.color : '#e0e0e0'}`,
                  borderRadius: 12, padding: '12px 14px', fontSize: 15,
                  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                  transition: 'border-color .2s', background: focused==='correo' ? '#fffbf0' : '#fff',
                }} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ display:'block', fontFamily:"'Permanent Marker',cursive", fontSize: 12, color: '#555', marginBottom: 6, letterSpacing: 1 }}>
                CONTRASEÑA
              </label>
              <input type="password" required placeholder="••••••••" value={form.contrasena}
                onChange={e => setForm(f => ({ ...f, contrasena: e.target.value }))}
                onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
                style={{
                  width:'100%', border: `3px solid ${focused==='pass' ? cfg.color : '#e0e0e0'}`,
                  borderRadius: 12, padding: '12px 14px', fontSize: 15,
                  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                  transition: 'border-color .2s', background: focused==='pass' ? '#fffbf0' : '#fff',
                }} />
            </div>
            <button type="submit" disabled={loading} className="cta-block" style={{
              width: '100%',
              background: loading ? '#ccc' : `linear-gradient(180deg, ${cfg.color}, ${cfg.shadow})`,
              color: '#fff', border: `3px solid ${loading ? '#aaa' : 'var(--ink)'}`,
              borderRadius: 999, padding: '14px', fontFamily: "'Fredoka One',cursive",
              fontSize: 18, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : `0 6px 0 ${cfg.shadow}`,
              transition: 'all .15s',
            }}>
              {loading ? '⏳ Ingresando...' : 'Ingresar →'}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '2px dashed #e0e0e0' }}>
            <p style={{ color:'#aaa', fontSize:11, textAlign:'center', margin:'0 0 10px', fontFamily:"'Permanent Marker',cursive", letterSpacing: 1 }}>O ACCEDE COMO</p>
            <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
              {intent !== 'reservar'  && <button onClick={() => navigate('/login',{state:{intent:'reservar'}})}
                style={{ background:'#e8f5e9', color:'#1B7A3E', border:'3px solid #1B7A3E', borderRadius:12, padding:'10px', fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:"'Nunito',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <LuCalendar size={15} /> Quiero reservar una cita
              </button>}
              {intent !== 'historial' && <button onClick={() => navigate('/login',{state:{intent:'historial'}})}
                style={{ background:'#e0f2fe', color:'#0284C7', border:'3px solid #0284C7', borderRadius:12, padding:'10px', fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:"'Nunito',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <LuClipboardList size={15} /> Ver mi historial
              </button>}
              {intent !== 'admin'     && <button onClick={() => navigate('/login',{state:{intent:'admin'}})}
                style={{ background:'#f3e8ff', color:'#7C3AED', border:'3px solid #7C3AED', borderRadius:12, padding:'10px', fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:"'Nunito',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <LuShield size={15} /> Soy administrador / empleado
              </button>}
            </div>
          </div>

          <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'#666' }}>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" style={{ color: cfg.color, fontWeight:800, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4 }}>Regístrate gratis <LuCircleCheck size={14} /></Link>
          </p>
          <p style={{ textAlign:'center', marginTop:8, fontSize:13 }}>
            <Link to="/" style={{ color:'#aaa', textDecoration:'none', fontWeight:600 }}>← Volver al inicio</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
