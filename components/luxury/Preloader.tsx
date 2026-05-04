'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

export default function Preloader() {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => setLoading(false), 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 150)
    return () => clearInterval(timer)
  }, [])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] bg-darker flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-sm bg-gold/10 flex items-center justify-center text-gold mb-8 gold-shimmer">
              <Sparkles size={40} className="animate-pulse" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-serif tracking-[0.5em] text-white font-bold leading-none">AEROJET</span>
              <span className="text-xs tracking-[0.3em] text-gold uppercase mt-2 font-semibold">Private Aviation</span>
            </div>
          </motion.div>

          {/* Loading bar */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-white/5">
            <motion.div 
              className="h-full bg-gold shadow-[0_0_15px_#C9A84C]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
            <div className="mt-4 text-[8px] text-white/20 tracking-[0.4em] uppercase text-center w-full">
              Sincronizzazione Sistemi {Math.floor(progress)}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
