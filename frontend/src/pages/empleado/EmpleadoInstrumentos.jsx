import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { empleadosApi } from '../../api/empleados'
import { insumosApi } from '../../api/insumos'
import { solicitudesInsumosApi } from '../../api/solicitudesInsumos'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  LuScissors, LuPlus, LuMinus, LuTrash2, LuSend, LuPackage,
  LuClipboardList, LuClock, LuCircleCheck, LuCircleX, LuBox,
} from 'react-icons/lu'

/* Emoji por nombre de instrumento */
const emojiDe = (nombre = '') => {
  const n = nombre.toLowerCase()
  if (n.includes('tijera'))                        return '✂️'
  if (n.includes('máquina') || n.includes('maquina') || n.includes('navaja')) return '🪒'
  if (n.includes('peine'))                         return '🪮'
  if (n.includes('cepillo'))                       return '🖌️'
  if (n.includes('capa'))                          return '🧥'
  if (n.includes('pulverizador') || n.includes('spray')) return '💦'
  if (n.includes('toalla'))                        return '🧺'
  if (n.includes('secador'))                       return '💨'
  if (n.includes('clip'))                          return '🪄'
  return '🧰'
}

const ESTADO_BADGE = {
  Pendiente: { bg: '#FFF8E1', color: '#B38600', border: '#FFC42E', icon: <LuClock size={13} />,       label: 'Pendiente' },
  Aprobada:  { bg: '#E0F2FE', color: '#0369A1', border: '#38BDF8', icon: <LuCircleCheck size={13} />, label: 'Aprobada' },
  Entregada: { bg: '#E8F5E9', color: '#1B7A3E', border: '#33A957', icon: <LuPackage size={13} />,     label: 'Entregada' },
  Rechazada: { bg: '#FFEBEE', color: '#C62828', border: '#FF4F95', icon: <LuCircleX size={13} />,     label: 'Rechazada' },
}

