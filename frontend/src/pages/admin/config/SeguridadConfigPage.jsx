import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../../api/axios'
import { LuShield, LuArrowLeft, LuCircleCheck, LuLock, LuUsers, LuKey, LuEye, LuEyeOff } from 'react-icons/lu'

export default function SeguridadConfigPage() {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [pwdForm, setPwdForm] = useState({ actual: '', nueva: '', confirmar: '' })
  const [loading, setLoading] = useState(false)

  const set = k => e => setPwdForm(p => ({ ...p, [k]: e.target.value }))

  const handleCambiarPassword = async () => {
    if (!pwdForm.actual || !pwdForm.nueva) { toast.error('Completa todos los campos'); return }
    if (pwdForm.nueva !== pwdForm.confirmar) { toast.error('Las nuevas contraseñas no coinciden'); return }
    if (pwdForm.nueva.length < 6) { toast.error('Mínimo 6 caracteres'); return }
    setLoading(true)
    try {
      await api.put('/usuarios/cambiar-password', { actual: pwdForm.actual, nueva: pwdForm.nueva })
      toast.success('Contraseña actualizada correctamente')
      setPwdForm({ actual: '', nueva: '', confirmar: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar la contraseña')
    } finally { setLoading(false) }
  }

  const InfoCard = ({ icon, title, desc, badge }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', background: '#f9f9f9', borderRadius: 14, border: '2px solid #e0e0e0', marginBottom: 12 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: 0 }}>{title}</p>
          {badge && <span style={{ background: '#e8f5e9', color: '#2E7D32', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{badge}</span>}
        </div>
        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#888', margin: 0 }}>{desc}</p>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '32px 28px', minHeight: '100vh', background: '#F8FDF8' }}>
      <button onClick={() => navigate('/admin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: '2px solid #ccc', borderRadius: 999, padding: '6px 14px', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', marginBottom: 24, color: '#666' }}>
        <LuArrowLeft size={14} /> Volver a Config
      </button>

      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title" style={{ fontSize: 'clamp(24px,3vw,38px)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <LuShield size={34} color="#6B7280" /> Seguridad del Sistema
        </h1>
        <p style={{ color: '#666', fontFamily: "'Poppins',sans-serif", fontSize: 14 }}>Gestiona contraseñas, sesiones y permisos de acceso</p>
      </div>

      <div style={{ maxWidth: 640 }}>
        {/* Estado de seguridad */}
        <div className="card-chunky" style={{ padding: '20px 24px', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'var(--ink)', marginBottom: 16 }}>Estado del Sistema</h3>
          <InfoCard icon={<LuShield size={20} color="#2E7D32" />} title="Autenticación JWT" desc="Tokens seguros con expiración de 24 horas" badge="Activo" />
          <InfoCard icon={<LuKey size={20} color="#2E7D32" />} title="Contraseñas cifradas" desc="BCrypt con factor de costo 10 (OWASP recomendado)" badge="Activo" />
          <InfoCard icon={<LuUsers size={20} color="#2E7D32" />} title="Control de roles" desc="Administrador, Empleado y Cliente con rutas separadas" badge="Activo" />
          <InfoCard icon={<LuLock size={20} color="#2E7D32" />} title="HTTPS / CORS" desc="Configurado para producción — verificar al desplegar" badge="Verificar" />
        </div>

        {/* Cambiar contraseña */}
        <div className="card-chunky" style={{ padding: '20px 24px', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'var(--ink)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <LuLock size={20} color="#6B7280" /> Cambiar Contraseña
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="inp-label">Contraseña actual</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} className="inp" value={pwdForm.actual}
                  onChange={set('actual')} placeholder="••••••••" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                  {showPass ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="inp-label">Nueva contraseña</label>
                <input type="password" className="inp" value={pwdForm.nueva} onChange={set('nueva')} placeholder="Mín. 6 caracteres" />
              </div>
              <div>
                <label className="inp-label">Confirmar nueva</label>
                <input type="password" className="inp" value={pwdForm.confirmar} onChange={set('confirmar')}
                  style={{ borderColor: pwdForm.confirmar && pwdForm.confirmar !== pwdForm.nueva ? '#c62828' : undefined }} />
              </div>
            </div>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 16, gap: 8, display: 'flex', alignItems: 'center' }} onClick={handleCambiarPassword} disabled={loading}>
            <LuCircleCheck size={16} /> {loading ? 'Cambiando...' : 'Cambiar contraseña'}
          </button>
        </div>

        {/* Sesiones */}
        <div className="card-chunky" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'var(--ink)', marginBottom: 12 }}>Sesiones Activas</h3>
          <div style={{ background: '#f9f9f9', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13, color: 'var(--ink)', margin: 0 }}>Esta sesión (actual)</p>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#888', margin: '2px 0 0' }}>Administrador · Activa ahora</p>
            </div>
            <span style={{ background: '#e8f5e9', color: '#2E7D32', borderRadius: 999, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>Activa</span>
          </div>
          <p style={{ fontSize: 11, color: '#aaa', fontFamily: "'Poppins',sans-serif", marginTop: 10 }}>
            Los tokens JWT expiran automáticamente. Para invalidar sesiones, el usuario debe cerrar sesión manualmente.
          </p>
        </div>
      </div>
    </div>
  )
}
