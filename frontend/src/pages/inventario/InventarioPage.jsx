import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventarioApi } from '../../api/inventario'
import { productosApi } from '../../api/productos'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import StatCard from '../../components/common/StatCard'
import toast from 'react-hot-toast'

export default function InventarioPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [modalProd, setModalProd] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data: inv, isLoading } = useQuery({
    queryKey:['inventario'],
    queryFn:() => inventarioApi.getAll().then(r => r.data.data ?? []),
  })

  const invData = inv ?? []
  const bajo = invData.filter(i => i.stockActual <= (i.stockMinimo ?? 5))
  const ok   = invData.filter(i => i.stockActual >  (i.stockMinimo ?? 5))

  const cols = [
    { key:'idInventario', label:'#', render:v=><span style={{fontWeight:700,color:'#00695c'}}>#{v}</span> },
    { key:'stockActual', label:'Stock Actual', render:(v,row) => (
      <span style={{fontWeight:800, color: v<=(row.stockMinimo??5) ? '#c62828':'#2E7D32'}}>{v}</span>
    )},
    { key:'stockMinimo', label:'Stock Mínimo' },
    { key:'ubicacion',   label:'Ubicación' },
    { key:'stockActual', label:'Alerta', render:(v,row) => v<=(row.stockMinimo??5)
      ? <span className="badge badge-err">⚠️ Stock bajo</span>
      : <span className="badge badge-ok">✓ Normal</span>
    },
  ]

  return (
    <div>
      <PageHeader title="Inventario & Productos" subtitle="Control de stock en tiempo real">
        <button className="btn btn-secondary" onClick={()=>setModalProd(true)}>📦 Productos</button>
        <button className="btn btn-primary" onClick={()=>{setEditing(null);setModal(true)}}>+ Ajustar Stock</button>
      </PageHeader>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:24}}>
        <StatCard icon="📦" label="Total Productos" value={invData.length} bg="#e0f7fa" />
        <StatCard icon="✅" label="Stock Normal"    value={ok.length}   bg="#e8f5e9" />
        <StatCard icon="⚠️" label="Stock Bajo"      value={bajo.length} bg="#fff8e1" trend={bajo.length > 0 ? 'Requiere reposición':'Todo en orden'} />
      </div>

      <DataTable columns={cols} data={invData} loading={isLoading}
        onEdit={row=>{setEditing(row);setModal(true)}} />

      <Modal open={modal} onClose={()=>setModal(false)} title="Ajustar Stock">
        <AjusteForm initial={editing} onClose={()=>setModal(false)} onSaved={()=>{qc.invalidateQueries(['inventario']);setModal(false)}} />
      </Modal>

      <Modal open={modalProd} onClose={()=>setModalProd(false)} title="Gestión de Productos" width={620}>
        <ProductosList />
      </Modal>
    </div>
  )
}

function AjusteForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({ stockActual: initial?.stockActual??0, stockMinimo: initial?.stockMinimo??5, ubicacion: initial?.ubicacion??'' })
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const handleSave = async () => {
    try {
      if(initial) await inventarioApi.update(initial.idInventario, form)
      else await inventarioApi.create(form)
      toast.success('Stock actualizado'); onSaved()
    } catch { toast.error('Error') }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div><label className="inp-label">Stock Actual</label><input type="number" className="inp" value={form.stockActual} onChange={f('stockActual')} /></div>
        <div><label className="inp-label">Stock Mínimo</label><input type="number" className="inp" value={form.stockMinimo} onChange={f('stockMinimo')} /></div>
      </div>
      <div><label className="inp-label">Ubicación</label><input className="inp" value={form.ubicacion} onChange={f('ubicacion')} placeholder="Estante A" /></div>
      <div style={{display:'flex',gap:10,marginTop:8}}>
        <button className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{flex:2}} onClick={handleSave}>Guardar cambios</button>
      </div>
    </div>
  )
}

function ProductosList() {
  const { data, isLoading } = useQuery({ queryKey:['productos'], queryFn:() => productosApi.getAll().then(r=>r.data.data??[]) })
  if (isLoading) return <p style={{textAlign:'center',padding:24,color:'#aaa'}}>Cargando...</p>
  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      {(data??[]).map(p => (
        <div key={p.idProducto} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'#fafafa',borderRadius:10,border:'1px solid #f0f0f0'}}>
          <div>
            <p style={{fontWeight:700,fontSize:14,color:'#1a2e1a',margin:0}}>{p.nombre}</p>
            <p style={{fontSize:12,color:'#888',margin:0}}>{p.descripcion}</p>
          </div>
          <div style={{textAlign:'right'}}>
            <p style={{fontWeight:800,color:'#2E7D32',fontSize:15,margin:0}}>S/ {Number(p.precioVenta).toFixed(2)}</p>
            <span className={`badge ${p.estado==='Activo'?'badge-ok':'badge-err'}`}>{p.estado}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
