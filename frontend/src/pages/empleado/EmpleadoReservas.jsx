import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservasApi } from '../../api/reservas'
import toast from 'react-hot-toast'
import {
  LuCalendar,
  LuClock,
  LuCircleCheck,
  LuChartBar,
  LuUser,
  LuX,
  LuScissors,
} from 'react-icons/lu'

const BADGE_STYLE = {
  Pendiente:  { background: '#FFC42E', color: '#2B1B00', border: '3px solid #2B1B00', boxShadow: '3px 3px 0 #2B1B00', label: 'Pendiente'  },
  Confirmado: { background: '#1B7A3E', color: '#fff',    border: '3px solid #0F5527', boxShadow: '3px 3px 0 #0F5527', label: 'Atendido' },
  Cancelado:  { background: '#FF4F95', color: '#fff',    border: '3px solid #C42E72', boxShadow: '3px 3px 0 #C42E72', label: 'Cancelado'  },
}

const hoy = new Date().toISOString().split('T')[0]

export default function EmpleadoReservas() {
  const qc = useQueryClient()

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ['mis-asignadas'],
    queryFn: () => reservasApi.misAsignadas().then(r => r.data.data ?? []),
  })

  const confirmarMut = useMutation({
    mutationFn: (id) => reservasApi.confirmar(id),
    onSuccess: () => { qc.invalidateQueries(['mis-asignadas']); toast.success('Marcado como atendido') },
    onError:   () => toast.error('Error al actualizar'),
  })
  const cancelarMut = useMutation({
    mutationFn: (id) => reservasApi.cancelar(id),
    onSuccess: () => { qc.invalidateQueries(['mis-asignadas']); toast.success('Reserva cancelada') },
    onError:   () => toast.error('Error al cancelar'),
  })

  const sorted = [...reservas].sort((a, b) => {
    if (a.fechaReserva !== b.fechaReserva) return a.fechaReserva > b.fechaReserva ? -1 : 1
    return (a.horario?.horaInicio ?? '') > (b.horario?.horaInicio ?? '') ? 1 : -1
  })

  const hoyCount       = reservas.filter(r => r.fechaReserva === hoy).length
  const pendienteCount = reservas.filter(r => r.estado === 'Pendiente').length
  const atendidoCount  = reservas.filter(r => r.estado === 'Confirmado').length

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', padding: 24 }}>

      {/* ── Inline header ── */}
      <div style={{ marginBottom: 28 }}>
        <span className="section-tag" style={{ color: 'var(--green)' }}>mis citas</span>
        <h1 className="section-title" style={{ margin: '12px 0 4px' }}>Reservas Asignadas</h1>
        <p style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 20,
          color: '#888',
          fontWeight: 700,
          margin: 0,
        }}>
          Todas tus citas — historial y control de estado
        </p>
      </div>

      {/* ── Summary chips row ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { label: 'Total',      value: reservas.length,  icon: <LuChartBar size={18} />,    accent: '#1B7A3E', bg: '#C5EBC9' },
          { label: 'Hoy',        value: hoyCount,          icon: <LuCalendar size={18} />,    accent: '#0EA5E9', bg: '#E0F2FE' },
          { label: 'Pendientes', value: pendienteCount,    icon: <LuClock size={18} />,       accent: '#E89E0D', bg: '#FFF8E1' },
          { label: 'Atendidos',  value: atendidoCount,     icon: <LuCircleCheck size={18} />, accent: '#A855F7', bg: '#F3E8FF' },
        ].map(s => (
          <div
            key={s.label}
            className="card-chunky"
            style={{
              background: s.bg,
              padding: '14px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderRadius: 20,
            }}
          >
            <span style={{ color: s.accent }}>{s.icon}</span>
            <span style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: 28,
              color: s.accent,
              lineHeight: 1,
            }}>
              {s.value}
            </span>
            <span style={{
              fontSize: 13,
              fontWeight: 900,
              color: s.accent,
              fontFamily: "'Nunito', sans-serif",
            }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Reservations list ── */}
      <div className="card-chunky" style={{ overflow: 'hidden' }}>

        {isLoading ? (
          <div style={{ padding: 20 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skel" style={{ height: 64, marginBottom: 12, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <LuScissors size={48} color="#ccc" style={{ marginBottom: 14 }} />
            <p style={{ color: '#aaa', fontFamily: "'Caveat',cursive", fontSize: 22 }}>
              No tienes reservas asignadas
            </p>
          </div>
        ) : sorted.map((r, idx) => {
          const badge    = BADGE_STYLE[r.estado] ?? BADGE_STYLE.Pendiente
          const esHoy    = r.fechaReserva === hoy
          const esPasada = r.fechaReserva < hoy

          /* Left border accent color */
          const accentColor = esHoy ? '#FFC42E' : esPasada ? '#d1d5db' : '#1B7A3E'

          return (
            <div
              key={r.idReserva}
              style={{
                padding: '18px 24px',
                borderBottom: idx < sorted.length - 1 ? '3px solid #f5f0e8' : 'none',
                borderLeft: `6px solid ${accentColor}`,
                background: esHoy ? '#FFFDE7' : '#fff',
                transition: 'background .2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>

                {/* Left: client info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Name row + HOY sticker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <p style={{
                      fontFamily: "'Fredoka One', cursive",
                      fontSize: 17,
                      color: 'var(--ink)',
                      margin: 0,
                    }}>
                      {r.cliente?.usuario?.nombres} {r.cliente?.usuario?.apellidos}
                    </p>
                    {esHoy && (
                      <span style={{
                        fontFamily: "'Permanent Marker', cursive",
                        background: '#FFC42E',
                        color: '#2B1B00',
                        fontSize: 11,
                        padding: '2px 10px',
                        border: '3px solid #2B1B00',
                        borderRadius: 8,
                        boxShadow: '3px 3px 0 #2B1B00',
                        transform: 'rotate(-2deg)',
                        display: 'inline-block',
                        letterSpacing: 1,
                      }}>
                        HOY
                      </span>
                    )}
                  </div>

                  {/* Info chips */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: '#f5f0e8',
                      border: '2px solid var(--ink)',
                      borderRadius: 999,
                      padding: '3px 10px',
                      fontSize: 12,
                      fontWeight: 900,
                      color: 'var(--ink)',
                    }}>
                      <LuCalendar size={12} color="#1B7A3E" />
                      {r.fechaReserva}
                    </span>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: '#f5f0e8',
                      border: '2px solid var(--ink)',
                      borderRadius: 999,
                      padding: '3px 10px',
                      fontSize: 12,
                      fontWeight: 900,
                      color: 'var(--ink)',
                    }}>
                      <LuClock size={12} color="#E89E0D" />
                      {r.horario?.horaInicio ?? '—'}
                    </span>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: '#f5f0e8',
                      border: '2px solid var(--ink)',
                      borderRadius: 999,
                      padding: '3px 10px',
                      fontSize: 12,
                      fontWeight: 900,
                      color: 'var(--ink)',
                    }}>
                      <LuUser size={12} color="#A855F7" />
                      {r.asiento?.nombre ?? '—'}
                    </span>
                  </div>

                  {r.observaciones && (
                    <p style={{ fontSize: 12, color: '#aaa', margin: '6px 0 0', fontStyle: 'italic' }}>
                      {r.observaciones}
                    </p>
                  )}
                </div>

                {/* Right: estado badge */}
                <span style={{
                  ...badge,
                  padding: '5px 14px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 900,
                  flexShrink: 0,
                  fontFamily: "'Nunito', sans-serif",
                }}>
                  {badge.label}
                </span>
              </div>

              {/* Action buttons — only pending non-past */}
              {r.estado === 'Pendiente' && !esPasada && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button
                    className="btn btn-g"
                    onClick={() => confirmarMut.mutate(r.idReserva)}
                    disabled={confirmarMut.isPending}
                    style={{ padding: '8px 18px', fontSize: 13, borderRadius: 12 }}
                  >
                    <LuCircleCheck size={15} />
                    Atendido
                  </button>
                  <button
                    className="btn btn-p"
                    onClick={() => { if (confirm('¿Cancelar esta reserva?')) cancelarMut.mutate(r.idReserva) }}
                    disabled={cancelarMut.isPending}
                    style={{ padding: '8px 16px', fontSize: 13, borderRadius: 12 }}
                  >
                    <LuX size={15} />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
