import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productosApi } from '../../api/productos'
import { categoriasApi } from '../../api/categorias'
import { inventarioApi } from '../../api/inventario'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import StatCard from '../../components/common/StatCard'
import toast from 'react-hot-toast'
import { LuBox, LuCircleCheck, LuX, LuTag, LuTriangleAlert } from 'react-icons/lu'

export default function ProductosPage() {
  const qc = useQueryClient()
  const [modal, setModal]       = useState(false)
  const [modalCat, setModalCat] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [catFilter, setCatFilter] = useState('')

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: () => productosApi.getAll().then(r => r.data.data ?? []),
  })

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasApi.getAll().then(r => r.data.data ?? []),
  })

  const { data: inventarios = [] } = useQuery({
    queryKey: ['inventarios'],
    queryFn: () => inventarioApi.getAll().then(r => r.data.data ?? []),
  })

  // Map idProducto → inventario entry
  const stockMap = Object.fromEntries(inventarios.map(i => [i.producto?.idProducto, i]))

  const deleteMutation = useMutation({
    mutationFn: (id) => productosApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['productos']); toast.success('Producto eliminado') },
    onError:   () => toast.error('Error al eliminar'),
  })

  const activos   = productos.filter(p => p.estado === 'Activo')
  const inactivos = productos.filter(p => p.estado !== 'Activo')
  const filtered  = catFilter ? productos.filter(p => p.categoria?.idCategoria === Number(catFilter)) : productos

  const cols = [
    { key: 'idProducto', label: '#',
      render: v => <span style={{ fontWeight: 700, color: '#2E7D32' }}>#{v}</span> },
    { key: 'nombre', label: 'Producto',
      render: (v, row) => (
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{v}</p>
          {row.descripcion && <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{row.descripcion}</p>}
        </div>
      )},
    { key: 'categoria', label: 'Categoría',
      render: v => v
        ? <span style={{ background: '#e8f5e9', color: '#2E7D32', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{v.nombre}</span>
        : <span style={{ color: '#ccc' }}>—</span> },
    { key: 'precioVenta', label: 'Precio Venta',
      render: v => <span style={{ fontWeight: 800, color: '#1b5e20' }}>S/ {Number(v).toFixed(2)}</span> },
    { key: 'costo', label: 'Costo',
      render: v => v ? <span style={{ color: '#666' }}>S/ {Number(v).toFixed(2)}</span> : '—' },
    { key: 'estado', label: 'Estado',
      render: v => <span className={`badge ${v === 'Activo' ? 'badge-ok' : 'badge-err'}`}>{v}</span> },
    { key: 'idProducto', label: 'Stock',
      render: (id) => {
        const inv = stockMap[id]
        if (!inv) return <span style={{ color:'#ccc' }}>—</span>
        const low = inv.stockActual <= (inv.stockMinimo ?? 5)
        return (
          <span style={{ fontWeight:700, color: low ? '#e53935' : '#2E7D32', background: low ? '#ffebee' : '#e8f5e9', borderRadius:20, padding:'3px 10px', fontSize:12, display:'inline-flex', alignItems:'center', gap:4 }}>
            {inv.stockActual} ud{low ? <LuTriangleAlert size={11} /> : ''}
          </span>
        )
      }},
  ]

  const openNew  = () => { setEditing(null); setModal(true) }
  const openEdit = (row) => { setEditing(row); setModal(true) }
  const onSaved  = () => { qc.invalidateQueries(['productos']); qc.invalidateQueries(['inventarios']); setModal(false) }

  return (
    <div>
      <PageHeader title="Productos" subtitle="Gestión de productos y categorías">
        <button className="btn btn-secondary" onClick={() => setModalCat(true)} style={{display:'flex',alignItems:'center',gap:6}}>
          <LuTag size={15} /> Categorías
        </button>
        <button className="btn btn-primary"   onClick={openNew}>+ Nuevo Producto</button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={<LuBox size={22} />}         label="Total Productos" value={productos.length} bg="#e0f7fa" />
        <StatCard icon={<LuCircleCheck size={22} />} label="Activos"          value={activos.length}   bg="#e8f5e9" />
        <StatCard icon={<LuX size={22} />}           label="Inactivos"        value={inactivos.length} bg="#fce4ec" />
        <StatCard icon={<LuTag size={22} />}         label="Categorías"      value={categorias.length} bg="#f3e5f5" />
      </div>

      {/* Filtro por categoría */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setCatFilter('')}
          style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: !catFilter ? '#2E7D32' : '#fff', color: !catFilter ? '#fff' : '#2E7D32', borderColor: '#2E7D32' }}>
          Todas
        </button>
        {categorias.map(cat => (
          <button key={cat.idCategoria} onClick={() => setCatFilter(cat.idCategoria)}
            style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: catFilter === cat.idCategoria ? '#2E7D32' : '#fff',
              color: catFilter === cat.idCategoria ? '#fff' : '#2E7D32', borderColor: '#2E7D32' }}>
            {cat.nombre}
          </button>
        ))}
      </div>

      <DataTable
        columns={cols}
        data={filtered}
        loading={isLoading}
        searchKeys={['nombre', 'descripcion']}
        onEdit={openEdit}
        onDelete={row => { if (confirm(`¿Eliminar "${row.nombre}"?`)) deleteMutation.mutate(row.idProducto) }}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Producto' : 'Nuevo Producto'} width={560}>
        <ProductoForm initial={editing} categorias={categorias} stockMap={stockMap} onClose={() => setModal(false)} onSaved={onSaved} />
      </Modal>

      <Modal open={modalCat} onClose={() => setModalCat(false)} title="Gestión de Categorías" width={500}>
        <CategoriasManager categorias={categorias} onChanged={() => qc.invalidateQueries(['categorias'])} />
      </Modal>
    </div>
  )
}

