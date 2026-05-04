'use client'
import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false)
  const cursorX = useSpring(0, { damping: 20, stiffness: 250, mass: 0.5 })
  const cursorY = useSpring(0, { damping: 20, stiffness: 250, mass: 0.5 })
  const ringX = useSpring(0, { damping: 15, stiffness: 150, mass: 0.8 })
  const ringY = useSpring(0, { damping: 15, stiffness: 150, mass: 0.8 })
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    setMounted(true)
    const moveMouse = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      ringX.set(e.clientX)
      ringY.set(e.clientY)
    }

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isClickable = target.closest('button, a, input, select, .cursor-pointer')
      setHovered(!!isClickable)
    }

    window.addEventListener('mousemove', moveMouse)
    window.addEventListener('mouseover', handleHover)

    return () => {
      window.removeEventListener('mousemove', moveMouse)
      window.removeEventListener('mouseover', handleHover)
    }
  }, [cursorX, cursorY, ringX, ringY])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] hidden lg:block">
      {/* Small dot */}
      <motion.div
        className="fixed w-1.5 h-1.5 bg-gold rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ x: cursorX, y: cursorY }}
      />
      {/* Outer ring */}
      <motion.div
        className="fixed w-8 h-8 border border-gold/40 rounded-full -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: hovered ? 1.8 : 1,
          borderColor: hovered ? 'rgba(201, 168, 76, 0.8)' : 'rgba(201, 168, 76, 0.4)',
          backgroundColor: hovered ? 'rgba(201, 168, 76, 0.1)' : 'rgba(201, 168, 76, 0)',
        }}
        style={{ x: ringX, y: ringY }}
      />
    </div>
  )
}
