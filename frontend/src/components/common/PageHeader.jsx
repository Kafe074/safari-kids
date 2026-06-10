export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="fade-page" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
      <div>
        <h2 style={{ fontFamily:"'Fredoka One',cursive", fontWeight:400, fontSize:24, color:'#1a2e1a', margin:0, lineHeight:1.15 }}>
          <span className="squiggle">{title}</span>
        </h2>
        {subtitle && <p style={{ color:'#8a988a', fontSize:13, marginTop:10, fontFamily:"'Poppins',sans-serif" }}>{subtitle}</p>}
      </div>
      {children && <div className="page-header-actions" style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>}
    </div>
  )
}
