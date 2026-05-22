import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LuBell, LuArrowLeft, LuCircleCheck, LuMail, LuSmartphone, LuCalendar } from 'react-icons/lu'

const DEFAULT_CONFIG = {
  emailReservaConfirmada:  true,
  emailReservaCancelada:   true,
  emailRecordatorio:       true,
  horasAntes:              24,
  smsActivo:               false,
  emailAdmin:              '',
  mensajePersonalizado:    '',
}

export default function NotificacionesConfigPage() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [saving, setSaving] = useState(false)

  const toggle = k => setConfig(p => ({ ...p, [k]: !p[k] }))
  const set    = k => e => setConfig(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast.success('Configuración de notificaciones guardada')
  }

  const SwitchRow = ({ label, desc, field, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: 0 }}>{label}</p>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#888', margin: '2px 0 0' }}>{desc}</p>
        </div>
      </div>
      <button onClick={() => toggle(field)} style={{
        width: 50, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
        background: config[field] ? '#1B7A3E' : '#d1d5db',
        position: 'relative', transition: 'background .2s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3, left: config[field] ? 22 : 4,
          width: 22, height: 22, borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .2s',
        }} />
      </button>
    </div>
  )

  return (
    <div style={{ padding: '32px 28px', minHeight: '100vh', background: '#F8FDF8' }}>
      <button onClick={() => navigate('/admin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: '2px solid #ccc', borderRadius: 999, padding: '6px 14px', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', marginBottom: 24, color: '#666' }}>
        <LuArrowLeft size={14} /> Volver a Config
      </button>

      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title" style={{ fontSize: 'clamp(24px,3vw,38px)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <LuBell size={34} color="#EC4899" /> Notificaciones
        </h1>
        <p style={{ color: '#666', fontFamily: "'Poppins',sans-serif", fontSize: 14 }}>Configura alertas y recordatorios automáticos para clientes y administradores</p>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div className="card-chunky" style={{ padding: '8px 24px 24px', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'var(--ink)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <LuMail size={20} color="#EC4899" /> Notificaciones por Correo
          </h3>
          <SwitchRow label="Reserva confirmada" desc="Enviar correo cuando se confirme una reserva" field="emailReservaConfirmada" icon={<LuCalendar size={18} color="#EC4899" />} />
          <SwitchRow label="Reserva cancelada"  desc="Enviar correo cuando se cancele una reserva" field="emailReservaCancelada" icon={<LuCalendar size={18} color="#c62828" />} />
          <SwitchRow label="Recordatorio"       desc="Enviar recordatorio antes de la cita" field="emailRecordatorio" icon={<LuBell size={18} color="#f59e0b" />} />

          {config.emailRecordatorio && (
            <div style={{ marginTop: 16 }}>
              <label className="inp-label">Horas antes del recordatorio</label>
              <input type="number" min="1" max="72" className="inp" value={config.horasAntes}
                onChange={set('horasAntes')} style={{ maxWidth: 120 }} />
            </div>
          )}
        </div>

        <div className="card-chunky" style={{ padding: '8px 24px 24px', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'var(--ink)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <LuSmartphone size={20} color="#6366f1" /> Notificaciones SMS
          </h3>
          <SwitchRow label="Activar SMS" desc="Enviar mensajes de texto a los clientes (requiere integración)" field="smsActivo" icon={<LuSmartphone size={18} color="#6366f1" />} />
          {config.smsActivo && (
            <div style={{ marginTop: 12, background: '#eef2ff', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 12, color: '#4338ca', fontFamily: "'Poppins',sans-serif", margin: 0 }}>
                ℹ️ Para activar SMS se requiere integración con un proveedor (Twilio, SMS Peru, etc.)
              </p>
            </div>
          )}
        </div>

        <div className="card-chunky" style={{ padding: '8px 24px 24px', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'var(--ink)', marginBottom: 16 }}>Correo del Administrador</h3>
          <label className="inp-label">Correo para notificaciones internas</label>
          <input type="email" className="inp" value={config.emailAdmin} onChange={set('emailAdmin')} placeholder="admin@safarikids.com" />
        </div>

        <button className="btn btn-g" style={{ width: '100%', padding: '13px', fontSize: 16, gap: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : <><LuCircleCheck size={18} /> Guardar configuración</>}
        </button>
      </div>
    </div>
  )
}
