import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservasApi } from '../../api/reservas'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

const ESTADO_COLORS = { Pendiente:'warn', Confirmado:'ok', Cancelado:'err' }

export default function ReservasPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterEstado, setFilterEstado] = useState('Todos')

  const { data, isLoading } = useQuery({
    queryKey: ['reservas'],
    queryFn: () => reservasApi.getAll().then(r => r.data.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: id => reservasApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['reservas']); toast.success('Reserva eliminada') },
    onError: () => toast.error('Error al eliminar'),
  })

  const filtered = (data ?? []).filter(r => filterEstado === 'Todos' || r.estado === filterEstado)

  const cols = [
    { key:'idReserva', label:'#' },
    { key:'fechaReserva', label:'Fecha' },
    { key:'estado', label:'Estado', render: v => <span className={`badge badge-${ESTADO_COLORS[v] ?? 'info'}`}>{v}</span> },
    { key:'observaciones', label:'Observaciones' },
  ]

  return (
    <div>
      <PageHeader title="Gestión de Reservas" subtitle="Administra todas las reservas del salón">
        <select className="inp" style={{ width:160 }} value={filterEstado} onChange={e=>setFilterEstado(e.target.value)}>
          {['Todos','Pendiente','Confirmado','Cancelado'].map(e => <option key={e}>{e}</option>)}
        </select>
        <button className="btn btn-primary" onClick={()=>{setEditing(null);setModal(true)}}>+ Nueva Reserva</button>
      </PageHeader>

      <DataTable columns={cols} data={filtered} loading={isLoading}
        onEdit={row=>{setEditing(row);setModal(true)}}
        onDelete={row=>{ if(confirm('¿Eliminar esta reserva?')) deleteMut.mutate(row.idReserva) }} />

      <Modal open={modal} onClose={()=>setModal(false)} title={editing ? 'Editar Reserva' : 'Nueva Reserva'}>
        <ReservaForm initial={editing} onClose={()=>setModal(false)} onSaved={()=>{qc.invalidateQueries(['reservas']);setModal(false)}} />
      </Modal>
    </div>
  )
}

function ReservaForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({ fechaReserva: initial?.fechaReserva ?? '', estado: initial?.estado ?? 'Pendiente', observaciones: initial?.observaciones ?? '' })
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    try {
      if (initial) await reservasApi.update(initial.idReserva, form)
      else await reservasApi.create(form)
      toast.success(initial ? 'Reserva actualizada' : 'Reserva creada')
      onSaved()
    } catch { toast.error('Error al guardar') }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div><label className="inp-label">Fecha de Reserva</label><input type="date" className="inp" value={form.fechaReserva} onChange={f('fechaReserva')} /></div>
      <div><label className="inp-label">Estado</label>
        <select className="inp" value={form.estado} onChange={f('estado')}>
          {['Pendiente','Confirmado','Cancelado'].map(e=><option key={e}>{e}</option>)}
        </select>
      </div>
      <div><label className="inp-label">Observaciones</label><textarea className="inp" rows={3} value={form.observaciones} onChange={f('observaciones')} /></div>
      <div style={{ display:'flex', gap:10, marginTop:8 }}>
        <button className="btn btn-secondary" style={{ flex:1 }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ flex:2 }} onClick={handleSave}>Guardar reserva</button>
      </div>
    </div>
  )
}
