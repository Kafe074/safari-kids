import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, width=520 }) {
  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h2 style={{ fontSize:17, fontWeight:400, color:'#1a2e1a', fontFamily:"'Fredoka One',cursive" }}>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div style={{ padding:'20px 28px 28px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
