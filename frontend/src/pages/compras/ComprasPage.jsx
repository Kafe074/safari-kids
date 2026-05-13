import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { comprasApi } from '../../api/compras'
import { proveedoresApi } from '../../api/proveedores'
import { productosApi } from '../../api/productos'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import StatCard from '../../components/common/StatCard'
import toast from 'react-hot-toast'
import { LuStore, LuDollarSign, LuUsers, LuX, LuCircleCheck } from 'react-icons/lu'

export default function ComprasPage() {
  const qc = useQueryClient()
  const [tab, setTab]       = useState('compras')
  const [modal, setModal]   = useState(false)
  const [editing, setEditing] = useState(null)

  const { data: compras = [], isLoading: loadC } = useQuery({ queryKey:['compras'],     queryFn:()=>comprasApi.getAll().then(r=>r.data.data??[]) })
  const { data: provs   = [], isLoading: loadP } = useQuery({ queryKey:['proveedores'], queryFn:()=>proveedoresApi.getAll().then(r=>r.data.data??[]) })

  const deleteMut = useMutation({
    mutationFn: (id) => tab==='compras' ? comprasApi.remove(id) : proveedoresApi.remove(id),
    onSuccess: () => { qc.invalidateQueries([tab==='compras'?'compras':'proveedores']); toast.success('Eliminado') },
    onError:   () => toast.error('Error al eliminar'),
  })

  const totalCompras = compras.reduce((s, c) => s + Number(c.total ?? 0), 0)

  const colsCompras = [
    { key:'idCompra',    label:'#',         render:v=><span style={{fontWeight:700,color:'#4E342E'}}>#{v}</span> },
    { key:'fechaCompra', label:'Fecha',      render:v=>v ? new Date(v).toLocaleDateString('es-PE',{day:'2-digit',month:'short',year:'numeric'}) : '—' },
    { key:'proveedor',   label:'Proveedor',  render:v=><span style={{fontWeight:600}}>{v?.nombre ?? '—'}</span> },
    { key:'total',       label:'Total',      render:v=><span style={{fontWeight:800,color:'#2E7D32'}}>S/ {Number(v??0).toFixed(2)}</span> },
  ]

  const colsProvs = [
    { key:'idProveedor', label:'#',          render:v=><span style={{fontWeight:700,color:'#4E342E'}}>#{v}</span> },
    { key:'nombre',      label:'Empresa',    render:v=><span style={{fontWeight:700}}>{v}</span> },
    { key:'telefono',    label:'Teléfono' },
    { key:'correo',      label:'Correo' },
    { key:'direccion',   label:'Dirección' },
  ]

  return (
    <div>
      <PageHeader title="Compras & Proveedores" subtitle="Órdenes de compra y gestión de proveedores">
        <button className="btn btn-primary" onClick={()=>{setEditing(null);setModal(true)}}>
          + {tab==='compras'?'Nueva Compra':'Nuevo Proveedor'}
        </button>
      </PageHeader>

      {tab === 'compras' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:24}}>
          <StatCard icon={<LuStore size={22} />} label="Total Compras"   value={compras.length}       bg="#fff3e0" />
          <StatCard icon={<LuDollarSign size={22} />} label="Total Invertido" value={`S/ ${totalCompras.toFixed(2)}`} bg="#e8f5e9" />
          <StatCard icon={<LuUsers size={22} />} label="Proveedores"     value={provs.length}          bg="#e3f2fd" />
        </div>
      )}

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:20,background:'#f5f5f5',padding:4,borderRadius:12,width:'fit-content'}}>
        {[['compras','Compras'],['proveedores','Proveedores']].map(([key,label]) => (
          <button key={key} onClick={()=>setTab(key)} style={{
            padding:'8px 20px',borderRadius:9,border:'none',cursor:'pointer',fontFamily:'inherit',
            background:tab===key?'#fff':'transparent',color:tab===key?'#2E7D32':'#888',
            fontWeight:tab===key?700:500,fontSize:13,boxShadow:tab===key?'0 2px 6px rgba(0,0,0,.08)':'none',transition:'all .15s'
          }}>{label}</button>
        ))}
      </div>

      {tab === 'compras'
        ? <DataTable columns={colsCompras} data={compras} loading={loadC} searchKeys={['proveedor']}
            onDelete={row=>{ if(confirm('¿Eliminar esta compra?')) deleteMut.mutate(row.idCompra) }} />
        : <DataTable columns={colsProvs} data={provs} loading={loadP} searchKeys={['nombre','correo']}
            onEdit={row=>{setEditing(row);setModal(true)}}
            onDelete={row=>{ if(confirm('¿Eliminar este proveedor?')) deleteMut.mutate(row.idProveedor) }} />
      }

      <Modal open={modal} onClose={()=>setModal(false)}
        title={tab==='compras'?'Nueva Compra':(editing?'Editar Proveedor':'Nuevo Proveedor')}
        width={tab==='compras'?680:500}>
        {tab === 'compras'
          ? <CompraForm proveedores={provs} onClose={()=>setModal(false)} onSaved={()=>{qc.invalidateQueries(['compras']);qc.invalidateQueries(['inventarios']);setModal(false)}} />
          : <ProveedorForm initial={editing} onClose={()=>setModal(false)} onSaved={()=>{qc.invalidateQueries(['proveedores']);setModal(false)}} />
        }
      </Modal>
    </div>
  )
}

