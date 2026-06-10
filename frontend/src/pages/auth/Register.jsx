import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { LuCircleCheck } from 'react-icons/lu'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombres: '', apellidos: '', correo: '', contrasena: '', confirmar: '',
    telefono: '', direccion: '', fechaNacimiento: '',
  })
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

  const inp = (field) => ({
    width: '100%', border: `3px solid ${focused === field ? '#FF4F95' : '#e0e0e0'}`,
    borderRadius: 12, padding: '12px 14px', fontSize: 15,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color .2s', background: focused === field ? '#fffbf0' : '#fff',
  })
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.contrasena !== form.confirmar) { toast.error('Las contraseñas no coinciden'); return }
    if (form.contrasena.length < 6) { toast.error('Mínimo 6 caracteres'); return }
    setLoading(true)
    try {
      const userData = await register(
        form.nombres, form.apellidos, form.correo, form.contrasena,
        form.telefono, form.direccion,
        form.fechaNacimiento ? form.fechaNacimiento : null
      )
      toast.success('¡Bienvenido, ' + userData.nombreCompleto.split(' ')[0] + '! 🦁')
      navigate('/mi-cuenta')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrarse')
    } finally { setLoading(false) }
  }

  const labelStyle = {
    display: 'block', fontFamily: "'Permanent Marker',cursive",
    fontSize: 11, color: '#555', marginBottom: 5, letterSpacing: 1,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Nunito',sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -60, right: -60, fontSize: 200, opacity: .04, animation: 'spinSlow 30s linear infinite' }}>🦁</div>
      <div style={{ position: 'absolute', bottom: -40, left: -40, fontSize: 160, opacity: .05, animation: 'spinR 25s linear infinite' }}>🌿</div>

      <div className="anim-slide-up" style={{ width: '100%', maxWidth: 520, position: 'relative' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #FF4F95, #C42E72)',
          border: '4px solid var(--ink)',
          borderRadius: '24px 24px 0 0',
          padding: '36px 36px 28px',
          textAlign: 'center', color: '#fff',
          boxShadow: '8px 0 0 var(--ink)',
        }}>
          <div style={{ fontSize: 56, marginBottom: 14 }} className="anim-roar">🦁</div>
          <h1 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, margin: '0 0 8px' }}>¡Crea tu cuenta!</h1>
          <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            Únete a la familia Safari Kids y reserva tus citas 🌿
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: '#fff',
          border: '4px solid var(--ink)', borderTop: 'none',
          borderRadius: '0 0 24px 24px',
          padding: '32px 36px 36px',
          boxShadow: '8px 8px 0 var(--ink)',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Nombres / Apellidos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>NOMBRES</label>
                <input required placeholder="Juan" value={form.nombres} onChange={set('nombres')}
                  style={inp('nombres')} onFocus={() => setFocused('nombres')} onBlur={() => setFocused(null)} />
              </div>
              <div>
                <label style={labelStyle}>APELLIDOS</label>
                <input required placeholder="Pérez" value={form.apellidos} onChange={set('apellidos')}
                  style={inp('apellidos')} onFocus={() => setFocused('apellidos')} onBlur={() => setFocused(null)} />
              </div>
            </div>

            {/* Correo */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>CORREO ELECTRÓNICO</label>
              <input type="email" required placeholder="tu@correo.com" value={form.correo} onChange={set('correo')}
                style={inp('correo')} onFocus={() => setFocused('correo')} onBlur={() => setFocused(null)} />
            </div>

            {/* Teléfono / Fecha Nacimiento */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>TELÉFONO <span style={{ color: '#ccc' }}>(opcional)</span></label>
                <input type="tel" placeholder="09XXXXXXXX" value={form.telefono} onChange={set('telefono')}
                  style={inp('telefono')} onFocus={() => setFocused('telefono')} onBlur={() => setFocused(null)} />
              </div>
              <div>
                <label style={labelStyle}>FECHA DE NACIMIENTO <span style={{ color: '#ccc' }}>(opcional)</span></label>
                <input type="date" value={form.fechaNacimiento} onChange={set('fechaNacimiento')}
                  style={inp('fechaNacimiento')} onFocus={() => setFocused('fechaNacimiento')} onBlur={() => setFocused(null)} />
              </div>
            </div>

            {/* Dirección */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>DIRECCIÓN <span style={{ color: '#ccc' }}>(opcional)</span></label>
              <input placeholder="Av. Principal 123, Huancayo" value={form.direccion} onChange={set('direccion')}
                style={inp('direccion')} onFocus={() => setFocused('direccion')} onBlur={() => setFocused(null)} />
            </div>

            {/* Contraseñas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
              <div>
                <label style={labelStyle}>CONTRASEÑA</label>
                <input type="password" required placeholder="••••••••" value={form.contrasena} onChange={set('contrasena')}
                  style={inp('contrasena')} onFocus={() => setFocused('contrasena')} onBlur={() => setFocused(null)} />
              </div>
              <div>
                <label style={labelStyle}>CONFIRMAR</label>
                <input type="password" required placeholder="••••••••" value={form.confirmar} onChange={set('confirmar')}
                  style={{
                    ...inp('confirmar'),
                    borderColor: form.confirmar && form.confirmar !== form.contrasena ? '#c62828' : (focused === 'confirmar' ? '#FF4F95' : '#e0e0e0'),
                  }}
                  onFocus={() => setFocused('confirmar')} onBlur={() => setFocused(null)} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="cta-block" style={{
              width: '100%',
              background: loading ? '#ccc' : 'linear-gradient(180deg,#FF7AB0,#FF4F95)',
              color: '#fff', border: `3px solid ${loading ? '#aaa' : 'var(--ink)'}`,
              borderRadius: 999, padding: '14px', fontFamily: "'Fredoka One',cursive",
              fontSize: 18, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 6px 0 #C42E72',
              transition: 'all .15s',
            }}>
              {loading ? 'Registrando...' : <><LuCircleCheck size={18} style={{ marginRight: 6 }} /> Crear cuenta &rarr;</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#666' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: '#FF4F95', fontWeight: 800, textDecoration: 'none' }}>Inicia sesión</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: 8, fontSize: 13 }}>
            <Link to="/" style={{ color: '#aaa', textDecoration: 'none', fontWeight: 600 }}>← Volver al inicio</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
