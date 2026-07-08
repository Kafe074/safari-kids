import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservasApi } from '../../api/reservas'
import { empleadosApi } from '../../api/empleados'
import toast from 'react-hot-toast'
import {
  LuPlus, LuPencil, LuTrash2, LuSearch, LuCalendar, LuFilter, LuX, LuCircleCheck,
} from 'react-icons/lu'

import { SUCURSALES } from '../../constants/sucursales'
import ReservaPresencialModal from '../../components/ReservaPresencialModal'

const ESTADO_COLORS = { Pendiente: 'warn', Confirmado: 'ok', Cancelado: 'err' }
const ESTADOS = ['Todos', 'Pendiente', 'Confirmado', 'Cancelado']

function getNombreCliente(r) {
  const u = r?.cliente?.usuario
  if (!u) return '—'
  return `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || '—'
}

function getNombreEmpleado(r) {
  const u = r?.empleado?.usuario
  if (!u) return '—'
  return `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || '—'
}

export default function ReservasPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [presencial, setPresencial] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterEstado, setFilterEstado] = useState('Todos')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['reservas'],
    queryFn: () => reservasApi.getAll().then(r => r.data.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: id => reservasApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['reservas']); toast.success('Reserva eliminada') },
    onError: () => toast.error('Error al eliminar'),
  })

  const openEdit = row => { setEditing(row); setModal(true) }
  const closeModal = () => setModal(false)

  const filtered = (data ?? []).filter(r => {
    const matchEstado = filterEstado === 'Todos' || r.estado === filterEstado
    const q = search.toLowerCase()
    const nombre = getNombreCliente(r).toLowerCase()
    const nombreEmpleado = getNombreEmpleado(r).toLowerCase()
    const matchSearch = !q || String(r.idReserva ?? '').includes(q)
      || String(r.fechaReserva ?? '').toLowerCase().includes(q)
      || String(r.observaciones ?? '').toLowerCase().includes(q)
      || String(r.local ?? '').toLowerCase().includes(q)
      || nombre.includes(q)
      || nombreEmpleado.includes(q)
    return matchEstado && matchSearch
  })

  return (
    <div style={{ padding: '32px 28px', minHeight: '100vh', background: '#F8FDF8' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 32 }}>
        <span className="section-tag" style={{ color: 'var(--green)', borderColor: 'var(--green)', background: '#e8f5e9', transform: 'rotate(-1.5deg)' }}>
          Admin
        </span>
        <h1 className="section-title" style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginTop: 14, marginBottom: 6 }}>
          Gestión de Reservas
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: '#666', fontWeight: 400 }}>
            Administra todas las reservas del salón
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-g" style={{ padding: '10px 22px', fontSize: 15, gap: 8 }} onClick={() => setPresencial(true)}>
              <LuPlus size={18} /> Nueva Reserva
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter / Search bar ── */}
      <div className="card-chunky" style={{ padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <LuSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
          <input className="inp" placeholder="Buscar por cliente, encargado, fecha, local..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <LuFilter size={15} style={{ color: '#888' }} />
          {ESTADOS.map(e => (
            <button key={e} onClick={() => setFilterEstado(e)} style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 13, fontFamily: "'Poppins', sans-serif",
              fontWeight: 700, border: '2px solid var(--ink)', cursor: 'pointer', transition: 'all .15s',
              background: filterEstado === e ? 'var(--ink)' : '#fff',
              color: filterEstado === e ? '#fff' : 'var(--ink)',
            }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="card-chunky" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 64, textAlign: 'center', color: '#aaa' }}>
            <LuCalendar size={40} style={{ marginBottom: 12, opacity: .4 }} />
            <p style={{ fontFamily: "'Poppins', sans-serif" }}>Cargando reservas...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: '#aaa' }}>
            <LuCalendar size={40} style={{ marginBottom: 12, opacity: .4 }} />
            <p style={{ fontFamily: "'Poppins', sans-serif" }}>No se encontraron reservas</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Encargado</th>
                  <th>Fecha</th>
                  <th>Sucursal</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{ fontFamily: "'Fredoka One', cursive", fontWeight: 700, color: 'var(--green)' }}>
                        #{r.idReserva}
                      </span>
                    </td>
                    <td style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                      {getNombreCliente(r)}
                    </td>
                    <td style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {getNombreEmpleado(r)}
                    </td>
                    <td style={{ fontFamily: "'Poppins', sans-serif" }}>{r.fechaReserva ?? '—'}</td>
                    <td style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13 }}>
                      {r.local ? (
                        <span style={{ background: '#e8f5e9', color: '#1b5e20', borderRadius: 8, padding: '3px 10px', fontWeight: 600, fontSize: 12 }}>
                          {r.local}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${ESTADO_COLORS[r.estado] ?? 'info'}`}>{r.estado}</span>
                    </td>
                    <td style={{ fontFamily: "'Poppins', sans-serif", color: '#666', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.observaciones ?? '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }} onClick={() => openEdit(r)}>
                          <LuPencil size={13} /> Editar
                        </button>
                        <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }}
                          onClick={() => { if (confirm('¿Eliminar esta reserva?')) deleteMut.mutate(r.idReserva) }}>
                          <LuTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '10px 16px', background: '#fafafa', borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#aaa', fontFamily: "'Poppins', sans-serif" }}>
          {filtered.length} reserva(s){search || filterEstado !== 'Todos' ? ' (filtradas)' : ''}
        </div>
      </div>

      {/* ── Modal nueva reserva (búsqueda por DNI, servicio, fecha/hora, sede, estilista, asiento) ── */}
      {presencial && (
        <ReservaPresencialModal
          onClose={() => setPresencial(false)}
          onSaved={() => qc.invalidateQueries(['reservas'])}
        />
      )}

      {/* ── Modal editar reserva ── */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal-box" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LuCalendar size={20} color="var(--green)" />
                Editar Reserva
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center' }}>
                <LuX size={22} />
              </button>
            </div>
            <div style={{ padding: '20px 28px 28px' }}>
              <ReservaForm initial={editing} onClose={closeModal}
                onSaved={() => { qc.invalidateQueries(['reservas']); closeModal() }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ReservaForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    fechaReserva:  initial?.fechaReserva  ?? '',
    local:         initial?.local         ?? '',
    estado:        initial?.estado        ?? 'Pendiente',
    observaciones: initial?.observaciones ?? '',
    idEmpleado:    initial?.empleado?.idEmpleado ?? '',
  })
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const { data: empleados = [] } = useQuery({
    queryKey: ['empleados-activos'],
    queryFn: () => empleadosApi.getAll().then(r => (r.data.data ?? []).filter(e => e.estado === 'Activo')),
  })

  const handleSave = async () => {
    try {
      const payload = { ...form, idEmpleado: form.idEmpleado ? Number(form.idEmpleado) : null }
      await reservasApi.update(initial.idReserva, payload)
      toast.success('Reserva actualizada')
      onSaved()
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label className="inp-label">Fecha de Reserva</label>
        <input type="date" className="inp" value={form.fechaReserva} onChange={f('fechaReserva')} />
      </div>
      <div>
        <label className="inp-label">Sucursal</label>
        <select className="inp" value={form.local} onChange={f('local')}>
          <option value="">— Sin asignar —</option>
          {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="inp-label">Encargado (estilista)</label>
        <select className="inp" value={form.idEmpleado} onChange={f('idEmpleado')}>
          <option value="">— Sin cambio —</option>
          {empleados.map(e => {
            const u = e.usuario
            const nombre = u ? `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() : `Empleado #${e.idEmpleado}`
            return <option key={e.idEmpleado} value={e.idEmpleado}>{nombre}{e.especialidad ? ` · ${e.especialidad}` : ''}</option>
          })}
        </select>
      </div>
      <div>
        <label className="inp-label">Estado</label>
        <select className="inp" value={form.estado} onChange={f('estado')}>
          {['Pendiente', 'Confirmado', 'Cancelado'].map(e => <option key={e}>{e}</option>)}
        </select>
      </div>
      <div>
        <label className="inp-label">Observaciones</label>
        <textarea className="inp" rows={3} value={form.observaciones} onChange={f('observaciones')} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ flex: 2, gap: 8 }} onClick={handleSave}>
          <LuCircleCheck size={16} /> Guardar reserva
        </button>
      </div>
    </div>
  )
}
