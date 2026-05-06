import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesApi } from '../../api/clientes'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

export default function ClientesPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesApi.getAll().then(r => r.data.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: id => clientesApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['clientes']); toast.success('Cliente eliminado') },
    onError: () => toast.error('Error al eliminar'),
  })

  const cols = [
    { key:'idCliente', label:'#', render: v => <span style={{ fontWeight:700, color:'#2E7D32' }}>#{v}</span> },
    { key:'telefono',  label:'Teléfono' },
    { key:'direccion', label:'Dirección' },
    { key:'fechaNacimiento', label:'Fecha Nac.' },
  ]

  return (
    <div>
      <PageHeader title="Gestión de Clientes" subtitle={`${(data??[]).length} clientes registrados`}>
        <button className="btn btn-primary" onClick={()=>{setEditing(null);setModal(true)}}>+ Nuevo Cliente</button>
      </PageHeader>

      <DataTable columns={cols} data={data ?? []} loading={isLoading}
        onEdit={row=>{setEditing(row);setModal(true)}}
        onDelete={row=>{ if(confirm('¿Eliminar este cliente?')) deleteMut.mutate(row.idCliente) }} />

      <Modal open={modal} onClose={()=>setModal(false)} title={editing ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <ClienteForm initial={editing} onClose={()=>setModal(false)} onSaved={()=>{qc.invalidateQueries(['clientes']);setModal(false)}} />
      </Modal>
    </div>
  )
}

function ClienteForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    telefono: initial?.telefono ?? '', direccion: initial?.direccion ?? '',
    fechaNacimiento: initial?.fechaNacimiento ?? '',
  })
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    try {
      if (initial) await clientesApi.update(initial.idCliente, form)
      else await clientesApi.create(form)
      toast.success(initial ? 'Cliente actualizado' : 'Cliente creado')
      onSaved()
    } catch { toast.error('Error al guardar') }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div><label className="inp-label">Teléfono</label><input className="inp" value={form.telefono} onChange={f('telefono')} placeholder="999 000 000" /></div>
      <div><label className="inp-label">Dirección</label><input className="inp" value={form.direccion} onChange={f('direccion')} placeholder="Av. ..." /></div>
      <div><label className="inp-label">Fecha de Nacimiento</label><input type="date" className="inp" value={form.fechaNacimiento} onChange={f('fechaNacimiento')} /></div>
      <div style={{ display:'flex', gap:10, marginTop:8 }}>
        <button className="btn btn-secondary" style={{ flex:1 }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ flex:2 }} onClick={handleSave}>Guardar</button>
      </div>
    </div>
  )
}
