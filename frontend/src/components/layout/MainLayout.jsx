import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import { useAuth } from '../../context/AuthContext'
import { LuMenu } from 'react-icons/lu'

const TITLES = {
  '/dashboard':'Dashboard','/reservas':'Gestión de Reservas','/clientes':'Gestión de Clientes',
  '/empleados':'Gestión de Empleados','/servicios-admin':'Catálogo de Servicios',
  '/inventario':'Inventario & Productos','/ventas':'Módulo de Ventas',
  '/compras':'Compras & Proveedores','/reportes':'Reportes & Estadísticas',
  '/usuarios':'Usuarios & Roles','/admin':'Configuración',
  '/empleado':'Mi Agenda','/mis-citas':'Mis Citas',
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()
  const { user } = useAuth()

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F0FAF2' }} className="page-admin">
      <Sidebar collapsed={collapsed} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

        {/* Topbar */}
        <header style={{
          background: '#fff',
          borderBottom: '3px solid #1A2E1A',
          padding: '0 24px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 4px 0 #1A2E1A',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <button
              onClick={() => setCollapsed(c => !c)}
              style={{
                background: 'none', border: '3px solid #1A2E1A', cursor: 'pointer',
                fontSize: 18, color: '#1A2E1A', width: 36, height: 36, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .15s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#FFC42E'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            ><LuMenu size={18} /></button>
            <h1 style={{
              fontFamily: "'Fredoka One',cursive",
              fontSize: 20, color: '#1A2E1A',
            }}>
              {TITLES[pathname] ?? 'Safari Kids'}
            </h1>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{
              background: '#1B7A3E', color: '#FFC42E',
              fontSize: 13, fontWeight: 800, padding: '6px 14px', borderRadius: 999,
              border: '3px solid #0F5527',
              fontFamily: "'Fredoka One',cursive",
            }}>
              🦁 {user?.rol}
            </span>
          </div>
        </header>

        <main style={{ flex:1, padding: 24, overflowY:'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
