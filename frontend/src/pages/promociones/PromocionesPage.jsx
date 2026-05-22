import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { promocionesApi } from '../../api/promociones'
import toast from 'react-hot-toast'
import { LuPlus, LuPencil, LuTrash2, LuTag, LuCircleCheck, LuX, LuGlobe, LuKey, LuStar } from 'react-icons/lu'

const TIPO_ICONS = { Global: <LuGlobe size={14} />, Codigo: <LuKey size={14} />, PrimerServicio: <LuStar size={14} /> }
const TIPO_COLORS = { Global: '#3b82f6', Codigo: '#f59e0b', PrimerServicio: '#8b5cf6' }
const TIPO_BG    = { Global: '#eff6ff', Codigo: '#fffbeb', PrimerServicio: '#f5f3ff' }

export default function PromocionesPage() {
  const qc = useQueryClient()
  const [modal, setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterTipo, setFilterTipo] = useState('Todos')

  const { data = [], isLoading } = useQuery({
    queryKey: ['promociones'],
    queryFn: () => promocionesApi.getAll().then(r => r.data.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: id => promocionesApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['promociones']); toast.success('Promoción eliminada') },
    onError: () => toast.error('Error al eliminar'),
  })

  const openNew  = () => { setEditing(null); setModal(true) }
  const openEdit = row => { setEditing(row); setModal(true) }
  const closeModal = () => setModal(false)

  const filtered = data.filter(p => filterTipo === 'Todos' || p.tipo === filterTipo)
  const activas   = data.filter(p => p.estado === 'Activa').length

  return (
    <div style={{ padding: '32px 28px', minHeight: '100vh', background: '#F8FDF8' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <span className="section-tag" style={{ color: '#f59e0b', borderColor: '#f59e0b', background: '#fffbeb', transform: 'rotate(-1.5deg)' }}>
          Marketing
        </span>
        <h1 className="section-title" style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginTop: 14, marginBottom: 6 }}>
          Promociones & Descuentos
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: '#666', fontWeight: 400 }}>
            {activas} promoción{activas !== 1 ? 'es' : ''} activa{activas !== 1 ? 's' : ''}
          </p>
          <button className="btn btn-g" style={{ padding: '10px 22px', fontSize: 15, gap: 8, background: 'linear-gradient(180deg,#FDD835,#F9A825)', boxShadow: '0 6px 0 #e65100, 0 12px 24px rgba(249,168,37,.4)', borderColor: '#e65100', color: '#4e2600' }} onClick={openNew}>
            <LuPlus size={18} /> Nueva Promoción
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total',         value: data.length,                           bg: '#fff3e0', color: '#e65100' },
          { label: 'Activas',       value: activas,                               bg: '#e8f5e9', color: '#2E7D32' },
          { label: 'Globales',      value: data.filter(p=>p.tipo==='Global').length,     bg: '#eff6ff', color: '#1d4ed8' },
          { label: 'Código',        value: data.filter(p=>p.tipo==='Codigo').length,     bg: '#fffbeb', color: '#b45309' },
          { label: 'Primer Serv.', value: data.filter(p=>p.tipo==='PrimerServicio').length, bg: '#f5f3ff', color: '#6d28d9' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LuTag size={20} color={s.color} />
            </div>
            <div>
              <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#888', marginTop: 2 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tipo filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['Todos', 'Global', 'Codigo', 'PrimerServicio'].map(t => (
          <button key={t} onClick={() => setFilterTipo(t)} style={{
            padding: '6px 16px', borderRadius: 999, fontSize: 13, border: '2px solid var(--ink)',
            fontFamily: "'Poppins',sans-serif", fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
            background: filterTipo === t ? 'var(--ink)' : '#fff',
            color: filterTipo === t ? '#fff' : 'var(--ink)',
          }}>
            {t === 'PrimerServicio' ? 'Primer Servicio' : t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card-chunky" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 64, textAlign: 'center', color: '#aaa' }}>
            <LuTag size={40} style={{ marginBottom: 12, opacity: .4 }} />
            <p style={{ fontFamily: "'Poppins',sans-serif" }}>Cargando promociones...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: '#aaa' }}>
            <LuTag size={40} style={{ marginBottom: 12, opacity: .4 }} />
            <p style={{ fontFamily: "'Poppins',sans-serif" }}>No hay promociones. ¡Crea la primera!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Código</th>
                  <th>Descuento</th>
                  <th>Vigencia</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={i}>
                    <td><span style={{ fontFamily: "'Fredoka One',cursive", color: '#f59e0b' }}>#{p.idPromocion}</span></td>
                    <td style={{ fontWeight: 700, fontFamily: "'Poppins',sans-serif" }}>
                      {p.nombre}
                      {p.descripcion && <span style={{ display: 'block', fontSize: 11, color: '#888', fontWeight: 400 }}>{p.descripcion}</span>}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: TIPO_BG[p.tipo], color: TIPO_COLORS[p.tipo] }}>
                        {TIPO_ICONS[p.tipo]} {p.tipo === 'PrimerServicio' ? 'Primer Serv.' : p.tipo}
                      </span>
                    </td>
                    <td style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13 }}>
                      {p.codigo ? (
                        <span style={{ background: '#fff3e0', color: '#b45309', borderRadius: 8, padding: '3px 10px', fontWeight: 700, fontSize: 12 }}>
                          {p.codigo}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#2E7D32' }}>{p.descuento}%</span>
                    </td>
                    <td style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#666' }}>
                      {p.fechaInicio ?? '∞'} → {p.fechaFin ?? '∞'}
                    </td>
                    <td>
                      <span className={`badge ${p.estado === 'Activa' ? 'badge-ok' : 'badge-err'}`}>{p.estado}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }} onClick={() => openEdit(p)}>
                          <LuPencil size={13} /> Editar
                        </button>
                        <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }}
                          onClick={() => { if (confirm('¿Eliminar esta promoción?')) deleteMut.mutate(p.idPromocion) }}>
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
        <div style={{ padding: '10px 16px', background: '#fafafa', borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#aaa', fontFamily: "'Poppins',sans-serif" }}>
          {filtered.length} promoción(es)
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal-box" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LuTag size={20} color="#f59e0b" />
                {editing ? 'Editar Promoción' : 'Nueva Promoción'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><LuX size={22} /></button>
            </div>
            <div style={{ padding: '20px 28px 28px' }}>
              <PromocionForm initial={editing} onClose={closeModal}
                onSaved={() => { qc.invalidateQueries(['promociones']); closeModal() }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PromocionForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre:          initial?.nombre          ?? '',
    descripcion:     initial?.descripcion     ?? '',
    descuento:       initial?.descuento       ?? '',
    codigo:          initial?.codigo          ?? '',
    tipo:            initial?.tipo            ?? 'Global',
    primerServicio:  initial?.primerServicio  ?? false,
    primerProducto:  initial?.primerProducto  ?? false,
    fechaInicio:     initial?.fechaInicio     ?? '',
    fechaFin:        initial?.fechaFin        ?? '',
    estado:          initial?.estado          ?? 'Activa',
  })
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.nombre.trim()) { toast.error('El nombre es obligatorio'); return }
    if (!form.descuento || isNaN(Number(form.descuento))) { toast.error('El descuento debe ser un número'); return }
    const payload = {
      ...form,
      descuento:  Number(form.descuento),
      fechaInicio: form.fechaInicio || null,
      fechaFin:    form.fechaFin    || null,
      codigo:      form.tipo === 'Codigo' ? form.codigo.trim().toUpperCase() || null : null,
      primerServicio: form.tipo === 'PrimerServicio' ? true : form.primerServicio,
    }
    try {
      if (initial) await promocionesApi.update(initial.idPromocion, payload)
      else         await promocionesApi.create(payload)
      toast.success('Promoción guardada')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label className="inp-label">Nombre *</label>
        <input className="inp" value={form.nombre} onChange={f('nombre')} placeholder="Ej: Descuento 15% Fin de Semana" />
      </div>
      <div>
        <label className="inp-label">Descripción</label>
        <input className="inp" value={form.descripcion} onChange={f('descripcion')} placeholder="Descripción opcional" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="inp-label">Descuento (%) *</label>
          <input type="number" min="0" max="100" className="inp" value={form.descuento} onChange={f('descuento')} placeholder="15" />
        </div>
        <div>
          <label className="inp-label">Tipo de Promoción</label>
          <select className="inp" value={form.tipo} onChange={f('tipo')}>
            <option value="Global">Global (automática)</option>
            <option value="Codigo">Por Código</option>
            <option value="PrimerServicio">Primer Servicio</option>
          </select>
        </div>
      </div>

      {form.tipo === 'Codigo' && (
        <div>
          <label className="inp-label">Código Promocional</label>
          <input className="inp" value={form.codigo} onChange={e => setForm(p => ({ ...p, codigo: e.target.value.toUpperCase() }))}
            placeholder="Ej: SAFARI15" />
          <p style={{ fontSize: 11, color: '#888', marginTop: 4, fontFamily: "'Poppins',sans-serif" }}>
            El cliente deberá ingresar este código al pagar.
          </p>
        </div>
      )}

      {form.tipo === 'Global' && (
        <div style={{ background: '#eff6ff', border: '2px solid #93c5fd', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#1d4ed8' }}>
          💡 Esta promoción se aplicará automáticamente a todos los pagos dentro del periodo indicado.
        </div>
      )}

      {form.tipo === 'PrimerServicio' && (
        <div style={{ background: '#f5f3ff', border: '2px solid #c4b5fd', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#6d28d9' }}>
          ⭐ Se aplicará automáticamente cuando un cliente nuevo (sin reservas confirmadas previas) realice su primer pago.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="inp-label">Fecha inicio</label>
          <input type="date" className="inp" value={form.fechaInicio} onChange={f('fechaInicio')} />
        </div>
        <div>
          <label className="inp-label">Fecha fin</label>
          <input type="date" className="inp" value={form.fechaFin} onChange={f('fechaFin')} />
        </div>
      </div>
      <div>
        <label className="inp-label">Estado</label>
        <select className="inp" value={form.estado} onChange={f('estado')}>
          <option value="Activa">Activa</option>
          <option value="Inactiva">Inactiva</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ flex: 2, gap: 8 }} onClick={handleSave}>
          <LuCircleCheck size={16} /> Guardar Promoción
        </button>
      </div>
    </div>
  )
}
