import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import { useAuth } from '../../context/AuthContext'

const TITLES = {
  '/dashboard':'Dashboard','/reservas':'Gestión de Reservas','/clientes':'Gestión de Clientes',
  '/empleados':'Gestión de Empleados','/servicios-admin':'Catálogo de Servicios',
  '/inventario':'Inventario & Productos','/ventas':'Módulo de Ventas',
  '/compras':'Compras & Proveedores','/reportes':'Reportes & Estadísticas',
  '/usuarios':'Usuarios & Roles','/admin':'Configuración',
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()
  const { user } = useAuth()

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:"'Poppins',sans-serif" }} className="page-admin">
      <Sidebar collapsed={collapsed} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Topbar */}
        <header style={{
          background:'#fff', borderBottom:'1px solid #f0f0f0',
          padding:'0 24px', height:60, display:'flex', alignItems:'center',
          justifyContent:'space-between', flexShrink:0,
          boxShadow:'0 1px 4px rgba(0,0,0,.04)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <button onClick={()=>setCollapsed(c=>!c)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#666' }}>☰</button>
            <h1 style={{ fontSize:16, fontWeight:700, color:'#1a2e1a' }}>{TITLES[pathname] ?? 'Safari Kids'}</h1>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ background:'#e8f5e9', color:'#2E7D32', fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:20 }}>
              🦁 {user?.rol}
            </span>
          </div>
        </header>
        <main style={{ flex:1, padding:24, background:'#f9faf7', overflowY:'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
