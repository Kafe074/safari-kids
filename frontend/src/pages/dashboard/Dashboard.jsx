import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import StatCard from '../../components/common/StatCard'
import { useAuth } from '../../context/AuthContext'
import {
  LuCalendar, LuClock, LuUsers, LuBriefcase,
  LuShoppingCart, LuPackage, LuChartBar, LuShoppingBag,
} from 'react-icons/lu'

export default function Dashboard() {
  const { user } = useAuth()
  const { data: stats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/reportes/dashboard').then(r => r.data.data),
    refetchInterval: 60000,
  })

  const cards = [
    { icon: <LuCalendar size={26} color="#fff" />, label: 'Total Reservas',       value: stats?.totalReservas,      bg: '#1B7A3E', color: '#1B7A3E', trend: '↑ Ver todas' },
    { icon: <LuClock     size={26} color="#fff" />, label: 'Reservas Pendientes',  value: stats?.reservasPendientes, bg: '#FFC42E', color: '#b38600', trend: 'Requieren atención' },
    { icon: <LuUsers     size={26} color="#fff" />, label: 'Clientes Registrados', value: stats?.totalClientes,      bg: '#38BDF8', color: '#0280b0' },
    { icon: <LuBriefcase size={26} color="#fff" />, label: 'Empleados Activos',    value: stats?.totalEmpleados,     bg: '#A855F7', color: '#7e22ce' },
    { icon: <LuShoppingCart size={26} color="#fff" />, label: 'Ventas Realizadas',     value: stats?.totalVentas,    bg: '#FF6F3C', color: '#c94200' },
    { icon: <LuPackage   size={26} color="#fff" />, label: 'Productos en Catálogo', value: stats?.totalProductos,   bg: '#FF4F95', color: '#c0005e' },
  ]

  const accesos = [
    { to: '/reservas',   icon: <LuCalendar    size={24} />, label: 'Ver Reservas', color: '#1B7A3E' },
    { to: '/clientes',   icon: <LuUsers       size={24} />, label: 'Ver Clientes', color: '#38BDF8' },
    { to: '/ventas',     icon: <LuShoppingCart size={24} />, label: 'Nueva Venta', color: '#FF6F3C' },
    { to: '/inventario', icon: <LuPackage     size={24} />, label: 'Inventario',   color: '#FF4F95' },
    { to: '/reportes',   icon: <LuChartBar    size={24} />, label: 'Ver Reportes', color: '#A855F7' },
    { to: '/compras',    icon: <LuShoppingBag size={24} />, label: 'Ver Compras',  color: '#FFC42E' },
  ]

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div>
      {/* Welcome banner */}
      <div className="fade-page" style={{
        background: 'linear-gradient(135deg,#1b5e20,#1B7A3E)',
        border: '4px solid #0F5527',
        borderRadius: 24,
        boxShadow: '8px 8px 0 #0F5527',
        padding: '28px 32px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decoración de fondo */}
        <span aria-hidden style={{ position: 'absolute', right: 110, top: -18, fontSize: 90, opacity: .12, transform: 'rotate(15deg)' }} className="wiggle-s">🌿</span>
        <span aria-hidden style={{ position: 'absolute', right: 8, bottom: -26, fontSize: 100, opacity: .12 }} className="float">🦁</span>
        <div style={{ position: 'relative' }}>
          <h2 style={{ color: '#FFC42E', fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 6px' }}>
            Panel Administrativo
          </h2>
          <h1 style={{ fontFamily: "'Fredoka One',cursive", color: '#fff', fontSize: 28, margin: '0 0 4px', lineHeight: 1.2 }}>
            ¡{saludo}, {user?.nombreCompleto?.split(' ')[0]}! 🦁
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, margin: 0 }}>
            Safari Kids – Sistema de Gestión
          </p>
        </div>
        <div style={{ textAlign: 'right', position: 'relative' }}>
          <p style={{
            color: '#FFF8E1', fontSize: 12, margin: 0, fontWeight: 700,
            background: 'rgba(255,255,255,.12)', padding: '8px 14px',
            borderRadius: 999, border: '1px solid rgba(255,255,255,.2)',
            textTransform: 'capitalize',
          }}>
            📅 {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Quick access */}
      <div className="card-admin">
        <h3 style={{ fontFamily: "'Fredoka One',cursive", fontWeight: 400, color: 'var(--ink)', marginBottom: 16, fontSize: 18 }}>
          Accesos Rápidos
        </h3>
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
          {accesos.map(a => (
            <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
              <div
                className="card-chunky"
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  color: a.color,
                }}
              >
                <span style={{ color: a.color, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {a.icon}
                </span>
                <span style={{ fontFamily: "'Fredoka One',cursive", color: 'var(--ink)', fontSize: 15, lineHeight: 1.2 }}>
                  {a.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
