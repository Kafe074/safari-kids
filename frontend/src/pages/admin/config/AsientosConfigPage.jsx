import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { asientosApi } from '../../../api/asientos'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LuArmchair, LuPlus, LuPencil, LuTrash2, LuCircleCheck, LuX, LuArrowLeft } from 'react-icons/lu'

export default function AsientosConfigPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [modal, setModal]   = useState(false)
  const [editing, setEditing] = useState(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['asientos'],
    queryFn: () => asientosApi.getAll().then(r => r.data.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: id => asientosApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['asientos']); toast.success('Silla eliminada') },
    onError: () => toast.error('Error al eliminar'),
  })

  const disponibles = data.filter(a => a.estado === 'Disponible').length

  return (
    <div style={{ padding: '32px 28px', minHeight: '100vh', background: '#F8FDF8' }}>
      <button onClick={() => navigate('/admin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: '2px solid #ccc', borderRadius: 999, padding: '6px 14px', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', marginBottom: 24, color: '#666' }}>
        <LuArrowLeft size={14} /> Volver a Config
      </button>

      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title" style={{ fontSize: 'clamp(24px,3vw,38px)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <LuArmchair size={34} color="#0EA5E9" /> Gestión de Sillas
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#666', fontFamily: "'Poppins',sans-serif", fontSize: 14 }}>{disponibles} sillas disponibles de {data.length}</p>
          <button className="btn btn-g" style={{ gap: 8, background: 'linear-gradient(180deg,#38BDF8,#0EA5E9)', boxShadow: '0 6px 0 #0369a1', borderColor: '#0369a1' }} onClick={() => { setEditing(null); setModal(true) }}>
            <LuPlus size={16} /> Nueva Silla
          </button>
        </div>
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#aaa' }}><LuArmchair size={40} style={{ opacity: .4 }} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16 }}>
          {data.map(a => (
            <div key={a.idAsiento} className="card-chunky" style={{ padding: 20, borderColor: a.estado === 'Disponible' ? '#38BDF8' : '#f87171' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontSize: 36 }}>🦁</div>
                <span className={`badge ${a.estado === 'Disponible' ? 'badge-ok' : 'badge-err'}`}>{a.estado}</span>
              </div>
              <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: 'var(--ink)', margin: '0 0 4px' }}>{a.nombre ?? `Silla #${a.idAsiento}`}</h3>
              <p style={{ fontSize: 12, color: '#888', fontFamily: "'Poppins',sans-serif", margin: '0 0 12px' }}>{a.tipo ?? 'Temática'} · Cap: {a.capacidad ?? 1}</p>
              {a.descripcion && <p style={{ fontSize: 11, color: '#aaa', fontFamily: "'Poppins',sans-serif", margin: '0 0 12px' }}>{a.descripcion}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '5px 8px', fontSize: 11 }} onClick={() => { setEditing(a); setModal(true) }}>
                  <LuPencil size={12} /> Editar
                </button>
                <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 11 }}
                  onClick={() => { if (confirm('¿Eliminar?')) deleteMut.mutate(a.idAsiento) }}>
                  <LuTrash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: '#aaa' }}>
              <LuArmchair size={40} style={{ opacity: .4, marginBottom: 12 }} />
              <p style={{ fontFamily: "'Poppins',sans-serif" }}>No hay sillas. ¡Agrega la primera!</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div className="modal-box" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LuArmchair size={18} color="#0EA5E9" /> {editing ? 'Editar Silla' : 'Nueva Silla'}
              </h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><LuX size={22} /></button>
            </div>
            <div style={{ padding: '20px 28px 28px' }}>
              <AsientoForm initial={editing} onClose={() => setModal(false)}
                onSaved={() => { qc.invalidateQueries(['asientos']); setModal(false) }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AsientoForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre:      initial?.nombre      ?? '',
    tipo:        initial?.tipo        ?? 'Temática',
    descripcion: initial?.descripcion ?? '',
    capacidad:   initial?.capacidad   ?? 1,
    estado:      initial?.estado      ?? 'Disponible',
  })
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.nombre.trim()) { toast.error('El nombre es obligatorio'); return }
    try {
      if (initial) await asientosApi.update(initial.idAsiento, { ...form, capacidad: Number(form.capacidad) })
      else         await asientosApi.create({ ...form, capacidad: Number(form.capacidad) })
      toast.success('Silla guardada')
      onSaved()
    } catch { toast.error('Error al guardar') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label className="inp-label">Nombre *</label><input className="inp" value={form.nombre} onChange={f('nombre')} placeholder="Ej: Silla León" /></div>
        <div><label className="inp-label">Tipo</label><input className="inp" value={form.tipo} onChange={f('tipo')} placeholder="Temática" /></div>
      </div>
      <div><label className="inp-label">Descripción</label><input className="inp" value={form.descripcion} onChange={f('descripcion')} placeholder="Descripción opcional" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label className="inp-label">Capacidad</label><input type="number" min="1" className="inp" value={form.capacidad} onChange={f('capacidad')} /></div>
        <div><label className="inp-label">Estado</label>
          <select className="inp" value={form.estado} onChange={f('estado')}>
            <option value="Disponible">Disponible</option>
            <option value="Ocupado">Ocupado</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ flex: 2, gap: 8 }} onClick={handleSave}><LuCircleCheck size={16} /> Guardar</button>
      </div>
    </div>
  )
}
