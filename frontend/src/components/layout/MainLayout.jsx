import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import { useAuth } from '../../context/AuthContext'
import { LuMenu, LuX } from 'react-icons/lu'

const TITLES = {
  '/dashboard':'Dashboard','/reservas':'Gestión de Reservas','/clientes':'Gestión de Clientes',
  '/empleados':'Gestión de Empleados','/servicios-admin':'Catálogo de Servicios',
  '/inventario':'Inventario & Productos','/ventas':'Módulo de Ventas',
  '/compras':'Compras & Proveedores','/reportes':'Reportes & Estadísticas',
  '/usuarios':'Usuarios & Roles','/admin':'Configuración',
  '/admin/horarios':'Gestión de Horarios','/admin/asientos':'Gestión de Sillas',
  '/admin/insumos':'Insumos del Salón','/admin/notificaciones':'Notificaciones',
  '/admin/seguridad':'Seguridad','/promociones':'Promociones & Descuentos',
  '/empleado':'Mi Agenda','/mis-citas':'Mis Citas',
}

export default function MainLayout() {
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [isMobile,    setIsMobile]    = useState(window.innerWidth < 768)
  const { pathname } = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => { if (isMobile) setMobileOpen(false) }, [pathname])

  const sidebarVisible = isMobile ? mobileOpen : true
  const sidebarCollapsed = isMobile ? false : collapsed

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0FAF2' }} className="page-admin">

      {/* Backdrop móvil */}
      {isMobile && mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: isMobile ? 'fixed' : 'relative',
        top: 0, left: 0, bottom: 0,
        zIndex: isMobile ? 200 : 'auto',
        transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        transition: 'transform .25s ease',
        flexShrink: 0,
      }}>
        {sidebarVisible || !isMobile ? (
          <Sidebar collapsed={sidebarCollapsed} />
        ) : null}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          background: '#fff',
          borderBottom: '3px solid #1A2E1A',
          padding: '0 16px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 4px 0 #1A2E1A',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => isMobile ? setMobileOpen(o => !o) : setCollapsed(c => !c)}
              style={{
                background: 'none', border: '3px solid #1A2E1A', cursor: 'pointer',
                color: '#1A2E1A', width: 36, height: 36, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .15s', flexShrink: 0,
              }}
              onMouseOver={e => e.currentTarget.style.background = '#FFC42E'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            >
              {isMobile && mobileOpen ? <LuX size={18} /> : <LuMenu size={18} />}
            </button>

            {/* Logo en móvil */}
            {isMobile && (
              <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#1B7A3E' }}>
                🦁 Safari<span style={{ color: '#F9A825' }}>Kids</span>
              </span>
            )}

            {!isMobile && (
              <h1 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#1A2E1A' }}>
                {TITLES[pathname] ?? 'Safari Kids'}
              </h1>
            )}
          </div>

          {/* Título centrado en móvil */}
          {isMobile && (
            <h1 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 15, color: '#1A2E1A', position: 'absolute', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '40vw' }}>
              {TITLES[pathname] ?? ''}
            </h1>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: '#1B7A3E', color: '#FFC42E',
              fontSize: isMobile ? 11 : 13, fontWeight: 800,
              padding: isMobile ? '4px 10px' : '6px 14px',
              borderRadius: 999, border: '3px solid #0F5527',
              fontFamily: "'Fredoka One',cursive",
              whiteSpace: 'nowrap',
            }}>
              🦁 {isMobile ? user?.rol?.slice(0, 3).toUpperCase() : user?.rol}
            </span>
          </div>
        </header>

        <main style={{ flex: 1, padding: isMobile ? '12px' : '24px', overflowY: 'auto', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
