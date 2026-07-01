import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { reservasApi } from '../../api/reservas'
import { empleadosApi } from '../../api/empleados'
import { horariosApi } from '../../api/horarios'
import { pagosApi } from '../../api/pagos'
import { promocionesApi } from '../../api/promociones'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  LuScissors, LuCalendar, LuClock, LuMapPin, LuUser,
  LuStickyNote, LuCircleCheck, LuChevronLeft, LuChevronRight,
  LuTriangleAlert, LuTag, LuCreditCard, LuBanknote, LuPrinter, LuSparkles,
} from 'react-icons/lu'

import { SUCURSALES } from '../../constants/sucursales'

const nombreEstilista = (e) => {
  const u = e?.usuario
  if (!u) return 'Estilista'
  return `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || 'Estilista'
}

function StepIndicator({ step, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 36 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width:   i + 1 === step ? 46 : 38,
            height:  i + 1 === step ? 46 : 38,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Fredoka One',cursive",
            fontSize:  i + 1 === step ? 19 : 15,
            background: i + 1 < step ? 'var(--green)' : i + 1 === step ? 'var(--yellow)' : '#e0d8cc',
            color:      i + 1 <= step ? '#fff' : '#999',
            border:    `3px solid var(--ink)`,
            boxShadow: i + 1 === step ? '4px 4px 0 var(--ink)' : '2px 2px 0 var(--ink)',
            transition: 'all .3s',
            zIndex: 1,
          }}>
            {i + 1 < step ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div style={{
              width: 32, height: 4,
              background: i + 1 < step ? 'var(--green)' : '#e0d8cc',
              border: '1px solid var(--ink)',
              transition: 'background .3s',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '12px 16px',
  border: '3px solid var(--ink)', borderRadius: 12,
  fontSize: 15, outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box', background: 'var(--paper)', transition: 'box-shadow .15s',
}

export default function NuevaReserva() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const { user }    = useAuth()
  const preSelected = location.state?.servicio ?? ''

  const [step, setStep]     = useState(preSelected ? 2 : 1)
  const [form, setForm]     = useState({ servicio: null, fecha: '', horario: '', sucursal: '', estilista: '', asiento: null, notas: '' })
  const [loading, setLoading]   = useState(false)
  const [reservaCreada, setReservaCreada] = useState(null) // { idReserva, codigoReserva }

  // Payment state
  const [metodoPago, setMetodoPago]   = useState('Simulado')
  const [codigo, setCodigo]           = useState('')
  const [descuentoInfo, setDescuentoInfo] = useState(null)
  const [validandoCodigo, setValidandoCodigo] = useState(false)
  const [boleta, setBoleta]           = useState(null)
  const [procesandoPago, setProcesandoPago] = useState(false)

  const { data: servicios = [] } = useQuery({
    queryKey: ['servicios-public'],
    queryFn: () => api.get('/servicios').then(r => r.data.data ?? []),
  })

  const { data: horarios = [] } = useQuery({
    queryKey: ['horarios-disponibles'],
    queryFn: () => horariosApi.getAll().then(r => {
      const data = r.data?.data ?? r.data ?? []
      return data.filter(h => h.estado === 'Disponible')
    }),
  })

  const { data: asientos = [] } = useQuery({
    queryKey: ['asientos-disponibles'],
    queryFn: () => api.get('/asientos').then(r => (r.data.data ?? []).filter(a => a.estado === 'Disponible')),
  })

  const { data: estilistas = [], isLoading: cargandoEstilistas } = useQuery({
    queryKey: ['estilistas-disponibles', form.sucursal],
    queryFn: () => empleadosApi.disponibles(form.sucursal).then(r => r.data.data ?? []),
    enabled: !!form.sucursal,
  })

  const selServicio = (s) => { setForm(f => ({ ...f, servicio: s })); setStep(2) }

  const handleConfirm = async () => {
    if (!form.servicio || !form.fecha || !form.horario || !form.asiento) {
      toast.error('Completa todos los campos'); return
    }
    setLoading(true)
    try {
      const res = await reservasApi.crear({
        fecha:         form.fecha,
        horaInicio:    form.horario,
        idServicio:    form.servicio.idServicio,
        idAsiento:     form.asiento.idAsiento,
        idEmpleado:    form.estilista && form.estilista !== 'cualquiera' ? form.estilista.idEmpleado : null,
        local:         form.sucursal,
        observaciones: form.notas,
      })
      const data = res.data.data // { idReserva, codigoReserva }
      setReservaCreada(data)
      setStep(5)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear la reserva')
    } finally { setLoading(false) }
  }

  const handleValidarCodigo = async () => {
    if (!codigo.trim()) return
    setValidandoCodigo(true)
    try {
      const res = await promocionesApi.validarCodigo(codigo.trim().toUpperCase())
      const data = res.data.data
      if (data?.valido) {
        setDescuentoInfo(data)
        toast.success(`¡Código válido! Descuento ${data.descuento}% aplicado`)
      } else {
        setDescuentoInfo(null)
        toast.error('Código de descuento no válido o expirado')
      }
    } catch {
      toast.error('Error al validar el código')
    } finally { setValidandoCodigo(false) }
  }

  const precioBase = Number(form.servicio?.precio ?? 0)
  const descuentoMonto = descuentoInfo
    ? +(precioBase * descuentoInfo.descuento / 100).toFixed(2)
    : 0
  const precioFinal = +(precioBase - descuentoMonto).toFixed(2)

  const handlePagar = async () => {
    if (!reservaCreada?.idReserva) { toast.error('Error: no hay reserva creada'); return }
    setProcesandoPago(true)
    try {
      const res = await pagosApi.procesar({
        idReserva:       reservaCreada.idReserva,
        metodoPago,
        codigoPromocion: codigo.trim() || null,
      })
      const data = res.data.data
      setBoleta(data)
      toast.success(metodoPago === 'Efectivo' ? '¡Reserva confirmada! Paga en el salón' : '¡Pago exitoso! 🎉', { duration: 4000 })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al procesar el pago')
    } finally { setProcesandoPago(false) }
  }

  const stepTitles = ['Elige tu servicio', 'Fecha y sede', 'Elige tu asiento', 'Confirmar reserva', 'Pago']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', paddingTop: 100, paddingBottom: 60, fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '0 24px' }}>

        <button onClick={() => navigate('/mi-cuenta')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: '3px solid var(--ink)', borderRadius: 999, padding: '8px 16px', fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer', marginBottom: 16, color: 'var(--ink)' }}>
          <LuChevronLeft size={14} /> Mi Cuenta
        </button>

        <div style={{ background: 'linear-gradient(135deg,#1b5e20,#1B7A3E)', border: '4px solid var(--ink)', borderRadius: 24, boxShadow: '8px 8px 0 var(--ink)', padding: '28px 32px', marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 32, color: '#fff', margin: '0 0 4px' }}>
            Nueva Reserva 🦁
          </h1>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 14, margin: 0 }}>
            {stepTitles[step - 1]} · Paso {step} de 5
          </p>
        </div>

        <StepIndicator step={step} total={5} />

        {/* ── STEP 1 : Servicio ── */}
        {step === 1 && (
          <div className="card-chunky anim-pop-in" style={{ padding: 32 }}>
            <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>
              ¿Qué servicio deseas?
            </h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Selecciona el servicio y te ayudamos con el resto</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {servicios.filter(s => s.estado === 'Disponible').map(s => {
                const selected = form.servicio?.idServicio === s.idServicio
                return (
                  <button key={s.idServicio} onClick={() => selServicio(s)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    padding: '20px 14px',
                    background: selected ? 'var(--yellow)' : '#fff',
                    border: `4px solid ${selected ? 'var(--pink)' : 'var(--ink)'}`,
                    borderRadius: 20, boxShadow: selected ? '6px 6px 0 var(--ink)' : '4px 4px 0 var(--ink)',
                    cursor: 'pointer', transition: 'all .18s', fontFamily: 'inherit',
                    transform: selected ? 'translate(-2px,-2px)' : 'translate(0,0)',
                  }}>
                    <span style={{ color: selected ? 'var(--ink)' : 'var(--green)', display: 'flex' }}><LuScissors size={28} /></span>
                    <span style={{ fontWeight: 800, fontSize: 12, color: 'var(--ink)', textAlign: 'center', lineHeight: 1.3 }}>{s.nombre}</span>
                    <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: selected ? 'var(--ink)' : 'var(--green)' }}>
                      S/ {Number(s.precio).toFixed(0)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2 : Fecha y sede ── */}
        {step === 2 && (
          <div className="card-chunky anim-pop-in" style={{ padding: 32 }}>
            <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>Fecha y sede</h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Elige cuándo y dónde quieres venir</p>

            {form.servicio && (
              <div style={{ background: '#e8f5e9', borderRadius: 14, border: '3px solid var(--green)', padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <LuScissors size={24} color="var(--green)" />
                <div>
                  <p style={{ fontWeight: 800, color: 'var(--ink)', margin: 0, fontSize: 14 }}>{form.servicio.nombre}</p>
                  <p style={{ color: 'var(--green)', fontSize: 12, margin: 0 }}>
                    S/ {Number(form.servicio.precio).toFixed(0)} ·{' '}
                    <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}>Cambiar</button>
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--ink)', marginBottom: 10 }}>
                  <LuCalendar size={18} /> Fecha de visita
                </label>
                <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value, horario: '' }))}
                  min={new Date().toISOString().split('T')[0]} style={inputStyle}
                  onFocus={e => e.target.style.boxShadow = '4px 4px 0 var(--ink)'}
                  onBlur={e => e.target.style.boxShadow = 'none'} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--ink)', marginBottom: 10 }}>
                  <LuClock size={18} /> Horario disponible
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  {horarios.map(h => {
                    const label = h.horaInicio?.substring(0, 5)
                    const sel   = form.horario === label
                    const past  = form.fecha && new Date(`${form.fecha}T${label}:00`).getTime() <= Date.now()
                    return (
                      <button key={h.idHorario} disabled={past}
                        title={past ? 'Este horario ya pasó' : undefined}
                        onClick={() => !past && setForm(f => ({ ...f, horario: label }))} style={{
                        padding: '10px 6px', borderRadius: 12,
                        border: `3px solid ${sel ? 'var(--pink)' : 'var(--ink)'}`,
                        background: past ? '#eee' : sel ? 'var(--yellow)' : '#fff',
                        color: past ? '#aaa' : 'var(--ink)',
                        fontFamily: "'Fredoka One',cursive", fontSize: 14,
                        cursor: past ? 'not-allowed' : 'pointer',
                        textDecoration: past ? 'line-through' : 'none',
                        boxShadow: past ? 'none' : sel ? '4px 4px 0 var(--ink)' : '2px 2px 0 var(--ink)',
                        transition: 'all .15s', transform: sel && !past ? 'translate(-1px,-1px)' : 'none',
                      }}>{label}</button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--ink)', marginBottom: 10 }}>
                  <LuMapPin size={18} /> Sede
                </label>
                {SUCURSALES.map(s => {
                  const sel = form.sucursal === s
                  return (
                    <div key={s} onClick={() => setForm(f => ({ ...f, sucursal: s, estilista: '' }))} style={{
                      padding: '13px 16px', borderRadius: 14, marginBottom: 10, cursor: 'pointer',
                      border: `3px solid ${sel ? 'var(--pink)' : 'var(--ink)'}`,
                      background: sel ? 'var(--yellow)' : '#fff',
                      boxShadow: sel ? '4px 4px 0 var(--ink)' : '2px 2px 0 var(--ink)',
                      display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s',
                      transform: sel ? 'translate(-2px,-2px)' : 'none',
                    }}>
                      <LuMapPin size={18} color={sel ? 'var(--ink)' : 'var(--green)'} style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: sel ? 800 : 600, color: 'var(--ink)', fontSize: 13 }}>{s}</span>
                      {sel && <LuCircleCheck size={18} color="var(--ink)" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                    </div>
                  )
                })}
              </div>

              {/* Estilista disponible en la sede elegida */}
              {form.sucursal && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--ink)', marginBottom: 10 }}>
                    <LuUser size={18} /> Elige a tu estilista
                  </label>

                  {cargandoEstilistas ? (
                    <p style={{ color: '#888', fontSize: 13, padding: '8px 0' }}>Buscando estilistas disponibles…</p>
                  ) : (
                    <>
                      {/* Opción: cualquiera disponible */}
                      <div onClick={() => setForm(f => ({ ...f, estilista: 'cualquiera' }))} style={{
                        padding: '13px 16px', borderRadius: 14, marginBottom: 10, cursor: 'pointer',
                        border: `3px solid ${form.estilista === 'cualquiera' ? 'var(--pink)' : 'var(--ink)'}`,
                        background: form.estilista === 'cualquiera' ? 'var(--yellow)' : '#fff',
                        boxShadow: form.estilista === 'cualquiera' ? '4px 4px 0 var(--ink)' : '2px 2px 0 var(--ink)',
                        display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s',
                        transform: form.estilista === 'cualquiera' ? 'translate(-2px,-2px)' : 'none',
                      }}>
                        <LuSparkles size={18} color={form.estilista === 'cualquiera' ? 'var(--ink)' : 'var(--green)'} style={{ flexShrink: 0 }} />
                        <div>
                          <span style={{ fontWeight: form.estilista === 'cualquiera' ? 800 : 600, color: 'var(--ink)', fontSize: 13, display: 'block' }}>Cualquiera disponible</span>
                          <span style={{ color: '#888', fontSize: 11 }}>Te asignamos al estilista con más disponibilidad</span>
                        </div>
                        {form.estilista === 'cualquiera' && <LuCircleCheck size={18} color="var(--ink)" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                      </div>

                      {estilistas.length === 0 ? (
                        <p style={{ color: '#aaa', fontSize: 12, fontStyle: 'italic', margin: '4px 0' }}>
                          No hay estilistas registrados en esta sede. Te asignaremos uno disponible.
                        </p>
                      ) : estilistas.map(e => {
                        const sel = form.estilista !== 'cualquiera' && form.estilista?.idEmpleado === e.idEmpleado
                        return (
                          <div key={e.idEmpleado} onClick={() => setForm(f => ({ ...f, estilista: e }))} style={{
                            padding: '13px 16px', borderRadius: 14, marginBottom: 10, cursor: 'pointer',
                            border: `3px solid ${sel ? 'var(--pink)' : 'var(--ink)'}`,
                            background: sel ? 'var(--yellow)' : '#fff',
                            boxShadow: sel ? '4px 4px 0 var(--ink)' : '2px 2px 0 var(--ink)',
                            display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s',
                            transform: sel ? 'translate(-2px,-2px)' : 'none',
                          }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: sel ? 'var(--ink)' : 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Fredoka One',cursive", fontSize: 16 }}>
                              {nombreEstilista(e).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span style={{ fontWeight: sel ? 800 : 700, color: 'var(--ink)', fontSize: 13, display: 'block' }}>{nombreEstilista(e)}</span>
                              {e.especialidad && <span style={{ color: '#888', fontSize: 11 }}>{e.especialidad}</span>}
                            </div>
                            {sel && <LuCircleCheck size={18} color="var(--ink)" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={() => setStep(1)} className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <LuChevronLeft size={18} /> Atrás
              </button>
              <button disabled={!form.fecha || !form.horario || !form.sucursal || !form.estilista} onClick={() => setStep(3)}
                className="btn btn-g" style={{ flex: 2, opacity: (!form.fecha || !form.horario || !form.sucursal || !form.estilista) ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Siguiente <LuChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 : Selección de asiento ── */}
        {step === 3 && (
          <div className="card-chunky anim-pop-in" style={{ padding: 32 }}>
            <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>
              Elige tu asiento
            </h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Selecciona la silla donde tu peque disfrutará del servicio</p>

            {asientos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#aaa' }}>
                <p style={{ fontSize: 40, marginBottom: 8 }}>🪑</p>
                <p style={{ fontFamily: "'Poppins',sans-serif" }}>No hay asientos disponibles en este momento</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {asientos.map(a => {
                  const sel = form.asiento?.idAsiento === a.idAsiento
                  return (
                    <button key={a.idAsiento} onClick={() => setForm(f => ({ ...f, asiento: a }))} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      padding: '20px 14px',
                      background: sel ? 'var(--yellow)' : '#fff',
                      border: `4px solid ${sel ? 'var(--pink)' : 'var(--ink)'}`,
                      borderRadius: 20, boxShadow: sel ? '6px 6px 0 var(--ink)' : '4px 4px 0 var(--ink)',
                      cursor: 'pointer', transition: 'all .18s', fontFamily: 'inherit',
                      transform: sel ? 'translate(-2px,-2px)' : 'translate(0,0)',
                    }}>
                      <span style={{ fontSize: 32 }}>🪑</span>
                      <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)', textAlign: 'center', lineHeight: 1.3 }}>{a.nombre}</span>
                      <span style={{ fontSize: 11, color: sel ? 'var(--ink)' : '#888', fontFamily: "'Poppins',sans-serif" }}>{a.tipo}</span>
                      {sel && <LuCircleCheck size={16} color="var(--ink)" />}
                    </button>
                  )
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={() => setStep(2)} className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <LuChevronLeft size={18} /> Atrás
              </button>
              <button disabled={!form.asiento} onClick={() => setStep(4)}
                className="btn btn-g" style={{ flex: 2, opacity: !form.asiento ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Siguiente <LuChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4 : Confirmar ── */}
        {step === 4 && (
          <div className="card-chunky anim-pop-in" style={{ padding: 32, borderColor: 'var(--yellow)' }}>
            <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>Confirma tu reserva</h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Revisa los detalles antes de confirmar</p>

            <div style={{ background: 'linear-gradient(135deg,#e8f5e9,#f1f8f1)', border: '3px solid var(--ink)', borderRadius: 18, boxShadow: '4px 4px 0 var(--ink)', padding: 24, marginBottom: 24 }}>
              {[
                [<LuScissors size={16} />, 'Servicio', form.servicio?.nombre],
                [<LuScissors size={16} />, 'Precio',   `S/ ${Number(form.servicio?.precio || 0).toFixed(0)}`],
                [<LuCalendar size={16} />, 'Fecha',    form.fecha],
                [<LuClock    size={16} />, 'Hora',     form.horario],
                [<LuMapPin   size={16} />, 'Sede',     form.sucursal],
                [<LuUser     size={16} />, 'Estilista', form.estilista === 'cualquiera' ? 'Cualquiera disponible' : nombreEstilista(form.estilista)],
                [<LuUser     size={16} />, 'Asiento',  form.asiento?.nombre],
              ].map(([ico, l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(27,122,62,.12)' }}>
                  <span style={{ color: '#666', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--green)', display: 'flex' }}>{ico}</span>{l}
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--ink)', fontSize: 14 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--ink)', marginBottom: 10 }}>
                <LuStickyNote size={18} /> Notas adicionales (opcional)
              </label>
              <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                placeholder="Ej: Mi hijo es alérgico a ciertos productos..." rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.boxShadow = '4px 4px 0 var(--ink)'}
                onBlur={e => e.target.style.boxShadow = 'none'} />
            </div>

            <div style={{ background: '#fff8e1', border: '3px solid var(--yellow)', borderRadius: 14, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <LuTriangleAlert size={18} color="#b38600" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: '#7c5607', margin: 0, lineHeight: 1.6 }}>
                Al confirmar se creará tu reserva y podrás elegir el método de pago.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(3)} className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <LuChevronLeft size={18} /> Atrás
              </button>
              <button onClick={handleConfirm} disabled={loading} className="btn btn-g"
                style={{ flex: 2, fontSize: 16, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? 'Creando reserva...' : <>Ir al Pago <LuChevronRight size={18} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5 : Pago ── */}
        {step === 5 && !boleta && (
          <div className="card-chunky anim-pop-in" style={{ padding: 32 }}>
            <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>
              💳 Pago del servicio
            </h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Completa el pago para confirmar tu reserva</p>

            {/* Resumen de precio */}
            <div style={{ background: '#f9f9f9', border: '2px solid #e0e0e0', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#666' }}>{form.servicio?.nombre}</span>
                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: 'var(--green)' }}>S/ {precioBase.toFixed(2)}</span>
              </div>
              {descuentoInfo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#2E7D32' }}>
                    Descuento ({descuentoInfo.descuento}%) — {descuentoInfo.nombre}
                  </span>
                  <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: '#c62828' }}>-S/ {descuentoMonto.toFixed(2)}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--ink)' }}>Total a pagar</span>
                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'var(--green)' }}>S/ {precioFinal.toFixed(2)}</span>
              </div>
            </div>

            {/* Código de descuento */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--ink)', marginBottom: 10 }}>
                <LuTag size={18} /> Código de descuento (opcional)
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input value={codigo} onChange={e => { setCodigo(e.target.value.toUpperCase()); setDescuentoInfo(null) }}
                  placeholder="Ej: SAFARI15" style={{ ...inputStyle, flex: 1 }}
                  onFocus={e => e.target.style.boxShadow = '4px 4px 0 var(--ink)'}
                  onBlur={e => e.target.style.boxShadow = 'none'} />
                <button onClick={handleValidarCodigo} disabled={validandoCodigo || !codigo.trim()}
                  style={{ whiteSpace: 'nowrap', background: '#e8f5e9', color: '#2E7D32', border: '3px solid var(--ink)', borderRadius: 12, padding: '0 18px', fontFamily: "'Fredoka One',cursive", fontSize: 14, cursor: 'pointer', opacity: !codigo.trim() ? 0.5 : 1 }}>
                  {validandoCodigo ? '...' : 'Aplicar'}
                </button>
              </div>
              {descuentoInfo && (
                <div style={{ marginTop: 8, background: '#e8f5e9', border: '2px solid #4caf50', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#1b5e20', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LuCircleCheck size={16} /> {descuentoInfo.nombre} — {descuentoInfo.descuento}% de descuento aplicado
                </div>
              )}
            </div>

            {/* Método de pago */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--ink)', marginBottom: 12 }}>
                <LuCreditCard size={18} /> Método de pago
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { key: 'Simulado', label: 'Tarjeta Simulada', icon: <LuCreditCard size={22} />, color: '#3b82f6' },
                  { key: 'Efectivo', label: 'Efectivo en salón', icon: <LuBanknote   size={22} />, color: '#2E7D32' },
                ].map(m => (
                  <button key={m.key} onClick={() => setMetodoPago(m.key)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    padding: '18px 14px', borderRadius: 16,
                    border: `3px solid ${metodoPago === m.key ? m.color : 'var(--ink)'}`,
                    background: metodoPago === m.key ? (m.key === 'Simulado' ? '#eff6ff' : '#e8f5e9') : '#fff',
                    cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
                    boxShadow: metodoPago === m.key ? `4px 4px 0 ${m.color}` : '2px 2px 0 var(--ink)',
                  }}>
                    <span style={{ color: m.color }}>{m.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Info método simulado */}
            {metodoPago === 'Simulado' && (
              <div style={{ background: '#eff6ff', border: '2px solid #93c5fd', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
                <p style={{ fontFamily: "'Fredoka One',cursive", color: '#1d4ed8', fontSize: 15, marginBottom: 12 }}>💳 Datos de tarjeta (simulado)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4, fontWeight: 700 }}>NÚMERO DE TARJETA</label>
                    <input readOnly value="4242 4242 4242 4242" style={{ ...inputStyle, background: '#fff', fontSize: 13, cursor: 'default', padding: '8px 12px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4, fontWeight: 700 }}>VENCIMIENTO</label>
                      <input readOnly value="12/29" style={{ ...inputStyle, background: '#fff', fontSize: 13, cursor: 'default', padding: '8px 12px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4, fontWeight: 700 }}>CVV</label>
                      <input readOnly value="123" style={{ ...inputStyle, background: '#fff', fontSize: 13, cursor: 'default', padding: '8px 12px' }} />
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: '#6b7280', marginTop: 10, margin: 0 }}>* Pago 100% simulado — no se realizan cargos reales</p>
              </div>
            )}

            {/* Info efectivo */}
            {metodoPago === 'Efectivo' && (
              <div style={{ background: '#e8f5e9', border: '2px solid var(--green)', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
                <p style={{ fontFamily: "'Fredoka One',cursive", color: '#1b5e20', fontSize: 15, margin: '0 0 6px' }}>💰 Pago en efectivo</p>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#2E7D32', margin: 0 }}>
                  Recibirás un código único. Preséntalo al empleado al llegar al salón para confirmar tu pago.
                </p>
              </div>
            )}

            <button onClick={handlePagar} disabled={procesandoPago} className="btn btn-g"
              style={{ width: '100%', fontSize: 17, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: procesandoPago ? 0.7 : 1 }}>
              {procesandoPago ? 'Procesando...' : metodoPago === 'Efectivo'
                ? <>🦁 Confirmar reserva (pago en salón)</>
                : <>🦁 Confirmar y Pagar S/ {precioFinal.toFixed(2)}</>
              }
            </button>
          </div>
        )}

        {/* ── BOLETA / CONFIRMACIÓN ── */}
        {boleta && boleta.metodoPago === 'Efectivo' ? (
          /* Pago efectivo pendiente */
          <div className="card-chunky anim-pop-in" style={{ padding: 32, borderColor: 'var(--yellow)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 52, marginBottom: 8 }} className="float">💰</div>
              <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: '#b38600', margin: 0 }}>¡Reserva creada!</h2>
              <p style={{ color: '#666', fontSize: 14, marginTop: 6 }}>Paga en efectivo al llegar al salón</p>
            </div>

            {/* Código de reserva */}
            <div style={{ background: '#fff8e1', border: '4px solid var(--yellow)', borderRadius: 20, boxShadow: '6px 6px 0 var(--ink)', padding: '24px 32px', marginBottom: 24, textAlign: 'center' }}>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, marginTop: 0 }}>
                Tu código de reserva
              </p>
              <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 34, color: 'var(--ink)', margin: '0 0 8px', letterSpacing: 4 }}>
                {boleta.codigoReserva ?? reservaCreada?.codigoReserva}
              </p>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#888', margin: 0 }}>
                Muestra este código al empleado para confirmar tu pago
              </p>
            </div>

            {/* Resumen */}
            <div style={{ background: '#f9f9f9', border: '2px dashed var(--ink)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
              {[
                ['Servicio',      boleta.servicio],
                ['Fecha',         boleta.fechaReserva],
                ['Hora',          boleta.hora],
                ['Local',         boleta.local],
                ['Total a pagar', `S/ ${Number(boleta.montoTotal ?? 0).toFixed(2)}`],
              ].filter(([,v]) => v).map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontSize: 13, color: '#666', fontFamily: "'Poppins',sans-serif" }}>{l}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: "'Poppins',sans-serif" }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => window.print()} className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <LuPrinter size={16} /> Imprimir
              </button>
              <button onClick={() => navigate('/mi-cuenta/reservas')} className="btn btn-g" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <LuCircleCheck size={18} /> Ver mis reservas
              </button>
            </div>
          </div>
        ) : boleta ? (
          /* Pago exitoso (tarjeta/simulado) */
          <div className="card-chunky anim-pop-in" style={{ padding: 32, borderColor: 'var(--green)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 52, marginBottom: 8 }} className="anim-heartbeat">🎉</div>
              <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: 'var(--green)', margin: 0 }}>¡Pago exitoso!</h2>
              <p style={{ color: '#666', fontSize: 14, marginTop: 6 }}>Tu reserva ha sido confirmada</p>
            </div>

            <div style={{ background: '#f9f9f9', border: '3px dashed var(--ink)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'var(--ink)' }}>🧾 BOLETA</span>
                <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#888', fontWeight: 700 }}>{boleta.numeroBoleta}</span>
              </div>
              {[
                ['Cliente',     boleta.cliente],
                ['Servicio',    boleta.servicio],
                ['Fecha',       boleta.fechaReserva],
                ['Hora',        boleta.hora],
                ['Local',       boleta.local],
                ['Método pago', boleta.metodoPago],
                ['Referencia',  boleta.referencia],
              ].filter(([,v]) => v).map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontSize: 13, color: '#666', fontFamily: "'Poppins',sans-serif" }}>{l}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: "'Poppins',sans-serif" }}>{v}</span>
                </div>
              ))}
              {boleta.promoAplicada && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontSize: 13, color: '#2E7D32', fontFamily: "'Poppins',sans-serif" }}>Descuento</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#c62828' }}>-S/ {Number(boleta.descuento ?? 0).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, marginTop: 6 }}>
                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: 'var(--green)' }}>Total pagado</span>
                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: 'var(--green)' }}>S/ {Number(boleta.montoTotal ?? 0).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => window.print()} className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <LuPrinter size={16} /> Imprimir
              </button>
              <button onClick={() => navigate('/mi-cuenta/reservas')} className="btn btn-g" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <LuCircleCheck size={18} /> Ver mis reservas
              </button>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  )
}
