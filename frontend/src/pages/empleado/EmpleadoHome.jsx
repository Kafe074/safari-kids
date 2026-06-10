import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservasApi } from '../../api/reservas'
import { pagosApi } from '../../api/pagos'
import { empleadosApi } from '../../api/empleados'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/common/StatCard'
import OnboardingTour from '../../components/common/OnboardingTour'
import toast from 'react-hot-toast'
import {
  LuCalendar, LuClock, LuCircleCheck, LuChartBar, LuX,
  LuScissors, LuUser, LuMapPin, LuBanknote, LuSearch,
} from 'react-icons/lu'

const EMPLEADO_TOUR = [
  {
    emoji: '✂️',
    title: '¡Bienvenido, estilista!',
    description: 'Este es tu panel de trabajo. Aquí verás todas tus citas asignadas, podrás marcarlas como atendidas y gestionar los pagos en efectivo. Vamos a conocerlo juntos.',
    accent: '#1B7A3E',
  },
  {
    emoji: '📊',
    title: 'Tus estadísticas del día',
    description: 'Las tarjetas superiores te muestran cuántas citas tienes hoy, cuántas están pendientes de atender, cuántas ya completaste y tus citas próximas.',
    accent: '#0EA5E9',
  },
  {
    emoji: '💵',
    title: 'Validar pago en efectivo',
    description: 'Cuando un cliente pague en efectivo, ingresa su código de reserva (ej: SKR-A1B2C3D4) en el buscador para confirmar el pago y marcar la reserva como atendida.',
    accent: '#b45309',
  },
  {
    emoji: '📋',
    title: 'Tu agenda de citas',
    description: 'En "Clientes de hoy" ves la agenda del día. Usa los botones de cada cita para marcarla como atendida o cancelarla. "Próximas citas" muestra los días siguientes.',
    accent: '#7E22CE',
  },
]

const BADGE_STYLE = {
  Pendiente:  { background: '#FFC42E', color: '#2B1B00', border: '3px solid #2B1B00', label: 'Pendiente' },
  Confirmado: { background: '#1B7A3E', color: '#fff',    border: '3px solid #0F5527', label: 'Atendido'  },
  Cancelado:  { background: '#FF4F95', color: '#fff',    border: '3px solid #C42E72', label: 'Cancelado' },
}

