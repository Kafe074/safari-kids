import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { inventarioApi } from '../../api/inventario'
import { productosApi }  from '../../api/productos'
import PageHeader  from '../../components/common/PageHeader'
import Modal       from '../../components/common/Modal'
import toast from 'react-hot-toast'
import { SUCURSALES } from '../../constants/sucursales'
import {
  LuBox, LuCircleCheck, LuTriangleAlert, LuMapPin, LuPlus, LuPencil, LuTrash2, LuX,
} from 'react-icons/lu'

const TABS = ['Todas', ...SUCURSALES.map(s => s.split('–')[0].trim())]
const TAB_COLORS = ['#2E7D32', '#1d4ed8', '#7E22CE', '#b45309']

export default function InventarioPage() {
  const qc = useQueryClient()
  const [tab, setTab]       = useState(0)           // 0 = Todas, 1-3 = sucursales
  const [modal, setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [modalProd, setModalProd] = useState(false)

  const { data: invData = [], isLoading } = useQuery({
    queryKey: ['inventario'],
    queryFn:  () => inventarioApi.getAll().then(r => r.data.data ?? []),
  })

  // Filtrar por pestaña activa
  const filtered = tab === 0
    ? invData
    : invData.filter(i => {
        const tabName = SUCURSALES[tab - 1]
        return i.sucursal === tabName
      })

  const bajo = filtered.filter(i => i.stockActual <= (i.stockMinimo ?? 5))
  const ok   = filtered.filter(i => i.stockActual >  (i.stockMinimo ?? 5))

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este registro de inventario?')) return
    try {
      await inventarioApi.remove(id)
      qc.invalidateQueries(['inventario'])
      toast.success('Eliminado')
    } catch { toast.error('Error al eliminar') }
  }

  // Contar bajos por sucursal para badge
  const bajosPorSucursal = SUCURSALES.map(s =>
    invData.filter(i => i.sucursal === s && i.stockActual <= (i.stockMinimo ?? 5)).length
  )

  return (
    <div style={{ padding: '32px 28px', minHeight: '100vh', background: '#F8FDF8' }}>

      <PageHeader title="Inventario & Stock" subtitle="Control de stock por sucursal en tiempo real">
        <button className="btn btn-secondary" onClick={() => setModalProd(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LuBox size={15} /> Productos
        </button>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true) }}>
          + Nuevo registro
        </button>
      </PageHeader>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f7fa' }}><LuBox size={24} color="#00695c" /></div>
          <div>
            <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 30, color: 'var(--ink)', lineHeight: 1 }}>{filtered.length}</p>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#888', marginTop: 2 }}>
              {tab === 0 ? 'Total registros' : 'En esta sucursal'}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9' }}><LuCircleCheck size={24} color="var(--green)" /></div>
          <div>
            <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 30, color: 'var(--green)', lineHeight: 1 }}>{ok.length}</p>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#888', marginTop: 2 }}>Stock normal</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff8e1' }}><LuTriangleAlert size={24} color="#f59e0b" /></div>
          <div>
            <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 30, color: bajo.length > 0 ? '#c62828' : 'var(--ink)', lineHeight: 1 }}>{bajo.length}</p>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#888', marginTop: 2 }}>
              {bajo.length > 0 ? 'Requieren reposición' : 'Todo en orden'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs de sucursal */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map((label, i) => {
          const bajos = i === 0 ? invData.filter(x => x.stockActual <= (x.stockMinimo ?? 5)).length : bajosPorSucursal[i - 1]
          const active = tab === i
          const color  = TAB_COLORS[i]
          return (
            <button key={label} onClick={() => setTab(i)} style={{
              padding: '8px 18px', borderRadius: 999, fontSize: 13,
              fontFamily: "'Poppins',sans-serif", fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
              border: `2px solid ${active ? color : 'var(--ink)'}`,
              background: active ? color : '#fff',
              color: active ? '#fff' : 'var(--ink)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {i > 0 && <LuMapPin size={13} />}
              {label}
              {bajos > 0 && (
                <span style={{ background: active ? 'rgba(255,255,255,0.25)' : '#ffebee', color: active ? '#fff' : '#c62828', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>
                  {bajos} ⚠
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tabla */}
      <div className="card-chunky" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#aaa' }}>
            <LuBox size={40} style={{ opacity: .4, marginBottom: 12 }} />
            <p style={{ fontFamily: "'Poppins',sans-serif" }}>Cargando inventario...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#aaa' }}>
            <LuBox size={40} style={{ opacity: .4, marginBottom: 12 }} />
            <p style={{ fontFamily: "'Poppins',sans-serif" }}>
              {tab === 0 ? 'No hay registros de inventario.' : 'Sin stock registrado para esta sucursal.'}
            </p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditing(null); setModal(true) }}>
              <LuPlus size={14} style={{ marginRight: 6 }} /> Agregar stock
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Sucursal</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => {
                  const bajoBool = inv.stockActual <= (inv.stockMinimo ?? 5)
                  const suc = inv.sucursal
                  const sucIdx = SUCURSALES.findIndex(s => s === suc)
                  const sucColor = sucIdx >= 0 ? TAB_COLORS[sucIdx + 1] : '#888'
                  const sucLabel = suc ? suc.split('–')[0].trim() : null
                  return (
                    <tr key={i}>
                      <td><span style={{ fontFamily: "'Fredoka One',cursive", color: '#00695c' }}>#{inv.idInventario}</span></td>
                      <td style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700 }}>
                        {inv.producto?.nombre ?? '—'}
                        {inv.producto?.descripcion && (
                          <span style={{ display: 'block', fontSize: 11, color: '#aaa', fontWeight: 400 }}>{inv.producto.descripcion}</span>
                        )}
                      </td>
                      <td>
                        {sucLabel ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: sucColor + '18', color: sucColor, borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                            <LuMapPin size={11} /> {sucLabel}
                          </span>
                        ) : (
                          <span style={{ color: '#bbb', fontSize: 12 }}>General</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: bajoBool ? '#c62828' : '#2E7D32' }}>
                          {inv.stockActual}
                        </span>
                      </td>
                      <td style={{ fontFamily: "'Poppins',sans-serif", color: '#888' }}>{inv.stockMinimo ?? 5}</td>
                      <td style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#666' }}>{inv.ubicacion || '—'}</td>
                      <td>
                        {bajoBool
                          ? <span className="badge badge-err" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><LuTriangleAlert size={12} /> Stock bajo</span>
                          : <span className="badge badge-ok"  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><LuCircleCheck size={12} /> Normal</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }}
                            onClick={() => { setEditing(inv); setModal(true) }}>
                            <LuPencil size={13} /> Editar
                          </button>
                          <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 12 }}
                            onClick={() => handleDelete(inv.idInventario)}>
                            <LuTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '10px 16px', background: '#fafafa', borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#aaa', fontFamily: "'Poppins',sans-serif" }}>
          {filtered.length} registro(s){tab > 0 ? ` en ${SUCURSALES[tab - 1].split('–')[0].trim()}` : ''}
        </div>
      </div>

      {/* Modal ajuste de stock */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Stock' : 'Nuevo Registro de Stock'}>
        <AjusteForm
          initial={editing}
          defaultSucursal={tab > 0 ? SUCURSALES[tab - 1] : ''}
          onClose={() => setModal(false)}
          onSaved={() => { qc.invalidateQueries(['inventario']); setModal(false) }}
        />
      </Modal>

      {/* Modal productos */}
      <Modal open={modalProd} onClose={() => setModalProd(false)} title="Gestión de Productos" width={620}>
        <ProductosList />
      </Modal>
    </div>
  )
}

function AjusteForm({ initial, defaultSucursal, onClose, onSaved }) {
  const { data: productos = [] } = useQuery({
    queryKey: ['productos'],
    queryFn: () => productosApi.getAll().then(r => (r.data.data ?? []).filter(p => p.estado === 'Activo')),
  })

  const [form, setForm] = useState({
    idProducto:  initial?.producto?.idProducto ?? '',
    stockActual: initial?.stockActual ?? 0,
    stockMinimo: initial?.stockMinimo ?? 5,
    ubicacion:   initial?.ubicacion   ?? '',
    sucursal:    initial?.sucursal    ?? defaultSucursal ?? '',
  })
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    if (!initial && !form.idProducto) { toast.error('Selecciona un producto'); return }
    try {
      const payload = {
        ...form,
        idProducto:  Number(form.idProducto),
        stockActual: Number(form.stockActual),
        stockMinimo: Number(form.stockMinimo),
        sucursal:    form.sucursal || null,
      }
      if (initial) await inventarioApi.update(initial.idInventario, payload)
      else         await inventarioApi.create(payload)
      toast.success(initial ? 'Stock actualizado' : 'Registro creado')
      onSaved()
    } catch { toast.error('Error al guardar') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!initial && (
        <div>
          <label className="inp-label">Producto *</label>
          <select className="inp" value={form.idProducto} onChange={f('idProducto')}>
            <option value="">Seleccionar producto...</option>
            {productos.map(p => <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>)}
          </select>
        </div>
      )}
      {initial && (
        <div style={{ background: '#f9f9f9', borderRadius: 10, padding: '10px 14px', border: '2px solid #e0e0e0' }}>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
            {initial.producto?.nombre}
          </p>
        </div>
      )}
      <div>
        <label className="inp-label">Sucursal</label>
        <select className="inp" value={form.sucursal} onChange={f('sucursal')}>
          <option value="">— Stock general (sin sucursal) —</option>
          {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="inp-label">Stock Actual</label>
          <input type="number" min="0" className="inp" value={form.stockActual} onChange={f('stockActual')} />
        </div>
        <div>
          <label className="inp-label">Stock Mínimo</label>
          <input type="number" min="0" className="inp" value={form.stockMinimo} onChange={f('stockMinimo')} />
        </div>
      </div>
      <div>
        <label className="inp-label">Ubicación física</label>
        <input className="inp" value={form.ubicacion} onChange={f('ubicacion')} placeholder="Ej: Estante A / Vitrina 2" />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary"   style={{ flex: 2 }} onClick={handleSave}>
          <LuCircleCheck size={15} style={{ marginRight: 6 }} />
          {initial ? 'Guardar cambios' : 'Crear registro'}
        </button>
      </div>
    </div>
  )
}

function ProductosList() {
  const { data, isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: () => productosApi.getAll().then(r => r.data.data ?? []),
  })
  if (isLoading) return <p style={{ textAlign: 'center', padding: 24, color: '#aaa' }}>Cargando...</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(data ?? []).map(p => (
        <div key={p.idProducto} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fafafa', borderRadius: 10, border: '1px solid #f0f0f0' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#1a2e1a', margin: 0 }}>{p.nombre}</p>
            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{p.descripcion}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 800, color: '#2E7D32', fontSize: 15, margin: 0 }}>S/ {Number(p.precioVenta).toFixed(2)}</p>
            <span className={`badge ${p.estado === 'Activo' ? 'badge-ok' : 'badge-err'}`}>{p.estado}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
