import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

/* ── Dropdown menu items ────────────────────── */
const NAV = [
  { label: 'Inicio', to: '/' },
  { label: 'Servicios', to: '/servicios' },
  {
    label: 'La Empresa',
    dropdown: [
      { label: '🦁 Quiénes somos',   hash: 'nosotros' },
      { label: '📍 Sucursales',       hash: 'sucursales' },
      { label: '⭐ Testimonios',      hash: 'testimonios' },
      { label: '🖼️ Galería',          hash: 'galeria' },
    ],
  },
  {
    label: 'Clientes',
    dropdown: [
      { label: '🗓 Reservar cita',    to: '/login', state: { intent: 'reservar' } },
      { label: '📋 Mis reservas',      to: '/login', state: { intent: 'historial' } },
      { label: '👤 Mi cuenta',         to: '/mi-cuenta' },
    ],
  },
  { label: 'Tienda', to: '/tienda' },
  { label: 'Contacto', hash: 'contacto' },
]

export default function PublicNavbar() {
  const { user, logout } = useAuth()
  const { count: cartCount } = useCart()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [scrolled, setScrolled]     = useState(false)
  const [openMenu, setOpenMenu]     = useState(null)   // label of open dropdown
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef(null)

  /* scroll listener */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* close dropdown when clicking outside */
  useEffect(() => {
    const fn = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleHash = (hash) => {
    setOpenMenu(null); setMobileOpen(false)
    if (pathname !== '/') { navigate('/'); setTimeout(() => scrollToHash(hash), 120) }
    else scrollToHash(hash)
  }

  const scrollToHash = (hash) => {
    const el = document.getElementById(hash)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  /* dynamic text color — transparent mode only on the homepage hero */
  const isLight = !scrolled && pathname === '/'
  const textColor  = isLight ? 'rgba(255,255,255,.9)' : '#2d2d2d'
  const activeColor = '#F9A825'
  const hoverBg    = isLight ? 'rgba(255,255,255,.12)' : '#f5f5f5'

  /* link style factory */
  const linkStyle = (active = false) => ({
    color: active ? activeColor : textColor,
    fontWeight: active ? 800 : 700,
    fontSize: 14,
    textDecoration: 'none',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    transition: 'all .18s',
    fontFamily: "'Nunito', sans-serif",
    background: 'transparent',
    border: 'none',
    whiteSpace: 'nowrap',
  })

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
      background: isLight ? 'transparent' : 'rgba(255,255,255,0.97)',
      backdropFilter: isLight ? 'none' : 'blur(14px)',
      borderBottom: isLight ? 'none' : '1px solid rgba(0,0,0,.07)',
      boxShadow: isLight ? 'none' : '0 2px 20px rgba(0,0,0,.07)',
      transition: 'all .3s',
    }}>
      <div ref={navRef} style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 16px',
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8,
      }}>

        {/* ── Logo ── */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 28, lineHeight: 1 }} className="anim-roar">🦁</span>
          <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: isLight ? '#fff' : '#2E7D32' }}>Safari</span>
          <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: '#F9A825', marginLeft: -4 }}>Kids</span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}
          className="nav-desktop">
          {NAV.filter(item => !(user && item.label === 'Clientes')).map((item) => {
            if (item.dropdown) {
              const isOpen = openMenu === item.label
              return (
                <div key={item.label} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setOpenMenu(isOpen ? null : item.label)}
                    style={{
                      ...linkStyle(isOpen),
                      background: isOpen ? hoverBg : 'transparent',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = hoverBg}
                    onMouseOut={e => { if (!isOpen) e.currentTarget.style.background = 'transparent' }}
                  >
                    {item.label}
                    <span style={{ fontSize: 10, marginLeft: 2, transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                  </button>

                  {/* Dropdown panel */}
                  {isOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
                      background: '#fff', borderRadius: 16, padding: '8px',
                      boxShadow: '0 16px 48px rgba(0,0,0,.12)', border: '1px solid #f0f0f0',
                      minWidth: 210, zIndex: 400,
                      animation: 'popIn .18s cubic-bezier(.34,1.56,.64,1) both',
                    }}>
                      {/* Arrow */}
                      <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', width: 12, height: 12, background: '#fff', border: '1px solid #f0f0f0', borderBottom: 'none', borderRight: 'none', rotate: '45deg' }} />

                      {item.dropdown.map((d) => (
                        <button key={d.label} onClick={() => {
                          setOpenMenu(null)
                          if (d.hash) handleHash(d.hash)
                          else if (d.state) navigate(d.to, { state: d.state })
                          else navigate(d.to)
                        }} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '10px 14px', border: 'none', background: 'transparent',
                          borderRadius: 10, cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                          fontSize: 14, fontWeight: 600, color: '#333', textAlign: 'left',
                          transition: 'all .15s',
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = '#f0f7f0'; e.currentTarget.style.color = '#2E7D32' }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#333' }}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            if (item.hash) {
              return (
                <button key={item.label} onClick={() => handleHash(item.hash)} style={linkStyle(false)}
                  onMouseOver={e => e.currentTarget.style.background = hoverBg}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  {item.label}
                </button>
              )
            }

            return (
              <Link key={item.label} to={item.to} style={linkStyle(pathname === item.to)}
                onMouseOver={e => e.currentTarget.style.background = hoverBg}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* ── Auth area ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {!user ? (
            <>
              <Link to="/login" className="nav-hide-sm" style={{
                color: textColor, fontSize: 13, fontWeight: 700, textDecoration: 'none',
                padding: '6px 12px', borderRadius: 8, transition: 'background .15s', whiteSpace: 'nowrap',
              }}
              onMouseOver={e => e.currentTarget.style.background = hoverBg}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                Ingresar
              </Link>
              <button onClick={() => navigate('/login', { state: { intent: 'reservar' } })}
                className="btn-jungle btn-jungle-yellow"
                style={{ fontSize: 13, padding: '9px 18px', whiteSpace: 'nowrap' }}>
                🗓 Reservar
              </button>
            </>
          ) : user.rol?.toUpperCase() === 'CLIENTE' ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Link to="/reservar" className="btn-jungle btn-jungle-yellow nav-hide-sm" style={{ fontSize: 13, padding: '9px 16px', textDecoration: 'none', whiteSpace: 'nowrap' }}>+ Reservar</Link>
              <Link to="/carrito" style={{
                position: 'relative', color: textColor, fontWeight: 700, fontSize: 22,
                textDecoration: 'none', padding: '4px 8px', borderRadius: 8, display: 'flex', alignItems: 'center',
              }}>
                🛒
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: 0, background: '#e53935', color: '#fff',
                    borderRadius: '50%', width: 16, height: 16, fontSize: 10, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{cartCount}</span>
                )}
              </Link>
              <Link to="/mi-cuenta" className="nav-hide-sm" style={{ color: textColor, fontWeight: 700, fontSize: 13, textDecoration: 'none', padding: '6px 8px', borderRadius: 8, whiteSpace: 'nowrap' }}>Mi cuenta</Link>
              <button onClick={logout} style={{ background: 'none', border: `1.5px solid ${isLight ? 'rgba(255,255,255,.4)' : '#ddd'}`, borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer', color: textColor, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Salir</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Link to="/dashboard" className="btn-jungle btn-jungle-green nav-hide-sm" style={{ fontSize: 13, padding: '9px 16px', textDecoration: 'none', whiteSpace: 'nowrap' }}>⚙️ Panel</Link>
              <button onClick={logout} style={{ background: 'none', border: `1.5px solid ${isLight ? 'rgba(255,255,255,.4)' : '#ddd'}`, borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer', color: textColor, fontFamily: 'inherit' }}>Salir</button>
            </div>
          )}

          {/* ── Hamburger (móvil) ── */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="hamburger-btn"
            aria-label="Menú"
            style={{
              background: 'none',
              border: `2px solid ${isLight ? 'rgba(255,255,255,0.6)' : '#ddd'}`,
              borderRadius: 10, padding: '7px 9px', cursor: 'pointer',
              color: textColor, display: 'none', flexDirection: 'column',
              gap: 5, alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {mobileOpen ? (
              <span style={{ fontSize: 18, lineHeight: 1, color: '#333' }}>✕</span>
            ) : (
              <>
                <span style={{ display: 'block', width: 20, height: 2, background: isLight ? '#fff' : '#333', borderRadius: 2 }} />
                <span style={{ display: 'block', width: 20, height: 2, background: isLight ? '#fff' : '#333', borderRadius: 2 }} />
                <span style={{ display: 'block', width: 20, height: 2, background: isLight ? '#fff' : '#333', borderRadius: 2 }} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div style={{ background: '#fff', borderTop: '2px solid #f0f0f0', padding: '8px 16px 20px', boxShadow: '0 8px 24px rgba(0,0,0,.12)' }}>
          {/* Nav items */}
          {NAV.filter(item => !(user && item.label === 'Clientes')).map(item => (
            <div key={item.label}>
              {item.dropdown ? item.dropdown.map(d => (
                <button key={d.label}
                  onClick={() => { setMobileOpen(false); if (d.hash) handleHash(d.hash); else if (d.state) navigate(d.to, { state: d.state }); else navigate(d.to); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 8px', border: 'none', background: 'none', textAlign: 'left', fontSize: 14, fontWeight: 600, color: '#333', cursor: 'pointer', fontFamily: 'inherit', borderBottom: '1px solid #f5f5f5' }}>
                  {d.label}
                </button>
              )) : (
                <Link to={item.to ?? '/'} onClick={() => { setMobileOpen(false); if (item.hash) handleHash(item.hash) }}
                  style={{ display: 'flex', alignItems: 'center', padding: '12px 8px', fontSize: 15, fontWeight: 700, color: '#1A2E1A', textDecoration: 'none', borderBottom: '1px solid #f5f5f5' }}>
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          {/* Auth actions en móvil */}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!user ? (
              <>
                <button onClick={() => { setMobileOpen(false); navigate('/login', { state: { intent: 'reservar' } }) }}
                  className="btn-jungle btn-jungle-yellow" style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}>
                  🗓 Reservar cita
                </button>
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  style={{ textAlign: 'center', color: '#2E7D32', fontWeight: 700, fontSize: 14, textDecoration: 'none', padding: '10px', borderRadius: 10, border: '2px solid #2E7D32' }}>
                  Iniciar sesión
                </Link>
              </>
            ) : user.rol?.toUpperCase() === 'CLIENTE' ? (
              <>
                <Link to="/reservar" onClick={() => setMobileOpen(false)} className="btn-jungle btn-jungle-yellow" style={{ textDecoration: 'none', justifyContent: 'center', fontSize: 15 }}>🗓 + Reservar</Link>
                <Link to="/mi-cuenta" onClick={() => setMobileOpen(false)} style={{ textAlign: 'center', color: '#2E7D32', fontWeight: 700, fontSize: 14, textDecoration: 'none', padding: '10px', borderRadius: 10, border: '2px solid #2E7D32' }}>Mi cuenta</Link>
                <button onClick={() => { setMobileOpen(false); logout() }} style={{ background: '#ffebee', color: '#c62828', border: '2px solid #c62828', borderRadius: 10, padding: '10px', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="btn-jungle btn-jungle-green" style={{ textDecoration: 'none', justifyContent: 'center', fontSize: 15 }}>⚙️ Panel Admin</Link>
                <button onClick={() => { setMobileOpen(false); logout() }} style={{ background: '#ffebee', color: '#c62828', border: '2px solid #c62828', borderRadius: 10, padding: '10px', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cerrar sesión</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
