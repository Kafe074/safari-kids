import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { solicitudesInsumosApi } from '../../api/solicitudesInsumos'
import toast from 'react-hot-toast'
import {
  LuClipboardList, LuCircleCheck, LuCircleX, LuTruck, LuArrowLeft, LuClock,
} from 'react-icons/lu'

const SOL_BADGE = {
  Pendiente: { bg: '#FFF8E1', color: '#B38600', border: '#FFC42E', label: 'Pendiente' },
  Aprobada:  { bg: '#E0F2FE', color: '#0369A1', border: '#38BDF8', label: 'Aprobada' },
  Entregada: { bg: '#E8F5E9', color: '#1B7A3E', border: '#33A957', label: 'Entregada' },
  Rechazada: { bg: '#FFEBEE', color: '#C62828', border: '#FF4F95', label: 'Rechazada' },
}

const nombreDe = (u, fallbackId, prefijo) =>
  u ? `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || `${prefijo} #${fallbackId}` : `${prefijo} #${fallbackId}`

export default function SolicitudesInstrumentosPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data: solicitudes = [], isLoading } = useQuery({
    queryKey: ['solicitudes-insumos'],
    queryFn: () => solicitudesInsumosApi.getAll().then(r => r.data.data ?? []),
  })

  const estadoMut = useMutation({
    mutationFn: ({ id, estado }) => solicitudesInsumosApi.cambiarEstado(id, estado),
    onSuccess: (_, { estado }) => {
      qc.invalidateQueries(['solicitudes-insumos'])
      qc.invalidateQueries(['insumos'])
      toast.success(estado === 'Entregada' ? 'Kit entregado — stock descontado' : `Solicitud ${estado.toLowerCase()}`)
    },
    onError: err => toast.error(err.response?.data?.message || 'Error al actualizar'),
  })

  const pendientes = solicitudes.filter(s => s.estado === 'Pendiente').length

  return (
    <div style={{ padding: '32px 28px', minHeight: '100vh', background: '#F8FDF8' }}>
      <button onClick={() => navigate('/admin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: '2px solid #ccc', borderRadius: 999, padding: '6px 14px', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', marginBottom: 24, color: '#666' }}>
        <LuArrowLeft size={14} /> Volver a Config
      </button>

      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title" style={{ fontSize: 'clamp(24px,3vw,38px)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <LuClipboardList size={34} color="#1B7A3E" /> Solicitudes de Instrumentos
        </h1>
        <p style={{ color: '#666', fontFamily: "'Poppins',sans-serif", fontSize: 14 }}>
          {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''}
          {pendientes > 0 && <span style={{ color: '#B38600', fontWeight: 700 }}> · {pendientes} pendiente{pendientes !== 1 ? 's' : ''} por revisar</span>}
        </p>
      </div>

      <div className="card-chunky" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg,#0F5527,#1B7A3E)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <LuClipboardList size={18} color="#FFC42E" /> Bandeja de solicitudes
          </span>
          {pendientes > 0 && (
            <span style={{ background: '#FFC42E', color: '#2B1B00', border: '2px solid #2B1B00', borderRadius: 999, padding: '2px 12px', fontFamily: "'Fredoka One',cursive", fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <LuClock size={13} /> {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {isLoading ? (
          <div style={{ padding: 20 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skel" style={{ height: 60, marginBottom: 10, animationDelay: `${i * 0.1}s` }} />)}
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎒</span>
            <p>No hay solicitudes de empleados</p>
            <small>Cuando un empleado solicite su kit para un cliente, aparecerá aquí</small>
          </div>
        ) : (
          <div className="stagger">
            {solicitudes.map(s => {
              const badge = SOL_BADGE[s.estado] ?? SOL_BADGE.Pendiente
              const emp = nombreDe(s.empleado?.usuario, s.empleado?.idEmpleado ?? '?', 'Empleado')
              const cli = nombreDe(s.cliente?.usuario, s.cliente?.idCliente ?? '?', 'Cliente')
              return (
                <div key={s.idSolicitud} style={{ padding: '14px 20px', borderBottom: '2px solid #f5f0e8', display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 13, color: 'var(--ink)' }}>#{s.idSolicitud} · {emp}</span>
                      <span style={{ background: '#EEF2FF', border: '2px solid #C7D2FE', color: '#3730A3', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                        👤 {s.cliente ? cli : 'Sin cliente'}
                      </span>
                      <span style={{ fontSize: 11.5, color: '#999', fontFamily: "'Poppins',sans-serif" }}>
                        {s.fechaSolicitud ? new Date(s.fechaSolicitud).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                      <span style={{ background: badge.bg, color: badge.color, border: `2px solid ${badge.border}`, borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 800 }}>
                        {badge.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(s.detalles ?? []).map(d => (
                        <span key={d.idDetalle} style={{ background: '#F6FBF6', border: '2px solid #DCE9DC', borderRadius: 999, padding: '2px 10px', fontSize: 11.5, fontWeight: 700, color: 'var(--ink)' }}>
                          {d.insumo?.nombre ?? d.producto?.nombre} × {d.cantidad}
                        </span>
                      ))}
                    </div>
                    {s.observaciones && (
                      <p style={{ fontSize: 11.5, color: '#999', margin: '6px 0 0', fontStyle: 'italic', fontFamily: "'Poppins',sans-serif" }}>"{s.observaciones}"</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                    {s.estado === 'Pendiente' && (
                      <>
                        <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }}
                          disabled={estadoMut.isPending}
                          onClick={() => estadoMut.mutate({ id: s.idSolicitud, estado: 'Aprobada' })}>
                          <LuCircleCheck size={13} /> Aprobar
                        </button>
                        <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }}
                          disabled={estadoMut.isPending}
                          onClick={() => estadoMut.mutate({ id: s.idSolicitud, estado: 'Rechazada' })}>
                          <LuCircleX size={13} /> Rechazar
                        </button>
                      </>
                    )}
                    {s.estado === 'Aprobada' && (
                      <button className="btn btn-yellow" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }}
                        disabled={estadoMut.isPending}
                        onClick={() => estadoMut.mutate({ id: s.idSolicitud, estado: 'Entregada' })}>
                        <LuTruck size={13} /> Marcar entregado
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
