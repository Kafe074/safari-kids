import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { serviciosApi } from '../../api/servicios'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

export default function ServiciosPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey:['servicios-admin'],
    queryFn:() => serviciosApi.getAll().then(r => r.data.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: id => serviciosApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['servicios-admin']); toast.success('Servicio eliminado') },
  })

  const cols = [
    { key:'idServicio', label:'#', render:v=><span style={{fontWeight:700,color:'#2E7D32'}}>#{v}</span> },
    { key:'nombre', label:'Nombre', render:v=><span style={{fontWeight:700}}>{v}</span> },
    { key:'precio', label:'Precio', render:v=><span style={{fontWeight:800,color:'#2E7D32'}}>S/ {Number(v).toFixed(2)}</span> },
    { key:'duracion', label:'Duración', render:v=><span className="badge badge-info">{v} min</span> },
    { key:'estado', label:'Estado', render:v=><span className={`badge ${v==='Disponible'?'badge-ok':'badge-err'}`}>{v}</span> },
  ]

  return (
    <div>
      <PageHeader title="Catálogo de Servicios" subtitle={`${(data??[]).length} servicios registrados`}>
        <button className="btn btn-primary" onClick={()=>{setEditing(null);setModal(true)}}>+ Nuevo Servicio</button>
      </PageHeader>
      <DataTable columns={cols} data={data??[]} loading={isLoading} searchKeys={['nombre']}
        onEdit={row=>{setEditing(row);setModal(true)}}
        onDelete={row=>{ if(confirm('¿Eliminar este servicio?')) deleteMut.mutate(row.idServicio) }} />
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'Editar Servicio':'Nuevo Servicio'}>
        <ServicioForm initial={editing} onClose={()=>setModal(false)} onSaved={()=>{qc.invalidateQueries(['servicios-admin']);setModal(false)}} />
      </Modal>
    </div>
  )
}

function ServicioForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre:initial?.nombre??'', descripcion:initial?.descripcion??'',
    precio:initial?.precio??'', duracion:initial?.duracion??30, estado:initial?.estado??'Disponible',
  })
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const handleSave = async () => {
    try {
      if(initial) await serviciosApi.update(initial.idServicio,form)
      else await serviciosApi.create(form)
      toast.success('Guardado correctamente'); onSaved()
    } catch { toast.error('Error al guardar') }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div><label className="inp-label">Nombre del Servicio</label><input className="inp" value={form.nombre} onChange={f('nombre')} placeholder="Ej: Corte Infantil" /></div>
      <div><label className="inp-label">Descripción</label><textarea className="inp" rows={2} value={form.descripcion} onChange={f('descripcion')} /></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div><label className="inp-label">Precio (S/)</label><input type="number" className="inp" value={form.precio} onChange={f('precio')} step="0.01" min="0" /></div>
        <div><label className="inp-label">Duración (min)</label><input type="number" className="inp" value={form.duracion} onChange={f('duracion')} min="5" /></div>
      </div>
      <div><label className="inp-label">Estado</label>
        <select className="inp" value={form.estado} onChange={f('estado')}>
          <option>Disponible</option><option>No_disponible</option>
        </select>
      </div>
      <div style={{display:'flex',gap:10,marginTop:8}}>
        <button className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{flex:2}} onClick={handleSave}>Guardar Servicio</button>
      </div>
    </div>
  )
}
