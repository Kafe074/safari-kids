import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { horariosApi } from '../../../api/horarios'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LuClock, LuPlus, LuPencil, LuTrash2, LuCircleCheck, LuX, LuArrowLeft } from 'react-icons/lu'

export default function HorariosConfigPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [modal, setModal]   = useState(false)
  const [editing, setEditing] = useState(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['horarios'],
    queryFn: () => horariosApi.getAll().then(r => r.data.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: id => horariosApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['horarios']); toast.success('Horario eliminado') },
    onError: () => toast.error('Error al eliminar'),
  })

  const openNew  = () => { setEditing(null); setModal(true) }
  const openEdit = row => { setEditing(row); setModal(true) }

  const disponibles = data.filter(h => h.estado === 'Disponible').length

  return (
    <div style={{ padding: '32px 28px', minHeight: '100vh', background: '#F8FDF8' }}>
      <button onClick={() => navigate('/admin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: '2px solid #ccc', borderRadius: 999, padding: '6px 14px', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', marginBottom: 24, color: '#666' }}>
        <LuArrowLeft size={14} /> Volver a Config
      </button>

      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title" style={{ fontSize: 'clamp(24px,3vw,38px)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <LuClock size={34} color="#1B7A3E" /> Gestión de Horarios
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#666', fontFamily: "'Poppins',sans-serif", fontSize: 14 }}>{disponibles} horarios disponibles de {data.length}</p>
          <button className="btn btn-g" style={{ gap: 8 }} onClick={openNew}><LuPlus size={16} /> Nuevo Horario</button>
        </div>
      </div>

      <div className="card-chunky" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#aaa' }}><LuClock size={36} style={{ opacity: .4 }} /><p>Cargando...</p></div>
        ) : data.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#aaa' }}>
            <LuClock size={36} style={{ opacity: .4 }} />
            <p style={{ fontFamily: "'Poppins',sans-serif" }}>No hay horarios. Agrega el primero.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>#</th><th>Hora Inicio</th><th>Hora Fin</th><th>Estado</th><th style={{ textAlign: 'right' }}>Acciones</th></tr></thead>
              <tbody>
                {data.map((h, i) => (
                  <tr key={i}>
                    <td><span style={{ fontFamily: "'Fredoka One',cursive", color: '#1B7A3E' }}>#{h.idHorario}</span></td>
                    <td style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20 }}>{h.horaInicio?.substring(0,5)}</td>
                    <td style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20 }}>{h.horaFin?.substring(0,5)}</td>
                    <td><span className={`badge ${h.estado === 'Disponible' ? 'badge-ok' : 'badge-err'}`}>{h.estado}</span></td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }} onClick={() => openEdit(h)}><LuPencil size={13} /> Editar</button>
                        <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => { if (confirm('¿Eliminar?')) deleteMut.mutate(h.idHorario) }}><LuTrash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LuClock size={18} color="#1B7A3E" /> {editing ? 'Editar Horario' : 'Nuevo Horario'}
              </h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><LuX size={22} /></button>
            </div>
            <div style={{ padding: '20px 28px 28px' }}>
              <HorarioForm initial={editing} onClose={() => setModal(false)}
                onSaved={() => { qc.invalidateQueries(['horarios']); setModal(false) }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function HorarioForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    horaInicio: initial?.horaInicio?.substring(0,5) ?? '',
    horaFin:    initial?.horaFin?.substring(0,5)    ?? '',
    estado:     initial?.estado ?? 'Disponible',
  })
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.horaInicio || !form.horaFin) { toast.error('Las horas son obligatorias'); return }
    try {
      if (initial) await horariosApi.update(initial.idHorario, form)
      else         await horariosApi.create(form)
      toast.success('Horario guardado')
      onSaved()
    } catch { toast.error('Error al guardar') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label className="inp-label">Hora inicio *</label><input type="time" className="inp" value={form.horaInicio} onChange={f('horaInicio')} /></div>
        <div><label className="inp-label">Hora fin *</label><input type="time" className="inp" value={form.horaFin} onChange={f('horaFin')} /></div>
      </div>
      <div>
        <label className="inp-label">Estado</label>
        <select className="inp" value={form.estado} onChange={f('estado')}>
          <option value="Disponible">Disponible</option>
          <option value="No_disponible">No disponible</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ flex: 2, gap: 8 }} onClick={handleSave}><LuCircleCheck size={16} /> Guardar</button>
      </div>
    </div>
  )
}
