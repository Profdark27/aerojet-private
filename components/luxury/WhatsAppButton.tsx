'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plane, Globe, Shield, Zap, X, ChevronRight } from 'lucide-react'
import { buildWhatsAppUrl, isWhatsAppConfigured, type WhatsAppTemplate } from '@/lib/whatsapp'
import { track } from '@/lib/tracking'

interface WhatsAppOption {
  id: WhatsAppTemplate | 'marco'
  label: string
  description: string
  icon: any
}

const OPTIONS: WhatsAppOption[] = [
  {
    id: 'marco',
    label: 'Marco (AI Advisor)',
    description: 'Assistente AI per quotazioni rapide',
    icon: Zap,
  },
  {
    id: 'volo',
    label: 'Preventivo Volo',
    description: 'Quotazione personalizzata immediata',
    icon: Plane,
  },
  {
    id: 'empty_leg',
    label: 'Empty Legs',
    description: 'Disponibilità tratte last-minute',
    icon: Globe,
  },
  {
    id: 'membership',
    label: 'Membership',
    description: 'Programmi accesso riservato',
    icon: Shield,
  },
]

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false)
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    setConfigured(isWhatsAppConfigured())
  }, [])

  if (!configured) return null

  const handleClick = (id: string) => {
    if (id === 'marco') {
      window.dispatchEvent(new CustomEvent('toggle-concierge'))
      setOpen(false)
      return
    }
    track('click_whatsapp', { template: id })
    const url = buildWhatsAppUrl(id as WhatsAppTemplate)
    window.open(url, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed z-[209] w-80 glass-panel overflow-hidden shadow-2xl shadow-black/60 rounded-xl"
            style={{ bottom: 'calc(env(safe-area-inset-bottom) + 160px)', right: '20px' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-emerald-500/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <MessageSquare size={20} />
              </div>
              <div>
                <div className="text-sm text-white font-medium">Concierge WhatsApp</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-400/60 uppercase tracking-widest font-bold">Online Ora</span>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="p-2 space-y-1">
              {OPTIONS.map((opt, i) => (
                <motion.button
                  key={opt.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleClick(opt.id)}
                  className="w-full p-4 flex items-center gap-4 group hover:bg-white/5 transition-all duration-300 rounded-lg text-left"
                >
                  <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-darker transition-all duration-500">
                    <opt.icon size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white font-medium group-hover:text-emerald-400 transition-colors">{opt.label}</div>
                    <div className="text-[9px] text-cream/30 uppercase tracking-wider mt-0.5">{opt.description}</div>
                  </div>
                  <ChevronRight size={12} className="text-white/10 group-hover:text-emerald-500 transition-colors" />
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
              <p className="text-[9px] text-cream/20 leading-relaxed uppercase tracking-widest text-center">
                Aerojet Private · Servizio 24/7
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className={`fixed z-[210] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
          open ? 'bg-white text-darker' : 'bg-[#25D366] text-white shadow-[#25D366]/20'
        }`}
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 90px)', right: '20px' }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
              <X size={20} strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.div key="ws" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
              <MessageSquare size={22} fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}
