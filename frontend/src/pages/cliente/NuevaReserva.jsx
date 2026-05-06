import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { reservasApi } from '../../api/reservas'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const HORARIOS = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30']
const SUCURSALES = ['Sede Principal – Jr. Ayacucho 456','El Tambo – Av. Ferrocarril 789','Chilca – Calle Real 234']

const EMOJI_MAP = { 'Corte':['✂️','💇'], 'Tinte':['🎨'], 'Lavado':['💆'], 'Tratamiento':['✨','🧴'], 'Peinado':['🌸','🎭'], 'Spa':['🧖'], 'Pack':['🌟','🎀'], 'Primera':['🎀'] }
function getEmoji(nombre) {
  for (const [k, emojis] of Object.entries(EMOJI_MAP)) if (nombre.includes(k)) return emojis[0]
  return '✂️'
}

function StepIndicator({ step, total }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, marginBottom:40 }}>
      {Array.from({length:total}).map((_,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center' }}>
          <div style={{
            width: i+1===step ? 44 : 36, height: i+1===step ? 44 : 36,
            borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:"'Fredoka One',cursive", fontSize: i+1===step ? 18 : 15,
            background: i+1 < step ? '#2E7D32' : i+1===step ? '#F9A825' : '#e0e0e0',
            color: i+1 <= step ? '#fff' : '#999',
            boxShadow: i+1===step ? '0 4px 12px rgba(249,168,37,.4)' : 'none',
            transition: 'all .3s', zIndex:1,
          }}>
            {i+1 < step ? '✓' : i+1}
          </div>
          {i < total-1 && <div style={{ width:60, height:3, background: i+1 < step ? '#2E7D32' : '#e0e0e0', transition:'background .3s' }} />}
        </div>
      ))}
    </div>
  )
}

