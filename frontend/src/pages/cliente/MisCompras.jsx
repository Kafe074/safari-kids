import { useQuery } from '@tanstack/react-query'
import { ventasApi } from '../../api/ventas'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LuCalendar, LuPackage, LuShoppingCart, LuArrowRight,
  LuChevronDown, LuCircleCheck, LuArrowLeft,
} from 'react-icons/lu'

export default function MisCompras() {
  const navigate = useNavigate()
  const { data = [], isLoading } = useQuery({
    queryKey: ['mis-compras'],
    queryFn: () => ventasApi.misCompras().then(r => r.data.data ?? []),
  })

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--paper, #FFFBF0)',
        padding: '40px 24px 60px',
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
              <VentaCard key={v.idVenta} venta={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function VentaCard({ venta }) {
  const [open, setOpen] = useState(false)
  const fecha = venta.fechaVenta
    ? new Date(venta.fechaVenta).toLocaleString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : ''
  const ref = `SK-${String(venta.idVenta).padStart(6, '0')}`
  const itemCount = venta.detalles?.length ?? 0

  return (
    <div
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
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#FFF8E1',
                border: '2px solid #1A2E1A',
                borderRadius: 10,
                padding: '3px 10px',
                fontSize: 12,
                fontWeight: 700,
                color: '#1A2E1A',
              }}
            >
              <LuCalendar size={12} color="#FFC42E" />
              {fecha}
            </span>

            {/* items count chip */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#ffe5d9',
                border: '2px solid #1A2E1A',
                borderRadius: 10,
                padding: '3px 10px',
                fontSize: 12,
                fontWeight: 700,
                color: '#1A2E1A',
              }}
            >
              <LuPackage size={12} color="#FF6F3C" />
              {itemCount} producto{itemCount !== 1 ? 's' : ''}
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
              paddingTop: 16,
              borderTop: '2px solid #1A2E1A',
            }}
          >
            <span
              style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 18,
                color: '#1A2E1A',
              }}
            >
              Total
            </span>
            <span
              style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 28,
                color: '#1B7A3E',
              }}
            >
              S/ {Number(venta.total).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
