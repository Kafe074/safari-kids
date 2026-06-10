import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { insumosApi } from '../../../api/insumos'
import { solicitudesInsumosApi } from '../../../api/solicitudesInsumos'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  LuPackage, LuPlus, LuPencil, LuTrash2, LuCircleCheck, LuX, LuArrowLeft,
  LuTriangleAlert, LuClipboardList, LuClock, LuCircleX, LuTruck,
} from 'react-icons/lu'

const SOL_BADGE = {
  Pendiente: { bg: '#FFF8E1', color: '#B38600', border: '#FFC42E', label: 'Pendiente' },
  Aprobada:  { bg: '#E0F2FE', color: '#0369A1', border: '#38BDF8', label: 'Aprobada' },
  Entregada: { bg: '#E8F5E9', color: '#1B7A3E', border: '#33A957', label: 'Entregada' },
  Rechazada: { bg: '#FFEBEE', color: '#C62828', border: '#FF4F95', label: 'Rechazada' },
}

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

  const { data: solicitudes = [], isLoading: loadingSol } = useQuery({
    queryKey: ['solicitudes-insumos'],
    queryFn: () => solicitudesInsumosApi.getAll().then(r => r.data.data ?? []),
  })

  const estadoMut = useMutation({
    mutationFn: ({ id, estado }) => solicitudesInsumosApi.cambiarEstado(id, estado),
    onSuccess: (_, { estado }) => {
      qc.invalidateQueries(['solicitudes-insumos'])
      qc.invalidateQueries(['insumos'])
      toast.success(estado === 'Entregada' ? 'Kit entregado — stock descontado' : `Solicitud ${estado.toLowerCase()}`)
    },
    onError: err => toast.error(err.response?.data?.message || 'Error al actualizar'),
  })

  const pendientes = solicitudes.filter(s => s.estado === 'Pendiente').length
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

      {/* ── Solicitudes de empleados ── */}
      <div className="card-chunky" style={{ overflow: 'hidden', marginTop: 24 }}>
        <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg,#0F5527,#1B7A3E)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <LuClipboardList size={18} color="#FFC42E" /> Solicitudes de instrumentos
          </span>
          {pendientes > 0 && (
            <span style={{ background: '#FFC42E', color: '#2B1B00', border: '2px solid #2B1B00', borderRadius: 999, padding: '2px 12px', fontFamily: "'Fredoka One',cursive", fontSize: 13 }}>
              {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loadingSol ? (
          <div style={{ padding: 20 }}>
            {[...Array(3)].map((_, i) => <div key={i} className="skel" style={{ height: 54, marginBottom: 10, animationDelay: `${i * 0.1}s` }} />)}
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎒</span>
            <p>No hay solicitudes de empleados</p>
            <small>Cuando un empleado solicite su kit, aparecerá aquí</small>
          </div>
        ) : (
          <div className="stagger">
            {solicitudes.map(s => {
              const badge = SOL_BADGE[s.estado] ?? SOL_BADGE.Pendiente
              const emp = s.empleado?.usuario
                ? `${s.empleado.usuario.nombres ?? ''} ${s.empleado.usuario.apellidos ?? ''}`.trim()
                : `Empleado #${s.empleado?.idEmpleado ?? '?'}`
              return (
                <div key={s.idSolicitud} style={{ padding: '14px 20px', borderBottom: '2px solid #f5f0e8', display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 13, color: 'var(--ink)' }}>#{s.idSolicitud} · {emp}</span>
                      <span style={{ fontSize: 11.5, color: '#999', fontFamily: "'Poppins',sans-serif" }}>
                        {s.fechaSolicitud ? new Date(s.fechaSolicitud).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                      <span style={{ background: badge.bg, color: badge.color, border: `2px solid ${badge.border}`, borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 800 }}>
                        {badge.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(s.detalles ?? []).map(d => (
                        <span key={d.idDetalle} style={{ background: '#F6FBF6', border: '2px solid #DCE9DC', borderRadius: 999, padding: '2px 10px', fontSize: 11.5, fontWeight: 700, color: 'var(--ink)' }}>
                          {d.insumo?.nombre ?? d.producto?.nombre} × {d.cantidad}
                        </span>
                      ))}
                    </div>
                    {s.observaciones && (
                      <p style={{ fontSize: 11.5, color: '#999', margin: '6px 0 0', fontStyle: 'italic', fontFamily: "'Poppins',sans-serif" }}>"{s.observaciones}"</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                    {s.estado === 'Pendiente' && (
                      <>
                        <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }}
                          disabled={estadoMut.isPending}
                          onClick={() => estadoMut.mutate({ id: s.idSolicitud, estado: 'Aprobada' })}>
                          <LuCircleCheck size={13} /> Aprobar
                        </button>
                        <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }}
                          disabled={estadoMut.isPending}
                          onClick={() => estadoMut.mutate({ id: s.idSolicitud, estado: 'Rechazada' })}>
                          <LuCircleX size={13} /> Rechazar
                        </button>
                      </>
                    )}
                    {s.estado === 'Aprobada' && (
                      <button className="btn btn-yellow" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }}
                        disabled={estadoMut.isPending}
                        onClick={() => estadoMut.mutate({ id: s.idSolicitud, estado: 'Entregada' })}>
                        <LuTruck size={13} /> Marcar entregado
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
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
