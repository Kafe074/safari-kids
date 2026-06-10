import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservasApi } from '../../api/reservas'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  LuCalendar, LuClock, LuUser, LuX, LuArrowRight, LuScissors, LuArrowLeft,
} from 'react-icons/lu'

// ── status badge config ──────────────────────────────────────────────────────
const ESTADO_CONFIG = {
  Pendiente: {
    bg: '#FFC42E',
    color: '#1A2E1A',
    border: '2px solid #1A2E1A',
    shadow: '3px 3px 0 #1A2E1A',
  },
  Confirmado: {
    bg: '#1B7A3E',
    color: '#fff',
    border: '2px solid #1A2E1A',
    shadow: '3px 3px 0 #1A2E1A',
  },
  Cancelado: {
    bg: '#FF4F95',
    color: '#fff',
    border: '2px solid #1A2E1A',
    shadow: '3px 3px 0 #1A2E1A',
  },
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.Pendiente
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: cfg.border,
        boxShadow: cfg.shadow,
        padding: '4px 14px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 800,
        fontFamily: "'Nunito', sans-serif",
        letterSpacing: 0.3,
        display: 'inline-block',
      }}
    >
      {estado}
    </span>
  )
}

export default function MisReservas() {
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['mis-reservas'],
    queryFn: () => reservasApi.misReservas().then(r => r.data.data ?? []),
  })

  const cancelMut = useMutation({
    mutationFn: (id) => reservasApi.cancelar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mis-reservas'] })
      toast.success('Reserva cancelada')
    },
    onError: () => toast.error('No se pudo cancelar la reserva'),
  })

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--paper, #FFFBF0)',
        padding: '100px 24px 60px',
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* ── header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 36,
          }}
        >
          <div>
            <button onClick={() => navigate('/mi-cuenta')} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#fff', border:'3px solid var(--ink)', borderRadius:10, padding:'6px 14px', fontFamily:"'Fredoka One',cursive", fontSize:14, cursor:'pointer', marginBottom:14, color:'var(--ink)', boxShadow:'3px 3px 0 var(--ink)', transition:'all .15s' }}
              onMouseOver={e=>{e.currentTarget.style.transform='translate(-1px,-1px)';e.currentTarget.style.boxShadow='4px 4px 0 var(--ink)'}}
              onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='3px 3px 0 var(--ink)'}}>
              <LuArrowLeft size={15} /> Mi Cuenta
            </button>
            <br/>
            <span className="section-tag" style={{ marginBottom: 10, display: 'inline-block' }}>
              historial
            </span>
            <h1 className="section-title" style={{ margin: 0 }}>
              Mis Reservas
            </h1>
            <p
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 18,
                color: '#666',
                margin: '4px 0 0',
              }}
            >
              Todas tus citas en un solo lugar
            </p>
          </div>

          <Link to="/reservar" style={{ textDecoration: 'none' }}>
            <button className="btn btn-g" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LuCalendar size={16} />
              Nueva Reserva
            </button>
          </Link>
        </div>

        {/* ── states ── */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div
              style={{
                display: 'inline-block',
                width: 48,
                height: 48,
                border: '4px solid #1B7A3E',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p
              style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 20,
                color: '#1A2E1A',
                marginTop: 16,
              }}
            >
              Cargando reservas...
            </p>
          </div>
        ) : !data?.length ? (
          <div
            className="card-chunky"
            style={{
              textAlign: 'center',
              padding: '60px 40px',
              background: '#fff',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                background: '#d4edda',
                border: '3px solid #1B7A3E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <LuScissors size={36} color="#1B7A3E" />
            </div>
            <h2
              style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 26,
                color: '#1A2E1A',
                margin: '0 0 8px',
              }}
            >
              ¡Sin reservas aún!
            </h2>
            <p style={{ color: '#888', fontWeight: 600, margin: '0 0 24px' }}>
              Agenda tu primera cita con nosotros
            </p>
            <Link to="/reservar" style={{ textDecoration: 'none' }}>
              <button className="btn btn-g" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Hacer mi primera reserva
                <LuArrowRight size={16} />
              </button>
            </Link>
          </div>
        ) : (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.map(r => (
              <ReservaCard
                key={r.idReserva}
                reserva={r}
                onCancel={() => {
                  if (confirm('¿Cancelar esta reserva?')) cancelMut.mutate(r.idReserva)
                }}
                canceling={cancelMut.isPending && cancelMut.variables === r.idReserva}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ReservaCard({ reserva: r, onCancel, canceling }) {
  const empleadoNombre = r.empleado
    ? `${r.empleado.usuario?.nombres ?? ''} ${r.empleado.usuario?.apellidos ?? ''}`.trim()
    : null

  return (
    <div
      className="card-chunky"
      style={{
        background: '#fff',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      {/* left: reservation info */}
      <div style={{ flex: 1, minWidth: 220 }}>
        {/* number */}
        <p
          style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: 22,
            color: '#1A2E1A',
            margin: '0 0 12px',
          }}
        >
          Reserva #{r.idReserva}
        </p>

        {/* meta chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {/* date */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFF8E1',
              border: '2px solid #1A2E1A',
              borderRadius: 10,
              padding: '4px 12px',
              fontSize: 13,
              fontWeight: 700,
              color: '#1A2E1A',
            }}
          >
            <LuCalendar size={14} color="#FFC42E" />
            {r.fechaReserva}
          </span>

          {/* time */}
          {r.horario && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#e0f5ff',
                border: '2px solid #1A2E1A',
                borderRadius: 10,
                padding: '4px 12px',
                fontSize: 13,
                fontWeight: 700,
                color: '#1A2E1A',
              }}
            >
              <LuClock size={14} color="#38BDF8" />
              {r.horario.horaInicio}
            </span>
          )}

          {/* employee */}
          {empleadoNombre && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#f3e8ff',
                border: '2px solid #1A2E1A',
                borderRadius: 10,
                padding: '4px 12px',
                fontSize: 13,
                fontWeight: 700,
                color: '#1A2E1A',
              }}
            >
              <LuUser size={14} color="#A855F7" />
              {empleadoNombre}
            </span>
          )}
        </div>

        {/* observations */}
        {r.observaciones && (
          <p
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 15,
              color: '#888',
              margin: '10px 0 0',
            }}
          >
            "{r.observaciones}"
          </p>
        )}
      </div>

      {/* right: badge + cancel */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <EstadoBadge estado={r.estado} />

        {r.estado === 'Pendiente' && (
          <button
            className="btn btn-p"
            onClick={onCancel}
            disabled={canceling}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              padding: '6px 14px',
              opacity: canceling ? 0.7 : 1,
            }}
          >
            <LuX size={14} />
            Cancelar
          </button>
        )}
      </div>
    </div>
  )
}
