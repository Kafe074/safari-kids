import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { empleadosApi } from '../../api/empleados'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

export default function EmpleadosPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['empleados'],
    queryFn: () => empleadosApi.getAll().then(r => r.data.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: id => empleadosApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['empleados']); toast.success('Empleado eliminado') },
  })

  const cols = [
    { key:'idEmpleado', label:'#', render: v => <span style={{ fontWeight:700, color:'#6a1b9a' }}>#{v}</span> },
    { key:'especialidad', label:'Especialidad' },
    { key:'turno', label:'Turno', render: v => <span className="badge badge-info">{v}</span> },
    { key:'estado', label:'Estado', render: v => <span className={`badge ${v==='Activo'?'badge-ok':'badge-err'}`}>{v}</span> },
  ]

  return (
    <div>
      <PageHeader title="Gestión de Empleados" subtitle={`${(data??[]).length} empleados en el equipo`}>
        <button className="btn btn-primary" onClick={()=>{setEditing(null);setModal(true)}}>+ Nuevo Empleado</button>
      </PageHeader>

      <DataTable columns={cols} data={data??[]} loading={isLoading}
        onEdit={row=>{setEditing(row);setModal(true)}}
        onDelete={row=>{ if(confirm('¿Eliminar este empleado?')) deleteMut.mutate(row.idEmpleado) }} />

      <Modal open={modal} onClose={()=>setModal(false)} title={editing ? 'Editar Empleado' : 'Nuevo Empleado'}>
        <EmpleadoForm initial={editing} onClose={()=>setModal(false)} onSaved={()=>{qc.invalidateQueries(['empleados']);setModal(false)}} />
      </Modal>
    </div>
  )
}

function EmpleadoForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    especialidad: initial?.especialidad ?? '', turno: initial?.turno ?? 'Mañana', estado: initial?.estado ?? 'Activo',
  })
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    try {
      if (initial) await empleadosApi.update(initial.idEmpleado, form)
      else await empleadosApi.create(form)
      toast.success('Guardado correctamente')
      onSaved()
    } catch { toast.error('Error al guardar') }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div><label className="inp-label">Especialidad</label><input className="inp" value={form.especialidad} onChange={f('especialidad')} placeholder="Ej: Corte Infantil" /></div>
      <div><label className="inp-label">Turno</label>
        <select className="inp" value={form.turno} onChange={f('turno')}>
          {['Mañana','Tarde','Completo'].map(t=><option key={t}>{t}</option>)}
        </select>
      </div>
      <div><label className="inp-label">Estado</label>
        <select className="inp" value={form.estado} onChange={f('estado')}>
          {['Activo','Inactivo'].map(e=><option key={e}>{e}</option>)}
        </select>
      </div>
      <div style={{ display:'flex', gap:10, marginTop:8 }}>
        <button className="btn btn-secondary" style={{ flex:1 }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ flex:2 }} onClick={handleSave}>Guardar</button>
      </div>
    </div>
  )
}