export default function EmpleadoHome() {
  const { user } = useAuth()
  const qc  = useQueryClient()
  const hoy = new Date().toISOString().split('T')[0]

  const { data: perfil } = useQuery({
    queryKey: ['empleado-me'],
    queryFn: () => empleadosApi.getAll().then(r => {
      const lista = r.data.data ?? []
      return lista.find(e => e.usuario?.correo === user?.correo) ?? null
    }),
    enabled: !!user,
  })

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ['mis-asignadas'],
    queryFn: () => reservasApi.misAsignadas().then(r => r.data.data ?? []),
  })

  const confirmarMut = useMutation({
    mutationFn: id => reservasApi.confirmar(id),
    onSuccess: () => { qc.invalidateQueries(['mis-asignadas']); toast.success('Marcado como atendido') },
    onError:   () => toast.error('Error al actualizar'),
  })
  const cancelarMut = useMutation({
    mutationFn: id => reservasApi.cancelar(id),
    onSuccess: () => { qc.invalidateQueries(['mis-asignadas']); toast.success('Reserva cancelada') },
    onError:   () => toast.error('Error al cancelar'),
  })

  const hoyReservas   = reservas.filter(r => r.fechaReserva === hoy)
  const pendientesHoy = hoyReservas.filter(r => r.estado === 'Pendiente')
  const atendidosHoy  = hoyReservas.filter(r => r.estado === 'Confirmado')
  const proximas      = reservas
    .filter(r => r.fechaReserva > hoy)
    .sort((a, b) => a.fechaReserva > b.fechaReserva ? 1 : -1)

  const nombre     = user?.nombreCompleto?.split(' ')[0] ?? 'Estilista'
  const fechaLarga = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
  const sucursal   = perfil?.sucursal ?? null
  const tourKey    = `safari_tour_empleado_${user?.correo ?? 'anon'}`

  // Estado para validar pago en efectivo
  const [codigoInput, setCodigoInput]     = useState('')
  const [buscando, setBuscando]           = useState(false)
  const [reservaEncontrada, setReservaEncontrada] = useState(null)
  const [validando, setValidando]         = useState(false)

  const buscarPorCodigo = async () => {
    if (!codigoInput.trim()) return
    setBuscando(true)
    try {
      const res = await reservasApi.porCodigo(codigoInput.trim().toUpperCase())
      const r = res.data.data
      if (r.estado === 'Cancelado') { toast.error('Esta reserva fue cancelada'); setReservaEncontrada(null); return }
      setReservaEncontrada(r)
    } catch (err) {
      toast.error(err.response?.status === 404 ? 'Código no encontrado' : 'Error al buscar')
      setReservaEncontrada(null)
    } finally { setBuscando(false) }
  }

  const validarPago = async () => {
    if (!reservaEncontrada) return
    setValidando(true)
    try {
      await pagosApi.validarEfectivo(codigoInput.trim().toUpperCase())
      toast.success('¡Pago validado! Reserva confirmada')
      qc.invalidateQueries(['mis-asignadas'])
      setReservaEncontrada(null)
      setCodigoInput('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al validar el pago')
    } finally { setValidando(false) }
  }

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', padding: 24 }}>
      <OnboardingTour steps={EMPLEADO_TOUR} storageKey={tourKey} />

      {/* ── Welcome hero ── */}
      <div className="card-chunky" style={{
        background: 'linear-gradient(135deg, #1B7A3E 0%, #33A957 60%, #4CAF50 100%)',
        padding: '32px 36px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(255,255,255,.2)', border: '4px solid rgba(255,255,255,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <LuScissors size={30} color="#fff" />
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(28px, 4vw, 42px)', color: '#fff', margin: 0, lineHeight: 1.1 }}>
            Hola, {nombre}!
          </h1>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: 'rgba(255,255,255,.85)', margin: '4px 0 0', fontWeight: 700, textTransform: 'capitalize' }}>
            {fechaLarga}
          </p>
        </div>

        {/* Sucursal badge — destacado */}
        {sucursal ? (
          <div style={{
            background: 'rgba(255,255,255,0.18)',
            border: '3px solid rgba(255,255,255,0.5)',
            borderRadius: 16,
            padding: '14px 22px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            flexShrink: 0,
            boxShadow: '4px 4px 0 rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LuMapPin size={16} color="#FFC42E" />
              <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                Tu sucursal
              </span>
            </div>
            <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>
              {sucursal.split('–')[0].trim()}
            </span>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
              {sucursal.includes('–') ? sucursal.split('–')[1]?.trim() : ''}
            </span>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,196,46,0.2)', border: '2px dashed rgba(255,196,46,0.6)',
            borderRadius: 12, padding: '10px 18px',
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          }}>
            <LuMapPin size={15} color="#FFC42E" />
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
              Sin sucursal asignada
            </span>
          </div>
        )}
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={<LuCalendar   size={26} color="#1B7A3E" />} label="Citas hoy"      value={hoyReservas.length}   bg="#C5EBC9" />
        <StatCard icon={<LuClock      size={26} color="#E89E0D" />} label="Por atender"    value={pendientesHoy.length} bg="#FFF8E1" />
        <StatCard icon={<LuCircleCheck size={26} color="#0EA5E9" />} label="Atendidos hoy" value={atendidosHoy.length}  bg="#E0F2FE" />
        <StatCard icon={<LuChartBar   size={26} color="#A855F7" />} label="Próximas citas" value={proximas.length}      bg="#F3E8FF" />
      </div>

      {/* ── Validar pago en efectivo ── */}
      <div className="card-chunky" style={{ marginBottom: 28, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg, #b45309, #d97706)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <LuBanknote size={20} color="#fff" />
          <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: '#fff' }}>Validar Pago en Efectivo</span>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#666', marginBottom: 16, marginTop: 0 }}>
            Ingresa el código de reserva del cliente para confirmar su pago en efectivo.
          </p>
          <div style={{ display: 'flex', gap: 10, marginBottom: reservaEncontrada ? 16 : 0 }}>
            <input
              value={codigoInput}
              onChange={e => { setCodigoInput(e.target.value.toUpperCase()); setReservaEncontrada(null) }}
              placeholder="Ej: SKR-A1B2C3D4"
              style={{ flex: 1, padding: '10px 14px', border: '3px solid var(--ink)', borderRadius: 12, fontFamily: 'inherit', fontSize: 14, outline: 'none' }}
              onKeyDown={e => e.key === 'Enter' && buscarPorCodigo()}
            />
            <button className="btn" onClick={buscarPorCodigo} disabled={buscando || !codigoInput.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff8e1', borderColor: '#b45309', color: '#b45309' }}>
              <LuSearch size={16} /> {buscando ? '...' : 'Buscar'}
            </button>
          </div>

          {reservaEncontrada && (
            <div style={{ background: '#fff8e1', border: '3px solid #d97706', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 15, margin: 0, color: 'var(--ink)' }}>
                    {reservaEncontrada.cliente?.usuario?.nombres} {reservaEncontrada.cliente?.usuario?.apellidos}
                  </p>
                  <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>
                    {reservaEncontrada.fechaReserva} · {reservaEncontrada.horario?.horaInicio?.substring(0,5)}
                    {reservaEncontrada.local && ` · ${reservaEncontrada.local.split('–')[0].trim()}`}
                  </p>
                </div>
                <span style={{ background: reservaEncontrada.estado === 'Confirmado' ? '#1B7A3E' : '#FFC42E', color: reservaEncontrada.estado === 'Confirmado' ? '#fff' : '#2B1B00', border: '2px solid var(--ink)', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 800 }}>
                  {reservaEncontrada.estado === 'Confirmado' ? 'Ya confirmada' : 'Pendiente de pago'}
                </span>
              </div>
              {reservaEncontrada.estado !== 'Confirmado' ? (
                <button className="btn btn-g" onClick={validarPago} disabled={validando}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <LuCircleCheck size={16} /> {validando ? 'Validando...' : 'Confirmar pago en efectivo'}
                </button>
              ) : (
                <p style={{ textAlign: 'center', color: '#1B7A3E', fontWeight: 800, fontSize: 13, margin: 0 }}>
                  ✓ Este pago ya fue validado anteriormente
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="two-col">

        {/* ── LEFT: Clientes de hoy ── */}
        <div className="card-chunky" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg, #1B7A3E, #33A957)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <LuCalendar size={20} color="#FFC42E" /> Clientes de hoy
            </span>
            <span style={{ background: '#FFC42E', color: '#2B1B00', border: '3px solid #2B1B00', borderRadius: 999, padding: '2px 12px', fontFamily: "'Fredoka One', cursive", fontSize: 16, boxShadow: '3px 3px 0 #2B1B00' }}>
              {hoyReservas.length}
            </span>
          </div>

          {isLoading ? (
            <div style={{ padding: 20 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skel" style={{ height: 56, marginBottom: 10, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          ) : hoyReservas.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <LuScissors size={40} color="#ccc" style={{ marginBottom: 10 }} />
              <p style={{ color: '#aaa', fontFamily: "'Caveat',cursive", fontSize: 18 }}>Sin citas para hoy</p>
            </div>
          ) : (
            <div>
              {hoyReservas
                .sort((a, b) => (a.horario?.horaInicio ?? '') > (b.horario?.horaInicio ?? '') ? 1 : -1)
                .map(r => {
                  const badge = BADGE_STYLE[r.estado] ?? BADGE_STYLE.Pendiente
                  return (
                    <div key={r.idReserva} style={{ padding: '14px 20px', borderBottom: '3px solid #f5f0e8' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 900, fontSize: 15, margin: '0 0 4px', color: 'var(--ink)', fontFamily: "'Nunito', sans-serif" }}>
                            {r.cliente?.usuario?.nombres} {r.cliente?.usuario?.apellidos}
                          </p>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#666', fontWeight: 800 }}>
                              <LuClock size={13} color="#E89E0D" /> {r.horario?.horaInicio ?? '—'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#666', fontWeight: 800 }}>
                              <LuUser size={13} color="#A855F7" /> {r.asiento?.nombre ?? '—'}
                            </span>
                            {r.local && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#1B7A3E', fontWeight: 800 }}>
                                <LuMapPin size={13} color="#1B7A3E" /> {r.local.split('–')[0].trim()}
                              </span>
                            )}
                          </div>
                          {r.observaciones && (
                            <p style={{ fontSize: 11, color: '#aaa', margin: '4px 0 0', fontStyle: 'italic' }}>{r.observaciones}</p>
                          )}
                        </div>
                        <span style={{ ...badge, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 900, boxShadow: '3px 3px 0 var(--ink)', flexShrink: 0, marginLeft: 10, fontFamily: "'Nunito', sans-serif" }}>
                          {badge.label}
                        </span>
                      </div>

                      {r.estado === 'Pendiente' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          <button className="btn btn-g" onClick={() => confirmarMut.mutate(r.idReserva)} disabled={confirmarMut.isPending}
                            style={{ flex: 1, padding: '8px 12px', fontSize: 13, borderRadius: 12 }}>
                            <LuCircleCheck size={15} /> Marcar atendido
                          </button>
                          <button className="btn btn-p" onClick={() => { if (confirm('¿Cancelar esta reserva?')) cancelarMut.mutate(r.idReserva) }}
                            disabled={cancelarMut.isPending} style={{ padding: '8px 12px', fontSize: 13, borderRadius: 12 }}>
                            <LuX size={15} />
                          </button>
                        </div>
                      )}
                      {r.estado === 'Confirmado' && (
                        <p style={{ fontSize: 12, color: '#1B7A3E', fontWeight: 900, margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <LuCircleCheck size={14} /> Servicio completado
                        </p>
                      )}
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Próximas citas ── */}
        <div className="card-chunky" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg, #7E22CE, #A855F7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <LuChartBar size={20} color="#FFC42E" /> Próximas citas
            </span>
            <span style={{ background: '#FFC42E', color: '#2B1B00', border: '3px solid #2B1B00', borderRadius: 999, padding: '2px 12px', fontFamily: "'Fredoka One', cursive", fontSize: 16, boxShadow: '3px 3px 0 #2B1B00' }}>
              {proximas.length}
            </span>
          </div>

          {proximas.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <LuCalendar size={40} color="#ccc" style={{ marginBottom: 10 }} />
              <p style={{ color: '#aaa', fontFamily: "'Caveat',cursive", fontSize: 18 }}>Sin citas próximas</p>
            </div>
          ) : (
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {proximas.map(r => {
                const badge = BADGE_STYLE[r.estado] ?? BADGE_STYLE.Pendiente
                return (
                  <div key={r.idReserva} style={{ padding: '12px 20px', borderBottom: '3px solid #f5f0e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 900, fontSize: 14, margin: '0 0 4px', color: 'var(--ink)', fontFamily: "'Nunito', sans-serif" }}>
                        {r.cliente?.usuario?.nombres} {r.cliente?.usuario?.apellidos}
                      </p>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#666', fontWeight: 800 }}>
                          <LuCalendar size={12} color="#A855F7" /> {r.fechaReserva}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#666', fontWeight: 800 }}>
                          <LuClock size={12} color="#E89E0D" /> {r.horario?.horaInicio ?? '—'}
                        </span>
                        {r.local && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#1B7A3E', fontWeight: 800 }}>
                            <LuMapPin size={12} color="#1B7A3E" /> {r.local.split('–')[0].trim()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{ ...badge, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 900, boxShadow: '3px 3px 0 var(--ink)', flexShrink: 0, fontFamily: "'Nunito', sans-serif" }}>
                      {r.estado}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