function ProductoForm({ initial, categorias, stockMap, onClose, onSaved }) {
  const invEntry = initial ? stockMap[initial.idProducto] : null
  const [form, setForm] = useState({
    nombre:      initial?.nombre       ?? '',
    descripcion: initial?.descripcion  ?? '',
    precioVenta: initial?.precioVenta  ?? '',
    costo:       initial?.costo        ?? '',
    estado:      initial?.estado       ?? 'Activo',
    categoria:   initial?.categoria    ? { idCategoria: initial.categoria.idCategoria } : null,
    stock:       invEntry?.stockActual ?? 0,
    stockMinimo: invEntry?.stockMinimo ?? 5,
  })
  const [saving, setSaving] = useState(false)
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.precioVenta) { toast.error('Nombre y precio son obligatorios'); return }
    setSaving(true)
    try {
      const payload = {
        nombre: form.nombre, descripcion: form.descripcion,
        precioVenta: Number(form.precioVenta),
        costo: form.costo ? Number(form.costo) : null,
        estado: form.estado,
        categoria: form.categoria?.idCategoria ? { idCategoria: Number(form.categoria.idCategoria) } : null,
      }
      if (initial) {
        await productosApi.update(initial.idProducto, { ...payload, idProducto: initial.idProducto })
        if (invEntry) await inventarioApi.patchStock(invEntry.idInventario, Number(form.stock))
        else await inventarioApi.create({ idProducto: initial.idProducto, stockActual: Number(form.stock), stockMinimo: Number(form.stockMinimo) })
      } else {
        const res = await productosApi.create(payload)
        const newId = res.data?.data?.idProducto
        if (newId) await inventarioApi.create({ idProducto: newId, stockActual: Number(form.stock), stockMinimo: Number(form.stockMinimo) })
      }
      toast.success(initial ? 'Producto actualizado' : 'Producto creado')
      onSaved()
    } catch { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label className="inp-label">Nombre *</label>
        <input className="inp" value={form.nombre} onChange={f('nombre')} placeholder="Ej: Shampoo Infantil 400ml" />
      </div>
      <div>
        <label className="inp-label">Descripción</label>
        <input className="inp" value={form.descripcion} onChange={f('descripcion')} placeholder="Descripción del producto" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="inp-label">Precio Venta (S/) *</label>
          <input type="number" step="0.01" min="0" className="inp" value={form.precioVenta} onChange={f('precioVenta')} placeholder="0.00" />
        </div>
        <div>
          <label className="inp-label">Costo (S/)</label>
          <input type="number" step="0.01" min="0" className="inp" value={form.costo} onChange={f('costo')} placeholder="0.00" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="inp-label">Stock Actual</label>
          <input type="number" min="0" className="inp" value={form.stock} onChange={f('stock')} placeholder="0" />
        </div>
        <div>
          <label className="inp-label">Stock Mínimo</label>
          <input type="number" min="0" className="inp" value={form.stockMinimo} onChange={f('stockMinimo')} placeholder="5" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="inp-label">Categoría</label>
          <select className="inp" value={form.categoria?.idCategoria ?? ''}
            onChange={e => setForm(p => ({ ...p, categoria: e.target.value ? { idCategoria: e.target.value } : null }))}>
            <option value="">Sin categoría</option>
            {categorias.map(c => <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="inp-label">Estado</label>
          <select className="inp" value={form.estado} onChange={f('estado')}>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary"   style={{ flex: 2 }} onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : (initial ? 'Guardar cambios' : 'Crear producto')}
        </button>
      </div>
    </div>
  )
}

function CategoriasManager({ categorias, onChanged }) {
  const [nombre, setNombre]   = useState('')
  const [desc, setDesc]       = useState('')
  const [saving, setSaving]   = useState(false)

  const handleAdd = async () => {
    if (!nombre.trim()) { toast.error('Ingresa un nombre'); return }
    setSaving(true)
    try {
      await categoriasApi.create({ nombre, descripcion: desc })
      toast.success('Categoría creada')
      setNombre(''); setDesc('')
      onChanged()
    } catch { toast.error('Error al crear') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar categoría "${nombre}"?`)) return
    try {
      await categoriasApi.remove(id)
      toast.success('Categoría eliminada')
      onChanged()
    } catch { toast.error('Error al eliminar') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {categorias.map(cat => (
          <div key={cat.idCategoria} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px', background: '#fafafa', borderRadius: 10, border: '1px solid #f0f0f0' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{cat.nombre}</p>
              {cat.descripcion && <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{cat.descripcion}</p>}
            </div>
            <button onClick={() => handleDelete(cat.idCategoria, cat.nombre)}
              style={{ background: '#fce4ec', color: '#c62828', border: 'none', borderRadius: 8,
                padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
              Eliminar
            </button>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 13, color: '#333', marginBottom: 10 }}>Nueva categoría</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input className="inp" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre de categoría" />
          <input className="inp" value={desc}   onChange={e => setDesc(e.target.value)}   placeholder="Descripción (opcional)" />
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>
            {saving ? 'Creando...' : '+ Agregar categoría'}
          </button>
        </div>
      </div>
    </div>
  )
}
