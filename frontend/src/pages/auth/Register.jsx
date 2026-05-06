import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const COLOR = '#2E7D32'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombres: '', apellidos: '', correo: '', contrasena: '', confirmar: '', telefono: '' })
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const inputStyle = (field) => ({
    width: '100%', border: '1.5px solid ' + (focusedField === field ? COLOR : '#e0e0e0'),
    borderRadius: 10, padding: '11px 14px', fontSize: 15,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s'
  })

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  const focus = (field) => () => setFocusedField(field)
  const blur = () => setFocusedField(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.contrasena !== form.confirmar) { toast.error('Las contraseñas no coinciden'); return }
    if (form.contrasena.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    try {
      const userData = await register(form.nombres, form.apellidos, form.correo, form.contrasena, form.telefono)
      toast.success('¡Bienvenido, ' + userData.nombreCompleto.split(' ')[0] + '!')
      navigate('/mi-cuenta')
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrarse'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Nunito','Segoe UI',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        <div style={{ background: COLOR, borderRadius: '20px 20px 0 0', padding: '32px 36px 28px', textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🦁</div>
          <h1 style={{ fontWeight: 900, fontSize: 24, margin: '0 0 8px', letterSpacing: '-0.5px' }}>Crear cuenta</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>Regístrate para reservar y gestionar tus citas</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '0 0 20px 20px', padding: '32px 36px 36px', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#333', marginBottom: 6 }}>Nombres</label>
                <input required placeholder="Juan" value={form.nombres} onChange={set('nombres')}
                  style={inputStyle('nombres')} onFocus={focus('nombres')} onBlur={blur} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#333', marginBottom: 6 }}>Apellidos</label>
                <input required placeholder="Pérez" value={form.apellidos} onChange={set('apellidos')}
                  style={inputStyle('apellidos')} onFocus={focus('apellidos')} onBlur={blur} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#333', marginBottom: 6 }}>Correo electrónico</label>
              <input type="email" required placeholder="tu@correo.com" value={form.correo} onChange={set('correo')}
                style={inputStyle('correo')} onFocus={focus('correo')} onBlur={blur} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#333', marginBottom: 6 }}>Teléfono <span style={{ color: '#aaa', fontWeight: 400 }}>(opcional)</span></label>
              <input type="tel" placeholder="09XXXXXXXX" value={form.telefono} onChange={set('telefono')}
                style={inputStyle('telefono')} onFocus={focus('telefono')} onBlur={blur} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#333', marginBottom: 6 }}>Contraseña</label>
                <input type="password" required placeholder="••••••••" value={form.contrasena} onChange={set('contrasena')}
                  style={inputStyle('contrasena')} onFocus={focus('contrasena')} onBlur={blur} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#333', marginBottom: 6 }}>Confirmar</label>
                <input type="password" required placeholder="••••••••" value={form.confirmar} onChange={set('confirmar')}
                  style={{ ...inputStyle('confirmar'), borderColor: form.confirmar && form.confirmar !== form.contrasena ? '#d32f2f' : (focusedField === 'confirmar' ? COLOR : '#e0e0e0') }}
                  onFocus={focus('confirmar')} onBlur={blur} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', background: COLOR, color: '#fff', border: 'none', borderRadius: 12,
              padding: '14px', fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, fontFamily: 'inherit'
            }}>
              {loading ? 'Registrando...' : 'Crear cuenta →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#666' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: COLOR, fontWeight: 700, textDecoration: 'none' }}>Inicia sesión</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: 8, fontSize: 13 }}>
            <Link to="/" style={{ color: '#888', textDecoration: 'none', fontWeight: 600 }}>← Volver al inicio</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