function CompraForm({ proveedores, onClose, onSaved }) {
  const { data: productos = [] } = useQuery({
    queryKey: ['productos'],
    queryFn: () => productosApi.getAll().then(r => (r.data.data ?? []).filter(p => p.estado === 'Activo')),
  })

  const [idProveedor, setIdProveedor] = useState('')
  const [items, setItems]             = useState([{ idProducto:'', cantidad:1, costoUnitario:'' }])
  const [saving, setSaving]           = useState(false)

  const addItem  = () => setItems(p => [...p, { idProducto:'', cantidad:1, costoUnitario:'' }])
  const removeItem = (i) => setItems(p => p.filter((_,idx) => idx !== i))
  const updateItem = (i, k, v) => setItems(p => p.map((it,idx) => idx===i ? {...it,[k]:v} : it))

  const total = items.reduce((s, it) => s + (Number(it.costoUnitario)||0) * (Number(it.cantidad)||0), 0)

  const handleSave = async () => {
    if (!idProveedor) { toast.error('Selecciona un proveedor'); return }
    const validItems = items.filter(i => i.idProducto && i.cantidad > 0 && i.costoUnitario)
    if (validItems.length === 0) { toast.error('Agrega al menos un producto'); return }
    setSaving(true)
    try {
      await comprasApi.create({
        idProveedor: Number(idProveedor),
        items: validItems.map(i => ({ idProducto: Number(i.idProducto), cantidad: Number(i.cantidad), costoUnitario: Number(i.costoUnitario) })),
      })
      toast.success('Compra registrada — inventario actualizado')
      onSaved()
    } catch { toast.error('Error al registrar la compra') }
    finally { setSaving(false) }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      {/* Proveedor */}
      <div>
        <label className="inp-label">Proveedor *</label>
        <select className="inp" value={idProveedor} onChange={e=>setIdProveedor(e.target.value)}>
          <option value="">Seleccionar proveedor...</option>
          {proveedores.map(p=><option key={p.idProveedor} value={p.idProveedor}>{p.nombre}</option>)}
        </select>
      </div>

      {/* Items */}
      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <label className="inp-label" style={{margin:0}}>Productos comprados *</label>
          <button type="button" onClick={addItem} style={{background:'#e8f5e9',color:'#2E7D32',border:'none',borderRadius:8,padding:'4px 12px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>+ Agregar</button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {items.map((it,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 80px 100px 36px',gap:8,alignItems:'center'}}>
              <select className="inp" style={{padding:'8px 10px'}} value={it.idProducto} onChange={e=>updateItem(i,'idProducto',e.target.value)}>
                <option value="">Producto...</option>
                {productos.map(p=><option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>)}
              </select>
              <input type="number" min="1" className="inp" style={{padding:'8px 10px'}} placeholder="Cant." value={it.cantidad} onChange={e=>updateItem(i,'cantidad',e.target.value)} />
              <input type="number" min="0" step="0.01" className="inp" style={{padding:'8px 10px'}} placeholder="Costo S/" value={it.costoUnitario} onChange={e=>updateItem(i,'costoUnitario',e.target.value)} />
              <button type="button" onClick={()=>removeItem(i)} disabled={items.length===1}
                style={{background:'#ffebee',color:'#c62828',border:'none',borderRadius:8,padding:'8px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:items.length===1?0.4:1}}>
                <LuX size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div style={{background:'#e8f5e9',borderRadius:12,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontWeight:700,color:'#555'}}>Total de la compra</span>
        <span style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:'#2E7D32'}}>S/ {total.toFixed(2)}</span>
      </div>

      <div style={{display:'flex',gap:10}}>
        <button className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{flex:2}} onClick={handleSave} disabled={saving}>
          {saving ? 'Registrando...' : (
            <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
              <LuCircleCheck size={16} /> Registrar Compra
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

function ProveedorForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({ nombre:initial?.nombre??'', telefono:initial?.telefono??'', correo:initial?.correo??'', direccion:initial?.direccion??'' })
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}))
  const handleSave = async () => {
    if (!form.nombre.trim()) { toast.error('El nombre es obligatorio'); return }
    try {
      if (initial) await proveedoresApi.update(initial.idProveedor,form)
      else         await proveedoresApi.create(form)
      toast.success('Proveedor guardado')
      onSaved()
    } catch { toast.error('Error al guardar') }
  }
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div><label className="inp-label">Nombre de la Empresa *</label><input className="inp" value={form.nombre} onChange={f('nombre')} placeholder="Distribuidora S.A.C." /></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div><label className="inp-label">Teléfono</label><input className="inp" value={form.telefono} onChange={f('telefono')} /></div>
        <div><label className="inp-label">Correo</label><input type="email" className="inp" value={form.correo} onChange={f('correo')} /></div>
      </div>
      <div><label className="inp-label">Dirección</label><input className="inp" value={form.direccion} onChange={f('direccion')} /></div>
      <div style={{display:'flex',gap:10,marginTop:8}}>
        <button className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary"   style={{flex:2}} onClick={handleSave}>Guardar Proveedor</button>
      </div>
    </div>
  )
}
