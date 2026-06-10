import { useEffect, useRef, useState } from 'react'

function useCountUp(target, duration = 900) {
  const [display, setDisplay] = useState(target)
  const rafRef = useRef()

  useEffect(() => {
    const n = Number(target)
    if (!Number.isInteger(n) || typeof target === 'string') { setDisplay(target); return }
    const start = performance.now()
    const tick = now => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(n * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return display
}

export default function StatCard({ icon, label, value, color = '#1B7A3E', bg, trend }) {
  const animated = useCountUp(value)
  return (
    <div className="stat-card" style={{ background: '#fff' }}>
      <div className="stat-icon" style={{
        background: bg || color,
        border: '3px solid var(--ink)',
        borderRadius: 14,
        boxShadow: '3px 3px 0 var(--ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {typeof icon === 'string'
          ? <span style={{ fontSize: 26 }}>{icon}</span>
          : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        }
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 11, color: '#888', fontWeight: 800, marginBottom: 2, fontFamily:"'Permanent Marker',cursive", letterSpacing: 1, textTransform: 'uppercase' }}>
          {label}
        </p>
        <p style={{ fontFamily:"'Fredoka One',cursive", fontSize: 30, color: 'var(--ink)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {animated ?? '—'}
        </p>
        {trend && <p style={{ fontSize: 11, color: color, marginTop: 3, fontWeight: 800 }}>{trend}</p>}
      </div>
    </div>
  )
}
