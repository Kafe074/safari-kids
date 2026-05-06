import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import StatCard from '../../components/common/StatCard'
import PageHeader from '../../components/common/PageHeader'

const LABELS = {
  totalReservas:      'Total Reservas',
  reservasPendientes: 'Reservas Pendientes',
  totalClientes:      'Total Clientes',
  totalEmpleados:     'Total Empleados',
  totalVentas:        'Total Ventas',
  totalProductos:     'Total Productos',
}

export default function ReportesPage() {
  const { data: dash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/reportes/dashboard').then(r => r.data.data),
  })

  const metrics = [
    { icon:'📅', label:'Total Reservas',       value:dash?.totalReservas,      bg:'#e8f5e9' },
    { icon:'⏳', label:'Reservas Pendientes',   value:dash?.reservasPendientes, bg:'#fff8e1' },
    { icon:'👨‍👧', label:'Total Clientes',         value:dash?.totalClientes,      bg:'#e3f2fd' },
    { icon:'💼', label:'Total Empleados',       value:dash?.totalEmpleados,     bg:'#f3e5f5' },
    { icon:'🛒', label:'Total Ventas',          value:dash?.totalVentas,        bg:'#fff3e0' },
    { icon:'📦', label:'Total Productos',       value:dash?.totalProductos,     bg:'#e0f7fa' },
  ]

  const handleDownloadCSV = () => {
    if (!dash) return
    const fecha = new Date().toLocaleDateString('es-PE')
    const rows = [
      ['Reporte Safari Kids', fecha],
      [],
      ['Metrica', 'Valor'],
      ...Object.entries(dash).map(([k, v]) => [LABELS[k] ?? k, v]),
    ]
    const csv  = '﻿' + rows.map(r => r.join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `safari-kids-reporte-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader title="Reportes & Estadísticas" subtitle="Resumen general del sistema Safari Kids">
        <button className="btn btn-secondary" onClick={() => window.print()}>🖨️ Imprimir</button>
        <button className="btn btn-primary" onClick={handleDownloadCSV} disabled={!dash}>⬇️ Descargar CSV</button>
      </PageHeader>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,marginBottom:28}}>
        {metrics.map(m => <StatCard key={m.label} {...m} />)}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        {/* Resumen numérico */}
        <div className="card-admin">
          <h3 style={{fontWeight:700,color:'#1a2e1a',marginBottom:14,fontSize:15}}>📋 Resumen del Sistema</h3>
          {Object.entries(dash ?? {}).map(([k, v]) => (
            <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #f5f5f5'}}>
              <span style={{fontSize:13,color:'#666'}}>{LABELS[k] ?? k}</span>
              <span style={{fontWeight:800,color:'#1a2e1a',fontSize:15,fontFamily:"'Fredoka One',cursive"}}>{v}</span>
            </div>
          ))}
          {!dash && <p style={{color:'#bbb',textAlign:'center',padding:20}}>Cargando datos...</p>}

          <div style={{marginTop:20,display:'flex',gap:10}}>
            <button onClick={handleDownloadCSV} disabled={!dash} style={{
              flex:1,background:dash?'#2E7D32':'#aaa',color:'#fff',border:'none',borderRadius:10,
              padding:'11px',fontSize:13,fontWeight:700,cursor:dash?'pointer':'default',fontFamily:'inherit',
            }}>⬇️ CSV</button>
            <button onClick={() => window.print()} style={{
              flex:1,background:'#f5f5f5',color:'#555',border:'none',borderRadius:10,
              padding:'11px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',
            }}>🖨️ Imprimir</button>
          </div>
        </div>

        {/* Info del sistema */}
        <div className="card-admin">
          <h3 style={{fontWeight:700,color:'#1a2e1a',marginBottom:14,fontSize:15}}>🦁 Safari Kids — Sistema</h3>
          <div style={{background:'linear-gradient(135deg,#1b5e20,#2E7D32)',borderRadius:14,padding:24,color:'#fff',marginBottom:16}}>
            <p style={{fontSize:13,color:'rgba(255,255,255,.7)',marginBottom:4}}>Versión del Sistema</p>
            <p style={{fontSize:22,fontWeight:800,margin:'0 0 4px'}}>Safari Kids v1.0</p>
            <p style={{fontSize:12,color:'rgba(255,255,255,.6)',margin:0}}>Spring Boot 3.4 + React 18 + MySQL</p>
          </div>
          {[
            ['Frontend',      'React 18 + Vite'],
            ['Backend',       'Spring Boot 3.4.1'],
            ['Base de Datos', 'MySQL 8 — safari_kids'],
            ['Autenticación', 'JWT Stateless'],
            ['ORM',           'Spring Data JPA + Hibernate 6'],
          ].map(([k, v]) => (
            <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #f5f5f5'}}>
              <span style={{fontSize:12,color:'#888'}}>{k}</span>
              <span style={{fontSize:12,fontWeight:600,color:'#1a2e1a'}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
