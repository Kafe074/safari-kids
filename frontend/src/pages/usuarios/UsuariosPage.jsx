import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usuariosApi } from '../../api/usuarios'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

export default function UsuariosPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey:['usuarios'],
    queryFn:() => usuariosApi.getAll().then(r => r.data.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: id => usuariosApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['usuarios']); toast.success('Usuario eliminado') },
  })

  const cols = [
    { key:'idUsuario', label:'#', render:v=><span style={{fontWeight:700,color:'#6a1b9a'}}>#{v}</span> },
    { key:'nombres', label:'Nombres', render:(v,row)=><span style={{fontWeight:700}}>{v} {row.apellidos}</span> },
    { key:'correo',  label:'Correo' },
    { key:'estado',  label:'Estado', render:v=><span className={`badge ${v==='Activo'?'badge-ok':'badge-err'}`}>{v}</span> },
  ]

  return (
    <div>
      <PageHeader title="Usuarios & Roles" subtitle="Gestión de accesos al sistema">
        <button className="btn btn-primary" onClick={()=>{setEditing(null);setModal(true)}}>+ Nuevo Usuario</button>
      </PageHeader>
      <DataTable columns={cols} data={data??[]} loading={isLoading} searchKeys={['nombres','correo','apellidos']}
        onEdit={row=>{setEditing(row);setModal(true)}}
        onDelete={row=>{ if(confirm('¿Eliminar este usuario?')) deleteMut.mutate(row.idUsuario) }} />
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'Editar Usuario':'Nuevo Usuario'}>
        <UsuarioForm initial={editing} onClose={()=>setModal(false)} onSaved={()=>{qc.invalidateQueries(['usuarios']);setModal(false)}} />
      </Modal>
    </div>
  )
}

function UsuarioForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombres:initial?.nombres??'', apellidos:initial?.apellidos??'',
    correo:initial?.correo??'', contrasena:'', estado:initial?.estado??'Activo',
  })
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}))
  const handleSave = async () => {
    try {
      if(initial) await usuariosApi.update(initial.idUsuario, form)
      else await usuariosApi.create(form)
      toast.success('Usuario guardado'); onSaved()
    } catch { toast.error('Error al guardar') }
  }
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div><label className="inp-label">Nombres</label><input className="inp" value={form.nombres} onChange={f('nombres')} /></div>
        <div><label className="inp-label">Apellidos</label><input className="inp" value={form.apellidos} onChange={f('apellidos')} /></div>
      </div>
      <div><label className="inp-label">Correo</label><input type="email" className="inp" value={form.correo} onChange={f('correo')} /></div>
      <div><label className="inp-label">Contraseña {initial&&'(dejar vacío para mantener)'}</label><input type="password" className="inp" value={form.contrasena} onChange={f('contrasena')} /></div>
      <div><label className="inp-label">Estado</label>
        <select className="inp" value={form.estado} onChange={f('estado')}>
          <option>Activo</option><option>Inactivo</option>
        </select>
      </div>
      <div style={{display:'flex',gap:10,marginTop:8}}>
        <button className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{flex:2}} onClick={handleSave}>Guardar Usuario</button>
      </div>
    </div>
  )
}
