import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { reservasApi } from '../api/reservas'
import { clientesApi } from '../api/clientes'
import { empleadosApi } from '../api/empleados'
import { serviciosApi } from '../api/servicios'
import { horariosApi } from '../api/horarios'
import { asientosApi } from '../api/asientos'
import { SUCURSALES } from '../constants/sucursales'
import { LuX, LuSearch, LuCircleCheck, LuUser } from 'react-icons/lu'

const nombreEstilista = (e) => {
  const u = e?.usuario
  if (!u) return 'Estilista'
  return `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || 'Estilista'
}

export default function ReservaPresencialModal({ onClose, onSaved }) {
  const hoy = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    dni: '', nombres: '', apellidos: '', telefono: '',
    idServicio: '', fecha: hoy, horaInicio: '', local: '',
    idEmpleado: '', idAsiento: '', observaciones: '',
  })
  const [buscando, setBuscando] = useState(false)
  const [clienteExistente, setClienteExistente] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [resultado, setResultado] = useState(null) // { codigoReserva, cuentaNueva }

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const { data: servicios = [] } = useQuery({
    queryKey: ['servicios-presencial'],
    queryFn: () => serviciosApi.getAll().then(r => (r.data.data ?? []).filter(s => s.estado === 'Disponible')),
  })
  const { data: horarios = [] } = useQuery({
    queryKey: ['horarios-presencial'],
    queryFn: () => horariosApi.getAll().then(r => (r.data.data ?? []).filter(h => h.estado === 'Disponible')),
  })
  const { data: asientos = [] } = useQuery({
    queryKey: ['asientos-presencial'],
    queryFn: () => asientosApi.getAll().then(r => (r.data.data ?? []).filter(a => a.estado === 'Disponible')),
  })
  const { data: estilistas = [] } = useQuery({
    queryKey: ['estilistas-presencial', form.local],
    queryFn: () => empleadosApi.disponibles(form.local).then(r => r.data.data ?? []),
    enabled: !!form.local,
  })

  const buscarPorDni = async () => {
    if (!/^\d{8}$/.test(form.dni)) { toast.error('El DNI debe tener 8 dígitos'); return }
    setBuscando(true)
    try {
      const res = await clientesApi.porDni(form.dni)
      const c = res.data.data
      const u = c?.usuario
      setClienteExistente(c)
      setForm(p => ({
        ...p,
        nombres: u?.nombres ?? p.nombres,
        apellidos: u?.apellidos ?? p.apellidos,
        telefono: c?.telefono ?? p.telefono,
      }))
      toast.success('Cliente encontrado: se usará su historial')
    } catch {
      setClienteExistente(null)
      toast('DNI no registrado — se creará una cuenta nueva', { icon: '🆕' })
    } finally { setBuscando(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^\d{8}$/.test(form.dni)) { toast.error('El DNI debe tener 8 dígitos'); return }
    if (!form.idServicio || !form.fecha || !form.horaInicio || !form.local) {
      toast.error('Completa servicio, fecha, hora y sede'); return
    }
    setGuardando(true)
    try {
      const res = await reservasApi.crearPresencial({
        dni: form.dni,
        nombres: form.nombres || null,
        apellidos: form.apellidos || null,
        telefono: form.telefono || null,
        fecha: form.fecha,
        horaInicio: form.horaInicio,
        idServicio: Number(form.idServicio),
        idAsiento: form.idAsiento ? Number(form.idAsiento) : null,
        idEmpleado: form.idEmpleado ? Number(form.idEmpleado) : null,
        local: form.local,
        observaciones: form.observaciones || null,
      })
      const data = res.data.data
      setResultado(data)
      toast.success('¡Reserva presencial creada!')
      onSaved?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear la reserva')
    } finally { setGuardando(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="card-chunky" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: 0, background: '#fff' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '3px solid #f0ebe2' }}>
          <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: 'var(--ink)', margin: 0 }}>
            🦁 Reserva presencial
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex' }}>
            <LuX size={22} />
          </button>
        </div>

        {resultado ? (
          /* ── Confirmación ── */
          <div style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
            <h4 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: 'var(--green)', margin: '0 0 6px' }}>¡Reserva creada!</h4>
            {resultado.cuentaNueva && (
              <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px' }}>
                Se creó una cuenta provisional. El cliente podrá registrarse luego en la web con el DNI <b>{resultado.dni}</b> para ver su historial.
              </p>
            )}
            <div style={{ background: '#fff8e1', border: '3px solid var(--yellow)', borderRadius: 16, padding: '18px 24px', margin: '12px 0 20px' }}>
              <p style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, margin: '0 0 6px' }}>Código de reserva</p>
              <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: 'var(--ink)', margin: 0, letterSpacing: 3 }}>{resultado.codigoReserva}</p>
            </div>
            <button onClick={onClose} className="btn btn-g" style={{ width: '100%' }}>
              <LuCircleCheck size={18} style={{ marginRight: 6 }} /> Listo
            </button>
          </div>
        ) : (
          /* ── Formulario ── */
          <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* DNI + buscar */}
            <div>
              <label className="inp-label">DNI del cliente</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="inp" inputMode="numeric" maxLength={8} placeholder="12345678" value={form.dni}
                  onChange={e => { setForm(p => ({ ...p, dni: e.target.value.replace(/\D/g, '').slice(0, 8) })); setClienteExistente(null) }}
                  style={{ flex: 1 }} />
                <button type="button" onClick={buscarPorDni} disabled={buscando} className="btn btn-secondary"
                  style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LuSearch size={15} /> {buscando ? '...' : 'Buscar'}
                </button>
              </div>
              {clienteExistente && (
                <p style={{ fontSize: 12, color: 'var(--green)', margin: '6px 2px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <LuUser size={13} /> Cliente registrado — se vinculará a su historial
                </p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="inp-label">Nombres</label>
                <input className="inp" placeholder="Juan" value={form.nombres} onChange={set('nombres')} />
              </div>
              <div>
                <label className="inp-label">Apellidos</label>
                <input className="inp" placeholder="Pérez" value={form.apellidos} onChange={set('apellidos')} />
              </div>
            </div>

            <div>
              <label className="inp-label">Teléfono <span style={{ color: '#bbb' }}>(opcional)</span></label>
              <input className="inp" placeholder="09XXXXXXXX" value={form.telefono} onChange={set('telefono')} />
            </div>

            <hr style={{ border: 'none', borderTop: '2px dashed #eee', margin: '4px 0' }} />

            <div>
              <label className="inp-label">Servicio</label>
              <select className="inp" value={form.idServicio} onChange={set('idServicio')}>
                <option value="">Selecciona un servicio…</option>
                {servicios.map(s => <option key={s.idServicio} value={s.idServicio}>{s.nombre} — S/ {Number(s.precio).toFixed(0)}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="inp-label">Fecha</label>
                <input type="date" className="inp" min={hoy} value={form.fecha}
                  onChange={e => setForm(p => ({ ...p, fecha: e.target.value, horaInicio: '' }))} />
              </div>
              <div>
                <label className="inp-label">Hora</label>
                <select className="inp" value={form.horaInicio} onChange={set('horaInicio')}>
                  <option value="">Hora…</option>
                  {horarios.map(h => {
                    const v = h.horaInicio?.substring(0, 5)
                    const past = form.fecha && new Date(`${form.fecha}T${v}:00`).getTime() <= Date.now()
                    return <option key={h.idHorario} value={v} disabled={past}>{v}{past ? ' (pasó)' : ''}</option>
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="inp-label">Sede</label>
              <select className="inp" value={form.local} onChange={e => setForm(p => ({ ...p, local: e.target.value, idEmpleado: '' }))}>
                <option value="">Selecciona una sede…</option>
                {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {form.local && (
              <div>
                <label className="inp-label">Estilista</label>
                <select className="inp" value={form.idEmpleado} onChange={set('idEmpleado')}>
                  <option value="">Cualquiera disponible</option>
                  {estilistas.map(e => <option key={e.idEmpleado} value={e.idEmpleado}>{nombreEstilista(e)}{e.especialidad ? ` · ${e.especialidad}` : ''}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="inp-label">Asiento <span style={{ color: '#bbb' }}>(opcional)</span></label>
              <select className="inp" value={form.idAsiento} onChange={set('idAsiento')}>
                <option value="">Auto-asignar</option>
                {asientos.map(a => <option key={a.idAsiento} value={a.idAsiento}>{a.nombre}{a.tipo ? ` · ${a.tipo}` : ''}</option>)}
              </select>
            </div>

            <div>
              <label className="inp-label">Observaciones <span style={{ color: '#bbb' }}>(opcional)</span></label>
              <textarea className="inp" rows={2} value={form.observaciones} onChange={set('observaciones')} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button type="submit" disabled={guardando} className="btn btn-g" style={{ flex: 2, opacity: guardando ? 0.7 : 1 }}>
                {guardando ? 'Creando…' : 'Crear reserva'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
