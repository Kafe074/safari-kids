export default function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
      <div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#1a2e1a', margin:0 }}>{title}</h2>
        {subtitle && <p style={{ color:'#888', fontSize:13, marginTop:3, fontFamily:"'Poppins',sans-serif" }}>{subtitle}</p>}
      </div>
      {children && <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>}
    </div>
  )
}