export default function NuevaReserva() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const preSelected = location.state?.servicio ?? ''

  const [step, setStep]   = useState(preSelected ? 2 : 1)
  const [form, setForm]   = useState({ servicio: null, fecha:'', horario:'', sucursal:'', notas:'' })
  const [loading, setLoading] = useState(false)

  const { data: servicios = [] } = useQuery({
    queryKey: ['servicios-public'],
    queryFn: () => api.get('/servicios').then(r => r.data.data ?? []),
  })

  const selServicio = (s) => { setForm(f => ({...f, servicio: s})); setStep(2) }

  const handleConfirm = async () => {
    if (!form.servicio || !form.fecha || !form.horario) { toast.error('Completa todos los campos'); return }
    setLoading(true)
    try {
      await reservasApi.crear({
        fecha: form.fecha,
        horaInicio: form.horario,
        idServicio: form.servicio.idServicio,
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

  const stepTitles = ['Elige tu servicio','Fecha y sede','Confirmar reserva']

  return (
    <div style={{ minHeight:'100vh', background:'#f5f0e8', paddingTop:100, paddingBottom:60, fontFamily:"'Nunito',sans-serif" }}>
      <div style={{ maxWidth:640, margin:'0 auto', padding:'0 24px' }}>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:52, marginBottom:8 }} className="anim-roar">🦁</div>
          <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:30, color:'#1a2e1a', margin:'0 0 4px' }}>Nueva Reserva</h1>
          <p style={{ color:'#888', fontSize:14 }}>{stepTitles[step-1]} · Paso {step} de 3</p>
        </div>

        <StepIndicator step={step} total={3} />

        <div style={{ background:'#fff', borderRadius:28, padding:36, boxShadow:'0 8px 40px rgba(0,0,0,.08)', border:`3px solid ${step===3 ? '#F9A825':'transparent'}` }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:'#1a2e1a', marginBottom:6 }}>¿Qué servicio deseas? ✂️</h2>
              <p style={{ color:'#888', fontSize:13, marginBottom:24 }}>Selecciona el servicio y te ayudamos con el resto</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {servicios.filter(s => s.estado === 'Disponible').map(s => (
                  <button key={s.idServicio} onClick={() => selServicio(s)} style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                    padding:'18px 12px',
                    background: form.servicio?.idServicio === s.idServicio ? '#1b5e20' : '#f9fbf9',
                    border:`2.5px solid ${form.servicio?.idServicio === s.idServicio ? '#2E7D32':'#eee'}`,
                    borderRadius:16, cursor:'pointer', transition:'all .2s', fontFamily:'inherit',
                    transform: form.servicio?.idServicio === s.idServicio ? 'scale(1.03)':'scale(1)',
                  }}>
                    <span style={{ fontSize:28 }}>{getEmoji(s.nombre)}</span>
                    <span style={{ fontWeight:800, fontSize:12, color: form.servicio?.idServicio===s.idServicio?'#fff':'#1a2e1a', textAlign:'center', lineHeight:1.3 }}>{s.nombre}</span>
                    <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:16, color: form.servicio?.idServicio===s.idServicio?'#F9A825':'#2E7D32' }}>S/ {Number(s.precio).toFixed(0)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:'#1a2e1a', marginBottom:6 }}>Fecha y sede 🗓</h2>
              <p style={{ color:'#888', fontSize:13, marginBottom:24 }}>Elige cuándo y dónde quieres venir</p>

              {form.servicio && (
                <div style={{ background:'#e8f5e9', borderRadius:14, padding:'14px 18px', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:28 }}>{getEmoji(form.servicio.nombre)}</span>
                  <div>
                    <p style={{ fontWeight:800, color:'#1a2e1a', margin:0, fontSize:14 }}>{form.servicio.nombre}</p>
                    <p style={{ color:'#2E7D32', fontSize:12, margin:0 }}>S/ {Number(form.servicio.precio).toFixed(0)} · <button onClick={() => setStep(1)} style={{ background:'none', border:'none', color:'#2E7D32', cursor:'pointer', fontSize:12, fontWeight:700, padding:0, fontFamily:'inherit', textDecoration:'underline' }}>Cambiar</button></p>
                  </div>
                </div>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <div>
                  <label style={{ display:'block', fontFamily:"'Fredoka One',cursive", fontSize:14, color:'#555', marginBottom:8 }}>📅 Fecha de visita</label>
                  <input type="date" value={form.fecha} onChange={e => setForm(f => ({...f, fecha:e.target.value}))}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ width:'100%', padding:'12px 16px', border:'2px solid #e0e0e0', borderRadius:12, fontSize:15, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
                    onFocus={e => e.target.style.borderColor='#2E7D32'} onBlur={e => e.target.style.borderColor='#e0e0e0'} />
                </div>

                <div>
                  <label style={{ display:'block', fontFamily:"'Fredoka One',cursive", fontSize:14, color:'#555', marginBottom:8 }}>⏰ Horario disponible</label>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                    {HORARIOS.map(h => (
                      <button key={h} onClick={() => setForm(f => ({...f, horario:h}))} style={{
                        padding:'10px 6px', borderRadius:10, border:`2px solid ${form.horario===h?'#2E7D32':'#e0e0e0'}`,
                        background: form.horario===h ? '#2E7D32':'#fff',
                        color: form.horario===h ? '#fff':'#444',
                        fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', transition:'all .15s',
                      }}>{h}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display:'block', fontFamily:"'Fredoka One',cursive", fontSize:14, color:'#555', marginBottom:8 }}>📍 Sede</label>
                  {SUCURSALES.map(s => (
                    <div key={s} onClick={() => setForm(f => ({...f, sucursal:s}))} style={{
                      padding:'12px 16px', borderRadius:12, marginBottom:8, cursor:'pointer',
                      border:`2px solid ${form.sucursal===s?'#2E7D32':'#e0e0e0'}`,
                      background: form.sucursal===s ? '#e8f5e9':'#fff',
                      display:'flex', alignItems:'center', gap:10, transition:'all .15s',
                    }}>
                      <span style={{ fontSize:18 }}>📍</span>
                      <span style={{ fontWeight: form.sucursal===s?800:600, color: form.sucursal===s?'#1b5e20':'#444', fontSize:13 }}>{s}</span>
                      {form.sucursal===s && <span style={{ marginLeft:'auto', color:'#2E7D32', fontSize:18 }}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', gap:12, marginTop:24 }}>
                <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex:1 }}>← Atrás</button>
                <button disabled={!form.fecha||!form.horario||!form.sucursal} onClick={() => setStep(3)}
                  className="btn btn-primary" style={{ flex:2, opacity:(!form.fecha||!form.horario||!form.sucursal)?0.5:1 }}>Siguiente →</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:'#1a2e1a', marginBottom:6 }}>Confirma tu reserva ✓</h2>
              <p style={{ color:'#888', fontSize:13, marginBottom:24 }}>Revisa los detalles antes de confirmar</p>

              <div style={{ background:'linear-gradient(135deg,#e8f5e9,#f1f8f1)', borderRadius:20, padding:24, marginBottom:24 }}>
                {[
                  ['✂️ Servicio', form.servicio?.nombre],
                  ['💰 Precio',   `S/ ${Number(form.servicio?.precio || 0).toFixed(0)}`],
                  ['📅 Fecha',    form.fecha],
                  ['⏰ Hora',     form.horario],
                  ['📍 Sede',     form.sucursal],
                ].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(46,125,50,.1)' }}>
                    <span style={{ color:'#666', fontSize:13 }}>{l}</span>
                    <span style={{ fontWeight:800, color:'#1a2e1a', fontSize:14 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', padding:'14px 0 0' }}>
                  <span style={{ fontFamily:"'Fredoka One',cursive", color:'#2E7D32', fontSize:16 }}>Total a pagar</span>
                  <span style={{ fontFamily:"'Fredoka One',cursive", color:'#2E7D32', fontSize:22 }}>S/ {Number(form.servicio?.precio || 0).toFixed(0)}</span>
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontFamily:"'Fredoka One',cursive", fontSize:14, color:'#555', marginBottom:8 }}>📝 Notas adicionales (opcional)</label>
                <textarea value={form.notas} onChange={e => setForm(f => ({...f, notas:e.target.value}))}
                  placeholder="Ej: Mi hijo es alérgico a ciertos productos..."
                  rows={3} style={{ width:'100%', padding:'12px 16px', border:'2px solid #e0e0e0', borderRadius:12, fontSize:14, outline:'none', fontFamily:'inherit', resize:'vertical', boxSizing:'border-box' }}
                  onFocus={e => e.target.style.borderColor='#2E7D32'} onBlur={e => e.target.style.borderColor='#e0e0e0'} />
              </div>

              <div style={{ background:'#fff8e1', borderRadius:12, padding:'12px 16px', marginBottom:20, display:'flex', gap:10, alignItems:'flex-start' }}>
                <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
                <p style={{ fontSize:12, color:'#7c5607', margin:0, lineHeight:1.6 }}>
                  Al confirmar aceptas que la reserva puede cancelarse con hasta 2 horas de anticipación. El pago se realiza en el salón.
                </p>
              </div>

              <div style={{ display:'flex', gap:12 }}>
                <button onClick={() => setStep(2)} className="btn btn-secondary" style={{ flex:1 }}>← Atrás</button>
                <button onClick={handleConfirm} disabled={loading}
                  className="btn btn-primary" style={{ flex:2, fontSize:16, opacity:loading?0.7:1 }}>
                  {loading ? 'Guardando...' : '🦁 ¡Confirmar mi reserva!'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
