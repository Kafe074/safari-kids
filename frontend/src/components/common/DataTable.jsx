import { useState } from 'react'
import { LuSearch, LuPencil, LuTrash2 } from 'react-icons/lu'

function SkeletonRows({ cols }) {
  return (
    <div style={{ padding: '8px 16px 16px' }}>
      <div className="skel" style={{ height: 38, marginBottom: 10, borderRadius: 10 }} />
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="skel" style={{
              height: 22, flex: j === 0 ? 0.5 : 1,
              animationDelay: `${(i * cols + j) * 0.06}s`,
            }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function DataTable({ columns, data, onEdit, onDelete, loading, searchKeys=[] }) {
  const [search, setSearch] = useState('')

  const filtered = data?.filter(row =>
    !search || searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(search.toLowerCase()))
  ) ?? []

  return (
    <div>
      {/* Search */}
      {searchKeys.length > 0 && (
        <div style={{ marginBottom:16, position:'relative', maxWidth:300 }}>
          <LuSearch size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9aa89a', pointerEvents:'none' }} />
          <input className="inp" placeholder="Buscar..." value={search}
            onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:34 }} />
        </div>
      )}

      <div style={{ background:'#fff', borderRadius:14, border:'1px solid #eef2ee', overflow:'hidden', boxShadow:'0 2px 12px rgba(27,46,26,.05)' }}>
        {loading ? (
          <SkeletonRows cols={columns.length + ((onEdit || onDelete) ? 1 : 0)} />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">{search ? '🔍' : '🦒'}</span>
            <p>{search ? 'Sin resultados para tu búsqueda' : 'Aún no hay registros aquí'}</p>
            <small>{search ? `Prueba con otro término distinto a "${search}"` : 'Crea el primero con el botón de arriba'}</small>
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
                          {onEdit && (
                            <button className="btn btn-secondary" onClick={()=>onEdit(row)}
                              style={{ padding:'5px 12px', fontSize:12, display:'inline-flex', alignItems:'center', gap:5 }}>
                              <LuPencil size={12} /> Editar
                            </button>
                          )}
                          {onDelete && (
                            <button className="btn btn-danger" onClick={()=>onDelete(row)} title="Eliminar"
                              style={{ padding:'5px 10px', fontSize:12, display:'inline-flex', alignItems:'center' }}>
                              <LuTrash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding:'10px 16px', background:'#fafcfa', borderTop:'1px solid #f0f4f0', fontSize:12, color:'#9aa89a', fontFamily:"'Poppins',sans-serif", display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>{loading ? 'Cargando…' : `${filtered.length} registro${filtered.length === 1 ? '' : 's'}${search ? ' (filtrados)' : ''}`}</span>
          {search && !loading && (
            <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', color:'#1B7A3E', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              Limpiar filtro
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
