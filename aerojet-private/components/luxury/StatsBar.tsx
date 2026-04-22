'use client'
import { useEffect, useRef, useState } from 'react'

const stats = [
  { value: 8000, suffix: '+', label: 'Aeromobili Certificati' },
  { value: 180, suffix: '+', label: 'Paesi Raggiungibili' },
  { value: 4, suffix: 'h', label: 'Tempo Minimo Decollo' },
  { value: 24, suffix: '/7', label: 'Concierge Dedicato' },
]

function Counter({ value, suffix, active }: { value: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    const duration = 1800
    const steps = 60
    const inc = value / steps
    let current = 0
    const interval = setInterval(() => {
      current = Math.min(current + inc, value)
      setCount(Math.floor(current))
      if (current >= value) clearInterval(interval)
    }, duration / steps)
    return () => clearInterval(interval)
  }, [active, value])
  return <>{count.toLocaleString('it-IT')}{suffix}</>
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ display: 'flex', background: '#0F1220', borderTop: '1px solid rgba(201,168,76,0.15)', borderBottom: '1px solid rgba(201,168,76,0.15)', flexWrap: 'wrap' }}>
      {stats.map((s, i) => (
        <div key={i} style={{ flex: '1 1 150px', textAlign: 'center', padding: '40px 20px', borderRight: i < 3 ? '1px solid rgba(201,168,76,0.1)' : 'none' }}>
          <div style={{ fontSize: 'clamp(32px, 4vw, 44px)', color: '#C9A84C', fontWeight: 300, letterSpacing: 2 }}>
            <Counter value={s.value} suffix={s.suffix} active={visible} />
          </div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 8 }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}
