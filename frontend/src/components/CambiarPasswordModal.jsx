import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { LuX, LuLock, LuEye, LuEyeOff, LuCircleCheck } from 'react-icons/lu'

export default function CambiarPasswordModal({ onClose }) {
  const [form, setForm] = useState({ actual: '', nueva: '', confirmar: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.actual || !form.nueva) { toast.error('Completa todos los campos'); return }
    if (form.nueva !== form.confirmar) { toast.error('Las nuevas contraseñas no coinciden'); return }
    if (form.nueva.length < 6) { toast.error('Mínimo 6 caracteres'); return }
    setLoading(true)
    try {
      await api.put('/usuarios/cambiar-password', { actual: form.actual, nueva: form.nueva })
      toast.success('Contraseña actualizada correctamente')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar la contraseña')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="card-chunky" style={{ width: '100%', maxWidth: 440, padding: 0, background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '3px solid #f0ebe2' }}>
          <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 19, color: 'var(--ink)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <LuLock size={19} color="#6B7280" /> Cambiar contraseña
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex' }}>
            <LuX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="inp-label">Contraseña actual</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} className="inp" value={form.actual}
                onChange={set('actual')} placeholder="••••••••" style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                {showPass ? <LuEyeOff size={16} /> : <LuEye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="inp-label">Nueva contraseña</label>
            <input type="password" className="inp" value={form.nueva} onChange={set('nueva')} placeholder="Mín. 6 caracteres" />
          </div>
          <div>
            <label className="inp-label">Confirmar nueva</label>
            <input type="password" className="inp" value={form.confirmar} onChange={set('confirmar')} placeholder="••••••••"
              style={{ borderColor: form.confirmar && form.confirmar !== form.nueva ? '#c62828' : undefined }} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" disabled={loading} className="btn btn-g" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
              <LuCircleCheck size={16} /> {loading ? 'Cambiando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
