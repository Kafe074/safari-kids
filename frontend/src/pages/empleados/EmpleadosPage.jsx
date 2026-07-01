import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { empleadosApi } from '../../api/empleados'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  LuPlus, LuPencil, LuTrash2, LuSearch, LuBriefcase, LuUsers, LuCircleCheck, LuX, LuFilter, LuShieldCheck,
} from 'react-icons/lu'

import { SUCURSALES } from '../../constants/sucursales'

const TURNO_COLORS = { Mañana: 'ok', Tarde: 'warn', Completo: 'info' }

function getNombre(e) {
  const u = e?.usuario
  if (!u) return '—'
  return `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || '—'
}

export default function EmpleadosPage() {
  const qc = useQueryClient()
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch]   = useState('')
  const [filterEstado, setFilterEstado] = useState('Todos')

  const { data, isLoading } = useQuery({
    queryKey: ['empleados'],
    queryFn: () => empleadosApi.getAll().then(r => r.data.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: id => empleadosApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['empleados']); toast.success('Empleado eliminado') },
  })

  const openNew  = () => { setEditing(null); setModal(true) }
  const openEdit = row => { setEditing(row); setModal(true) }
  const closeModal = () => setModal(false)

  const all      = data ?? []
  const activos   = all.filter(e => e.estado === 'Activo').length
  const inactivos = all.filter(e => e.estado === 'Inactivo').length

  const filtered = all.filter(r => {
    const matchEstado = filterEstado === 'Todos' || r.estado === filterEstado
    const q = search.toLowerCase()
    const nombre = getNombre(r).toLowerCase()
    const matchSearch = !q
      || String(r.idEmpleado ?? '').includes(q)
      || String(r.especialidad ?? '').toLowerCase().includes(q)
      || String(r.turno ?? '').toLowerCase().includes(q)
      || String(r.sucursal ?? '').toLowerCase().includes(q)
      || nombre.includes(q)
    return matchEstado && matchSearch
  })

  return (
    <div style={{ padding: '32px 28px', minHeight: '100vh', background: '#F8FDF8' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 32 }}>
        <span className="section-tag" style={{ color: 'var(--purple)', borderColor: 'var(--purple)', background: '#f5f0ff', transform: 'rotate(-1.5deg)' }}>
          Equipo
        </span>
        <h1 className="section-title" style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginTop: 14, marginBottom: 6 }}>
          Gestión de Empleados
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: '#666', fontWeight: 400 }}>
            {all.length} empleado{all.length !== 1 ? 's' : ''} en el equipo
          </p>
          <button className="btn btn-g"
            style={{ padding: '10px 22px', fontSize: 15, gap: 8, background: 'linear-gradient(180deg,#B47EFF 0%,#A855F7 100%)', boxShadow: '0 6px 0 #7E22CE, 0 12px 24px rgba(168,85,247,.4)', borderColor: '#7E22CE' }}
            onClick={openNew}>
            <LuPlus size={18} /> Nuevo Empleado
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f5f0ff' }}><LuUsers size={26} color="var(--purple)" /></div>
          <div>
            <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 32, color: 'var(--ink)', lineHeight: 1 }}>{all.length}</p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: '#888', marginTop: 2 }}>Total empleados</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9' }}><LuBriefcase size={26} color="var(--green)" /></div>
          <div>
            <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 32, color: 'var(--green)', lineHeight: 1 }}>{activos}</p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: '#888', marginTop: 2 }}>Activos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ffebee' }}><LuBriefcase size={26} color="#c62828" /></div>
          <div>
            <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 32, color: '#c62828', lineHeight: 1 }}>{inactivos}</p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: '#888', marginTop: 2 }}>Inactivos</p>
          </div>
        </div>
      </div>

      {/* ── Filter / Search bar ── */}
      <div className="card-chunky" style={{ padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <LuSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
          <input className="inp" placeholder="Buscar por nombre, especialidad, sucursal..."
            value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <LuFilter size={15} style={{ color: '#888' }} />
          {['Todos', 'Activo', 'Inactivo'].map(estado => (
            <button key={estado} onClick={() => setFilterEstado(estado)} style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 13, fontFamily: "'Poppins', sans-serif",
              fontWeight: 700, border: '2px solid var(--ink)', cursor: 'pointer', transition: 'all .15s',
              background: filterEstado === estado ? 'var(--ink)' : '#fff',
              color: filterEstado === estado ? '#fff' : 'var(--ink)',
            }}>{estado}</button>
          ))}
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="card-chunky" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 64, textAlign: 'center', color: '#aaa' }}>
            <LuBriefcase size={40} style={{ marginBottom: 12, opacity: .4 }} />
            <p style={{ fontFamily: "'Poppins', sans-serif" }}>Cargando empleados...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: '#aaa' }}>
            <LuBriefcase size={40} style={{ marginBottom: 12, opacity: .4 }} />
            <p style={{ fontFamily: "'Poppins', sans-serif" }}>No se encontraron empleados</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre Completo</th>
                  <th>Especialidad</th>
                  <th>Sucursal</th>
                  <th>Turno</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{ fontFamily: "'Fredoka One', cursive", fontWeight: 700, color: 'var(--purple)' }}>
                        #{r.idEmpleado}
                      </span>
                    </td>
                    <td style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                      {getNombre(r)}
                    </td>
                    <td style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                      {r.especialidad ?? '—'}
                    </td>
                    <td style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13 }}>
                      {r.sucursal ? (
                        <span style={{ background: '#f5f0ff', color: '#6d28d9', borderRadius: 8, padding: '3px 10px', fontWeight: 600, fontSize: 12 }}>
                          {r.sucursal.split('–')[0].trim()}
                        </span>
                      ) : (
                        <span style={{ color: '#bbb' }}>Sin asignar</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${TURNO_COLORS[r.turno] ?? 'info'}`}>{r.turno ?? '—'}</span>
                    </td>
                    <td>
                      <span className={`badge ${r.estado === 'Activo' ? 'badge-ok' : 'badge-err'}`}>{r.estado}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }} onClick={() => openEdit(r)}>
                          <LuPencil size={13} /> Editar
                        </button>
                        <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }}
                          onClick={() => { if (confirm('¿Eliminar este empleado?')) deleteMut.mutate(r.idEmpleado) }}>
                          <LuTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '10px 16px', background: '#fafafa', borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#aaa', fontFamily: "'Poppins', sans-serif" }}>
          {filtered.length} empleado(s){search || filterEstado !== 'Todos' ? ' (filtrados)' : ''}
        </div>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal-box" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LuBriefcase size={20} color="var(--purple)" />
                {editing ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center' }}>
                <LuX size={22} />
              </button>
            </div>
            <div style={{ padding: '20px 28px 28px' }}>
              <EmpleadoForm initial={editing} onClose={closeModal}
                onSaved={() => { qc.invalidateQueries(['empleados']); closeModal() }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmpleadoForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombres:      '',
    apellidos:    '',
    correo:       '',
    contrasena:   '',
    especialidad: initial?.especialidad ?? '',
    sucursal:     initial?.sucursal     ?? '',
    turno:        initial?.turno        ?? 'Mañana',
    estado:       initial?.estado       ?? 'Activo',
  })
  const [showPwd, setShowPwd]   = useState(false)
  const [password, setPassword] = useState('')
  const [checking, setChecking] = useState(false)
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = () => {
    if (!initial) {
      if (!form.nombres.trim() || !form.apellidos.trim()) { toast.error('Ingresa nombres y apellidos'); return }
      if (!form.correo.includes('@')) { toast.error('Correo no válido'); return }
      if (form.contrasena.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return }
    }
    setShowPwd(true)
  }

  const confirmSave = async () => {
    if (!password.trim()) { toast.error('Ingresa tu contraseña'); return }
    setChecking(true)
    try {
      const res = await api.post('/auth/verify-password', { contrasena: password })
      if (!res.data.data) { toast.error('Contraseña incorrecta'); setChecking(false); return }
      if (initial) await empleadosApi.update(initial.idEmpleado, form)
      else         await empleadosApi.create(form)
      toast.success('Guardado correctamente')
      onSaved()
    } catch { toast.error('Error al guardar') }
    finally { setChecking(false) }
  }

  if (showPwd) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#fff8e1', border: '3px solid var(--yellow)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <LuShieldCheck size={20} color="#b38600" />
        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: '#7c5607', margin: 0 }}>
          Confirma tu contraseña para guardar los cambios
        </p>
      </div>
      <div>
        <label className="inp-label">Contraseña</label>
        <input type="password" className="inp" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Tu contraseña de administrador" autoFocus
          onKeyDown={e => e.key === 'Enter' && confirmSave()} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowPwd(false); setPassword('') }}>Cancelar</button>
        <button className="btn btn-primary" style={{ flex: 2, gap: 8 }} onClick={confirmSave} disabled={checking}>
          {checking ? 'Verificando...' : <><LuShieldCheck size={16} /> Confirmar y guardar</>}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!initial && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="inp-label">Nombres</label>
              <input className="inp" value={form.nombres} onChange={f('nombres')} placeholder="Ej: María" />
            </div>
            <div>
              <label className="inp-label">Apellidos</label>
              <input className="inp" value={form.apellidos} onChange={f('apellidos')} placeholder="Ej: Gómez" />
            </div>
          </div>
          <div>
            <label className="inp-label">Correo (usuario de acceso)</label>
            <input className="inp" type="email" value={form.correo} onChange={f('correo')} placeholder="empleado@safarikids.com" />
          </div>
          <div>
            <label className="inp-label">Contraseña inicial</label>
            <input className="inp" type="password" value={form.contrasena} onChange={f('contrasena')} placeholder="Mínimo 6 caracteres" />
          </div>
        </>
      )}
      <div>
        <label className="inp-label">Especialidad</label>
        <input className="inp" value={form.especialidad} onChange={f('especialidad')} placeholder="Ej: Corte Infantil" />
      </div>
      <div>
        <label className="inp-label">Sucursal asignada</label>
        <select className="inp" value={form.sucursal} onChange={f('sucursal')}>
          <option value="">— Sin asignar —</option>
          {SUCURSALES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="inp-label">Turno</label>
          <select className="inp" value={form.turno} onChange={f('turno')}>
            {['Mañana', 'Tarde', 'Completo'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="inp-label">Estado</label>
          <select className="inp" value={form.estado} onChange={f('estado')}>
            {['Activo', 'Inactivo'].map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ flex: 2, gap: 8 }} onClick={handleSave}>
          <LuCircleCheck size={16} /> Guardar
        </button>
      </div>
    </div>
  )
}
