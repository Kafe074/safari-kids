import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LuLayoutDashboard, LuCalendar, LuUsers, LuBriefcase, LuScissors,
  LuShoppingBag, LuBox, LuShoppingCart, LuClipboardList,
  LuChartBar, LuSettings, LuLogOut,
} from 'react-icons/lu'

const NAV_ADMIN = [
  { to:'/dashboard',       icon:<LuLayoutDashboard size={18} />,         label:'Dashboard' },
  { to:'/reservas',        icon:<LuCalendar size={18} />,     label:'Reservas' },
  { to:'/clientes',        icon:<LuUsers size={18} />,        label:'Clientes' },
  { to:'/empleados',       icon:<LuBriefcase size={18} />,    label:'Empleados' },
  { to:'/servicios-admin', icon:<LuScissors size={18} />,     label:'Servicios' },
  { to:'/productos',       icon:<LuShoppingBag size={18} />,  label:'Productos' },
  { to:'/inventario',      icon:<LuBox size={18} />,          label:'Inventario' },
  { to:'/ventas',          icon:<LuShoppingCart size={18} />, label:'Ventas' },
  { to:'/compras',         icon:<LuClipboardList size={18} />,label:'Compras' },
  { to:'/reportes',        icon:<LuChartBar size={18} />,     label:'Reportes' },
  { to:'/usuarios',        icon:<LuUsers size={18} />,        label:'Usuarios',  adminOnly:true },
  { to:'/admin',           icon:<LuSettings size={18} />,     label:'Config',    adminOnly:true },
]

const NAV_EMPLEADO = [
  { to:'/empleado',  icon:<LuLayoutDashboard size={18} />,     label:'Mi Agenda' },
  { to:'/mis-citas', icon:<LuCalendar size={18} />, label:'Mis Citas' },
]

export default function Sidebar({ collapsed }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const rol    = user?.rol?.toUpperCase()
  const isAdmin = rol === 'ADMINISTRADOR'
  const isEmp   = rol === 'EMPLEADO'
  const items   = isEmp ? NAV_EMPLEADO : NAV_ADMIN.filter(n => !n.adminOnly || isAdmin)

  return (
    <aside style={{
      width: collapsed ? 68 : 248,
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0F5527 0%, #1B7A3E 60%, #2E7D32 100%)',
      display: 'flex', flexDirection: 'column',
      transition: 'width .25s',
      flexShrink: 0,
      borderRight: '4px solid #0F5527',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 14px' : '20px 18px 16px',
        borderBottom: '2px dashed rgba(255,255,255,.15)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 36, flexShrink: 0 }} className="anim-roar">🦁</span>
        {!collapsed && (
          <div>
            <p style={{ fontFamily: "'Fredoka One',cursive", color: '#FFC42E', fontSize: 18, lineHeight: 1 }}>
              Safari<span style={{ color: '#fff' }}>Kids</span>
            </p>
            <p style={{ fontFamily: "'Caveat',cursive", color: 'rgba(255,255,255,.6)', fontSize: 13, marginTop: 1 }}>
              {isEmp ? 'Panel Empleado' : '¡Panel de Gestión!'}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: 10, overflowY: 'auto' }}>
        {items.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            title={collapsed ? label : ''}>
            <span className="icon" style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop: '2px dashed rgba(255,255,255,.15)', padding: 10 }}>
        {!collapsed && (
          <div style={{
            padding: '10px 12px', marginBottom: 4,
            background: 'rgba(255,255,255,.08)', borderRadius: 10,
            border: '1px solid rgba(255,255,255,.12)',
          }}>
            <p style={{ color: '#fff', fontSize: 12, fontWeight: 800, lineHeight: 1, fontFamily: "'Nunito',sans-serif" }}>
              {user?.nombreCompleto}
            </p>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, marginTop: 3, fontFamily: "'Caveat',cursive" }}>
              {user?.rol}
            </p>
          </div>
        )}
        <button onClick={logout} className="nav-link"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
          title={collapsed ? 'Salir' : ''}>
          <span className="icon" style={{ display: 'flex', alignItems: 'center' }}><LuLogOut size={18} /></span>
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  )
}
