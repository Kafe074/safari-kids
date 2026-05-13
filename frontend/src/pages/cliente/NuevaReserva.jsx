import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { reservasApi } from '../../api/reservas'
import { horariosApi } from '../../api/horarios'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  LuScissors, LuCalendar, LuClock, LuMapPin,
  LuStickyNote, LuCircleCheck, LuChevronLeft, LuChevronRight,
  LuTriangleAlert,
} from 'react-icons/lu'

const SUCURSALES = [
  'Sede Principal – Jr. Ayacucho 456',
  'El Tambo – Av. Ferrocarril 789',
  'Chilca – Calle Real 234',
]

/* ── Step indicator ─────────────────────────────────────────── */
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
              width: 56, height: 4,
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

/* ── Chunky input helper ─────────────────────────────────────── */
const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '3px solid var(--ink)',
  borderRadius: 12,
  fontSize: 15,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  background: 'var(--paper)',
  transition: 'box-shadow .15s',
}

/* ── Main component ──────────────────────────────────────────── */
export default function NuevaReserva() {
  const navigate     = useNavigate()
  const location     = useLocation()
  const { user }     = useAuth()
  const preSelected  = location.state?.servicio ?? ''

  const [step, setStep]   = useState(preSelected ? 2 : 1)
  const [form, setForm]   = useState({ servicio: null, fecha: '', horario: '', sucursal: '', notas: '' })
  const [loading, setLoading] = useState(false)

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

  const selServicio = (s) => { setForm(f => ({ ...f, servicio: s })); setStep(2) }

  const handleConfirm = async () => {
    if (!form.servicio || !form.fecha || !form.horario) {
      toast.error('Completa todos los campos')
      return
    }
    setLoading(true)
    try {
      await reservasApi.crear({
        fecha:         form.fecha,
        horaInicio:    form.horario,
        idServicio:    form.servicio.idServicio,
        observaciones: form.notas || `Sede: ${form.sucursal}`,
      })
      toast.success('🦁 ¡Reserva confirmada! Te esperamos en Safari Kids.', { duration: 4000 })
      setTimeout(() => navigate('/mi-cuenta/reservas'), 1500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear la reserva')
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = ['Elige tu servicio', 'Fecha y sede', 'Confirmar reserva']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', paddingTop: 100, paddingBottom: 60, fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '0 24px' }}>

        {/* Back button */}
        <button onClick={() => navigate('/mi-cuenta')} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'none', border:'3px solid var(--ink)', borderRadius:999, padding:'8px 16px', fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, cursor:'pointer', marginBottom:16, color:'var(--ink)' }}>
          <LuChevronLeft size={14} /> Mi Cuenta
        </button>

        {/* Hero header */}
        <div style={{
          background: 'linear-gradient(135deg,#1b5e20,#1B7A3E)',
          border: '4px solid var(--ink)',
          borderRadius: 24,
          boxShadow: '8px 8px 0 var(--ink)',
          padding: '28px 32px',
          marginBottom: 32,
          textAlign: 'center',
        }}>
          <h1 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 32, color: '#fff', margin: '0 0 4px' }}>
            Nueva Reserva 🦁
          </h1>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 14, margin: 0 }}>
            {stepTitles[step - 1]} · Paso {step} de 3
          </p>
        </div>

        <StepIndicator step={step} total={3} />

        {/* ── STEP 1 : Servicio ──────────────────────────────────── */}
        {step === 1 && (
          <div className="card-chunky" style={{ padding: 32 }}>
            <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>
              ¿Qué servicio deseas?
            </h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>
              Selecciona el servicio y te ayudamos con el resto
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {servicios.filter(s => s.estado === 'Disponible').map(s => {
                const selected = form.servicio?.idServicio === s.idServicio
                return (
                  <button
                    key={s.idServicio}
                    onClick={() => selServicio(s)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      padding: '20px 14px',
                      background: selected ? 'var(--yellow)' : '#fff',
                      border: `4px solid ${selected ? 'var(--pink)' : 'var(--ink)'}`,
                      borderRadius: 20,
                      boxShadow: selected ? '6px 6px 0 var(--ink)' : '4px 4px 0 var(--ink)',
                      cursor: 'pointer',
                      transition: 'all .18s',
                      fontFamily: 'inherit',
                      transform: selected ? 'translate(-2px,-2px)' : 'translate(0,0)',
                    }}
                    onMouseOver={e => {
                      if (!selected) {
                        e.currentTarget.style.transform = 'translate(-2px,-2px)'
                        e.currentTarget.style.boxShadow = '6px 6px 0 var(--ink)'
                      }
                    }}
                    onMouseOut={e => {
                      if (!selected) {
                        e.currentTarget.style.transform = 'translate(0,0)'
                        e.currentTarget.style.boxShadow = '4px 4px 0 var(--ink)'
                      }
                    }}
                  >
                    <span style={{ color: selected ? 'var(--ink)' : 'var(--green)', display: 'flex', alignItems: 'center' }}>
                      <LuScissors size={28} />
                    </span>
                    <span style={{
                      fontWeight: 800, fontSize: 12,
                      color: 'var(--ink)',
                      textAlign: 'center', lineHeight: 1.3,
                    }}>
                      {s.nombre}
                    </span>
                    <span style={{
                      fontFamily: "'Fredoka One',cursive",
                      fontSize: 18,
                      color: selected ? 'var(--ink)' : 'var(--green)',
                    }}>
                      S/ {Number(s.precio).toFixed(0)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2 : Fecha y sede ──────────────────────────────── */}
        {step === 2 && (
          <div className="card-chunky" style={{ padding: 32 }}>
            <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>
              Fecha y sede
            </h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>
              Elige cuándo y dónde quieres venir
            </p>

            {/* Selected service chip */}
            {form.servicio && (
              <div style={{
                background: '#e8f5e9', borderRadius: 14,
                border: '3px solid var(--green)',
                padding: '14px 18px', marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <LuScissors size={24} color="var(--green)" />
                <div>
                  <p style={{ fontWeight: 800, color: 'var(--ink)', margin: 0, fontSize: 14 }}>{form.servicio.nombre}</p>
                  <p style={{ color: 'var(--green)', fontSize: 12, margin: 0 }}>
                    S/ {Number(form.servicio.precio).toFixed(0)} ·{' '}
                    <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}>
                      Cambiar
                    </button>
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* Date */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--ink)', marginBottom: 10 }}>
                  <LuCalendar size={18} /> Fecha de visita
                </label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  style={inputStyle}
                  onFocus={e => e.target.style.boxShadow = '4px 4px 0 var(--ink)'}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
              </div>

              {/* Time slots */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--ink)', marginBottom: 10 }}>
                  <LuClock size={18} /> Horario disponible
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  {horarios.map(h => {
                    const label = h.horaInicio?.substring(0, 5)
                    const sel   = form.horario === label
                    return (
                      <button
                        key={h.idHorario}
                        onClick={() => setForm(f => ({ ...f, horario: label }))}
                        style={{
                          padding: '10px 6px',
                          borderRadius: 12,
                          border: `3px solid ${sel ? 'var(--pink)' : 'var(--ink)'}`,
                          background: sel ? 'var(--yellow)' : '#fff',
                          color: 'var(--ink)',
                          fontFamily: "'Fredoka One',cursive",
                          fontSize: 14,
                          cursor: 'pointer',
                          boxShadow: sel ? '4px 4px 0 var(--ink)' : '2px 2px 0 var(--ink)',
                          transition: 'all .15s',
                          transform: sel ? 'translate(-1px,-1px)' : 'none',
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Location */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--ink)', marginBottom: 10 }}>
                  <LuMapPin size={18} /> Sede
                </label>
                {SUCURSALES.map(s => {
                  const sel = form.sucursal === s
                  return (
                    <div
                      key={s}
                      onClick={() => setForm(f => ({ ...f, sucursal: s }))}
                      style={{
                        padding: '13px 16px', borderRadius: 14, marginBottom: 10,
                        cursor: 'pointer',
                        border: `3px solid ${sel ? 'var(--pink)' : 'var(--ink)'}`,
                        background: sel ? 'var(--yellow)' : '#fff',
                        boxShadow: sel ? '4px 4px 0 var(--ink)' : '2px 2px 0 var(--ink)',
                        display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'all .15s',
                        transform: sel ? 'translate(-2px,-2px)' : 'none',
                      }}
                    >
                      <LuMapPin size={18} color={sel ? 'var(--ink)' : 'var(--green)'} style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: sel ? 800 : 600, color: 'var(--ink)', fontSize: 13 }}>{s}</span>
                      {sel && <LuCircleCheck size={18} color="var(--ink)" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={() => setStep(1)} className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <LuChevronLeft size={18} /> Atrás
              </button>
              <button
                disabled={!form.fecha || !form.horario || !form.sucursal}
                onClick={() => setStep(3)}
                className="btn btn-g"
                style={{ flex: 2, opacity: (!form.fecha || !form.horario || !form.sucursal) ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                Siguiente <LuChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 : Confirm ──────────────────────────────────── */}
        {step === 3 && (
          <div className="card-chunky" style={{ padding: 32, borderColor: 'var(--yellow)' }}>
            <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>
              Confirma tu reserva
            </h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>
              Revisa los detalles antes de confirmar
            </p>

            {/* Summary card */}
            <div style={{
              background: 'linear-gradient(135deg,#e8f5e9,#f1f8f1)',
              border: '3px solid var(--ink)',
              borderRadius: 18,
              boxShadow: '4px 4px 0 var(--ink)',
              padding: 24,
              marginBottom: 24,
            }}>
              {[
                [<LuScissors   size={16} />, 'Servicio', form.servicio?.nombre],
                [<LuScissors   size={16} />, 'Precio',   `S/ ${Number(form.servicio?.precio || 0).toFixed(0)}`],
                [<LuCalendar   size={16} />, 'Fecha',    form.fecha],
                [<LuClock      size={16} />, 'Hora',     form.horario],
                [<LuMapPin     size={16} />, 'Sede',     form.sucursal],
              ].map(([ico, l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(27,122,62,.12)' }}>
                  <span style={{ color: '#666', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--green)', display: 'flex' }}>{ico}</span>
                    {l}
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--ink)', fontSize: 14 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 }}>
                <span style={{ fontFamily: "'Fredoka One',cursive", color: 'var(--green)', fontSize: 17 }}>Total a pagar</span>
                <span style={{ fontFamily: "'Fredoka One',cursive", color: 'var(--green)', fontSize: 26 }}>
                  S/ {Number(form.servicio?.precio || 0).toFixed(0)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--ink)', marginBottom: 10 }}>
                <LuStickyNote size={18} /> Notas adicionales (opcional)
              </label>
              <textarea
                value={form.notas}
                onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                placeholder="Ej: Mi hijo es alérgico a ciertos productos..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.boxShadow = '4px 4px 0 var(--ink)'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
            </div>

            {/* Warning */}
            <div style={{
              background: '#fff8e1',
              border: '3px solid var(--yellow)',
              borderRadius: 14,
              padding: '12px 16px',
              marginBottom: 24,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <LuTriangleAlert size={18} color="#b38600" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: '#7c5607', margin: 0, lineHeight: 1.6 }}>
                Al confirmar aceptas que la reserva puede cancelarse con hasta 2 horas de anticipación. El pago se realiza en el salón.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(2)} className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <LuChevronLeft size={18} /> Atrás
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="btn btn-g"
                style={{ flex: 2, fontSize: 16, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? 'Guardando...' : '🦁 ¡Confirmar mi reserva!'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
