'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

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
    const duration = 2000
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
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="bg-darker border-y border-white/5">
      <div className="max-w-7xl mx-auto flex flex-wrap lg:divide-x divide-white/5">
        {stats.map((s, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex-1 min-w-[200px] text-center py-12 px-6 group relative overflow-hidden"
          >
            <div className="luxury-heading text-[clamp(40px,5vw,52px)] text-gold font-light mb-2 transition-transform duration-500 group-hover:scale-110">
              <Counter value={s.value} suffix={s.suffix} active={visible} />
            </div>
            <div className="text-[10px] tracking-[0.4em] text-white/60 uppercase font-bold group-hover:text-gold transition-colors duration-500">
              {s.label}
            </div>
            
            {/* Background glow on hover */}
            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
