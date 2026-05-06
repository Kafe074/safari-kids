import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservasApi } from '../../api/reservas'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import toast from 'react-hot-toast'

const BADGE = {
  Pendiente:  { bg:'#fff8e1', color:'#f57f17', label:'Pendiente' },
  Confirmado: { bg:'#e8f5e9', color:'#2E7D32', label:'Atendido ✓' },
  Cancelado:  { bg:'#ffebee', color:'#c62828', label:'Cancelado' },
}

export default function EmpleadoHome() {
  const { user } = useAuth()
  const qc  = useQueryClient()
  const hoy = new Date().toISOString().split('T')[0]

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

  const hoyReservas   = reservas.filter(r => r.fechaReserva === hoy)
  const pendientesHoy = hoyReservas.filter(r => r.estado === 'Pendiente')
  const atendidosHoy  = hoyReservas.filter(r => r.estado === 'Confirmado')
  const proximas      = reservas.filter(r => r.fechaReserva > hoy)
    .sort((a, b) => a.fechaReserva > b.fechaReserva ? 1 : -1)

  return (
    <div>
      <PageHeader
        title={`Bienvenido, ${user?.nombreCompleto?.split(' ')[0] ?? 'Estilista'} 👋`}
        subtitle={`Tu agenda del día · ${new Date().toLocaleDateString('es-PE', { weekday:'long', day:'numeric', month:'long' })}`}
      />

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:16, marginBottom:28 }}>
        <StatCard icon="📅" label="Citas hoy"      value={hoyReservas.length}   bg="#e8f5e9" />
        <StatCard icon="⏳" label="Por atender"     value={pendientesHoy.length} bg="#fff8e1" />
        <StatCard icon="✅" label="Atendidos hoy"   value={atendidosHoy.length}  bg="#e0f7fa" />
        <StatCard icon="📋" label="Próximas citas"  value={proximas.length}      bg="#f3e5f5" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

        {/* Agenda de hoy */}
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #f0f0f0', overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f5f5f5', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ fontWeight:800, fontSize:15, color:'#1a2e1a', margin:0 }}>📅 Clientes de hoy</h3>
            <span style={{ background:'#e8f5e9', color:'#2E7D32', borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:700 }}>{hoyReservas.length}</span>
          </div>

          {isLoading ? (
            <p style={{ padding:24, textAlign:'center', color:'#aaa' }}>Cargando agenda...</p>
          ) : hoyReservas.length === 0 ? (
            <div style={{ padding:32, textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:8 }}>🌴</div>
              <p style={{ color:'#aaa', fontSize:14 }}>Sin citas programadas para hoy</p>
            </div>
          ) : (
            <div>
              {hoyReservas
                .sort((a, b) => (a.horario?.horaInicio ?? '') > (b.horario?.horaInicio ?? '') ? 1 : -1)
                .map(r => {
                  const badge = BADGE[r.estado] ?? BADGE.Pendiente
                  return (
                    <div key={r.idReserva} style={{ padding:'14px 20px', borderBottom:'1px solid #fafafa' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                        <div>
                          <p style={{ fontWeight:800, fontSize:14, margin:'0 0 2px', color:'#1a2e1a' }}>
                            {r.cliente?.usuario?.nombres} {r.cliente?.usuario?.apellidos}
                          </p>
                          <p style={{ fontSize:12, color:'#888', margin:0 }}>
                            ⏰ {r.horario?.horaInicio ?? '—'} &nbsp;·&nbsp; 💺 {r.asiento?.nombre ?? '—'}
                          </p>
                          {r.observaciones && (
                            <p style={{ fontSize:11, color:'#aaa', margin:'3px 0 0', fontStyle:'italic' }}>{r.observaciones}</p>
                          )}
                        </div>
                        <span style={{ background:badge.bg, color:badge.color, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, flexShrink:0, marginLeft:8 }}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Botones de acción */}
                      {r.estado === 'Pendiente' && (
                        <div style={{ display:'flex', gap:8, marginTop:6 }}>
                          <button
                            onClick={() => confirmarMut.mutate(r.idReserva)}
                            disabled={confirmarMut.isPending}
                            style={{ flex:1, background:'#2E7D32', color:'#fff', border:'none', borderRadius:8, padding:'7px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                            ✅ Marcar como atendido
                          </button>
                          <button
                            onClick={() => { if (confirm('¿Cancelar esta reserva?')) cancelarMut.mutate(r.idReserva) }}
                            disabled={cancelarMut.isPending}
                            style={{ background:'#ffebee', color:'#c62828', border:'none', borderRadius:8, padding:'7px 12px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                            ✕
                          </button>
                        </div>
                      )}
                      {r.estado === 'Confirmado' && (
                        <p style={{ fontSize:11, color:'#2E7D32', fontWeight:700, margin:'6px 0 0' }}>✓ Servicio completado</p>
                      )}
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* Próximas reservas */}
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #f0f0f0', overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f5f5f5', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ fontWeight:800, fontSize:15, color:'#1a2e1a', margin:0 }}>📋 Próximas citas</h3>
            <span style={{ background:'#f3e5f5', color:'#6a1b9a', borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:700 }}>{proximas.length}</span>
          </div>
          {proximas.length === 0 ? (
            <div style={{ padding:32, textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:8 }}>📭</div>
              <p style={{ color:'#aaa', fontSize:14 }}>Sin citas próximas</p>
            </div>
          ) : (
            <div style={{ maxHeight:420, overflowY:'auto' }}>
              {proximas.map(r => (
                <div key={r.idReserva} style={{ padding:'12px 20px', borderBottom:'1px solid #fafafa', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontWeight:700, fontSize:14, margin:'0 0 2px', color:'#1a2e1a' }}>
                      {r.cliente?.usuario?.nombres} {r.cliente?.usuario?.apellidos}
                    </p>
                    <p style={{ fontSize:12, color:'#888', margin:0 }}>
                      📅 {r.fechaReserva} &nbsp;·&nbsp; ⏰ {r.horario?.horaInicio ?? '—'}
                    </p>
                  </div>
                  <span style={{ ...(BADGE[r.estado]??BADGE.Pendiente), background:(BADGE[r.estado]??BADGE.Pendiente).bg, color:(BADGE[r.estado]??BADGE.Pendiente).color, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                    {r.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
