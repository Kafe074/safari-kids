import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservasApi } from '../../api/reservas'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const ESTADO_STYLE = {
  Pendiente:  { background:'#fff8e1', color:'#f57f17', border:'1px solid #ffe082' },
  Confirmado: { background:'#e8f5e9', color:'#2E7D32', border:'1px solid #a5d6a7' },
  Cancelado:  { background:'#ffebee', color:'#c62828', border:'1px solid #ef9a9a' },
}

function EstadoBadge({ estado }) {
  const s = ESTADO_STYLE[estado] || ESTADO_STYLE.Pendiente
  return <span style={{...s, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:700}}>{estado}</span>
}

export default function MisReservas() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['mis-reservas'],
    queryFn: () => reservasApi.misReservas().then(r => r.data.data ?? []),
  })

  const cancelMut = useMutation({
    mutationFn: (id) => reservasApi.cancelar(id),
    onSuccess: () => { qc.invalidateQueries(['mis-reservas']); toast.success('Reserva cancelada') },
    onError: () => toast.error('No se pudo cancelar la reserva'),
  })

  return (
    <div style={{ maxWidth:800, margin:'40px auto', padding:'0 24px', fontFamily:"'Nunito','Segoe UI',sans-serif" }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontWeight:900, fontSize:26, color:'#1a2e1a', margin:'0 0 4px' }}>Mis Reservas</h1>
          <p style={{ color:'#888', fontSize:14, margin:0 }}>Historial completo de tus citas</p>
        </div>
        <Link to="/reservar" style={{ background:'#2E7D32', color:'#fff', textDecoration:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, fontSize:14 }}>
          + Nueva reserva
        </Link>
      </div>

      {isLoading ? (
        <p style={{ textAlign:'center', color:'#999', padding:40 }}>Cargando reservas...</p>
      ) : !data?.length ? (
        <div style={{ textAlign:'center', padding:60, background:'#fff', borderRadius:16, border:'1px solid #eee' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
          <p style={{ color:'#999', fontWeight:600 }}>No tienes reservas aún</p>
          <Link to="/reservar" style={{ color:'#2E7D32', fontWeight:700, textDecoration:'none' }}>Hacer tu primera reserva →</Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {data.map(r => (
            <div key={r.idReserva} style={{ background:'#fff', borderRadius:14, padding:'20px 24px', border:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:800, color:'#1a2e1a', margin:'0 0 4px' }}>Reserva #{r.idReserva}</p>
                <p style={{ color:'#888', fontSize:13, margin:'0 0 2px' }}>📅 {r.fechaReserva}</p>
                {r.horario && <p style={{ color:'#888', fontSize:13, margin:0 }}>⏰ {r.horario.horaInicio} — {r.empleado?.usuario?.nombres} {r.empleado?.usuario?.apellidos}</p>}
                {r.observaciones && <p style={{ color:'#aaa', fontSize:12, margin:'4px 0 0', fontStyle:'italic' }}>{r.observaciones}</p>}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                <EstadoBadge estado={r.estado} />
                {r.estado === 'Pendiente' && (
                  <button
                    onClick={() => { if (confirm('¿Cancelar esta reserva?')) cancelMut.mutate(r.idReserva) }}
                    style={{ background:'#ffebee', color:'#c62828', border:'none', borderRadius:8, padding:'5px 12px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
