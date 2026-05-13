import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesApi } from '../../api/clientes'
import toast from 'react-hot-toast'
import {
  LuPlus, LuPencil, LuTrash2, LuSearch, LuUsers, LuCircleCheck, LuX,
} from 'react-icons/lu'

export default function ClientesPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesApi.getAll().then(r => r.data.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: id => clientesApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['clientes']); toast.success('Cliente eliminado') },
    onError: () => toast.error('Error al eliminar'),
  })

  const openNew = () => { setEditing(null); setModal(true) }
  const openEdit = row => { setEditing(row); setModal(true) }
  const closeModal = () => setModal(false)

  const total = (data ?? []).length

  const filtered = (data ?? []).filter(r => {
    const q = search.toLowerCase()
    return !q
      || String(r.idCliente ?? '').includes(q)
      || String(r.telefono ?? '').toLowerCase().includes(q)
      || String(r.direccion ?? '').toLowerCase().includes(q)
  })

  return (
    <div style={{ padding: '32px 28px', minHeight: '100vh', background: '#F8FDF8' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 32 }}>
        <span className="section-tag" style={{ color: 'var(--pink)', borderColor: 'var(--pink)', background: '#fff0f6', transform: 'rotate(-1.5deg)' }}>
          Clientes
        </span>
        <h1 className="section-title" style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginTop: 14, marginBottom: 6 }}>
          Gestión de Clientes
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: '#666', fontWeight: 400 }}>
            {total} cliente{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
          </p>
          <button
            className="btn btn-p"
            style={{ padding: '10px 22px', fontSize: 15, gap: 8 }}
            onClick={openNew}
          >
            <LuPlus size={18} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* ── Stat card ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff0f6' }}>
            <LuUsers size={26} color="var(--pink)" />
          </div>
          <div>
            <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 32, color: 'var(--ink)', lineHeight: 1 }}>{total}</p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: '#888', marginTop: 2 }}>Clientes totales</p>
          </div>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="card-chunky" style={{ padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <LuSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
          <input
            className="inp"
            placeholder="Buscar por teléfono, dirección..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="card-chunky" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 64, textAlign: 'center', color: '#aaa' }}>
            <LuUsers size={40} style={{ marginBottom: 12, opacity: .4 }} />
            <p style={{ fontFamily: "'Poppins', sans-serif" }}>Cargando clientes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: '#aaa' }}>
            <LuUsers size={40} style={{ marginBottom: 12, opacity: .4 }} />
            <p style={{ fontFamily: "'Poppins', sans-serif" }}>No se encontraron clientes</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Fecha Nac.</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{ fontFamily: "'Fredoka One', cursive", fontWeight: 700, color: 'var(--pink)' }}>
                        #{r.idCliente}
                      </span>
                    </td>
                    <td style={{ fontFamily: "'Poppins', sans-serif" }}>{r.telefono ?? '—'}</td>
                    <td style={{ fontFamily: "'Poppins', sans-serif", color: '#666' }}>{r.direccion ?? '—'}</td>
                    <td style={{ fontFamily: "'Poppins', sans-serif" }}>{r.fechaNacimiento ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 12px', fontSize: 12, gap: 5 }}
                          onClick={() => openEdit(r)}
                        >
                          <LuPencil size={13} /> Editar
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '5px 12px', fontSize: 12, gap: 5 }}
                          onClick={() => { if (confirm('¿Eliminar este cliente?')) deleteMut.mutate(r.idCliente) }}
                        >
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
          {filtered.length} cliente(s){search ? ' (filtrados)' : ''}
        </div>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal-box" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LuUsers size={20} color="var(--pink)" />
                {editing ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center' }}>
                <LuX size={22} />
              </button>
            </div>
            <div style={{ padding: '20px 28px 28px' }}>
              <ClienteForm
                initial={editing}
                onClose={closeModal}
                onSaved={() => { qc.invalidateQueries(['clientes']); closeModal() }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ClienteForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    telefono: initial?.telefono ?? '',
    direccion: initial?.direccion ?? '',
    fechaNacimiento: initial?.fechaNacimiento ?? '',
  })
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    try {
      if (initial) await clientesApi.update(initial.idCliente, form)
      else await clientesApi.create(form)
      toast.success(initial ? 'Cliente actualizado' : 'Cliente creado')
      onSaved()
    } catch { toast.error('Error al guardar') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label className="inp-label">Teléfono</label>
        <input className="inp" value={form.telefono} onChange={f('telefono')} placeholder="999 000 000" />
      </div>
      <div>
        <label className="inp-label">Dirección</label>
        <input className="inp" value={form.direccion} onChange={f('direccion')} placeholder="Av. ..." />
      </div>
      <div>
        <label className="inp-label">Fecha de Nacimiento</label>
        <input type="date" className="inp" value={form.fechaNacimiento} onChange={f('fechaNacimiento')} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-primary" style={{ flex: 2, gap: 8 }} onClick={handleSave}>
          <LuCircleCheck size={16} /> Guardar
        </button>
      </div>
    </div>
  )
}
