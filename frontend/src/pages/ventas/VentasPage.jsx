import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ventasApi } from '../../api/ventas'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import toast from 'react-hot-toast'
import {
  LuShoppingCart, LuCircleCheck, LuDollarSign, LuTruck, LuStore,
  LuPackage, LuUser, LuChevronDown, LuX,
} from 'react-icons/lu'

const ESTADO_ENTREGA_LABEL = {
  Pendiente:          { label: 'Pendiente',         color: '#f59e0b', bg: '#fffbeb' },
  EntregadoDelivery:  { label: 'Entregado (delivery)', color: '#3b82f6', bg: '#eff6ff' },
  EntregadaCliente:   { label: 'Entregada al cliente', color: '#2E7D32', bg: '#e8f5e9' },
}

export default function VentasPage() {
  const qc = useQueryClient()
  const [expandedId, setExpandedId] = useState(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['ventas'],
    queryFn: () => ventasApi.getAll().then(r => (r.data.data ?? []).sort((a, b) => b.idVenta - a.idVenta)),
  })

  const estadoMut = useMutation({
    mutationFn: ({ id, estado }) => ventasApi.cambiarEstadoEntrega(id, estado),
    onSuccess: () => { qc.invalidateQueries(['ventas']); toast.success('Estado de entrega actualizado') },
    onError: () => toast.error('Error al actualizar'),
  })

  const deleteMut = useMutation({
    mutationFn: id => ventasApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['ventas']); toast.success('Venta anulada') },
  })

  const totalMonto  = data.reduce((acc, v) => acc + Number(v.total ?? 0), 0)
  const completadas = data.filter(v => v.estado === 'Completado').length
  const deliveries  = data.filter(v => v.metodoEntrega === 'Delivery').length
  const pendientes  = data.filter(v => v.estadoEntrega === 'Pendiente').length

  return (
    <div style={{ padding: '32px 28px', minHeight: '100vh', background: '#F8FDF8' }}>
      <PageHeader title="Módulo de Ventas" subtitle="Registro y control de ventas de productos" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={<LuShoppingCart size={22} />} label="Total Ventas"     value={data.length}                bg="#fff3e0" />
        <StatCard icon={<LuCircleCheck  size={22} />} label="Completadas"      value={completadas}                bg="#e8f5e9" />
        <StatCard icon={<LuDollarSign   size={22} />} label="Ingresos"         value={`S/ ${totalMonto.toFixed(2)}`} bg="#e3f2fd" />
        <StatCard icon={<LuTruck        size={22} />} label="Deliveries"       value={deliveries}                 bg="#eff6ff" />
        <StatCard icon={<LuPackage      size={22} />} label="Por entregar"     value={pendientes}                 bg="#fef3c7" />
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 64, color: '#aaa' }}>
          <LuShoppingCart size={40} style={{ opacity: .4 }} />
        </div>
      ) : data.length === 0 ? (
        <div className="card-chunky" style={{ textAlign: 'center', padding: 64, color: '#aaa' }}>
          <LuShoppingCart size={40} style={{ opacity: .4, marginBottom: 12 }} />
          <p style={{ fontFamily: "'Poppins',sans-serif" }}>No hay ventas registradas</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.map(v => {
            const esDelivery  = v.metodoEntrega === 'Delivery'
            const estadoInfo  = ESTADO_ENTREGA_LABEL[v.estadoEntrega] ?? ESTADO_ENTREGA_LABEL.Pendiente
            const expanded    = expandedId === v.idVenta

            return (
              <div key={v.idVenta} className="card-chunky" style={{ overflow: 'hidden' }}>
                {/* ── Header row ── */}
                <div onClick={() => setExpandedId(expanded ? null : v.idVenta)}
                  style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', flexWrap: 'wrap' }}>

                  {/* ID */}
                  <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#e65100', minWidth: 48 }}>#{v.idVenta}</span>

                  {/* Cliente */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '1 1 160px', minWidth: 140 }}>
                    <LuUser size={14} color="#888" />
                    <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                      {v.nombreCliente ?? 'Invitado'}
                    </span>
                  </div>

                  {/* Método entrega */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '1 1 140px', minWidth: 120 }}>
                    {esDelivery ? <LuTruck size={15} color="#3b82f6" /> : <LuStore size={15} color="#2E7D32" />}
                    <div>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, fontWeight: 700, color: esDelivery ? '#3b82f6' : '#2E7D32', margin: 0 }}>
                        {esDelivery ? 'Delivery' : 'Recojo en local'}
                      </p>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#888', margin: 0 }}>
                        {esDelivery ? (v.direccionEntrega ?? '—') : (v.sucursalEntrega?.split('–')[0]?.trim() ?? '—')}
                      </p>
                    </div>
                  </div>

                  {/* Estado entrega */}
                  <span style={{ padding: '3px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: estadoInfo.bg, color: estadoInfo.color, flexShrink: 0 }}>
                    {estadoInfo.label}
                  </span>

                  {/* Total */}
                  <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: 'var(--green)', flexShrink: 0, marginLeft: 'auto' }}>
                    S/ {Number(v.total ?? 0).toFixed(2)}
                  </span>

                  {/* Fecha */}
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, color: '#aaa', flexShrink: 0 }}>
                    {v.fechaVenta ? new Date(v.fechaVenta).toLocaleDateString('es-PE', { day:'2-digit', month:'short' }) : '—'}
                  </span>

                  <LuChevronDown size={16} color="#aaa" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }} />
                </div>

                {/* ── Expanded ── */}
                {expanded && (
                  <div style={{ borderTop: '2px dashed var(--ink)', padding: '16px 22px', background: '#fafafa' }}>
                    {/* Detalles productos */}
                    {(v.detalles ?? []).length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>Productos</p>
                        {(v.detalles ?? []).map((d, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px solid #eee' }}>
                            <span style={{ fontFamily: "'Poppins',sans-serif" }}>{d.nombreProducto} × {d.cantidad}</span>
                            <span style={{ fontWeight: 700 }}>S/ {Number(d.subtotal).toFixed(2)}</span>
                          </div>
                        ))}
                        {esDelivery && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: '#3b82f6' }}>
                            <span>Delivery</span>
                            <span style={{ fontWeight: 700 }}>+ S/ {Number(v.costoDelivery ?? 0).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cambiar estado de entrega */}
                    {v.estado !== 'Anulado' && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, fontWeight: 700, color: '#888' }}>Marcar como:</span>
                        {esDelivery && v.estadoEntrega !== 'EntregadoDelivery' && (
                          <button className="btn" style={{ padding: '5px 14px', fontSize: 12, background: '#eff6ff', color: '#3b82f6', border: '2px solid #3b82f6', gap: 5 }}
                            onClick={() => estadoMut.mutate({ id: v.idVenta, estado: 'EntregadoDelivery' })}>
                            <LuTruck size={13} /> Entregado al delivery
                          </button>
                        )}
                        {!esDelivery && v.estadoEntrega !== 'EntregadaCliente' && (
                          <button className="btn" style={{ padding: '5px 14px', fontSize: 12, background: '#e8f5e9', color: '#2E7D32', border: '2px solid #2E7D32', gap: 5 }}
                            onClick={() => estadoMut.mutate({ id: v.idVenta, estado: 'EntregadaCliente' })}>
                            <LuCircleCheck size={13} /> Entregada al cliente
                          </button>
                        )}
                        {v.estadoEntrega !== 'Pendiente' && (
                          <button className="btn" style={{ padding: '5px 14px', fontSize: 12, background: '#fffbeb', color: '#b45309', border: '2px solid #f59e0b', gap: 5 }}
                            onClick={() => estadoMut.mutate({ id: v.idVenta, estado: 'Pendiente' })}>
                            <LuX size={13} /> Revertir a pendiente
                          </button>
                        )}
                        <button className="btn btn-danger" style={{ padding: '5px 14px', fontSize: 12, marginLeft: 'auto' }}
                          onClick={() => { if (confirm('¿Anular esta venta?')) deleteMut.mutate(v.idVenta) }}>
                          Anular
                        </button>
                      </div>
                    )}
                    {v.estado === 'Anulado' && (
                      <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: '#c62828', fontWeight: 700 }}>✕ Venta anulada</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
