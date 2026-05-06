import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ventasApi } from '../../api/ventas'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import StatCard from '../../components/common/StatCard'
import toast from 'react-hot-toast'

export default function VentasPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey:['ventas'],
    queryFn:() => ventasApi.getAll().then(r => r.data.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: id => ventasApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['ventas']); toast.success('Venta anulada') },
  })

  const ventas = data ?? []
  const totalMonto = ventas.reduce((acc,v) => acc + Number(v.total ?? 0), 0)
  const completadas = ventas.filter(v => v.estado === 'Completado')

  const cols = [
    { key:'idVenta', label:'#', render:v=><span style={{fontWeight:700,color:'#e65100'}}>#{v}</span> },
    { key:'fechaVenta', label:'Fecha', render:v=>v ? new Date(v).toLocaleDateString('es-PE') : '—' },
    { key:'total', label:'Total', render:v=><span style={{fontWeight:800,color:'#2E7D32'}}>S/ {Number(v).toFixed(2)}</span> },
    { key:'estado', label:'Estado', render:v=><span className={`badge ${v==='Completado'?'badge-ok':'badge-err'}`}>{v}</span> },
  ]

  return (
    <div>
      <PageHeader title="Módulo de Ventas" subtitle="Registro y control de ventas de productos">
        <button className="btn btn-primary" onClick={()=>{setEditing(null);setModal(true)}}>+ Nueva Venta</button>
      </PageHeader>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:24}}>
        <StatCard icon="🛒" label="Total Ventas" value={ventas.length} bg="#fff3e0" />
        <StatCard icon="✅" label="Completadas" value={completadas.length} bg="#e8f5e9" />
        <StatCard icon="💰" label="Ingresos Totales" value={`S/ ${totalMonto.toFixed(2)}`} bg="#e3f2fd" />
      </div>

      <DataTable columns={cols} data={ventas} loading={isLoading} searchKeys={['estado']}
        onEdit={row=>{setEditing(row);setModal(true)}}
        onDelete={row=>{ if(confirm('¿Anular esta venta?')) deleteMut.mutate(row.idVenta) }} />

      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'Editar Venta':'Nueva Venta'}>
        <VentaForm initial={editing} onClose={()=>setModal(false)} onSaved={()=>{qc.invalidateQueries(['ventas']);setModal(false)}} />
      </Modal>
    </div>
  )
}

function VentaForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({ total: initial?.total??'', estado: initial?.estado??'Completado' })
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const handleSave = async () => {
    try {
      if(initial) await ventasApi.update(initial.idVenta, { ...form, fechaVenta: new Date().toISOString() })
      else await ventasApi.create({ ...form, fechaVenta: new Date().toISOString() })
      toast.success('Venta guardada'); onSaved()
    } catch { toast.error('Error al guardar') }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div><label className="inp-label">Monto Total (S/)</label><input type="number" className="inp" value={form.total} onChange={f('total')} step="0.01" min="0" placeholder="0.00" /></div>
      <div><label className="inp-label">Estado</label>
        <select className="inp" value={form.estado} onChange={f('estado')}>
          <option>Completado</option><option>Anulado</option>
        </select>
      </div>
      <div style={{display:'flex',gap:10,marginTop:8}}>
        <button className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{flex:2}} onClick={handleSave}>Registrar Venta</button>
      </div>
    </div>
  )
}
