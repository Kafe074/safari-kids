import { useState, useEffect } from 'react'
import { LuX, LuChevronRight, LuChevronLeft } from 'react-icons/lu'

export default function OnboardingTour({ steps, storageKey }) {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      const t = setTimeout(() => setVisible(true), 400)
      return () => clearTimeout(t)
    }
  }, [storageKey])

  const finish = () => {
    localStorage.setItem(storageKey, '1')
    setVisible(false)
  }

  if (!visible) return null

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(26,46,26,0.55)',
      backdropFilter: 'blur(3px)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      animation: 'fadeIn 0.2s ease',
    }}>
      <div
        style={{
          background: '#FFFBF0',
          border: '4px solid #1A2E1A',
          borderRadius: 28,
          boxShadow: '10px 10px 0 #1A2E1A',
          maxWidth: 480,
          width: '100%',
          overflow: 'hidden',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* header */}
        <div style={{
          background: current.accent ?? '#1B7A3E',
          padding: '22px 28px 18px',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, flexShrink: 0,
            }}>
              {current.emoji}
            </div>
            <div>
              <p style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 11, fontWeight: 800,
                color: 'rgba(255,255,255,0.75)',
                textTransform: 'uppercase', letterSpacing: 1,
                margin: '0 0 2px',
              }}>
                Paso {step + 1} de {steps.length}
              </p>
              <h2 style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 26, color: '#fff',
                margin: 0, lineHeight: 1.1,
                textShadow: '2px 2px 0 rgba(0,0,0,0.15)',
              }}>
                {current.title}
              </h2>
            </div>
          </div>
          <button
            onClick={finish}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.4)',
              borderRadius: 10, padding: 6, cursor: 'pointer',
              color: '#fff', display: 'flex', flexShrink: 0,
              lineHeight: 1,
            }}
            title="Saltar tour"
          >
            <LuX size={16} />
          </button>
        </div>

        {/* body */}
        <div style={{ padding: '28px 32px 24px' }}>
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 16, lineHeight: 1.6,
            color: '#3a3a3a', margin: 0,
          }}>
            {current.description}
          </p>
        </div>

        {/* step dots */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 8,
          paddingBottom: 4,
        }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 24 : 8, height: 8,
                borderRadius: 99,
                background: i === step ? (current.accent ?? '#1B7A3E') : '#d0d0d0',
                border: '2px solid #1A2E1A',
                transition: 'width 0.2s',
              }}
            />
          ))}
        </div>

        {/* footer */}
        <div style={{
          padding: '16px 32px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
        }}>
          <button
            onClick={finish}
            style={{
              background: 'none', border: 'none',
              fontFamily: "'Nunito', sans-serif",
              fontSize: 13, fontWeight: 700,
              color: '#999', cursor: 'pointer', padding: 0,
            }}
          >
            Saltar
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#fff', border: '3px solid #1A2E1A',
                  borderRadius: 14, padding: '10px 18px',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800, fontSize: 14, cursor: 'pointer',
                  boxShadow: '4px 4px 0 #1A2E1A',
                }}
              >
                <LuChevronLeft size={16} /> Anterior
              </button>
            )}
            <button
              onClick={isLast ? finish : () => setStep(s => s + 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: current.accent ?? '#1B7A3E',
                border: '3px solid #1A2E1A',
                borderRadius: 14, padding: '10px 22px',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 900, fontSize: 14,
                color: '#fff', cursor: 'pointer',
                boxShadow: '4px 4px 0 #1A2E1A',
              }}
            >
              {isLast ? '¡Empezar!' : 'Siguiente'} <LuChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  )
}
