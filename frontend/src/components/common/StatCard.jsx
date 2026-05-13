export default function StatCard({ icon, label, value, color = '#1B7A3E', bg, trend }) {
  return (
    <div className="stat-card" style={{ background: '#fff' }}>
      <div className="stat-icon" style={{
        background: bg || color,
        border: '3px solid var(--ink)',
        borderRadius: 14,
        boxShadow: '3px 3px 0 var(--ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {typeof icon === 'string'
          ? <span style={{ fontSize: 26 }}>{icon}</span>
          : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        }
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 11, color: '#888', fontWeight: 800, marginBottom: 2, fontFamily:"'Permanent Marker',cursive", letterSpacing: 1, textTransform: 'uppercase' }}>
          {label}
        </p>
        <p style={{ fontFamily:"'Fredoka One',cursive", fontSize: 30, color: 'var(--ink)', lineHeight: 1 }}>
          {value ?? '—'}
        </p>
        {trend && <p style={{ fontSize: 11, color: color, marginTop: 3, fontWeight: 800 }}>{trend}</p>}
      </div>
    </div>
  )
}
