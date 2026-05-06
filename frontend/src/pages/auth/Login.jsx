import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const INTENT_CONFIG = {
  reservar:  { icon:'📅', title:'Reserva tu cita',       subtitle:'Inicia sesión para reservar tu turno',             color:'#2E7D32', redirect:'/reservar'   },
  historial: { icon:'📋', title:'Tu historial',           subtitle:'Inicia sesión para ver tus reservas anteriores',   color:'#1565c0', redirect:'/mi-cuenta'  },
  admin:     { icon:'🔐', title:'Panel administrativo',   subtitle:'Acceso para administradores y empleados',          color:'#1a237e', redirect:'/dashboard'  },
  default:   { icon:'🦁', title:'Bienvenido a Safari Kids', subtitle:'Inicia sesión con tu cuenta',                   color:'#2E7D32', redirect:null          },
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}
  const intent = state.intent || 'default'
  const cfg = INTENT_CONFIG[intent] || INTENT_CONFIG.default
  const [form, setForm] = useState({ correo: '', contrasena: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const userData = await login(form.correo, form.contrasena)
      toast.success('Bienvenido, ' + userData.nombreCompleto.split(' ')[0] + '!')
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

  const inputStyle = (focused) => ({
    width:'100%', border:'1.5px solid ' + (focused ? cfg.color : '#e0e0e0'),
    borderRadius:10, padding:'11px 14px', fontSize:15,
    outline:'none', boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.2s'
  })

  const [focusedField, setFocusedField] = useState(null)

  return (
    <div style={{minHeight:'100vh',background:'#f5f0e8',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'Nunito','Segoe UI',sans-serif"}}>
      <div style={{width:'100%',maxWidth:420}}>

        <div style={{background:cfg.color,borderRadius:'20px 20px 0 0',padding:'32px 36px 28px',textAlign:'center',color:'#fff'}}>
          <div style={{fontSize:48,marginBottom:12}}>{cfg.icon}</div>
          <h1 style={{fontWeight:900,fontSize:24,margin:'0 0 8px',letterSpacing:'-0.5px'}}>{cfg.title}</h1>
          <p style={{color:'rgba(255,255,255,0.8)',fontSize:14,margin:0,lineHeight:1.5}}>{state.message || cfg.subtitle}</p>
        </div>

        <div style={{background:'#fff',borderRadius:'0 0 20px 20px',padding:'32px 36px 36px',boxShadow:'0 8px 40px rgba(0,0,0,0.1)'}}>
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:18}}>
              <label style={{display:'block',fontWeight:700,fontSize:13,color:'#333',marginBottom:6}}>Correo electrónico</label>
              <input type="email" required placeholder="tu@correo.com" value={form.correo}
                onChange={e => setForm(f=>({...f,correo:e.target.value}))}
                style={inputStyle(focusedField==='correo')}
                onFocus={()=>setFocusedField('correo')} onBlur={()=>setFocusedField(null)} />
            </div>
            <div style={{marginBottom:28}}>
              <label style={{display:'block',fontWeight:700,fontSize:13,color:'#333',marginBottom:6}}>Contraseña</label>
              <input type="password" required placeholder="••••••••" value={form.contrasena}
                onChange={e => setForm(f=>({...f,contrasena:e.target.value}))}
                style={inputStyle(focusedField==='pass')}
                onFocus={()=>setFocusedField('pass')} onBlur={()=>setFocusedField(null)} />
            </div>
            <button type="submit" disabled={loading} style={{
              width:'100%',background:cfg.color,color:'#fff',border:'none',borderRadius:12,
              padding:'14px',fontWeight:800,fontSize:16,cursor:loading?'not-allowed':'pointer',
              opacity:loading?0.7:1,fontFamily:'inherit'
            }}>
              {loading ? 'Ingresando...' : 'Ingresar →'}
            </button>
          </form>

          <div style={{marginTop:28,paddingTop:24,borderTop:'1px solid #f0f0f0'}}>
            <p style={{color:'#bbb',fontSize:11,textAlign:'center',margin:'0 0 12px',fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>O accede como</p>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {intent !== 'reservar'  && <button onClick={()=>navigate('/login',{state:{intent:'reservar'}})}  style={{background:'#f0f7f0',color:'#2E7D32',border:'1.5px solid #c8e6c9',borderRadius:10,padding:'10px',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>📅 Quiero reservar una cita</button>}
              {intent !== 'historial' && <button onClick={()=>navigate('/login',{state:{intent:'historial'}})} style={{background:'#e8f0fe',color:'#1565c0',border:'1.5px solid #bbdefb',borderRadius:10,padding:'10px',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>📋 Ver mi historial de reservas</button>}
              {intent !== 'admin'     && <button onClick={()=>navigate('/login',{state:{intent:'admin'}})}     style={{background:'#e8eaf6',color:'#1a237e',border:'1.5px solid #c5cae9',borderRadius:10,padding:'10px',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>🔐 Soy administrador / empleado</button>}
            </div>
          </div>

          <p style={{textAlign:'center',marginTop:20,fontSize:14,color:'#666'}}>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" style={{color:cfg.color,fontWeight:700,textDecoration:'none'}}>Regístrate gratis</Link>
          </p>
          <p style={{textAlign:'center',marginTop:8,fontSize:13}}>
            <Link to="/" style={{color:'#888',textDecoration:'none',fontWeight:600}}>← Volver al inicio</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
