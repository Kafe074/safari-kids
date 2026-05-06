import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import StatCard from '../../components/common/StatCard'
import { useAuth } from '../../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const { data: stats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/reportes/dashboard').then(r => r.data.data),
    refetchInterval: 60000,
  })

  const cards = [
    { icon:'📅', label:'Total Reservas',       value: stats?.totalReservas,       bg:'#e8f5e9', color:'#2E7D32', trend:'↑ Ver todas' },
    { icon:'⏳', label:'Reservas Pendientes',   value: stats?.reservasPendientes,  bg:'#fff8e1', color:'#f57f17', trend:'Requieren atención' },
    { icon:'👨‍👧', label:'Clientes Registrados',  value: stats?.totalClientes,        bg:'#e3f2fd', color:'#1565c0' },
    { icon:'💼', label:'Empleados Activos',     value: stats?.totalEmpleados,       bg:'#f3e5f5', color:'#6a1b9a' },
    { icon:'🛒', label:'Ventas Realizadas',     value: stats?.totalVentas,          bg:'#fff3e0', color:'#e65100' },
    { icon:'📦', label:'Productos en Catálogo', value: stats?.totalProductos,       bg:'#e0f7fa', color:'#00695c' },
  ]

  const accesos = [
    { to:'/reservas',   icon:'📅', label:'Ver Reservas',    color:'#2E7D32' },
    { to:'/clientes',   icon:'👨‍👧', label:'Ver Clientes',    color:'#1565c0' },
    { to:'/ventas',     icon:'🛒', label:'Nueva Venta',     color:'#e65100' },
    { to:'/inventario', icon:'📦', label:'Inventario',      color:'#00695c' },
    { to:'/reportes',   icon:'📊', label:'Ver Reportes',    color:'#6a1b9a' },
    { to:'/compras',    icon:'🏪', label:'Ver Compras',     color:'#4E342E' },
  ]

  return (
    <div>
      {/* Welcome */}
      <div style={{ background:'linear-gradient(135deg,#1b5e20,#2E7D32)', borderRadius:20, padding:'28px 32px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div>
          <h2 style={{ color:'#F9A825', fontSize:13, fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:4 }}>Panel Administrativo</h2>
          <h1 style={{ color:'#fff', fontSize:24, fontWeight:800, margin:0 }}>¡Hola, {user?.nombreCompleto?.split(' ')[0]}! 🦁</h1>
          <p style={{ color:'rgba(255,255,255,.7)', fontSize:13, marginTop:4 }}>Safari Kids – Sistema de Gestión</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ color:'rgba(255,255,255,.6)', fontSize:12 }}>{new Date().toLocaleDateString('es-PE',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginBottom:24 }}>
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Quick access */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, flexWrap:'wrap' }}>
        <div className="card-admin">
          <h3 style={{ fontWeight:700, color:'#1a2e1a', marginBottom:16, fontSize:15 }}>Accesos Rápidos</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {accesos.map(a => (
              <Link key={a.to} to={a.to} style={{ textDecoration:'none' }}>
                <div style={{ background:a.color+'11', border:`1.5px solid ${a.color}33`, borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:10, transition:'all .15s', cursor:'pointer' }}
                  onMouseOver={e=>{e.currentTarget.style.background=a.color+'22'; e.currentTarget.style.transform='translateY(-2px)'}}
                  onMouseOut={e=>{e.currentTarget.style.background=a.color+'11'; e.currentTarget.style.transform='translateY(0)'}}>
                  <span style={{ fontSize:22 }}>{a.icon}</span>
                  <span style={{ color:a.color, fontWeight:700, fontSize:13 }}>{a.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card-admin">
          <h3 style={{ fontWeight:700, color:'#1a2e1a', marginBottom:16, fontSize:15 }}>Estado del Sistema</h3>
          {[
            ['Base de datos','Conectada','ok'],
            ['API REST','Activa','ok'],
            ['Autenticación JWT','Activa','ok'],
            ['Seed de datos','Cargado','ok'],
          ].map(([label,val,st]) => (
            <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #f5f5f5' }}>
              <span style={{ fontSize:12, color:'#666' }}>{label}</span>
              <span className={`badge badge-${st === 'ok' ? 'ok' : 'warn'}`}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
