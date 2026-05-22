import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { insumosApi } from '../../../api/insumos'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LuPackage, LuPlus, LuPencil, LuTrash2, LuCircleCheck, LuX, LuArrowLeft, LuTriangleAlert } from 'react-icons/lu'

export default function InsumosConfigPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [modal, setModal]   = useState(false)
  const [editing, setEditing] = useState(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['insumos'],
    queryFn: () => insumosApi.getAll().then(r => r.data.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: id => insumosApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['insumos']); toast.success('Insumo eliminado') },
    onError: () => toast.error('Error al eliminar'),
  })

  const bajoStock = data.filter(i => (i.stock ?? 0) < 5).length

  return (
    <div style={{ padding: '32px 28px', minHeight: '100vh', background: '#F8FDF8' }}>
      <button onClick={() => navigate('/admin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: '2px solid #ccc', borderRadius: 999, padding: '6px 14px', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', marginBottom: 24, color: '#666' }}>
        <LuArrowLeft size={14} /> Volver a Config
      </button>

      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title" style={{ fontSize: 'clamp(24px,3vw,38px)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <LuPackage size={34} color="#8B5CF6" /> Insumos del Salón
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#666', fontFamily: "'Poppins',sans-serif", fontSize: 14 }}>
            {data.length} insumo{data.length !== 1 ? 's' : ''}
            {bajoStock > 0 && <span style={{ color: '#c62828', fontWeight: 700 }}> · {bajoStock} con stock bajo</span>}
          </p>
          <button className="btn btn-g" style={{ gap: 8, background: 'linear-gradient(180deg,#C4B5FD,#A855F7)', boxShadow: '0 6px 0 #7E22CE', borderColor: '#7E22CE' }}
            onClick={() => { setEditing(null); setModal(true) }}>
            <LuPlus size={16} /> Nuevo Insumo
          </button>
        </div>
      </div>

      {bajoStock > 0 && (
        <div style={{ background: '#fff8e1', border: '2px solid #f59e0b', borderRadius: 14, padding: '12px 18px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <LuTriangleAlert size={18} color="#b45309" />
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#7c5607', fontWeight: 600 }}>
            {bajoStock} insumo{bajoStock !== 1 ? 's tienen' : ' tiene'} stock menor a 5 unidades. Considera reabastecer.
          </span>
        </div>
      )}

      <div className="card-chunky" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#aaa' }}><LuPackage size={40} style={{ opacity: .4 }} /></div>
        ) : data.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#aaa' }}>
            <LuPackage size={40} style={{ opacity: .4, marginBottom: 12 }} />
            <p style={{ fontFamily: "'Poppins',sans-serif" }}>No hay insumos registrados.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>#</th><th>Nombre</th><th>Unidad</th><th>Stock</th><th style={{ textAlign: 'right' }}>Acciones</th></tr></thead>
              <tbody>
                {data.map((ins, i) => (
                  <tr key={i}>
                    <td><span style={{ fontFamily: "'Fredoka One',cursive", color: '#8B5CF6' }}>#{ins.idInsumo}</span></td>
                    <td style={{ fontWeight: 700, fontFamily: "'Poppins',sans-serif" }}>{ins.nombre}</td>
                    <td style={{ fontFamily: "'Poppins',sans-serif", color: '#666' }}>{ins.unidadMedida ?? '—'}</td>
                    <td>
                      <span style={{
                        fontFamily: "'Fredoka One',cursive", fontSize: 18,
                        color: (ins.stock ?? 0) < 5 ? '#c62828' : '#2E7D32',
                      }}>
                        {ins.stock ?? 0}
                      </span>
                      {(ins.stock ?? 0) < 5 && <LuTriangleAlert size={14} color="#f59e0b" style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }} onClick={() => { setEditing(ins); setModal(true) }}><LuPencil size={13} /> Editar</button>
                        <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => { if (confirm('¿Eliminar?')) deleteMut.mutate(ins.idInsumo) }}><LuTrash2 size={13} /></button>
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
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LuPackage size={18} color="#8B5CF6" /> {editing ? 'Editar Insumo' : 'Nuevo Insumo'}
              </h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><LuX size={22} /></button>
            </div>
            <div style={{ padding: '20px 28px 28px' }}>
              <InsumoForm initial={editing} onClose={() => setModal(false)}
                onSaved={() => { qc.invalidateQueries(['insumos']); setModal(false) }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InsumoForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre:       initial?.nombre       ?? '',
    unidadMedida: initial?.unidadMedida ?? '',
    stock:        initial?.stock        ?? 0,
  })
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.nombre.trim()) { toast.error('El nombre es obligatorio'); return }
    try {
      const payload = { ...form, stock: Number(form.stock) }
      if (initial) await insumosApi.update(initial.idInsumo, payload)
      else         await insumosApi.create(payload)
      toast.success('Insumo guardado')
      onSaved()
    } catch { toast.error('Error al guardar') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div><label className="inp-label">Nombre *</label><input className="inp" value={form.nombre} onChange={f('nombre')} placeholder="Ej: Shampoo infantil" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label className="inp-label">Unidad de medida</label><input className="inp" value={form.unidadMedida} onChange={f('unidadMedida')} placeholder="ml, g, unid." /></div>
        <div><label className="inp-label">Stock actual</label><input type="number" min="0" className="inp" value={form.stock} onChange={f('stock')} /></div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ flex: 2, gap: 8 }} onClick={handleSave}><LuCircleCheck size={16} /> Guardar</button>
      </div>
    </div>
  )
}