export default function EmpleadoInstrumentos() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const [tab, setTab] = useState('instrumentos')   // instrumentos | productos
  const [kit, setKit] = useState([])               // [{ tipo:'insumo'|'producto', id, nombre, cantidad }]
  const [notas, setNotas] = useState('')

  /* ── Datos ── */
  const { data: perfil } = useQuery({
    queryKey: ['empleado-me'],
    queryFn: () => empleadosApi.getAll().then(r => {
      const lista = r.data.data ?? []
      return lista.find(e => e.usuario?.correo === user?.correo) ?? null
    }),
    enabled: !!user,
  })

  const { data: insumos = [], isLoading: loadingInsumos } = useQuery({
    queryKey: ['insumos'],
    queryFn: () => insumosApi.getAll().then(r => r.data.data ?? []),
  })

  const { data: productos = [], isLoading: loadingProductos } = useQuery({
    queryKey: ['productos-public'],
    queryFn: () => api.get('/productos').then(r => (r.data.data ?? []).filter(p => p.estado === 'Activo')),
  })

  const { data: solicitudes = [], isLoading: loadingSolicitudes } = useQuery({
    queryKey: ['mis-solicitudes', perfil?.idEmpleado],
    queryFn: () => solicitudesInsumosApi.getByEmpleado(perfil.idEmpleado).then(r => r.data.data ?? []),
    enabled: !!perfil?.idEmpleado,
  })

  /* ── Mutaciones ── */
  const crearMut = useMutation({
    mutationFn: () => solicitudesInsumosApi.crear({
      idEmpleado: perfil.idEmpleado,
      observaciones: notas.trim() || null,
      items: kit.map(k => ({
        idInsumo:   k.tipo === 'insumo'   ? k.id : null,
        idProducto: k.tipo === 'producto' ? k.id : null,
        cantidad:   k.cantidad,
      })),
    }),
    onSuccess: () => {
      qc.invalidateQueries(['mis-solicitudes'])
      setKit([]); setNotas('')
      toast.success('Solicitud enviada. El administrador la revisará pronto 🦁')
    },
    onError: err => toast.error(err.response?.data?.message || 'Error al enviar la solicitud'),
  })

  const cancelarMut = useMutation({
    mutationFn: id => solicitudesInsumosApi.cancelar(id),
    onSuccess: () => { qc.invalidateQueries(['mis-solicitudes']); toast.success('Solicitud cancelada') },
    onError: err => toast.error(err.response?.data?.message || 'No se pudo cancelar'),
  })

  /* ── Helpers del kit ── */
  const enKit = (tipo, id) => kit.find(k => k.tipo === tipo && k.id === id)

  const toggleItem = (tipo, id, nombre) => {
    setKit(prev => enKit(tipo, id)
      ? prev.filter(k => !(k.tipo === tipo && k.id === id))
      : [...prev, { tipo, id, nombre, cantidad: 1 }])
  }

  const cambiarCantidad = (tipo, id, delta) => {
    setKit(prev => prev.map(k =>
      k.tipo === tipo && k.id === id
        ? { ...k, cantidad: Math.max(1, Math.min(99, k.cantidad + delta)) }
        : k))
  }

  const enviar = () => {
    if (!perfil?.idEmpleado) { toast.error('No se encontró tu perfil de empleado'); return }
    if (kit.length === 0)    { toast.error('Agrega al menos un instrumento a tu kit'); return }
    crearMut.mutate()
  }

  const fmtFecha = f => f ? new Date(f).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

  /* ── Render de tarjeta seleccionable ── */
  const ItemCard = ({ tipo, id, nombre, sub, emoji }) => {
    const sel = enKit(tipo, id)
    return (
      <button onClick={() => toggleItem(tipo, id, nombre)} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        padding: '16px 10px',
        background: sel ? 'var(--yellow)' : '#fff',
        border: `3px solid ${sel ? 'var(--pink)' : 'var(--ink)'}`,
        borderRadius: 18, boxShadow: sel ? '5px 5px 0 var(--ink)' : '3px 3px 0 var(--ink)',
        cursor: 'pointer', transition: 'all .18s cubic-bezier(.34,1.56,.64,1)', fontFamily: 'inherit',
        transform: sel ? 'translate(-2px,-2px)' : 'none', position: 'relative',
      }}>
        {sel && (
          <span style={{ position: 'absolute', top: 8, right: 8, background: 'var(--pink)', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--ink)' }}>
            <LuCircleCheck size={12} />
          </span>
        )}
        <span style={{ fontSize: 30 }}>{emoji}</span>
        <span style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--ink)', textAlign: 'center', lineHeight: 1.25 }}>{nombre}</span>
        {sub && <span style={{ fontSize: 10.5, color: sel ? '#7a5c00' : '#999', fontFamily: "'Poppins',sans-serif" }}>{sub}</span>}
      </button>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="fade-page" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Fredoka One',cursive", fontWeight: 400, fontSize: 24, color: '#1a2e1a', margin: 0, lineHeight: 1.15 }}>
            <span className="squiggle">Gestión de Instrumentos</span>
          </h2>
          <p style={{ color: '#8a988a', fontSize: 13, marginTop: 10, fontFamily: "'Poppins',sans-serif" }}>
            Solicita los instrumentos y productos que usarás en tu jornada
          </p>
        </div>
      </div>

      {/* Grid principal: catálogo + kit */}
      <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start', marginBottom: 28 }}>

        {/* ── Catálogo ── */}
        <div className="card-chunky" style={{ overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '3px solid var(--ink)' }}>
            {[
              { key: 'instrumentos', label: 'Instrumentos', icon: <LuScissors size={16} /> },
              { key: 'productos',    label: 'Productos',    icon: <LuBox size={16} /> },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                flex: 1, padding: '14px 10px', border: 'none', cursor: 'pointer',
                background: tab === t.key ? 'var(--yellow)' : '#fff',
                fontFamily: "'Fredoka One',cursive", fontSize: 15, color: 'var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                borderRight: t.key === 'instrumentos' ? '3px solid var(--ink)' : 'none',
                transition: 'background .18s',
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 20 }}>
            {tab === 'instrumentos' && (
              loadingInsumos ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12 }}>
                  {[...Array(8)].map((_, i) => <div key={i} className="skel" style={{ height: 110, animationDelay: `${i * 0.07}s`, borderRadius: 18 }} />)}
                </div>
              ) : insumos.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🧰</span>
                  <p>No hay instrumentos registrados</p>
                  <small>Pide al administrador que registre los insumos del salón</small>
                </div>
              ) : (
                <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12 }}>
                  {insumos.map(i => (
                    <ItemCard key={i.idInsumo} tipo="insumo" id={i.idInsumo} nombre={i.nombre}
                      sub={`Stock: ${i.stock ?? 0} ${i.unidadMedida ?? ''}`} emoji={emojiDe(i.nombre)} />
                  ))}
                </div>
              )
            )}

            {tab === 'productos' && (
              loadingProductos ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12 }}>
                  {[...Array(8)].map((_, i) => <div key={i} className="skel" style={{ height: 110, animationDelay: `${i * 0.07}s`, borderRadius: 18 }} />)}
                </div>
              ) : productos.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🧴</span>
                  <p>No hay productos activos</p>
                  <small>El catálogo de productos está vacío</small>
                </div>
              ) : (
                <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12 }}>
                  {productos.map(p => (
                    <ItemCard key={p.idProducto} tipo="producto" id={p.idProducto} nombre={p.nombre}
                      sub={p.categoria?.nombre} emoji="🧴" />
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* ── Mi kit ── */}
        <div className="card-chunky" style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: 84 }}>
          <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg,#1B7A3E,#33A957)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              🎒 Mi kit del día
            </span>
            {kit.length > 0 && (
              <span className="pop" key={kit.length} style={{ background: '#FFC42E', color: '#2B1B00', border: '2px solid #2B1B00', borderRadius: 999, padding: '1px 10px', fontFamily: "'Fredoka One',cursive", fontSize: 14 }}>
                {kit.reduce((a, k) => a + k.cantidad, 0)}
              </span>
            )}
          </div>

          <div style={{ padding: 18 }}>
            {kit.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '22px 8px', color: '#9aa89a' }}>
                <span style={{ fontSize: 34, display: 'inline-block', marginBottom: 8 }} className="float">🎒</span>
                <p style={{ fontWeight: 800, fontSize: 13.5, color: '#6B7F6B', margin: 0 }}>Tu kit está vacío</p>
                <p style={{ fontSize: 12, color: '#9FB09F', marginTop: 4 }}>Toca los instrumentos que necesitas para agregarlos</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {kit.map(k => (
                  <div key={`${k.tipo}-${k.id}`} className="anim-pop-in" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F6FBF6', border: '2px solid #DCE9DC', borderRadius: 12, padding: '8px 10px' }}>
                    <span style={{ fontSize: 18 }}>{k.tipo === 'producto' ? '🧴' : emojiDe(k.nombre)}</span>
                    <span style={{ flex: 1, fontWeight: 800, fontSize: 12, color: 'var(--ink)', lineHeight: 1.2 }}>{k.nombre}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => cambiarCantidad(k.tipo, k.id, -1)} style={{ width: 22, height: 22, borderRadius: 7, border: '2px solid var(--ink)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LuMinus size={11} /></button>
                      <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 14, minWidth: 18, textAlign: 'center' }}>{k.cantidad}</span>
                      <button onClick={() => cambiarCantidad(k.tipo, k.id, +1)} style={{ width: 22, height: 22, borderRadius: 7, border: '2px solid var(--ink)', background: 'var(--yellow)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LuPlus size={11} /></button>
                    </div>
                    <button onClick={() => toggleItem(k.tipo, k.id, k.nombre)} title="Quitar" style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', display: 'flex', padding: 2 }}>
                      <LuTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="inp-label" style={{ marginTop: 4 }}>Observaciones (opcional)</label>
            <textarea className="inp" rows={2} value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Ej: para el turno de la tarde..." style={{ resize: 'vertical', marginBottom: 12 }} />

            <button onClick={enviar} disabled={crearMut.isPending || kit.length === 0}
              className="btn btn-g cta-block"
              style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '12px 20px', opacity: kit.length === 0 ? 0.5 : 1 }}>
              <LuSend size={16} /> {crearMut.isPending ? 'Enviando...' : 'Solicitar kit'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Historial ── */}
      <div className="card-chunky" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg,#0F5527,#1B7A3E)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <LuClipboardList size={18} color="#FFC42E" />
          <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: '#fff' }}>Mis solicitudes</span>
        </div>

        {loadingSolicitudes ? (
          <div style={{ padding: 20 }}>
            {[...Array(3)].map((_, i) => <div key={i} className="skel" style={{ height: 54, marginBottom: 10, animationDelay: `${i * 0.1}s` }} />)}
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <p>Aún no has hecho solicitudes</p>
            <small>Arma tu kit arriba y envía tu primera solicitud</small>
          </div>
        ) : (
          <div className="stagger">
            {solicitudes.map(s => {
              const badge = ESTADO_BADGE[s.estado] ?? ESTADO_BADGE.Pendiente
              return (
                <div key={s.idSolicitud} style={{ padding: '14px 20px', borderBottom: '2px solid #f5f0e8', display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 13, color: 'var(--ink)' }}>
                        Solicitud #{s.idSolicitud}
                      </span>
                      <span style={{ fontSize: 11.5, color: '#999', fontFamily: "'Poppins',sans-serif" }}>{fmtFecha(s.fechaSolicitud)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(s.detalles ?? []).map(d => (
                        <span key={d.idDetalle} style={{ background: '#F6FBF6', border: '2px solid #DCE9DC', borderRadius: 999, padding: '2px 10px', fontSize: 11.5, fontWeight: 700, color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {d.producto ? '🧴' : emojiDe(d.insumo?.nombre)} {d.insumo?.nombre ?? d.producto?.nombre} × {d.cantidad}
                        </span>
                      ))}
                    </div>
                    {s.observaciones && (
                      <p style={{ fontSize: 11.5, color: '#999', margin: '6px 0 0', fontStyle: 'italic' }}>"{s.observaciones}"</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ background: badge.bg, color: badge.color, border: `2px solid ${badge.border}`, borderRadius: 999, padding: '4px 12px', fontSize: 11.5, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {badge.icon} {badge.label}
                    </span>
                    {s.estado === 'Pendiente' && (
                      <button onClick={() => { if (confirm('¿Cancelar esta solicitud?')) cancelarMut.mutate(s.idSolicitud) }}
                        className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 11.5 }}>
                        Cancelar
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
