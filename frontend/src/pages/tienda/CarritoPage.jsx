import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ventasApi } from '../../api/ventas'
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { SUCURSALES, COSTO_DELIVERY } from '../../constants/sucursales'
import {
  LuShoppingCart, LuPackage, LuArrowLeft, LuPlus, LuMinus,
  LuX, LuCreditCard, LuCircleCheck, LuTrash2, LuDownload, LuPrinter,
  LuTruck, LuStore, LuMapPin,
} from 'react-icons/lu'

const STEP = { CART: 'cart', DELIVERY: 'delivery', PAYMENT: 'payment', PROCESSING: 'processing', BOLETA: 'boleta' }

export default function CarritoPage() {
  const { items, remove, updateQty, clear, total } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]       = useState(STEP.CART)
  const [entrega, setEntrega] = useState({ metodo: '', sucursal: '', direccion: '' })
  const [card, setCard]       = useState({ numero: '', nombre: '', vencimiento: '', cvv: '' })
  const [boleta, setBoleta]   = useState(null)
  const [cardError, setCardError] = useState('')

  const costoDelivery = entrega.metodo === 'Delivery' ? COSTO_DELIVERY : 0
  const totalFinal    = total + costoDelivery

  const formatCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const formatVenc = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d }

  const handleCardChange = (field, val) => {
    setCardError('')
    if (field === 'numero')       setCard(c => ({ ...c, numero: formatCard(val) }))
    else if (field === 'vencimiento') setCard(c => ({ ...c, vencimiento: formatVenc(val) }))
    else if (field === 'cvv')     setCard(c => ({ ...c, cvv: val.replace(/\D/g, '').slice(0, 3) }))
    else                          setCard(c => ({ ...c, [field]: val }))
  }

  const validateDelivery = () => {
    if (!entrega.metodo) return 'Selecciona un método de entrega'
    if (entrega.metodo === 'Delivery' && !entrega.direccion.trim()) return 'Ingresa una dirección de entrega'
    if (entrega.metodo === 'RecojoEnLocal' && !entrega.sucursal) return 'Selecciona una sucursal'
    return ''
  }

  const validateCard = () => {
    const num = card.numero.replace(/\s/g, '')
    if (num.length !== 16) return 'Número de tarjeta inválido (16 dígitos)'
    if (!card.nombre.trim()) return 'Ingresa el nombre del titular'
    if (!/^\d{2}\/\d{2}$/.test(card.vencimiento)) return 'Fecha inválida (MM/AA)'
    if (card.cvv.length !== 3) return 'CVV debe tener 3 dígitos'
    return ''
  }

  const handlePagar = async () => {
    const err = validateCard()
    if (err) { setCardError(err); return }
    setStep(STEP.PROCESSING)
    try {
      await new Promise(r => setTimeout(r, 2000))
      const res = await ventasApi.checkout({
        items: items.map(i => ({ idProducto: i.idProducto, cantidad: i.cantidad })),
        metodoEntrega:    entrega.metodo,
        direccionEntrega: entrega.metodo === 'Delivery'      ? entrega.direccion : null,
        sucursalEntrega:  entrega.metodo === 'RecojoEnLocal' ? entrega.sucursal  : null,
      })
      setBoleta(res.data.data)
      clear()
      setStep(STEP.BOLETA)
    } catch {
      toast.error('Error al procesar el pago')
      setStep(STEP.PAYMENT)
    }
  }

  if (step === STEP.PROCESSING) return <ProcessingScreen />
  if (step === STEP.BOLETA)     return <BoletaScreen boleta={boleta} onClose={() => navigate('/mi-cuenta/compras')} onBackToStore={() => navigate('/tienda')} />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', paddingTop: 90, fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: 'var(--ink)', padding: '48px 24px 40px', textAlign: 'center', position: 'relative' }}>
        <button onClick={() => navigate('/tienda')} className="btn btn-y" style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13 }}>
          <LuArrowLeft size={16} /> Tienda
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 8 }}>
          {step === STEP.CART ? <LuShoppingCart size={36} color="var(--yellow)" />
           : step === STEP.DELIVERY ? <LuTruck size={36} color="var(--yellow)" />
           : <LuCreditCard size={36} color="var(--yellow)" />}
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(26px, 4vw, 42px)', color: '#fff', margin: 0 }}>
            {step === STEP.CART ? 'Mi Carrito' : step === STEP.DELIVERY ? 'Método de Entrega' : 'Datos de Pago'}
          </h1>
        </div>
        {/* step indicators */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          {[['Carrito', STEP.CART], ['Entrega', STEP.DELIVERY], ['Pago', STEP.PAYMENT]].map(([label, s], i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Fredoka One',cursive", fontSize: 13,
                background: step === s ? 'var(--yellow)' : [STEP.DELIVERY, STEP.PAYMENT].includes(step) && i === 0 ? 'var(--green)' : step === STEP.PAYMENT && i === 1 ? 'var(--green)' : 'rgba(255,255,255,0.2)',
                color: '#fff', border: '2px solid rgba(255,255,255,0.4)',
              }}>{i + 1}</span>
              <span style={{ fontSize: 11, color: step === s ? 'var(--yellow)' : 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{label}</span>
              {i < 2 && <div style={{ width: 20, height: 2, background: 'rgba(255,255,255,0.2)' }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 24px' }}>

        {/* ── STEP 1: CART ── */}
        {step === STEP.CART && (
          items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="card-chunky" style={{ display: 'inline-block', padding: '48px 64px', background: '#fff' }}>
                <LuShoppingCart size={64} color="var(--green)" style={{ marginBottom: 16 }} />
                <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: 'var(--ink)', margin: '0 0 24px' }}>No tienes productos en tu carrito</p>
                <button onClick={() => navigate('/tienda')} className="btn btn-g">Ir a la tienda</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
                {items.map(item => (
                  <div key={item.idProducto} className="card-chunky" style={{ background: '#fff', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f0fdf4', border: '3px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <LuPackage size={26} color="var(--green)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: 'var(--ink)', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nombre}</p>
                      {item.categoria && <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, textTransform: 'uppercase' }}>{item.categoria.nombre}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {[{ icon: LuMinus, action: () => updateQty(item.idProducto, item.cantidad - 1) }, { icon: null, label: item.cantidad }, { icon: LuPlus, action: () => updateQty(item.idProducto, item.cantidad + 1) }].map((ctrl, i) =>
                        ctrl.icon ? (
                          <button key={i} onClick={ctrl.action} style={{ width: 32, height: 32, border: '3px solid var(--ink)', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ctrl.icon size={14} />
                          </button>
                        ) : (
                          <span key={i} style={{ width: 28, textAlign: 'center', fontWeight: 800, fontSize: 16 }}>{ctrl.label}</span>
                        )
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 80 }}>
                      <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: 'var(--green)', margin: 0 }}>S/ {(Number(item.precioVenta) * item.cantidad).toFixed(2)}</p>
                      <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>S/ {Number(item.precioVenta).toFixed(2)} c/u</p>
                    </div>
                    <button onClick={() => remove(item.idProducto)} style={{ background: 'none', border: '2px solid var(--pink)', borderRadius: 8, cursor: 'pointer', color: 'var(--pink)', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LuTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="card-chunky" style={{ background: '#fff', padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#555' }}>Subtotal</span>
                  <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 30, color: 'var(--green)' }}>S/ {total.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => navigate('/tienda')} className="btn btn-w" style={{ flex: 1 }}><LuArrowLeft size={15} style={{ marginRight: 6 }} /> Seguir comprando</button>
                  <button onClick={() => setStep(STEP.DELIVERY)} className="btn btn-y" style={{ flex: 2 }}><LuTruck size={16} style={{ marginRight: 6 }} /> Elegir entrega</button>
                </div>
              </div>
            </>
          )
        )}

        {/* ── STEP 2: DELIVERY ── */}
        {step === STEP.DELIVERY && (
          <div className="card-chunky" style={{ background: '#fff', padding: '28px 32px' }}>
            <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'var(--ink)', marginBottom: 24 }}>¿Cómo quieres recibir tu pedido?</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[
                { key: 'Delivery',      icon: LuTruck,  label: 'Delivery',         desc: `+ S/ ${COSTO_DELIVERY.toFixed(2)} de envío`, color: '#3b82f6', bg: '#eff6ff' },
                { key: 'RecojoEnLocal', icon: LuStore,  label: 'Recojo en local',  desc: 'Sin costo adicional',               color: '#2E7D32', bg: '#e8f5e9' },
              ].map(m => (
                <button key={m.key} onClick={() => setEntrega(e => ({ ...e, metodo: m.key, sucursal: '', direccion: '' }))}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '22px 16px',
                    border: `3px solid ${entrega.metodo === m.key ? m.color : 'var(--ink)'}`,
                    borderRadius: 18, background: entrega.metodo === m.key ? m.bg : '#fff',
                    cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
                    boxShadow: entrega.metodo === m.key ? `4px 4px 0 ${m.color}` : '2px 2px 0 var(--ink)',
                  }}>
                  <m.icon size={30} color={m.color} />
                  <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: 'var(--ink)' }}>{m.label}</span>
                  <span style={{ fontSize: 12, color: entrega.metodo === m.key ? m.color : '#888', fontWeight: 700 }}>{m.desc}</span>
                  {entrega.metodo === m.key && <LuCircleCheck size={18} color={m.color} />}
                </button>
              ))}
            </div>

            {entrega.metodo === 'Delivery' && (
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Dirección de entrega *</label>
                <div style={{ position: 'relative' }}>
                  <LuMapPin size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#3b82f6' }} />
                  <input value={entrega.direccion} onChange={e => setEntrega(p => ({ ...p, direccion: e.target.value }))}
                    placeholder="Ej: Jr. Ayacucho 456, Huancayo" style={{ ...inputStyle, paddingLeft: 42 }} />
                </div>
                <div style={{ background: '#eff6ff', borderRadius: 10, padding: '10px 14px', marginTop: 10, fontSize: 12, color: '#1d4ed8' }}>
                  🚚 Tiempo estimado: 30-45 minutos · Costo: <strong>S/ {COSTO_DELIVERY.toFixed(2)}</strong>
                </div>
              </div>
            )}

            {entrega.metodo === 'RecojoEnLocal' && (
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Selecciona la sucursal *</label>
                {SUCURSALES.map(s => (
                  <div key={s} onClick={() => setEntrega(p => ({ ...p, sucursal: s }))}
                    style={{
                      padding: '13px 16px', borderRadius: 14, marginBottom: 10, cursor: 'pointer',
                      border: `3px solid ${entrega.sucursal === s ? '#2E7D32' : 'var(--ink)'}`,
                      background: entrega.sucursal === s ? '#e8f5e9' : '#fff',
                      display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s',
                    }}>
                    <LuMapPin size={18} color={entrega.sucursal === s ? '#2E7D32' : '#888'} style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: entrega.sucursal === s ? 800 : 600, color: 'var(--ink)', fontSize: 13 }}>{s}</span>
                    {entrega.sucursal === s && <LuCircleCheck size={18} color="#2E7D32" style={{ marginLeft: 'auto' }} />}
                  </div>
                ))}
              </div>
            )}

            {/* Resumen de precio con delivery */}
            {entrega.metodo && (
              <div style={{ background: '#f9f9f9', borderRadius: 12, padding: '14px 18px', marginBottom: 20, border: '2px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#666' }}>Productos</span>
                  <span style={{ fontWeight: 700 }}>S/ {total.toFixed(2)}</span>
                </div>
                {entrega.metodo === 'Delivery' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: '#3b82f6' }}>Delivery</span>
                    <span style={{ fontWeight: 700, color: '#3b82f6' }}>+ S/ {COSTO_DELIVERY.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #e0e0e0' }}>
                  <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16 }}>Total</span>
                  <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: 'var(--green)' }}>S/ {totalFinal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(STEP.CART)} className="btn btn-w" style={{ flex: 1 }}><LuArrowLeft size={15} style={{ marginRight: 6 }} /> Volver</button>
              <button onClick={() => { const err = validateDelivery(); if (err) { toast.error(err); return; } setStep(STEP.PAYMENT) }}
                className="btn btn-y" style={{ flex: 2 }}><LuCreditCard size={16} style={{ marginRight: 6 }} /> Ir al pago · S/ {totalFinal.toFixed(2)}</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: PAYMENT ── */}
        {step === STEP.PAYMENT && (
          <div className="card-chunky" style={{ background: '#fff', padding: '28px 32px' }}>
            {/* resumen entrega */}
            <div style={{ background: entrega.metodo === 'Delivery' ? '#eff6ff' : '#e8f5e9', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, border: `2px solid ${entrega.metodo === 'Delivery' ? '#93c5fd' : '#86efac'}` }}>
              {entrega.metodo === 'Delivery' ? <LuTruck size={18} color="#3b82f6" /> : <LuStore size={18} color="#2E7D32" />}
              <div style={{ fontSize: 13 }}>
                <span style={{ fontWeight: 700 }}>{entrega.metodo === 'Delivery' ? 'Delivery' : 'Recojo en local'}</span>
                <span style={{ color: '#666', marginLeft: 8 }}>{entrega.metodo === 'Delivery' ? entrega.direccion : entrega.sucursal.split('–')[0].trim()}</span>
              </div>
              <button onClick={() => setStep(STEP.DELIVERY)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 12, fontWeight: 700 }}>Cambiar</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f3e8ff', border: '3px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LuCreditCard size={24} color="var(--purple)" />
              </div>
              <div>
                <p style={{ fontWeight: 800, color: 'var(--ink)', fontSize: 16, margin: '0 0 2px' }}>Total a cobrar</p>
                <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 30, color: 'var(--green)', margin: 0 }}>S/ {totalFinal.toFixed(2)}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div><label style={labelStyle}>Número de tarjeta</label><input value={card.numero} onChange={e => handleCardChange('numero', e.target.value)} placeholder="1234 5678 9012 3456" style={inputStyle} maxLength={19} /></div>
              <div><label style={labelStyle}>Nombre del titular</label><input value={card.nombre} onChange={e => handleCardChange('nombre', e.target.value)} placeholder="JUAN PEREZ" style={{ ...inputStyle, textTransform: 'uppercase' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><label style={labelStyle}>Vencimiento</label><input value={card.vencimiento} onChange={e => handleCardChange('vencimiento', e.target.value)} placeholder="MM/AA" style={inputStyle} maxLength={5} /></div>
                <div><label style={labelStyle}>CVV</label><input value={card.cvv} onChange={e => handleCardChange('cvv', e.target.value)} placeholder="123" style={inputStyle} maxLength={3} type="password" /></div>
              </div>
            </div>

            {cardError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffe4f0', border: '2px solid var(--pink)', borderRadius: 10, padding: '10px 14px', marginTop: 14 }}>
                <LuX size={15} color="var(--pink)" style={{ flexShrink: 0 }} />
                <p style={{ color: 'var(--pink)', fontSize: 13, fontWeight: 700, margin: 0 }}>{cardError}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(STEP.DELIVERY)} className="btn btn-w" style={{ flex: 1 }}><LuArrowLeft size={15} style={{ marginRight: 6 }} /> Volver</button>
              <button onClick={handlePagar} className="btn btn-p" style={{ flex: 2 }}>Pagar S/ {totalFinal.toFixed(2)}</button>
            </div>
            <p style={{ color: '#aaa', fontSize: 11, textAlign: 'center', margin: '16px 0 0' }}>🔒 Pago simulado — no se procesará ningún cobro real</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProcessingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif" }}>
      <div className="card-chunky" style={{ background: '#fff', padding: '56px 72px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', border: '6px solid var(--ink)', borderTopColor: 'var(--yellow)', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px' }} />
        <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, color: 'var(--ink)', margin: '0 0 8px' }}>Procesando pago...</h2>
        <p style={{ color: '#888', fontSize: 15, margin: 0 }}>Verificando datos de tu tarjeta</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}

function BoletaScreen({ boleta, onClose, onBackToStore }) {
  const fecha     = boleta?.fechaVenta ? new Date(boleta.fechaVenta).toLocaleString('es-PE') : ''
  const ref       = `SK-${String(boleta?.idVenta ?? 0).padStart(6, '0')}`
  const boletaRef = useRef(null)
  const [descargando, setDescargando] = useState(false)

  const handleDescargarPDF = async () => {
    if (!boletaRef.current) return
    setDescargando(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { default: jsPDF }       = await import('jspdf')
      const canvas  = await html2canvas(boletaRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' })
      const imgData = canvas.toDataURL('image/png')
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfW    = pdf.internal.pageSize.getWidth()
      const pdfH    = (canvas.height * pdfW) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
      pdf.save(`boleta-${ref}.pdf`)
    } catch { window.print() }
    finally { setDescargando(false) }
  }

  const esDelivery = boleta?.metodoEntrega === 'Delivery'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', paddingTop: 90, fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ maxWidth: 580, margin: '32px auto', padding: '0 24px' }}>
        <div ref={boletaRef} className="card-chunky" style={{ background: '#fff', overflow: 'hidden' }}>
          <div style={{ background: 'var(--green)', padding: '36px 28px', textAlign: 'center', color: '#fff', borderBottom: '4px solid var(--ink)' }}>
            <LuCircleCheck size={56} color="#fff" style={{ marginBottom: 12 }} />
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, margin: '0 0 6px' }}>¡Pago exitoso!</h2>
            <p style={{ opacity: 0.88, fontSize: 14, margin: 0 }}>Tu compra ha sido procesada correctamente</p>
          </div>
          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#888', fontSize: 13 }}>Nº Boleta</span>
              <span style={{ fontWeight: 800, color: 'var(--ink)', fontSize: 13 }}>{ref}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#888', fontSize: 13 }}>Fecha</span>
              <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 13 }}>{fecha}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: '#888', fontSize: 13 }}>Método de entrega</span>
              <span style={{ fontWeight: 700, color: esDelivery ? '#3b82f6' : '#2E7D32', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                {esDelivery ? <LuTruck size={14} /> : <LuStore size={14} />} {esDelivery ? 'Delivery' : 'Recojo en local'}
              </span>
            </div>
            {esDelivery && boleta?.direccionEntrega && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ color: '#888', fontSize: 13 }}>Dirección</span>
                <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 13 }}>{boleta.direccionEntrega}</span>
              </div>
            )}
            {!esDelivery && boleta?.sucursalEntrega && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ color: '#888', fontSize: 13 }}>Sucursal</span>
                <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 13 }}>{boleta.sucursalEntrega.split('–')[0].trim()}</span>
              </div>
            )}

            <div style={{ borderTop: '2px dashed #d4d4d4', paddingTop: 20, marginBottom: 20 }}>
              <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 15, color: 'var(--ink)', margin: '0 0 14px' }}>Detalle de productos</p>
              {boleta?.detalles?.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#333', margin: '0 0 2px' }}>{d.nombreProducto}</p>
                    <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>x{d.cantidad} × S/ {Number(d.precioUnitario).toFixed(2)}</p>
                  </div>
                  <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: 'var(--green)', flexShrink: 0 }}>S/ {Number(d.subtotal).toFixed(2)}</span>
                </div>
              ))}
              {esDelivery && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#3b82f6', fontWeight: 700 }}>Costo de delivery</span>
                  <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: '#3b82f6' }}>+ S/ {Number(boleta?.costoDelivery ?? 0).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '3px solid var(--ink)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--ink)', textTransform: 'uppercase' }}>Total pagado</span>
              <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 30, color: 'var(--green)' }}>S/ {Number(boleta?.total ?? 0).toFixed(2)}</span>
            </div>

            <div style={{ background: '#dcfce7', border: '2px solid var(--ink)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <LuCreditCard size={16} color="var(--green)" />
              <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>Pago procesado · Método: Tarjeta simulada</span>
            </div>
          </div>
          <div style={{ padding: '0 32px 28px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => window.print()} className="btn btn-w" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', minWidth: 100 }}><LuPrinter size={16} /> Imprimir</button>
            <button onClick={handleDescargarPDF} disabled={descargando} className="btn btn-y" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', minWidth: 100 }}><LuDownload size={16} /> {descargando ? 'Generando...' : 'Descargar PDF'}</button>
            <button onClick={onClose} className="btn btn-g" style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', minWidth: 140 }}>Ver mis compras</button>
          </div>
          <div style={{ padding: '0 32px 24px', textAlign: 'center' }}>
            <button onClick={onBackToStore} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <LuArrowLeft size={13} /> Seguir comprando en la tienda
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--ink)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 12, border: '3px solid var(--ink)', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', letterSpacing: 1 }
