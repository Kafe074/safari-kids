export default function StatCard({ icon, label, value, color, bg, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        <span style={{ fontSize:26 }}>{icon}</span>
      </div>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:12, color:'#888', fontWeight:600, marginBottom:2, fontFamily:"'Poppins',sans-serif" }}>{label}</p>
        <p style={{ fontSize:26, fontWeight:800, color:'#1a2e1a', lineHeight:1 }}>{value ?? '—'}</p>
        {trend && <p style={{ fontSize:11, color:'#2E7D32', marginTop:3 }}>{trend}</p>}
      </div>
    </div>
  )
}
