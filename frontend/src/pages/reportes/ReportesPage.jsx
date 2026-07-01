import { useQuery } from '@tanstack/react-query'
import { reportesApi } from '../../api/reportes'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import {
  LuCalendar, LuUsers, LuBriefcase, LuShoppingCart, LuBox, LuScissors,
  LuClipboardList, LuPrinter, LuDownload, LuDollarSign, LuTrendingUp,
  LuTrendingDown, LuWallet, LuTag, LuTruck, LuPackage, LuTriangleAlert,
  LuStore, LuReceipt, LuRefreshCw,
} from 'react-icons/lu'

const PEN = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 })
const fmtMoney = v => PEN.format(Number(v ?? 0))
const fmtNum   = v => new Intl.NumberFormat('es-PE').format(Number(v ?? 0))

/* Normaliza un objeto {k:v} o array [{nombre,cantidad}] a [{label,value}] */
const toBars = (src, labelKey = 'nombre', valKey = 'cantidad') => {
  if (!src) return []
  if (Array.isArray(src)) return src.map(o => ({ label: o[labelKey], value: o[valKey] }))
  return Object.entries(src).map(([label, value]) => ({ label, value }))
}

const COLORS = ['#2E7D32', '#0EA5E9', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#EF4444', '#6366F1']

function Section({ title, icon, children, accent = '#2E7D32', full }) {
  return (
    <div className="card-admin" style={{ gridColumn: full ? '1 / -1' : 'auto', breakInside: 'avoid' }}>
      <h3 style={{ fontWeight: 700, color: '#1a2e1a', marginBottom: 16, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: accent, display: 'flex' }}>{icon}</span> {title}
      </h3>
      {children}
    </div>
  )
}

function BarList({ data, money = false, emptyText = 'Sin datos' }) {
  if (!data || data.length === 0) return <p style={{ color: '#bbb', fontSize: 13, padding: '8px 0' }}>{emptyText}</p>
  const max = Math.max(...data.map(d => Number(d.value) || 0), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((d, i) => (
        <div key={d.label ?? i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12.5, color: '#444', fontWeight: 600 }}>{d.label}</span>
            <span style={{ fontSize: 12.5, color: '#1a2e1a', fontWeight: 800, fontFamily: "'Fredoka One',cursive" }}>
              {money ? fmtMoney(d.value) : fmtNum(d.value)}
            </span>
          </div>
          <div style={{ height: 8, background: '#eef2ee', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(Number(d.value) || 0) / max * 100}%`, background: COLORS[i % COLORS.length], borderRadius: 99, transition: 'width .5s' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function MiniTable({ cols, rows, empty = 'Sin datos' }) {
  if (!rows || rows.length === 0) return <p style={{ color: '#bbb', fontSize: 13, padding: '8px 0' }}>{empty}</p>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="tbl" style={{ fontSize: 12.5 }}>
        <thead><tr>{cols.map(c => <th key={c.key} style={{ textAlign: c.align ?? 'left' }}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{cols.map(c => <td key={c.key} style={{ textAlign: c.align ?? 'left' }}>{c.render ? c.render(r) : r[c.key]}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ReportesPage() {
  const { data: rep, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['reporte-general'],
    queryFn: () => reportesApi.getGeneral().then(r => r.data.data),
    // El reporte consulta muchas tablas; si la BD (Neon) está "fría" la primera
    // petición puede tardar. Reintentamos con espera creciente para no fallar.
    retry: 4,
    retryDelay: attempt => Math.min(attempt * 2000, 8000),
  })

  const handleCSV = () => {
    if (!rep) return
    const L = []
    const push = (...cells) => L.push(cells.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    push('Reporte General — Safari Kids', new Date().toLocaleString('es-PE'))
    push('')
    push('RESUMEN')
    Object.entries(rep.resumen ?? {}).forEach(([k, v]) => push(k, v))
    push('')
    push('FINANZAS')
    Object.entries(rep.finanzas ?? {}).forEach(([k, v]) => push(k, v))
    push('')
    push('RESERVAS POR ESTADO'); Object.entries(rep.reservas?.porEstado ?? {}).forEach(([k, v]) => push(k, v))
    push('RESERVAS POR SEDE');   Object.entries(rep.reservas?.porLocal ?? {}).forEach(([k, v]) => push(k, v))
    push('TOP EMPLEADOS (reservas)'); (rep.reservas?.topEmpleados ?? []).forEach(o => push(o.nombre, o.cantidad))
    push('')
    push('PRODUCTOS MÁS VENDIDOS', 'cantidad', 'monto'); (rep.ventas?.topProductos ?? []).forEach(o => push(o.nombre, o.cantidad, o.monto))
    push('')
    push('PAGOS POR MÉTODO', 'cantidad', 'monto'); Object.entries(rep.pagos?.porMetodo ?? {}).forEach(([k, v]) => push(k, v.cantidad, v.monto))
    push('')
    push('COMPRAS POR PROVEEDOR', 'monto'); (rep.compras?.porProveedor ?? []).forEach(o => push(o.nombre, o.monto))
    push('')
    push('INVENTARIO BAJO STOCK', 'sucursal', 'stock', 'minimo'); (rep.inventario?.bajoStock ?? []).forEach(o => push(o.producto, o.sucursal, o.stock, o.minimo))
    push('')
    push('SERVICIOS MÁS SOLICITADOS', 'cantidad'); (rep.servicios?.topSolicitados ?? []).forEach(o => push(o.nombre, o.cantidad))
    push('')
    push('INSUMOS BAJO STOCK', 'stock'); (rep.insumos?.bajoStock ?? []).forEach(o => push(o.nombre, o.stock))

    const csv = '﻿' + L.join('\r\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = `safari-kids-reporte-general-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const r = rep ?? {}
  const fin = r.finanzas ?? {}
  const res = r.resumen ?? {}

  const kpis = [
    { icon: <LuDollarSign size={22} />, label: 'Ingreso Total',  value: fmtMoney(fin.ingresoTotal), bg: '#e8f5e9' },
    { icon: <LuTrendingDown size={22} />, label: 'Gasto Compras', value: fmtMoney(fin.gastoCompras), bg: '#ffebee' },
    { icon: <LuWallet size={22} />,     label: 'Balance',        value: fmtMoney(fin.balance),      bg: fin.balance < 0 ? '#ffebee' : '#e8f5e9' },
    { icon: <LuReceipt size={22} />,    label: 'Ticket Promedio',value: fmtMoney(fin.ticketPromedio), bg: '#fff3e0' },
    { icon: <LuCalendar size={22} />,   label: 'Reservas',       value: fmtNum(res.reservas),       bg: '#e3f2fd' },
    { icon: <LuShoppingCart size={22} />, label: 'Ventas',       value: fmtNum(res.ventas),         bg: '#fff8e1' },
    { icon: <LuUsers size={22} />,      label: 'Clientes',       value: fmtNum(res.clientes),       bg: '#f3e5f5' },
    { icon: <LuBriefcase size={22} />,  label: 'Empleados',      value: fmtNum(res.empleados),      bg: '#e0f7fa' },
  ]

  return (
    <div className="reporte-print">
      <PageHeader title="Reporte General del Sistema" subtitle="Vista completa de operaciones, finanzas e inventario de Safari Kids">
        <button className="btn btn-secondary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LuPrinter size={15} /> Imprimir
        </button>
        <button className="btn btn-primary" onClick={handleCSV} disabled={!rep} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LuDownload size={15} /> Descargar CSV
        </button>
      </PageHeader>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {[...Array(8)].map((_, i) => <div key={i} className="skel" style={{ height: 96, borderRadius: 16, animationDelay: `${i * 0.06}s` }} />)}
        </div>
      ) : !rep ? (
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <p>No se pudo cargar el reporte</p>
          <small>La base de datos puede estar despertando. Espera unos segundos y reintenta.</small>
          <button className="btn btn-primary" onClick={() => refetch()} disabled={isFetching}
            style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <LuRefreshCw size={15} /> {isFetching ? 'Cargando…' : 'Reintentar'}
          </button>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
            {kpis.map(k => <StatCard key={k.label} {...k} />)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 18 }}>

            {/* Finanzas detalle */}
            <Section title="Finanzas" icon={<LuTrendingUp size={16} />} accent="#2E7D32">
              <BarList money data={[
                { label: 'Ingreso por ventas', value: fin.ingresoVentas },
                { label: 'Ingreso por reservas (pagos)', value: fin.ingresoPagos },
                { label: 'Gasto en compras', value: fin.gastoCompras },
              ]} />
              <div style={{ marginTop: 14, padding: '12px 14px', background: fin.balance < 0 ? '#fff5f5' : '#f1f8f1', border: `2px solid ${fin.balance < 0 ? '#fecaca' : '#c8e6c9'}`, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#555' }}>Balance neto</span>
                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: fin.balance < 0 ? '#c62828' : '#1b7a3e' }}>{fmtMoney(fin.balance)}</span>
              </div>
              {fin.ventasAnuladas > 0 && (
                <p style={{ fontSize: 12, color: '#999', marginTop: 10 }}>⚠ {fin.ventasAnuladas} venta(s) anulada(s) no contabilizada(s) en ingresos.</p>
              )}
            </Section>

            {/* Reservas por estado */}
            <Section title="Reservas por estado" icon={<LuCalendar size={16} />} accent="#0EA5E9">
              <BarList data={toBars(r.reservas?.porEstado)} />
            </Section>

            {/* Reservas por sede */}
            <Section title="Reservas por sede" icon={<LuStore size={16} />} accent="#8B5CF6">
              <BarList data={toBars(r.reservas?.porLocal)} />
            </Section>

            {/* Top empleados */}
            <Section title="Empleados con más reservas" icon={<LuBriefcase size={16} />} accent="#14B8A6">
              <BarList data={toBars(r.reservas?.topEmpleados)} emptyText="Aún no hay reservas atendidas" />
            </Section>

            {/* Productos más vendidos */}
            <Section title="Productos más vendidos" icon={<LuShoppingCart size={16} />} accent="#F59E0B" full>
              <MiniTable
                cols={[
                  { key: 'nombre', label: 'Producto' },
                  { key: 'cantidad', label: 'Unidades', align: 'right', render: r => fmtNum(r.cantidad) },
                  { key: 'monto', label: 'Total vendido', align: 'right', render: r => fmtMoney(r.monto) },
                ]}
                rows={r.ventas?.topProductos}
                empty="Aún no hay ventas registradas"
              />
            </Section>

            {/* Pagos por método */}
            <Section title="Pagos por método" icon={<LuDollarSign size={16} />} accent="#2E7D32">
              <MiniTable
                cols={[
                  { key: 'metodo', label: 'Método' },
                  { key: 'cantidad', label: 'N°', align: 'right' },
                  { key: 'monto', label: 'Monto pagado', align: 'right', render: r => fmtMoney(r.monto) },
                ]}
                rows={Object.entries(r.pagos?.porMetodo ?? {}).map(([metodo, v]) => ({ metodo, cantidad: v.cantidad, monto: v.monto }))}
              />
              <p style={{ fontSize: 12, color: '#999', marginTop: 10 }}>Pagos pendientes: <strong>{fmtNum(r.pagos?.pendientes)}</strong></p>
            </Section>

            {/* Ventas por entrega */}
            <Section title="Ventas por tipo de entrega" icon={<LuTruck size={16} />} accent="#6366F1">
              <BarList data={toBars(r.ventas?.porMetodoEntrega)} />
            </Section>

            {/* Compras por proveedor */}
            <Section title="Compras por proveedor" icon={<LuClipboardList size={16} />} accent="#EC4899">
              <BarList money data={toBars(r.compras?.porProveedor, 'nombre', 'monto')} emptyText="Sin compras registradas" />
            </Section>

            {/* Inventario */}
            <Section title="Inventario" icon={<LuBox size={16} />} accent="#0EA5E9" full>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                <div style={{ flex: '1 1 200px', background: '#f1f8f1', border: '2px solid #c8e6c9', borderRadius: 12, padding: '12px 16px' }}>
                  <p style={{ fontSize: 12, color: '#666', margin: 0 }}>Valor del inventario (a costo)</p>
                  <p style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: '#1b7a3e', margin: '2px 0 0' }}>{fmtMoney(r.inventario?.valorInventario)}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 8 }}>Stock por sucursal</p>
                  <BarList data={toBars(r.inventario?.porSucursal)} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#c62828', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <LuTriangleAlert size={14} /> Bajo stock ({r.inventario?.bajoStock?.length ?? 0})
                  </p>
                  <MiniTable
                    cols={[
                      { key: 'producto', label: 'Producto' },
                      { key: 'sucursal', label: 'Sucursal' },
                      { key: 'stock', label: 'Stock', align: 'right' },
                      { key: 'minimo', label: 'Mín', align: 'right' },
                    ]}
                    rows={r.inventario?.bajoStock}
                    empty="Todo el stock está sobre el mínimo ✓"
                  />
                </div>
              </div>
            </Section>

            {/* Servicios */}
            <Section title="Servicios más solicitados" icon={<LuScissors size={16} />} accent="#8B5CF6">
              <BarList data={toBars(r.servicios?.topSolicitados)} emptyText="Aún no hay servicios reservados" />
            </Section>

            {/* Catálogo de servicios */}
            <Section title="Catálogo de servicios" icon={<LuScissors size={16} />} accent="#14B8A6">
              <MiniTable
                cols={[
                  { key: 'nombre', label: 'Servicio' },
                  { key: 'estado', label: 'Estado' },
                  { key: 'precio', label: 'Precio', align: 'right', render: r => fmtMoney(r.precio) },
                ]}
                rows={r.servicios?.catalogo}
              />
            </Section>

            {/* Promociones */}
            <Section title="Promociones" icon={<LuTag size={16} />} accent="#F59E0B">
              <p style={{ fontSize: 13, color: '#444', marginBottom: 12 }}>Activas: <strong style={{ color: '#1b7a3e' }}>{fmtNum(r.promociones?.activas)}</strong></p>
              <BarList data={toBars(r.promociones?.porTipo)} />
            </Section>

            {/* Insumos */}
            <Section title="Insumos" icon={<LuPackage size={16} />} accent="#EF4444">
              <p style={{ fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 8 }}>Solicitudes por estado</p>
              <BarList data={toBars(r.insumos?.solicitudesPorEstado)} emptyText="Sin solicitudes" />
              <p style={{ fontSize: 13, fontWeight: 700, color: '#c62828', margin: '14px 0 8px' }}>Insumos bajo stock</p>
              <BarList data={toBars(r.insumos?.bajoStock, 'nombre', 'stock')} emptyText="Todos los insumos con stock ok ✓" />
            </Section>

            {/* Empleados */}
            <Section title="Empleados" icon={<LuBriefcase size={16} />} accent="#6366F1" full>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18 }}>
                <div><p style={{ fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 8 }}>Por sucursal</p><BarList data={toBars(r.empleados?.porSucursal)} /></div>
                <div><p style={{ fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 8 }}>Por turno</p><BarList data={toBars(r.empleados?.porTurno)} /></div>
                <div><p style={{ fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 8 }}>Por estado</p><BarList data={toBars(r.empleados?.porEstado)} /></div>
              </div>
            </Section>

          </div>

          <p style={{ textAlign: 'center', color: '#bbb', fontSize: 11.5, marginTop: 24 }}>
            Reporte generado el {rep.generadoEn ? new Date(rep.generadoEn).toLocaleString('es-PE') : '—'} · Safari Kids
          </p>
        </>
      )}
    </div>
  )
}
