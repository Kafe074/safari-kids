import { useState } from 'react'

export default function DataTable({ columns, data, onEdit, onDelete, loading, searchKeys=[] }) {
  const [search, setSearch] = useState('')

  const filtered = data?.filter(row =>
    !search || searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(search.toLowerCase()))
  ) ?? []

  return (
    <div>
      {/* Search */}
      {searchKeys.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <input className="inp" placeholder="🔍  Buscar..." value={search}
            onChange={e=>setSearch(e.target.value)} style={{ maxWidth:300 }} />
        </div>
      )}

      <div style={{ background:'#fff', borderRadius:14, border:'1px solid #f0f0f0', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:48, textAlign:'center', color:'#aaa' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🦁</div>
            <p>Cargando datos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:48, textAlign:'center', color:'#aaa' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
            <p>No se encontraron registros</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  {columns.map(c => <th key={c.key}>{c.label}</th>)}
                  {(onEdit || onDelete) && <th style={{ textAlign:'right', borderRadius:'0 10px 0 0' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i}>
                    {columns.map(c => (
                      <td key={c.key}>
                        {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td style={{ textAlign:'right' }}>
                        <div style={{ display:'flex', justifyContent:'flex-end', gap:6 }}>
                          {onEdit && <button className="btn btn-secondary" onClick={()=>onEdit(row)} style={{ padding:'5px 12px', fontSize:12 }}>✏️ Editar</button>}
                          {onDelete && <button className="btn btn-danger" onClick={()=>onDelete(row)} style={{ padding:'5px 12px', fontSize:12 }}>🗑️</button>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding:'10px 16px', background:'#fafafa', borderTop:'1px solid #f5f5f5', fontSize:12, color:'#aaa', fontFamily:"'Poppins',sans-serif" }}>
          {filtered.length} registro(s) {search && '(filtrados)'}
        </div>
      </div>
    </div>
  )
}
