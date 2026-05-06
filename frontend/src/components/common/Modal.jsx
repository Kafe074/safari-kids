export default function Modal({ open, onClose, title, children, width=520 }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box" style={{ maxWidth: width }}>
        <div className="modal-header">
          <h2 style={{ fontSize:17, fontWeight:700, color:'#1a2e1a' }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#999', lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:'20px 28px 28px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
