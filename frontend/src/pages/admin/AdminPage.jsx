import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import PageHeader from '../../components/common/PageHeader'
import { LuClock, LuArmchair, LuTag, LuPackage, LuBell, LuShield, LuKey, LuInbox } from 'react-icons/lu'

const SECTIONS = [
  { icon: <LuClock    size={32} color="#1B7A3E" />, title: 'Gestión de Horarios',     desc: 'Configura los turnos y franjas horarias disponibles para reservas.',          path: '/admin/horarios' },
  { icon: <LuArmchair size={32} color="#0EA5E9" />, title: 'Gestión de Sillas',        desc: 'Administra las sillas temáticas del salón Safari Kids.',                        path: '/admin/asientos' },
  { icon: <LuTag      size={32} color="#F59E0B" />, title: 'Promociones & Descuentos', desc: 'Crea y activa promociones, códigos de descuento y descuentos para nuevos clientes.', path: '/promociones' },
  { icon: <LuPackage  size={32} color="#8B5CF6" />, title: 'Insumos del Salón',        desc: 'Controla los materiales y consumibles utilizados en cada servicio.',           path: '/admin/insumos' },
  { icon: <LuInbox    size={32} color="#1B7A3E" />, title: 'Solicitudes de Instrumentos', desc: 'Revisa, aprueba o rechaza los kits que los empleados solicitan para sus clientes.', path: '/admin/solicitudes' },
  { icon: <LuBell     size={32} color="#EC4899" />, title: 'Notificaciones',           desc: 'Configura alertas y recordatorios automáticos para clientes.',                  path: '/admin/notificaciones' },
  { icon: <LuShield   size={32} color="#6B7280" />, title: 'Seguridad',               desc: 'Gestiona contraseñas, sesiones y permisos de acceso.',                          path: '/admin/seguridad' },
]

export default function AdminPage() {
  const navigate = useNavigate()
  const { data: dash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/reportes/dashboard').then(r => r.data.data),
  })

  return (
    <div>
      <PageHeader title="Configuración del Sistema" subtitle="Administración avanzada de Safari Kids" />

      {/* System info */}
      <div style={{ background: 'linear-gradient(135deg,#1b5e20,#2E7D32)', borderRadius: 20, padding: '24px 28px', marginBottom: 24, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginBottom: 4 }}>Sistema activo</p>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>🦁 Safari Kids v1.0</h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>Spring Boot + React + MySQL</p>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[['Clientes', dash?.totalClientes], ['Empleados', dash?.totalEmpleados], ['Reservas', dash?.totalReservas]].map(([l, v]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 800, fontSize: 22, color: '#F9A825', margin: 0 }}>{v ?? '—'}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', margin: 0 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Config grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 20 }}>
        {SECTIONS.map(s => (
          <div key={s.title} className="card-admin" style={{ cursor: 'pointer', transition: 'all .15s' }}
            onClick={() => navigate(s.path)}
            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(46,125,50,.12)'; e.currentTarget.style.borderColor = '#a5d6a7'; e.currentTarget.style.transform = 'translate(-2px,-2px)' }}
            onMouseOut={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = 'translate(0,0)' }}>
            <div style={{ marginBottom: 12 }}>{s.icon}</div>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: '#1a2e1a', marginBottom: 6 }}>{s.title}</h3>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
            <button className="btn btn-secondary" style={{ marginTop: 14, fontSize: 12 }} onClick={e => { e.stopPropagation(); navigate(s.path) }}>
              Gestionar →
            </button>
          </div>
        ))}
      </div>

      {/* Credentials box */}
      <div className="card-admin">
        <h3 style={{ fontWeight: 700, color: '#1a2e1a', marginBottom: 14, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
          <LuKey size={16} /> Credenciales de Prueba (seed)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {[
            { role: 'Administrador', email: 'admin@safarikids.com', pass: 'admin123', color: '#e8f5e9', border: '#a5d6a7', tc: '#1b5e20' },
            { role: 'Empleado',      email: 'carlos@safarikids.com', pass: 'emp123',  color: '#e3f2fd', border: '#90caf9', tc: '#0d47a1' },
            { role: 'Cliente',       email: 'sofia@gmail.com',       pass: 'cli123',  color: '#fff8e1', border: '#ffe082', tc: '#e65100' },
          ].map(c => (
            <div key={c.role} style={{ background: c.color, border: `1px solid ${c.border}`, borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontWeight: 800, fontSize: 13, color: c.tc, marginBottom: 6 }}>{c.role}</p>
              <p style={{ fontSize: 11, color: '#555', margin: '2px 0', fontFamily: "'Poppins',sans-serif" }}>{c.email}</p>
              <p style={{ fontSize: 11, color: '#555', margin: '2px 0', fontFamily: "'Poppins',sans-serif" }}>Pass: <strong>{c.pass}</strong></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
