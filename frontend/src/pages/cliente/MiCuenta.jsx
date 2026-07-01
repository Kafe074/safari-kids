import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import {
  LuCalendar, LuClock, LuShoppingCart, LuPackage, LuArrowRight, LuUser, LuLock,
} from 'react-icons/lu'
import OnboardingTour from '../../components/common/OnboardingTour'
import CambiarPasswordModal from '../../components/CambiarPasswordModal'

const CLIENTE_TOUR = [
  {
    emoji: '👋',
    title: '¡Bienvenido a Safari Kids!',
    description: 'Este es tu espacio personal. Desde aquí puedes gestionar tus reservas, ver tu historial de compras y explorar la tienda. Te guiamos en unos pasos rápidos.',
    accent: '#1B7A3E',
  },
  {
    emoji: '📅',
    title: 'Agenda una cita',
    description: 'Pulsa "Nueva Reserva" para elegir el servicio, la sucursal, la fecha y el horario que mejor te convenga. ¡Es muy fácil!',
    accent: '#1B7A3E',
  },
  {
    emoji: '🕐',
    title: 'Revisa tus reservas',
    description: 'En "Mis Reservas" encontrarás todas tus citas: las próximas y el historial completo. Puedes cancelar una cita desde ahí si lo necesitas.',
    accent: '#38BDF8',
  },
  {
    emoji: '🛍️',
    title: 'Tienda y compras',
    description: 'Visita la tienda para comprar productos directamente. En "Mis Compras" verás todo tu historial de pedidos. ¡Ya estás listo para empezar!',
    accent: '#A855F7',
  },
]

const TILES = [
  {
    to: '/reservar',
    icon: LuCalendar,
    label: 'Nueva Reserva',
    sub: 'Agenda tu próxima cita',
    accent: '#1B7A3E',
    accentLight: '#d4edda',
    shadow: '#155c2e',
  },
  {
    to: '/mi-cuenta/reservas',
    icon: LuClock,
    label: 'Mis Reservas',
    sub: 'Ver historial de citas',
    accent: '#38BDF8',
    accentLight: '#e0f5ff',
    shadow: '#0ea5d9',
  },
  {
    to: '/mi-cuenta/compras',
    icon: LuShoppingCart,
    label: 'Mis Compras',
    sub: 'Historial de la tienda',
    accent: '#FF6F3C',
    accentLight: '#ffe5d9',
    shadow: '#d45a28',
  },
  {
    to: '/tienda',
    icon: LuPackage,
    label: 'Ir a la Tienda',
    sub: 'Comprar productos',
    accent: '#A855F7',
    accentLight: '#f3e8ff',
    shadow: '#8b37d4',
  },
]

export default function MiCuenta() {
  const { user } = useAuth()
  const nombre = user?.nombreCompleto || 'Cliente'
  const firstName = nombre.split(' ')[0]
  const tourKey = `safari_tour_cliente_${user?.correo ?? 'anon'}`
  const [showPwd, setShowPwd] = useState(false)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--paper, #FFFBF0)',
        padding: '40px 24px 60px',
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      }}
    >
      <OnboardingTour steps={CLIENTE_TOUR} storageKey={tourKey} />
      {showPwd && <CambiarPasswordModal onClose={() => setShowPwd(false)} />}
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* ── Hero card ── */}
        <div
          className="card-chunky"
          style={{
            background: 'linear-gradient(135deg, #1B7A3E 0%, #25a356 60%, #38BDF8 100%)',
            marginBottom: 36,
            padding: '40px 36px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* decorative blobs */}
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 160, height: 160,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', bottom: -20, right: 80,
            width: 90, height: 90,
            background: 'rgba(255,196,46,0.18)',
            borderRadius: '50%',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              className="sticker"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#FFC42E',
                color: '#1A2E1A',
                padding: '6px 16px',
                marginBottom: 18,
                fontSize: 13,
                fontWeight: 800,
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              <LuUser size={15} />
              Mi Cuenta
            </div>

            <h1
              style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 42,
                color: '#fff',
                margin: '0 0 8px',
                lineHeight: 1.1,
                textShadow: '2px 2px 0 rgba(0,0,0,0.15)',
              }}
            >
              ¡Hola, {firstName}!
            </h1>
            <p
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 20,
                color: 'rgba(255,255,255,0.88)',
                margin: 0,
              }}
            >
              ¿Qué quieres hacer hoy?
            </p>

            <button
              onClick={() => setShowPwd(true)}
              style={{
                marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,0.18)', color: '#fff',
                border: '2px solid rgba(255,255,255,0.5)', borderRadius: 999,
                padding: '8px 16px', fontFamily: "'Nunito',sans-serif", fontWeight: 800,
                fontSize: 13, cursor: 'pointer',
              }}
            >
              <LuLock size={14} /> Cambiar contraseña
            </button>
          </div>
        </div>

        {/* ── section tag ── */}
        <div style={{ marginBottom: 24 }}>
          <span className="section-tag">Tu espacio</span>
        </div>

        {/* ── 2×2 tile grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {TILES.map(({ to, icon: Icon, label, sub, accent, accentLight }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div
                className="card-chunky"
                style={{
                  background: '#fff',
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 14,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translate(-3px, -3px)'
                  e.currentTarget.style.boxShadow = '11px 11px 0 var(--ink, #1A2E1A)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translate(0, 0)'
                  e.currentTarget.style.boxShadow = '8px 8px 0 var(--ink, #1A2E1A)'
                }}
              >
                {/* icon bubble */}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 18,
                    background: accentLight,
                    border: `3px solid ${accent}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: accent,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={28} strokeWidth={2.2} />
                </div>

                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: "'Fredoka One', cursive",
                      fontSize: 24,
                      color: '#1A2E1A',
                      margin: '0 0 4px',
                      lineHeight: 1.2,
                    }}
                  >
                    {label}
                  </h3>
                  <p
                    style={{
                      color: '#666',
                      fontSize: 14,
                      fontWeight: 600,
                      margin: 0,
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    {sub}
                  </p>
                </div>

                <LuArrowRight
                  size={20}
                  style={{ color: accent, alignSelf: 'flex-end', marginTop: -8 }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
