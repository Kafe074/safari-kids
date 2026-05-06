import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservasApi } from '../../api/reservas'
import PageHeader from '../../components/common/PageHeader'
import toast from 'react-hot-toast'

const BADGE = {
  Pendiente:  { bg:'#fff8e1', color:'#f57f17' },
  Confirmado: { bg:'#e8f5e9', color:'#2E7D32' },
  Cancelado:  { bg:'#ffebee', color:'#c62828' },
}

const hoy = new Date().toISOString().split('T')[0]

export default function EmpleadoReservas() {
  const qc = useQueryClient()

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ['mis-asignadas'],
    queryFn: () => reservasApi.misAsignadas().then(r => r.data.data ?? []),
  })

  const confirmarMut = useMutation({
    mutationFn: (id) => reservasApi.confirmar(id),
    onSuccess: () => { qc.invalidateQueries(['mis-asignadas']); toast.success('Marcado como atendido ✅') },
    onError:   () => toast.error('Error al actualizar'),
  })
  const cancelarMut = useMutation({
    mutationFn: (id) => reservasApi.cancelar(id),
    onSuccess: () => { qc.invalidateQueries(['mis-asignadas']); toast.success('Reserva cancelada') },
    onError:   () => toast.error('Error al cancelar'),
  })

  const sorted = [...reservas].sort((a, b) => {
    if (a.fechaReserva !== b.fechaReserva) return a.fechaReserva > b.fechaReserva ? -1 : 1
    return (a.horario?.horaInicio ?? '') > (b.horario?.horaInicio ?? '') ? 1 : -1
  })

  const hoyCount       = reservas.filter(r => r.fechaReserva === hoy).length
  const pendienteCount = reservas.filter(r => r.estado === 'Pendiente').length
  const atendidoCount  = reservas.filter(r => r.estado === 'Confirmado').length

  return (
    <div>
      <PageHeader title="Mis Reservas Asignadas" subtitle="Todas tus citas — historial y control de estado" />

      {/* Resumen */}
      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        {[
          { label:'Total', value:reservas.length,  bg:'#e8f5e9', color:'#2E7D32' },
          { label:'Hoy',   value:hoyCount,          bg:'#e3f2fd', color:'#1565c0' },
          { label:'Pendientes', value:pendienteCount, bg:'#fff8e1', color:'#f57f17' },
          { label:'Atendidos',  value:atendidoCount,  bg:'#f3e5f5', color:'#6a1b9a' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:'12px 20px', display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:26, color:s.color }}>{s.value}</span>
            <span style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Lista */}
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid #f0f0f0', overflow:'hidden' }}>
        {isLoading ? (
          <p style={{ padding:40, textAlign:'center', color:'#aaa' }}>Cargando reservas...</p>
        ) : sorted.length === 0 ? (
          <div style={{ padding:48, textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
            <p style={{ color:'#aaa' }}>No tienes reservas asignadas</p>
          </div>
        ) : sorted.map(r => {
          const badge   = BADGE[r.estado] ?? BADGE.Pendiente
          const esHoy   = r.fechaReserva === hoy
          const esPasada = r.fechaReserva < hoy

          return (
            <div key={r.idReserva} style={{
              padding:'16px 24px', borderBottom:'1px solid #f5f5f5',
              borderLeft: esHoy ? '4px solid #F9A825' : esPasada ? '4px solid #e0e0e0' : '4px solid transparent',
              background: esHoy ? '#fffde7' : '#fff',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <p style={{ fontWeight:800, fontSize:15, color:'#1a2e1a', margin:0 }}>
                      {r.cliente?.usuario?.nombres} {r.cliente?.usuario?.apellidos}
                    </p>
                    {esHoy && <span style={{ background:'#F9A825', color:'#fff', fontSize:10, fontWeight:800, borderRadius:20, padding:'2px 8px' }}>HOY</span>}
                  </div>
                  <p style={{ fontSize:13, color:'#666', margin:'0 0 2px' }}>
                    📅 {r.fechaReserva} &nbsp;·&nbsp; ⏰ {r.horario?.horaInicio ?? '—'} &nbsp;·&nbsp; 💺 {r.asiento?.nombre ?? '—'}
                  </p>
                  {r.observaciones && (
                    <p style={{ fontSize:12, color:'#aaa', margin:'4px 0 0', fontStyle:'italic' }}>{r.observaciones}</p>
                  )}
                </div>
                <span style={{ ...badge, padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700, flexShrink:0 }}>
                  {r.estado === 'Confirmado' ? 'Atendido ✓' : r.estado}
                </span>
              </div>

              {/* Acciones — solo para reservas de hoy o futuras pendientes */}
              {r.estado === 'Pendiente' && !esPasada && (
                <div style={{ display:'flex', gap:8, marginTop:10 }}>
                  <button onClick={() => confirmarMut.mutate(r.idReserva)} disabled={confirmarMut.isPending}
                    style={{ background:'#2E7D32', color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    ✅ Marcar como atendido
                  </button>
                  <button onClick={() => { if (confirm('¿Cancelar esta reserva?')) cancelarMut.mutate(r.idReserva) }} disabled={cancelarMut.isPending}
                    style={{ background:'#ffebee', color:'#c62828', border:'none', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
