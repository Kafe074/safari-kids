import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ADMIN = [
  { to:'/dashboard',       icon:'🏠', label:'Dashboard' },
  { to:'/reservas',        icon:'📅', label:'Reservas' },
  { to:'/clientes',        icon:'👨‍👧', label:'Clientes' },
  { to:'/empleados',       icon:'💼', label:'Empleados' },
  { to:'/servicios-admin', icon:'✂️',  label:'Servicios' },
  { to:'/productos',       icon:'🛍️', label:'Productos' },
  { to:'/inventario',      icon:'📦', label:'Inventario' },
  { to:'/ventas',          icon:'🛒', label:'Ventas' },
  { to:'/compras',         icon:'📋', label:'Compras' },
  { to:'/reportes',        icon:'📊', label:'Reportes' },
  { to:'/usuarios',        icon:'👥', label:'Usuarios',       adminOnly:true },
  { to:'/admin',           icon:'⚙️',  label:'Configuración', adminOnly:true },
]

const NAV_EMPLEADO = [
  { to:'/empleado',   icon:'🏠', label:'Mi Agenda' },
  { to:'/mis-citas',  icon:'📅', label:'Mis Citas' },
]

export default function Sidebar({ collapsed }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const rol = user?.rol?.toUpperCase()
  const isAdmin  = rol === 'ADMINISTRADOR'
  const isEmp    = rol === 'EMPLEADO'

  const items = isEmp
    ? NAV_EMPLEADO
    : NAV_ADMIN.filter(n => !n.adminOnly || isAdmin)

  return (
    <aside style={{
      width: collapsed ? 64 : 240,
      minHeight: '100vh',
      background: 'linear-gradient(180deg,#1b5e20 0%,#2E7D32 100%)',
      display: 'flex', flexDirection: 'column',
      transition: 'width .25s',
      flexShrink: 0,
      fontFamily: "'Poppins',sans-serif",
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 14px 16px', borderBottom: '1px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ fontSize:32, flexShrink:0 }}>🦁</div>
        {!collapsed && (
          <div>
            <p style={{ color:'#F9A825', fontWeight:800, fontSize:15, lineHeight:1 }}>Safari Kids</p>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:10, marginTop:2 }}>{isEmp ? 'Panel Empleado' : 'Panel de Gestión'}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, paddingTop:10, overflowY:'auto' }}>
        {items.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            title={collapsed ? label : ''}>
            <span className="icon">{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,.1)', padding:12 }}>
        {!collapsed && (
          <div style={{ padding:'8px 6px 10px', marginBottom:4 }}>
            <p style={{ color:'#fff', fontSize:12, fontWeight:700, lineHeight:1 }}>{user?.nombreCompleto}</p>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:10, marginTop:2 }}>{user?.rol}</p>
          </div>
        )}
        <button onClick={logout} className="nav-link" style={{ width:'100%', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.6)' }}
          title={collapsed ? 'Salir' : ''}>
          <span className="icon">🚪</span>
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  )
}
