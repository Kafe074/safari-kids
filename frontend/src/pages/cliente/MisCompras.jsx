import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ventasApi } from '../../api/ventas'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  LuCalendar, LuPackage, LuShoppingCart, LuArrowRight,
  LuChevronDown, LuCircleCheck, LuArrowLeft, LuDownload, LuPrinter,
  LuTruck, LuStore, LuMapPin,
} from 'react-icons/lu'

export default function MisCompras() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { data = [], isLoading } = useQuery({
    queryKey: ['mis-compras'],
    queryFn: () => ventasApi.misCompras().then(r => r.data.data ?? []),
  })

  const estadoMut = useMutation({
    mutationFn: ({ id, estado }) => ventasApi.cambiarEstadoEntrega(id, estado),
    onSuccess: () => { qc.invalidateQueries(['mis-compras']); toast.success('Estado actualizado') },
    onError: () => toast.error('Error al actualizar'),
  })

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--paper, #FFFBF0)',
        padding: '100px 24px 60px',
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* ── header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 36,
          }}
        >
          <div>
            <button onClick={() => navigate('/mi-cuenta')} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#fff', border:'3px solid var(--ink)', borderRadius:10, padding:'6px 14px', fontFamily:"'Fredoka One',cursive", fontSize:14, cursor:'pointer', marginBottom:14, color:'var(--ink)', boxShadow:'3px 3px 0 var(--ink)', transition:'all .15s' }}
              onMouseOver={e=>{e.currentTarget.style.transform='translate(-1px,-1px)';e.currentTarget.style.boxShadow='4px 4px 0 var(--ink)'}}
              onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='3px 3px 0 var(--ink)'}}>
              <LuArrowLeft size={15} /> Mi Cuenta
            </button>
            <br/>
            <span className="section-tag" style={{ marginBottom: 10, display: 'inline-block' }}>
              compras
            </span>
            <h1 className="section-title" style={{ margin: 0 }}>
              Mis Compras
            </h1>
            <p
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 18,
                color: '#666',
                margin: '4px 0 0',
              }}
            >
              Todo lo que has comprado en la tienda
            </p>
          </div>

          <Link to="/tienda" style={{ textDecoration: 'none' }}>
            <button className="btn btn-y" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LuShoppingCart size={16} />
              Ir a la Tienda
            </button>
          </Link>
        </div>

        {/* ── states ── */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div
              style={{
                display: 'inline-block',
                width: 48,
                height: 48,
                border: '4px solid #FF6F3C',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p
              style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 20,
                color: '#1A2E1A',
                marginTop: 16,
              }}
            >
              Cargando compras...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div
            className="card-chunky"
            style={{
              textAlign: 'center',
              padding: '60px 40px',
              background: '#fff',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                background: '#ffe5d9',
                border: '3px solid #FF6F3C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <LuShoppingCart size={36} color="#FF6F3C" />
            </div>
            <h2
              style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 26,
                color: '#1A2E1A',
                margin: '0 0 8px',
              }}
            >
              ¡Aún no has comprado!
            </h2>
            <p style={{ color: '#888', fontWeight: 600, margin: '0 0 24px' }}>
              Visita la tienda y lleva algo especial a casa
            </p>
            <Link to="/tienda" style={{ textDecoration: 'none' }}>
              <button className="btn btn-y" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Ir a la tienda
                <LuArrowRight size={16} />
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.map(v => (
              <VentaCard key={v.idVenta} venta={v} onCambiarEstado={(id, estado) => estadoMut.mutate({ id, estado })} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function VentaCard({ venta, onCambiarEstado }) {
  const [open, setOpen] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const cardRef = useRef(null)

  const esDelivery  = venta.metodoEntrega === 'Delivery'
  const estadoEntrega = venta.estadoEntrega ?? 'Pendiente'
  const estadoColor = estadoEntrega === 'Pendiente' ? '#f59e0b'
    : estadoEntrega === 'EntregadoDelivery' ? '#3b82f6'
    : '#2E7D32'
  const estadoLabel = estadoEntrega === 'Pendiente' ? 'Pendiente de entrega'
    : estadoEntrega === 'EntregadoDelivery' ? 'Entregado al delivery'
    : 'Entregada — ¡gracias!'

  const handleDescargarPDF = async (e) => {
    e.stopPropagation()
    if (!cardRef.current) return
    if (!open) setOpen(true)
    setDescargando(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { default: jsPDF }       = await import('jspdf')
      await new Promise(r => setTimeout(r, 300))
      const el      = cardRef.current
      const canvas  = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' })
      const imgData = canvas.toDataURL('image/png')
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfW    = pdf.internal.pageSize.getWidth()
      const pdfH    = (canvas.height * pdfW) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
      const ref = `SK-${String(venta.idVenta).padStart(6, '0')}`
      pdf.save(`boleta-${ref}.pdf`)
    } catch {
      window.print()
    } finally {
      setDescargando(false)
    }
  }
  const fecha = venta.fechaVenta
    ? new Date(venta.fechaVenta).toLocaleString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : ''
  const ref = `SK-${String(venta.idVenta).padStart(6, '0')}`
  const itemCount = venta.detalles?.length ?? 0

  return (
    <div
      ref={cardRef}
      className="card-chunky"
      style={{
        background: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* ── collapsed header (always visible) ── */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '22px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          cursor: 'pointer',
          flexWrap: 'wrap',
        }}
      >
        {/* left: boleta + meta */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 20,
                color: '#1A2E1A',
              }}
            >
              Boleta {ref}
            </span>

            {/* estado sticker */}
            <span
              className="sticker"
              style={{
                background: '#1B7A3E',
                color: '#fff',
                padding: '3px 12px',
                fontSize: 11,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <LuCircleCheck size={12} />
              {venta.estado}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {/* date chip */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFF8E1', border: '2px solid #1A2E1A', borderRadius: 10, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#1A2E1A' }}>
              <LuCalendar size={12} color="#FFC42E" /> {fecha}
            </span>
            {/* items chip */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffe5d9', border: '2px solid #1A2E1A', borderRadius: 10, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#1A2E1A' }}>
              <LuPackage size={12} color="#FF6F3C" /> {itemCount} producto{itemCount !== 1 ? 's' : ''}
            </span>
            {/* delivery chip */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: esDelivery ? '#eff6ff' : '#e8f5e9', border: `2px solid ${esDelivery ? '#3b82f6' : '#2E7D32'}`, borderRadius: 10, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: esDelivery ? '#3b82f6' : '#2E7D32' }}>
              {esDelivery ? <LuTruck size={12} /> : <LuStore size={12} />} {esDelivery ? 'Delivery' : 'Recojo local'}
            </span>
            {/* estado entrega chip */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: estadoColor + '18', borderRadius: 10, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: estadoColor }}>
              {estadoLabel}
            </span>
          </div>
        </div>

        {/* right: total + toggle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: 28,
              color: '#1B7A3E',
              lineHeight: 1,
            }}
          >
            S/ {Number(venta.total).toFixed(2)}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 700,
              color: '#999',
            }}
          >
            <LuChevronDown
              size={14}
              style={{
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
            {open ? 'ocultar' : 'ver detalle'}
          </span>
        </div>
      </div>

      {/* ── expanded product detail ── */}
      {open && (
        <div
          style={{
            borderTop: '3px dashed #1A2E1A',
            padding: '20px 28px',
            background: '#FFFBF0',
          }}
        >
          <p
            style={{
              fontFamily: "'Permanent Marker', cursive",
              fontSize: 14,
              color: '#1A2E1A',
              margin: '0 0 14px',
              letterSpacing: 0.5,
            }}
          >
            Detalle de productos
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {venta.detalles?.map((d, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  background: '#fff',
                  border: '2px solid #1A2E1A',
                  borderRadius: 12,
                  padding: '12px 16px',
                  boxShadow: '3px 3px 0 #1A2E1A',
                }}
              >
                {/* product info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: '#ffe5d9',
                      border: '2px solid #FF6F3C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <LuPackage size={18} color="#FF6F3C" />
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 800,
                        fontSize: 14,
                        color: '#1A2E1A',
                        margin: '0 0 2px',
                      }}
                    >
                      {d.nombreProducto}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#888',
                        margin: 0,
                      }}
                    >
                      x{d.cantidad} × S/ {Number(d.precioUnitario).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* subtotal */}
                <span
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: 18,
                    color: '#1B7A3E',
                    flexShrink: 0,
                  }}
                >
                  S/ {Number(d.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* total row */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:16, paddingTop:16, borderTop:'2px solid #1A2E1A' }}>
            <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:'#1A2E1A' }}>Total</span>
            <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:28, color:'#1B7A3E' }}>S/ {Number(venta.total).toFixed(2)}</span>
          </div>

          {/* dirección / sucursal info */}
          {esDelivery && venta.direccionEntrega && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#eff6ff', borderRadius: 10, padding: '8px 14px', marginBottom: 12, fontSize: 13 }}>
              <LuTruck size={14} color="#3b82f6" />
              <span style={{ fontWeight: 700, color: '#1d4ed8' }}>Delivery a:</span>
              <span style={{ color: '#333' }}>{venta.direccionEntrega}</span>
            </div>
          )}
          {!esDelivery && venta.sucursalEntrega && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#e8f5e9', borderRadius: 10, padding: '8px 14px', marginBottom: 12, fontSize: 13 }}>
              <LuMapPin size={14} color="#2E7D32" />
              <span style={{ fontWeight: 700, color: '#2E7D32' }}>Recojo en:</span>
              <span style={{ color: '#333' }}>{venta.sucursalEntrega}</span>
            </div>
          )}

          {/* botón confirmar entrega */}
          {estadoEntrega === 'Pendiente' && (
            <button
              onClick={() => onCambiarEstado(venta.idVenta, esDelivery ? 'EntregadoDelivery' : 'EntregadaCliente')}
              style={{
                marginBottom: 12, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: esDelivery ? '#eff6ff' : '#e8f5e9',
                color: esDelivery ? '#1d4ed8' : '#2E7D32',
                border: `3px solid ${esDelivery ? '#3b82f6' : '#2E7D32'}`,
                borderRadius: 12, padding: '10px',
                fontFamily: "'Fredoka One',cursive", fontSize: 15, cursor: 'pointer',
                boxShadow: `3px 3px 0 ${esDelivery ? '#3b82f6' : '#2E7D32'}`,
              }}>
              {esDelivery ? <LuTruck size={16} /> : <LuCircleCheck size={16} />}
              {esDelivery ? 'Confirmar: Entregado al delivery' : 'Confirmar: Recibido en local'}
            </button>
          )}
          {estadoEntrega !== 'Pendiente' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#e8f5e9', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
              <LuCircleCheck size={16} color="#2E7D32" />
              <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 14, color: '#2E7D32' }}>{estadoLabel}</span>
            </div>
          )}

          {/* download button */}
          <button
            onClick={handleDescargarPDF}
            disabled={descargando}
            style={{
              marginTop: 4, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: descargando ? '#ccc' : '#1B7A3E', color: '#fff',
              border: '3px solid #1A2E1A', borderRadius: 12, padding: '10px',
              fontFamily: "'Fredoka One',cursive", fontSize: 15, cursor: descargando ? 'not-allowed' : 'pointer',
              boxShadow: descargando ? 'none' : '4px 4px 0 #1A2E1A',
            }}>
            <LuDownload size={16} /> {descargando ? 'Generando PDF...' : 'Descargar boleta PDF'}
          </button>
        </div>
      )}
    </div>
  )
}
